import { SaleorClient } from "../../core/types";
export declare const hookFactory: <T extends "auth" | "user" | "config" | "_internal" | "getState">(query: T) => () => SaleorClient[T];
