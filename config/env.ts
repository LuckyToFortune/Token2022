import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Export configuration
export const env = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  RPC_URL: process.env.RPC_URL || "",
  WALLET_PATH: process.env.WALLET_PATH || "",
  FEE_RECEIVER_ADDRESS: process.env.FEE_RECEIVER_ADDRESS || "",
  PINATA_JWT: process.env.PINATA_JWT || "",
  PINATA_URL: process.env.PINATA_URL || "",
  PINATA_API_KEY: process.env.PINATA_API_KEY || "",
};
