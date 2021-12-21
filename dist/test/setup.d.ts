import { Context } from "setup-polly-jest";
import { PollyServer } from "@pollyjs/core";
import { SaleorClient } from "../src/core";
export declare const setupPollyMiddleware: (server: PollyServer) => void;
export declare const setupRecording: () => Context;
export declare const setupSaleorClient: () => SaleorClient;
