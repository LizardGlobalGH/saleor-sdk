import { UserDetailsQuery } from "../../apollo/types";
/**
 * React hook to get authorization methods
 *
 * @returns Saleor's authorization methods
 */
export declare const useAuth: () => import("../../core/auth").AuthSDK;
/**
 * React hook to get user's authentication data.
 *
 * @returns Object with user's data
 */
export declare const useAuthState: () => UserDetailsQuery;
