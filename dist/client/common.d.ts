import { TokensFromRefresh, TokensFromSignIn, BusyState, IdleState } from "./model.js";
/** The default tokens callback stores tokens in storage and reschedules token refresh */
export declare const defaultTokensCb: ({ tokens, abort, }: {
    tokens: TokensFromSignIn | TokensFromRefresh;
    abort?: AbortSignal;
}) => Promise<void>;
/**
 * Sign the user out. This means: clear tokens from storage,
 * and revoke the refresh token from Amazon Cognito
 */
export declare const signOut: (props?: {
    currentStatus?: BusyState | IdleState;
    tokensRemovedLocallyCb?: () => void;
    statusCb?: (status: BusyState | IdleState) => void;
}) => {
    signedOut: Promise<void>;
    abort: () => void;
};
/**
 * Sign up a new user with email verification
 */
export declare const handleUserSignUp: (props: {
    username: string;
    email: string;
    password?: string;
    userAttributes?: {
        name: string;
        value: string;
    }[];
    clientMetadata?: Record<string, string>;
    currentStatus?: BusyState | IdleState;
    statusCb?: (status: BusyState | IdleState) => void;
}) => {
    signUpCompleted: Promise<import("./config.js").MinimalResponse | undefined>;
    abort: () => void;
};
/**
 * Confirm sign-up with verification code and optionally request a magic link
 */
export declare const confirmSignUpAndRequestMagicLinkApi: (props: {
    username: string;
    confirmationCode: string;
    clientMetadata?: Record<string, string>;
    requestMagicLink?: boolean;
    redirectUri?: string;
    currentStatus?: BusyState | IdleState;
    statusCb?: (status: BusyState | IdleState) => void;
}) => {
    confirmationCompleted: Promise<import("./config.js").MinimalResponse | {
        confirmResponse: import("./config.js").MinimalResponse;
        magicLinkRequest: {
            signInLinkRequested: Promise<string>;
            abort: () => void;
        };
    } | {
        confirmResponse: import("./config.js").MinimalResponse;
        magicLinkRequest?: undefined;
    } | undefined>;
    abort: () => void;
};
/**
 * Complete sign-up flow: sign up user and return confirmation handler
 */
export declare const completeSignUpFlowApi: (props: {
    username: string;
    email: string;
    password?: string;
    userAttributes?: {
        name: string;
        value: string;
    }[];
    clientMetadata?: Record<string, string>;
    currentStatus?: BusyState | IdleState;
    statusCb?: (status: BusyState | IdleState) => void;
}) => {
    confirmSignUp: (confirmationProps: {
        confirmationCode: string;
        requestMagicLink?: boolean;
        redirectUri?: string;
    }) => {
        confirmationCompleted: Promise<import("./config.js").MinimalResponse | {
            confirmResponse: import("./config.js").MinimalResponse;
            magicLinkRequest: {
                signInLinkRequested: Promise<string>;
                abort: () => void;
            };
        } | {
            confirmResponse: import("./config.js").MinimalResponse;
            magicLinkRequest?: undefined;
        } | undefined>;
        abort: () => void;
    };
    signUpCompleted: Promise<import("./config.js").MinimalResponse | undefined>;
    abort: () => void;
};
