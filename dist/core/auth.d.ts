import { ApolloQueryResult, FetchResult } from "@apollo/client";
import { ExternalAuthenticationUrlMutation, ExternalLogoutMutation, ExternalObtainAccessTokensMutation, ExternalRefreshMutation, ExternalVerifyMutation, LoginMutation, PasswordChangeMutation, RefreshTokenMutation, RegisterMutation, RequestPasswordResetMutation, SetPasswordMutation, VerifyTokenMutation } from "../apollo/types";
import { SaleorClientMethodsProps } from "./types";
import { ChangeUserPasswordOpts, ExternalAuthOpts, LoginOpts, RegisterOpts, RequestPasswordResetOpts, SetPasswordOpts } from "./types";
export interface AuthSDK {
    changePassword: (opts: ChangeUserPasswordOpts) => Promise<FetchResult<PasswordChangeMutation>>;
    login: (opts: LoginOpts) => Promise<FetchResult<LoginMutation>>;
    logout: () => Promise<ApolloQueryResult<null>[] | null>;
    refreshToken: (includeUser?: boolean) => Promise<FetchResult<RefreshTokenMutation>>;
    register: (opts: RegisterOpts) => Promise<FetchResult<RegisterMutation>>;
    requestPasswordReset: (opts: RequestPasswordResetOpts) => Promise<FetchResult<RequestPasswordResetMutation>>;
    setPassword: (opts: SetPasswordOpts) => Promise<FetchResult<SetPasswordMutation>>;
    verifyToken: () => Promise<FetchResult<VerifyTokenMutation>>;
    getExternalAuthUrl: (opts: ExternalAuthOpts) => Promise<FetchResult<ExternalAuthenticationUrlMutation>>;
    getExternalAccessToken: (opts: ExternalAuthOpts) => Promise<FetchResult<ExternalObtainAccessTokensMutation>>;
    logoutExternal: (opts: ExternalAuthOpts) => Promise<FetchResult<ExternalLogoutMutation>>;
    refreshExternalToken: (opts: ExternalAuthOpts) => Promise<FetchResult<ExternalRefreshMutation>>;
    verifyExternalToken: (opts: ExternalAuthOpts) => Promise<FetchResult<ExternalVerifyMutation>>;
}
export declare const auth: ({ apolloClient: client, channel, }: SaleorClientMethodsProps) => AuthSDK;
