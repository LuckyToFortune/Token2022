import { Keypair, PublicKey } from "@solana/web3.js";
import { Context, Scenes } from "telegraf";

// Scene-specific session data interface
export interface MySceneSession extends Scenes.SceneSessionData {
  mySceneSessionProp: number; // Example of a scene-specific property
}

// General session data including scene-specific data
export interface MySession extends Scenes.SceneSession<MySceneSession> {
  mySessionProp: number; // Example of a general session property
  counter: number; // A counter to track actions
  sessionInfo: SessionInfo; // Custom session data type for user-specific info
}

// Custom context type for the bot
export interface MyContext extends Context {
  myContextProp: string; // Custom context property for additional data
  session: MySession; // Session data specific to each user
  scene: Scenes.SceneContextScene<MyContext, MySceneSession>; // Scene management within the context
}

// Session information specific to the bot
export interface SessionInfo {
  verification?: boolean;
  currentSettingStep: number;
  expectingInput?: string;
  setupCompleted: boolean;
  poolAddress?: PublicKey;
  contractAddress?: PublicKey;
  layers?: string;
  id?: number;
  bundleSize?: number;
  bundleSizeSecond?: number;
  bundleSizeThird?: number;
  withdrawAddress?: PublicKey;
  solInPool?: number;
  tokensInPool?: number;
  buyback?: number;
  entries: string[];
  devWallet: Keypair;
  bundleWallet: Keypair;
  bundleWalletSecond?: string;
  bundleWalletThird?: string;
  distributeAccounts: number;
  coinVault?: string;
  solVault?: string;
  tokenDecimals: number;
  collectWallet?: string;
  lpMint?: string;
  jobInProgress: boolean;
  authString?: string;
  lut?: string;
  swapKeys?: string;
  openbookAddress?: PublicKey;
  tokenInfo: {
    tokenName: string;
    tokenSymbol: string;
    tokenAmount: number;
    tokenDecimals: number;
    tokenDescription: string;
    image: string;
    isVanity: boolean;
    discord: string;
    telegram: string;
    twitter: string;
    website: string;
    vanityWith: string;
    fee: number;
    maxFee: number;
  };
  marketId?: PublicKey;
  sellPercentage: number;
  tip: number;
  // Add index signature for dynamic properties
  [key: string]: any; // or more specifically [key: string]: boolean;
}
