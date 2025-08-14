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
import { configure, configureFromAmplify } from "./config.js";
export declare const Passwordless: {
    configure: typeof configure;
    configureFromAmplify: typeof configureFromAmplify;
    signOut: (props?: {
        currentStatus?: import("./model.js").BusyState | import("./model.js").IdleState;
        tokensRemovedLocallyCb?: () => void;
        statusCb?: (status: import("./model.js").BusyState | import("./model.js").IdleState) => void;
    }) => {
        signedOut: Promise<void>;
        abort: () => void;
    };
    signUpUser: (props: {
        username: string;
        email: string;
        password?: string;
        userAttributes?: {
            name: string;
            value: string;
        }[];
        clientMetadata?: Record<string, string>;
        currentStatus?: import("./model.js").BusyState | import("./model.js").IdleState;
        statusCb?: (status: import("./model.js").BusyState | import("./model.js").IdleState) => void;
    }) => {
        signUpCompleted: Promise<import("./config.js").MinimalResponse | undefined>;
        abort: () => void;
    };
    confirmSignUpAndRequestMagicLink: (props: {
        username: string;
        confirmationCode: string;
        clientMetadata?: Record<string, string>;
        requestMagicLink?: boolean;
        redirectUri?: string;
        currentStatus?: import("./model.js").BusyState | import("./model.js").IdleState;
        statusCb?: (status: import("./model.js").BusyState | import("./model.js").IdleState) => void;
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
    completeSignUpFlow: (props: {
        username: string;
        email: string;
        password?: string;
        userAttributes?: {
            name: string;
            value: string;
        }[];
        clientMetadata?: Record<string, string>;
        currentStatus?: import("./model.js").BusyState | import("./model.js").IdleState;
        statusCb?: (status: import("./model.js").BusyState | import("./model.js").IdleState) => void;
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
};
