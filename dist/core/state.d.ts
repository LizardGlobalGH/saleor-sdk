import { UserDetailsQuery } from "../apollo/types";
import { SaleorClientInternals } from "./types";
export declare type State = UserDetailsQuery | null;
export declare const getState: (client: SaleorClientInternals["apolloClient"]) => State;
