import { signUp, confirmSignUp } from "./cognito-api.js";
import { configure } from "./config.js";
import { busyState } from "./model.js";
let signUpInProgress = undefined;
export async function signUpUser(...args) {
    if (!signUpInProgress) {
        signUpInProgress = _signUpUser(...args).finally(() => (signUpInProgress = undefined));
    }
    return signUpInProgress;
}
/**
 * Sign up a new user with email verification
 */
async function _signUpUser(props) {
    const { username, email, password = "TempPassword123!", // Temporary password for passwordless flow
    userAttributes = [], clientMetadata, currentStatus, statusCb, } = props;
    const { debug } = configure();
    if (currentStatus && busyState.includes(currentStatus)) {
        throw new Error(`Can't sign up while in status ${currentStatus}`);
    }
    statusCb?.("SIGNING_UP");
    const abort = new AbortController();
    // Ensure email is in userAttributes
    const finalUserAttributes = [
        { name: "email", value: email },
        ...userAttributes.filter(attr => attr.name !== "email"), // Remove duplicate email if exists
    ];
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
            return { response, abort: () => abort.abort() };
        }
        debug?.(`Sign-up successful for user: ${username}`);
        statusCb?.("SIGNUP_COMPLETED");
        return { response, abort: () => abort.abort() };
    }
    catch (err) {
        if (abort.signal.aborted)
            throw err;
        debug?.("Sign-up failed:", err);
        statusCb?.("SIGNUP_FAILED");
        throw err;
    }
}
let confirmSignUpInProgress = undefined;
export async function confirmSignUpAndRequestMagicLink(...args) {
    if (!confirmSignUpInProgress) {
        confirmSignUpInProgress = _confirmSignUpAndRequestMagicLink(...args).finally(() => (confirmSignUpInProgress = undefined));
    }
    return confirmSignUpInProgress;
}
/**
 * Confirm sign-up with verification code and optionally request a magic link
 */
async function _confirmSignUpAndRequestMagicLink(props) {
    const { username, confirmationCode, clientMetadata, requestMagicLink = true, redirectUri, currentStatus, statusCb, } = props;
    const { debug } = configure();
    if (currentStatus && busyState.includes(currentStatus)) {
        throw new Error(`Can't confirm sign-up while in status ${currentStatus}`);
    }
    statusCb?.("CONFIRMING_SIGNUP");
    const abort = new AbortController();
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
            return { confirmResponse, abort: () => abort.abort() };
        }
        debug?.(`Sign-up confirmation successful for user: ${username}`);
        statusCb?.("SIGNUP_CONFIRMED");
        // Optionally request magic link for immediate passwordless sign-in
        if (requestMagicLink) {
            debug?.(`Requesting magic link for user: ${username}`);
            // Import requestSignInLink dynamically to avoid circular dependency
            const { requestSignInLink } = await import("./magic-link.js");
            const magicLinkRequest = requestSignInLink({
                username,
                redirectUri,
                currentStatus: "SIGNUP_CONFIRMED",
                statusCb,
            });
            return {
                confirmResponse,
                magicLinkRequest,
                abort: () => abort.abort(),
            };
        }
        return { confirmResponse, abort: () => abort.abort() };
    }
    catch (err) {
        if (abort.signal.aborted)
            throw err;
        debug?.("Sign-up confirmation failed:", err);
        statusCb?.("SIGNUP_CONFIRMATION_FAILED");
        throw err;
    }
}
/**
 * Complete sign-up flow: sign up user and return confirmation handler
 */
export async function completeSignUpFlow(props) {
    const signUpResult = await signUpUser(props);
    return {
        ...signUpResult,
        confirmSignUp: async (confirmationProps) => {
            return confirmSignUpAndRequestMagicLink({
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
}
