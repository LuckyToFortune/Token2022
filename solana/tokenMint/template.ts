import bs58 from "bs58";
import { Context, Scenes } from "telegraf";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  MySession,
  MySceneSession,
  SessionInfo,
  MyContext,
} from "../../types/context";
import { Metadata } from "../../types/metadata";

// Example wallets for demonstration purposes
// const devWallet = Keypair.generate();
const devWallet = Keypair.fromSecretKey(
  Uint8Array.from(bs58.decode("private-key"))
);
const bundleWallet = Keypair.generate();

// Simplified session data initialization
export const initialSessionInfo: SessionInfo = {
  verification: true,
  currentSettingStep: 0,
  expectingInput: "",
  setupCompleted: false,
  poolAddress: new PublicKey("11111111111111111111111111111111"),
  contractAddress: new PublicKey("11111111111111111111111111111111"),
  layers: "",
  id: 1,
  bundleSize: 1000,
  bundleSizeSecond: 500,
  bundleSizeThird: 250,
  withdrawAddress: new PublicKey("11111111111111111111111111111111"),
  solInPool: 100,
  tokensInPool: 100000,
  buyback: 50,
  entries: [],
  devWallet: devWallet,
  bundleWallet: bundleWallet,
  bundleWalletSecond: "",
  bundleWalletThird: "",
  distributeAccounts: 0,
  coinVault: "",
  solVault: "",
  tokenDecimals: 6,
  collectWallet: "",
  lpMint: "",
  jobInProgress: false,
  authString: "",
  lut: "",
  swapKeys: "",
  openbookAddress: new PublicKey("11111111111111111111111111111111"),
  tokenInfo: {
    tokenName: "MyToken",
    tokenSymbol: "MTK",
    tokenAmount: 10_000_000_000,
    tokenDecimals: 6,
    tokenDescription:
      "This is a description of MyToken, an example token for demonstration purposes.",
    image:
      "https://salmon-occupational-spider-382.mypinata.cloud/ipfs/bafybeidp45w3pbtjmlvpo7ncwbifxqwvvui6xadyg5przejovwd2n2hore",
    isVanity: false,
    discord: "https://discord.gg/mytoken",
    telegram: "https://t.me/mytoken",
    twitter: "https://twitter.com/mytoken",
    website: "https://mytoken-website.com",
    vanityWith: "",
    fee: 1,
    maxFee: 5,
  },
  marketId: new PublicKey("11111111111111111111111111111111"),
  sellPercentage: 0,
  tip: 1_000_000,
};

// Example Metadata usage:
export const metadata: Metadata = {
  name: "MyToken",
  symbol: "MTK",
  description:
    "This is a description of MyToken, an example token for demonstration purposes.",
  image:
    "https://salmon-occupational-spider-382.mypinata.cloud/ipfs/bafybeidp45w3pbtjmlvpo7ncwbifxqwvvui6xadyg5przejovwd2n2hore", // This could be an IPFS link like "ipfs://Qm...".
  external_url: "https://mytoken-website.com", // Optional, website link related to the token

  // Extensions and social links
  extensions: {
    twitter: "https://twitter.com/mytoken",
    telegram: "https://t.me/mytoken",
    discord: "https://discord.gg/mytoken",
  },

  twitter: "https://twitter.com/mytoken", // Optional, if you want to keep it separate outside `extensions`
  telegram: "https://t.me/mytoken", // Optional
  discord: "https://discord.gg/mytoken", // Optional
  website: "https://mytoken-website.com", // Optional
};
