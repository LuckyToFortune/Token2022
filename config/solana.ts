import { clusterApiUrl, Connection } from "@solana/web3.js";
import { env } from "./env";

// RPC Connection
export const rpcUrl: string = env.RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(rpcUrl, "confirmed");
console.log("[RPCURL]", rpcUrl);
