import { BusyState, IdleState } from "./model.js";
/**
 * Sign up a new user with email verification
 */
export declare const handleUserSignup: (props: {
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
export declare const handleConfirmSignUpAndRequestMagicLink: (props: {
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
