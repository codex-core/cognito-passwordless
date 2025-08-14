import { BusyState, IdleState } from "./model.js";
export declare function signUpUser(...args: Parameters<typeof _signUpUser>): Promise<{
    response: import("./config.js").MinimalResponse;
    abort: () => void;
}>;
/**
 * Sign up a new user with email verification
 */
declare function _signUpUser(props: {
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
}): Promise<{
    response: import("./config.js").MinimalResponse;
    abort: () => void;
}>;
export declare function confirmSignUpAndRequestMagicLink(...args: Parameters<typeof _confirmSignUpAndRequestMagicLink>): Promise<{
    confirmResponse: import("./config.js").MinimalResponse;
    abort: () => void;
    magicLinkRequest?: undefined;
} | {
    confirmResponse: import("./config.js").MinimalResponse;
    magicLinkRequest: {
        signInLinkRequested: Promise<string>;
        abort: () => void;
    };
    abort: () => void;
}>;
/**
 * Confirm sign-up with verification code and optionally request a magic link
 */
declare function _confirmSignUpAndRequestMagicLink(props: {
    username: string;
    confirmationCode: string;
    clientMetadata?: Record<string, string>;
    requestMagicLink?: boolean;
    redirectUri?: string;
    currentStatus?: BusyState | IdleState;
    statusCb?: (status: BusyState | IdleState) => void;
}): Promise<{
    confirmResponse: import("./config.js").MinimalResponse;
    abort: () => void;
    magicLinkRequest?: undefined;
} | {
    confirmResponse: import("./config.js").MinimalResponse;
    magicLinkRequest: {
        signInLinkRequested: Promise<string>;
        abort: () => void;
    };
    abort: () => void;
}>;
/**
 * Complete sign-up flow: sign up user and return confirmation handler
 */
export declare function completeSignUpFlow(props: {
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
}): Promise<{
    confirmSignUp: (confirmationProps: {
        confirmationCode: string;
        requestMagicLink?: boolean;
        redirectUri?: string;
    }) => Promise<{
        confirmResponse: import("./config.js").MinimalResponse;
        abort: () => void;
        magicLinkRequest?: undefined;
    } | {
        confirmResponse: import("./config.js").MinimalResponse;
        magicLinkRequest: {
            signInLinkRequested: Promise<string>;
            abort: () => void;
        };
        abort: () => void;
    }>;
    response: import("./config.js").MinimalResponse;
    abort: () => void;
}>;
export {};
