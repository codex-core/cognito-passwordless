/**
 * Copyright Amazon.com, Inc. and its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You
 * may not use this file except in compliance with the License. A copy of
 * the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */
import { revokeToken, signUp, confirmSignUp } from "./cognito-api.js";
import { configure } from "./config.js";
import { retrieveTokens, storeTokens } from "./storage.js";
import {
  TokensFromRefresh,
  TokensFromSignIn,
  BusyState,
  IdleState,
  busyState,
} from "./model.js";
import { scheduleRefresh } from "./refresh.js";

/** The default tokens callback stores tokens in storage and reschedules token refresh */
export const defaultTokensCb = async ({
  tokens,
  abort,
}: {
  tokens: TokensFromSignIn | TokensFromRefresh;
  abort?: AbortSignal;
}) => {
  const storeAndScheduleRefresh = async (
    tokens: TokensFromSignIn | TokensFromRefresh
  ) => {
    await storeTokens(tokens);
    scheduleRefresh({
      abort,
      tokensCb: (newTokens) =>
        newTokens && storeAndScheduleRefresh({ ...tokens, ...newTokens }),
    }).catch((err) => {
      const { debug } = configure();
      debug?.("Failed to store and refresh tokens:", err);
    });
  };
  await storeAndScheduleRefresh(tokens);
};


/**
 * Sign the user out. This means: clear tokens from storage,
 * and revoke the refresh token from Amazon Cognito
 */
export const signOut = (props?: {
  currentStatus?: BusyState | IdleState;
  tokensRemovedLocallyCb?: () => void;
  statusCb?: (status: BusyState | IdleState) => void;
}) => {
  const { clientId, debug, storage } = configure();
  const { currentStatus, statusCb } = props ?? {};
  if (currentStatus && busyState.includes(currentStatus as BusyState)) {
    debug?.(
      `Initiating sign-out despite being in a busy state: ${currentStatus}`
    );
  }
  statusCb?.("SIGNING_OUT");
  const abort = new AbortController();
  const signedOut = (async () => {
    try {
      const tokens = await retrieveTokens();
      if (abort.signal.aborted) {
        debug?.("Aborting sign-out");
        currentStatus && statusCb?.(currentStatus);
        return;
      }
      if (!tokens) {
        debug?.("No tokens in storage to delete");
        props?.tokensRemovedLocallyCb?.();
        statusCb?.("SIGNED_OUT");
        return;
      }
      const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
      const customKeyPrefix = `Passwordless.${clientId}`;
      await Promise.all([
        storage.removeItem(`${amplifyKeyPrefix}.${tokens.username}.idToken`),
        storage.removeItem(
          `${amplifyKeyPrefix}.${tokens.username}.accessToken`
        ),
        storage.removeItem(
          `${amplifyKeyPrefix}.${tokens.username}.refreshToken`
        ),
        storage.removeItem(
          `${amplifyKeyPrefix}.${tokens.username}.tokenScopesString`
        ),
        storage.removeItem(`${amplifyKeyPrefix}.${tokens.username}.userData`),
        storage.removeItem(`${amplifyKeyPrefix}.LastAuthUser`),
        storage.removeItem(`${customKeyPrefix}.${tokens.username}.expireAt`),
        storage.removeItem(
          `Passwordless.${clientId}.${tokens.username}.refreshingTokens`
        ),
      ]);
      props?.tokensRemovedLocallyCb?.();
      if (tokens.refreshToken) {
        await revokeToken({
          abort: undefined, // if we've come this far, let this proceed
          refreshToken: tokens.refreshToken,
        });
      }
      statusCb?.("SIGNED_OUT");
    } catch (err) {
      if (abort.signal.aborted) return;
      currentStatus && statusCb?.(currentStatus);
      throw err;
    }
  })();
  return {
    signedOut,
    abort: () => abort.abort(),
  };
};

/**
 * Sign up a new user with email verification
 */
export const handleUserSignUp = (props: {
  username: string;
  email: string;
  password?: string;
  userAttributes?: { name: string; value: string }[];
  clientMetadata?: Record<string, string>;
  currentStatus?: BusyState | IdleState;
  statusCb?: (status: BusyState | IdleState) => void;
}) => {
  const {
    username,
    email,
    password = "TempPassword123!", // Temporary password for passwordless flow
    userAttributes = [],
    clientMetadata,
    currentStatus,
    statusCb,
  } = props;

  const { debug } = configure();
  
  if (currentStatus && busyState.includes(currentStatus as BusyState)) {
    throw new Error(`Can't sign up while in status ${currentStatus}`);
  }

  statusCb?.("SIGNING_UP" as BusyState);
  const abort = new AbortController();

  // Ensure email is in userAttributes
  const finalUserAttributes = [
    { name: "email", value: email },
    ...userAttributes.filter(attr => attr.name !== "email"), // Remove duplicate email if exists
  ];

  const signUpCompleted = (async () => {
    try {
      debug?.(`Starting sign-up for user: ${username}`);
      
      const response = await signUp({
        username,
        password,
        userAttributes: finalUserAttributes,
        clientMetadata,
        abort: abort.signal,
      });

      if (abort.signal.aborted) {
        debug?.("Aborting sign-up");
        currentStatus && statusCb?.(currentStatus);
        return response;
      }

      debug?.(`Sign-up successful for user: ${username}`);
      statusCb?.("SIGNUP_COMPLETED" as IdleState);
      return response;
    } catch (err) {
      if (abort.signal.aborted) return;
      debug?.("Sign-up failed:", err);
      statusCb?.("SIGNUP_FAILED" as IdleState);
      throw err;
    }
  })();

  return {
    signUpCompleted,
    abort: () => abort.abort(),
  };
};

/**
 * Confirm sign-up with verification code and optionally request a magic link
 */
export const confirmSignUpAndRequestMagicLinkApi = (props: {
  username: string;
  confirmationCode: string;
  clientMetadata?: Record<string, string>;
  requestMagicLink?: boolean;
  redirectUri?: string;
  currentStatus?: BusyState | IdleState;
  statusCb?: (status: BusyState | IdleState) => void;
}) => {
  const {
    username,
    confirmationCode,
    clientMetadata,
    requestMagicLink = true,
    redirectUri,
    currentStatus,
    statusCb,
  } = props;

  const { debug } = configure();
  
  if (currentStatus && busyState.includes(currentStatus as BusyState)) {
    throw new Error(`Can't confirm sign-up while in status ${currentStatus}`);
  }

  statusCb?.("CONFIRMING_SIGNUP" as BusyState);
  const abort = new AbortController();

  const confirmationCompleted = (async () => {
    try {
      debug?.(`Confirming sign-up for user: ${username}`);
      
      const confirmResponse = await confirmSignUp({
        username,
        confirmationCode,
        clientMetadata,
        abort: abort.signal,
      });

      if (abort.signal.aborted) {
        debug?.("Aborting sign-up confirmation");
        currentStatus && statusCb?.(currentStatus);
        return confirmResponse;
      }

      debug?.(`Sign-up confirmation successful for user: ${username}`);
      statusCb?.("SIGNUP_CONFIRMED" as IdleState);

      // Optionally request magic link for immediate passwordless sign-in
      if (requestMagicLink) {
        debug?.(`Requesting magic link for user: ${username}`);
        
        // Import requestSignInLink dynamically to avoid circular dependency
        const { requestSignInLink } = await import("./magic-link.js");
        
        const magicLinkRequest = requestSignInLink({
          username,
          redirectUri,
          currentStatus: "SIGNUP_CONFIRMED" as IdleState,
          statusCb,
        });

        return {
          confirmResponse,
          magicLinkRequest,
        };
      }

      return { confirmResponse };
    } catch (err) {
      if (abort.signal.aborted) return;
      debug?.("Sign-up confirmation failed:", err);
      statusCb?.("SIGNUP_CONFIRMATION_FAILED" as IdleState);
      throw err;
    }
  })();

  return {
    confirmationCompleted,
    abort: () => abort.abort(),
  };
};

/**
 * Complete sign-up flow: sign up user and return confirmation handler
 */
export const completeSignUpFlowApi = (props: {
  username: string;
  email: string;
  password?: string;
  userAttributes?: { name: string; value: string }[];
  clientMetadata?: Record<string, string>;
  currentStatus?: BusyState | IdleState;
  statusCb?: (status: BusyState | IdleState) => void;
}) => {
  const signUpResult = handleUserSignUp(props);

  return {
    ...signUpResult,
    confirmSignUp: (confirmationProps: {
      confirmationCode: string;
      requestMagicLink?: boolean;
      redirectUri?: string;
    }) => {
      return confirmSignUpAndRequestMagicLinkApi({
        username: props.username,
        confirmationCode: confirmationProps.confirmationCode,
        clientMetadata: props.clientMetadata,
        requestMagicLink: confirmationProps.requestMagicLink,
        redirectUri: confirmationProps.redirectUri,
        currentStatus: props.currentStatus,
        statusCb: props.statusCb,
      });
    },
  };
};
