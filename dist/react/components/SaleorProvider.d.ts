import React from "react";
import { SaleorClient } from "../../core";
export declare type SaleorContextType = {
    client: SaleorClient;
};
export declare const SaleorContext: React.Context<SaleorClient | null>;
export declare const SaleorProvider: React.FC<{
    client: SaleorClient;
}>;
