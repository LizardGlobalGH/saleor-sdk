import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { AccountRegisterInput, MutationAccountAddressCreateArgs, MutationAccountAddressUpdateArgs, MutationAccountSetDefaultAddressArgs, MutationAccountUpdateArgs, MutationExternalAuthenticationUrlArgs, MutationPasswordChangeArgs, MutationTokenCreateArgs, MutationTokenRefreshArgs, MutationRequestPasswordResetArgs, MutationSetPasswordArgs, MutationRequestEmailChangeArgs, AccountConfirmMutationVariables } from "../apollo/types";
import { AuthSDK } from "./auth";
import { UserSDK } from "./user";
import { State } from "./state";
export interface SaleorClientInternals {
    apolloClient: ApolloClient<NormalizedCacheObject>;
}
export interface SaleorClientConfig {
    channel: string;
    autologin: boolean;
    setChannel(channel: string): string;
}
export interface SaleorClient {
    auth: AuthSDK;
    user: UserSDK;
    config: SaleorClientConfig;
    _internal: SaleorClientInternals;
    getState(): State;
}
export interface SaleorClientOpts {
    apiUrl: string;
    channel: string;
    autologin?: boolean;
}
export declare type SaleorClientMethodsProps = SaleorClientInternals & Pick<SaleorClientConfig, "channel">;
export declare type CreateAccountAddressOpts = MutationAccountAddressCreateArgs;
export declare type ChangeUserPasswordOpts = MutationPasswordChangeArgs;
export declare type LoginOpts = MutationTokenCreateArgs;
export declare type RefreshTokenOpts = Pick<MutationTokenRefreshArgs, "csrfToken">;
export declare type RegisterOpts = AccountRegisterInput;
export declare type RequestEmailChangeOpts = MutationRequestEmailChangeArgs;
export declare type RequestPasswordResetOpts = MutationRequestPasswordResetArgs;
export declare type SetAccountDefaultAddressOpts = MutationAccountSetDefaultAddressArgs;
export declare type SetPasswordOpts = MutationSetPasswordArgs;
export declare type UpdateAccountOpts = MutationAccountUpdateArgs;
export declare type UpdateAccountAddressOpts = MutationAccountAddressUpdateArgs;
export declare type ExternalAuthOpts = MutationExternalAuthenticationUrlArgs;
export declare type ConfirmAccountOpts = AccountConfirmMutationVariables;
export declare type JWTToken = {
    iat: number;
    iss: string;
    owner: string;
    exp: number;
    token: string;
    email: string;
    type: string;
    user_id: string;
    is_staff: boolean;
};
