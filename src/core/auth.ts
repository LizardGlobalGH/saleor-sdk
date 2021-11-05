import { FetchResult } from "@apollo/client";
import {
  CHANGE_USER_PASSWORD,
  EXTERNAL_AUTHENTICATION_URL,
  EXTERNAL_LOGOUT,
  EXTERNAL_REFRESH,
  EXTERNAL_VERIFY_TOKEN,
  LOGIN,
  OBTAIN_EXTERNAL_ACCESS_TOKEN,
  REQUEST_PASSWORD_RESET,
  REFRESH_TOKEN,
  REGISTER,
  SET_PASSWORD,
  VERIFY_TOKEN,
  REFRESH_TOKEN_WITH_USER,
  EXTERNAL_REFRESH_WITH_USER,
} from "../apollo/mutations";
import {
  ExternalAuthenticationUrlMutation,
  ExternalAuthenticationUrlMutationVariables,
  ExternalLogoutMutation,
  ExternalLogoutMutationVariables,
  ExternalObtainAccessTokensMutation,
  ExternalObtainAccessTokensMutationVariables,
  ExternalRefreshMutation,
  ExternalRefreshMutationVariables,
  ExternalRefreshWithUserMutation,
  ExternalRefreshWithUserMutationVariables,
  ExternalVerifyMutation,
  ExternalVerifyMutationVariables,
  LoginMutation,
  LoginMutationVariables,
  PasswordChangeMutation,
  PasswordChangeMutationVariables,
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
  RefreshTokenWithUserMutation,
  RefreshTokenWithUserMutationVariables,
  RegisterMutation,
  RegisterMutationVariables,
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables,
  SetPasswordMutation,
  SetPasswordMutationVariables,
  VerifyTokenMutation,
  VerifyTokenMutationVariables,
} from "../apollo/types";
import { ExternalLogoutOpts, SaleorClientMethodsProps } from "./types";
import {
  ChangeUserPasswordOpts,
  ExternalAuthOpts,
  LoginOpts,
  RegisterOpts,
  RequestPasswordResetOpts,
  SetPasswordOpts,
} from "./types";
import { storage } from "./storage";
import { USER } from "../apollo/queries";

export interface AuthSDK {
  changePassword: (
    opts: ChangeUserPasswordOpts
  ) => Promise<FetchResult<PasswordChangeMutation>>;
  login: (opts: LoginOpts) => Promise<FetchResult<LoginMutation>>;
  logout: (
    opts?: ExternalLogoutOpts
  ) => Promise<FetchResult<ExternalLogoutMutation> | null>;
  refreshToken: (
    includeUser?: boolean
  ) => Promise<FetchResult<RefreshTokenMutation>>;
  register: (opts: RegisterOpts) => Promise<FetchResult<RegisterMutation>>;
  requestPasswordReset: (
    opts: RequestPasswordResetOpts
  ) => Promise<FetchResult<RequestPasswordResetMutation>>;
  setPassword: (
    opts: SetPasswordOpts
  ) => Promise<FetchResult<SetPasswordMutation>>;
  verifyToken: () => Promise<FetchResult<VerifyTokenMutation>>;
  getExternalAuthUrl: (
    opts: ExternalAuthOpts
  ) => Promise<FetchResult<ExternalAuthenticationUrlMutation>>;
  getExternalAccessToken: (
    opts: ExternalAuthOpts
  ) => Promise<FetchResult<ExternalObtainAccessTokensMutation>>;
  refreshExternalToken: (
    includeUser?: boolean
  ) => Promise<FetchResult<ExternalRefreshMutation>>;
  verifyExternalToken: () => Promise<FetchResult<ExternalVerifyMutation>>;
}

export const auth = ({
  apolloClient: client,
  channel,
}: SaleorClientMethodsProps): AuthSDK => {
  /**
   * Authenticates user with email and password.
   *
   * @param opts - Object with user's email and password.
   * @returns Promise resolved with CreateToken type data.
   */
  const login: AuthSDK["login"] = opts => {
    client.writeQuery({
      query: USER,
      data: {
        authenticating: true,
      },
    });

    return client.mutate<LoginMutation, LoginMutationVariables>({
      mutation: LOGIN,
      variables: {
        ...opts,
      },
      update: (_, { data }) => {
        if (data?.tokenCreate?.token) {
          storage.setTokens({
            accessToken: data.tokenCreate.token,
            csrfToken: data.tokenCreate.csrfToken,
          });
        }
      },
    });
  };

  /**
   * Clears stored token and Apollo store. If external plugin was used to log in, the mutation will prepare
   * the logout URL. All values passed in field input will be added as GET parameters to the logout request.
   *
   * @param opts - Object with input as JSON with returnTo - the URL where a user should be redirected
   * when external plugin was used to log in
   * @returns Logout data and errors if external plugin was used to log in. Otherwise null.
   */
  const logout: AuthSDK["logout"] = async opts => {
    const authPluginId = storage.getAuthPluginId();

    if (authPluginId && !opts?.input) {
      throw Error(
        "input should be provided when logged in with external plugin"
      );
    }

    storage.clear();

    client.writeQuery({
      query: USER,
      data: {
        authenticating: false,
      },
    });

    client.resetStore();

    if (authPluginId && opts?.input) {
      const result = await client.mutate<
        ExternalLogoutMutation,
        ExternalLogoutMutationVariables
      >({
        mutation: EXTERNAL_LOGOUT,
        variables: {
          ...opts,
          pluginId: authPluginId,
        },
      });
      return result;
    }
    return null;
  };

  /**
   * Registers user with email and password.
   *
   * @param opts - Object with user's data. Email and password are required fields.
   * "channel" can be changed by using first "setChannel" method from api.
   * @returns Promise resolved with AccountRegister type data.
   */
  const register: AuthSDK["register"] = async opts =>
    await client.mutate<RegisterMutation, RegisterMutationVariables>({
      mutation: REGISTER,
      variables: {
        input: {
          ...opts,
          channel,
        },
      },
    });

  /**
   * Refresh JWT token. Mutation will try to take refreshToken from the function's arguments.
   * If it fails, it will try to use refreshToken from the http-only cookie called refreshToken.
   *
   * @param includeUser - Whether to fetch user. Default false.
   * @returns Authorization token.
   */
  const refreshToken: AuthSDK["refreshToken"] = (includeUser = false) => {
    const csrfToken = storage.getCSRFToken();

    if (!csrfToken) {
      throw Error("csrfToken not present");
    }

    if (includeUser) {
      return client.mutate<
        RefreshTokenWithUserMutation,
        RefreshTokenWithUserMutationVariables
      >({
        mutation: REFRESH_TOKEN_WITH_USER,
        variables: {
          csrfToken,
        },
        update: (_, { data }) => {
          if (data?.tokenRefresh?.token) {
            storage.setAccessToken(data.tokenRefresh.token);
          } else {
            logout();
          }
        },
      });
    } else {
      return client.mutate<RefreshTokenMutation, RefreshTokenMutationVariables>(
        {
          mutation: REFRESH_TOKEN,
          variables: {
            csrfToken,
          },
          update: (_, { data }) => {
            if (data?.tokenRefresh?.token) {
              storage.setAccessToken(data.tokenRefresh.token);
            } else {
              logout();
            }
          },
        }
      );
    }
  };

  /**
   * Verify JWT token.
   *
   * @param token - Token value.
   * @returns User assigned to token and the information if the token is valid or not.
   */
  const verifyToken: AuthSDK["verifyToken"] = async () => {
    const token = storage.getAccessToken();

    if (!token) {
      throw Error("Token not present");
    }

    const result = await client.mutate<
      VerifyTokenMutation,
      VerifyTokenMutationVariables
    >({
      mutation: VERIFY_TOKEN,
      variables: { token },
    });

    if (!result.data?.tokenVerify?.isValid) {
      logout();
    }

    return result;
  };

  /**
   * Change the password of the logged in user.
   *
   * @param opts - Object with password and new password.
   * @returns Errors if the passoword change has failed.
   */
  const changePassword: AuthSDK["changePassword"] = async opts => {
    const result = await client.mutate<
      PasswordChangeMutation,
      PasswordChangeMutationVariables
    >({
      mutation: CHANGE_USER_PASSWORD,
      variables: { ...opts },
    });

    return result;
  };

  /**
   * Sends an email with the account password modification link.
   *
   * @param opts - Object with slug of a channel which will be used for notify user,
   * email of the user that will be used for password recovery and URL of a view
   * where users should be redirected to reset the password. URL in RFC 1808 format.
   *
   * @returns Errors if there were some.
   */
  const requestPasswordReset: AuthSDK["requestPasswordReset"] = async opts => {
    const result = await client.mutate<
      RequestPasswordResetMutation,
      RequestPasswordResetMutationVariables
    >({
      mutation: REQUEST_PASSWORD_RESET,
      variables: { ...opts, channel },
    });

    return result;
  };

  /**
   * Sets the user's password from the token sent by email.
   *
   * @param opts - Object with user's email, password and one-time token required to set the password.
   * @returns User instance, JWT token, JWT refresh token and CSRF token.
   */
  const setPassword: AuthSDK["setPassword"] = opts => {
    return client.mutate<SetPasswordMutation, SetPasswordMutationVariables>({
      mutation: SET_PASSWORD,
      variables: { ...opts },
      update: (_, { data }) => {
        if (data?.setPassword?.token) {
          storage.setTokens({
            accessToken: data.setPassword.token,
            csrfToken: data.setPassword.csrfToken || null,
          });
        }
      },
    });
  };

  /**
   * Executing externalAuthenticationUrl mutation will prepare special URL which will redirect user to requested
   * page after successfull authentication. After redirection state and code fields will be added to the URL.
   *
   * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
   * JSON with redirectUrl - the URL where the user should be redirected after successful authentication.
   * @returns Authentication data and errors
   */
  const getExternalAuthUrl: AuthSDK["getExternalAuthUrl"] = async opts => {
    const result = await client.mutate<
      ExternalAuthenticationUrlMutation,
      ExternalAuthenticationUrlMutationVariables
    >({
      mutation: EXTERNAL_AUTHENTICATION_URL,
      variables: { ...opts },
    });

    return result;
  };

  /**
   * The externalObtainAccessTokens mutation will generate requested access tokens.
   *
   * @param opts - Object withpluginId default value set as "mirumee.authentication.openidconnect" and input as
   * JSON with code - the authorization code received from the OAuth provider and state - the state value received
   * from the OAuth provider
   * @returns Login authentication data and errors
   */
  const getExternalAccessToken: AuthSDK["getExternalAccessToken"] = opts => {
    client.writeQuery({
      query: USER,
      data: {
        authenticating: true,
      },
    });

    return client.mutate<
      ExternalObtainAccessTokensMutation,
      ExternalObtainAccessTokensMutationVariables
    >({
      mutation: OBTAIN_EXTERNAL_ACCESS_TOKEN,
      variables: {
        ...opts,
      },
      update: (_, { data }) => {
        if (data?.externalObtainAccessTokens?.token) {
          storage.setAuthPluginId(opts.pluginId);
          storage.setTokens({
            accessToken: data.externalObtainAccessTokens.token,
            csrfToken: data.externalObtainAccessTokens.csrfToken || null,
          });
        }
      },
    });
  };

  /**
   * The externalRefresh mutation will generate new access tokens when provided with a valid refresh token.
   *
   * @param includeUser - Whether to fetch user. Default false.
   * @returns Token refresh data and errors
   */
  const refreshExternalToken: AuthSDK["refreshExternalToken"] = (
    includeUser = false
  ) => {
    const csrfToken = storage.getCSRFToken();
    const authPluginId = storage.getAuthPluginId();

    if (!csrfToken) {
      throw Error("csrfToken not present");
    }

    if (includeUser) {
      return client.mutate<
        ExternalRefreshWithUserMutation,
        ExternalRefreshWithUserMutationVariables
      >({
        mutation: EXTERNAL_REFRESH_WITH_USER,
        variables: {
          pluginId: authPluginId,
          input: JSON.stringify({
            csrfToken,
          }),
        },
        update: (_, { data }) => {
          if (data?.externalRefresh?.token) {
            storage.setTokens({
              accessToken: data.externalRefresh.token,
              csrfToken: data.externalRefresh.csrfToken || null,
            });
          } else {
            logout();
          }
        },
      });
    } else {
      return client.mutate<
        ExternalRefreshMutation,
        ExternalRefreshMutationVariables
      >({
        mutation: EXTERNAL_REFRESH,
        variables: {
          pluginId: authPluginId,
          input: JSON.stringify({
            csrfToken,
          }),
        },
        update: (_, { data }) => {
          if (data?.externalRefresh?.token) {
            storage.setTokens({
              accessToken: data.externalRefresh.token,
              csrfToken: data.externalRefresh.csrfToken || null,
            });
          } else {
            logout();
          }
        },
      });
    }
  };

  /**
   * The mutation will verify the authentication token.
   *
   * @returns Token verification data and errors
   */
  const verifyExternalToken: AuthSDK["verifyExternalToken"] = async () => {
    const csrfToken = storage.getCSRFToken();
    const authPluginId = storage.getAuthPluginId();

    if (!csrfToken) {
      throw Error("csrfToken not present");
    }

    const result = await client.mutate<
      ExternalVerifyMutation,
      ExternalVerifyMutationVariables
    >({
      mutation: EXTERNAL_VERIFY_TOKEN,
      variables: {
        pluginId: authPluginId,
        input: JSON.stringify({
          csrfToken,
        }),
      },
    });

    if (!result.data?.externalVerify?.isValid) {
      storage.clear();
    }

    return result;
  };

  return {
    changePassword,
    getExternalAccessToken,
    getExternalAuthUrl,
    login,
    logout,
    refreshExternalToken,
    refreshToken,
    register,
    requestPasswordReset,
    setPassword,
    verifyExternalToken,
    verifyToken,
  };
};
