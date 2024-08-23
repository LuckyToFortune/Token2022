import { mintToken } from "./index";
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SessionInfo } from "./../../types/context";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAccount,
  createAssociatedTokenAccountIdempotent,
  createAssociatedTokenAccountInstruction,
  createInitializeAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  harvestWithheldTokensToMint,
  LENGTH_SIZE,
  mintTo,
  TOKEN_2022_PROGRAM_ID,
  transferCheckedWithFee,
  TYPE_SIZE,
  withdrawWithheldTokensFromAccounts,
} from "@solana/spl-token";
import { connection } from "../../config/solana";
import { env } from "../../config/env";
import {
  createInitializeInstruction,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

// Helper function to generate Explorer URL
function generateExplorerTxUrl(txId: string) {
  return `https://explorer.solana.com/tx/${txId}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendTransactionWithRetry(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[],
  retries = 5
) {
  let delayDuration = 1000; // Start with 1 second delay
  // while (retries > 0) {
  try {
    transaction.feePayer = signers[0].publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers
    );
    return signature;
  } catch (error) {
    // Log the entire error to inspect its structure
    console.error("Transaction error:", error);

    // Check if the error contains "429" in any part of the object
    const errorMessage = error?.toString() || JSON.stringify(error);
    // if (errorMessage.includes("429")) {
    //   console.log(
    //     `Rate limit hit, retrying after ${delayDuration / 1000} seconds...`
    //   );
    //   await delay(delayDuration);
    //   retries--;
    //   delayDuration *= 2; // Exponential backoff
    // } else {
    //   throw error; // Re-throw if it's not a 429 rate limit error
    // }
  }
  // }
  throw new Error(
    "Failed to send transaction after multiple retries due to rate limiting."
  );
}

// Create Mint with Transfer Fee
export async function createMintWithTransferFee(
  sessionInfo: SessionInfo,
  metadataUrl: string
): Promise<PublicKey> {
  // Transaction to send
  let transaction: Transaction;
  // Transaction signature returned from sent transaction
  let transactionSignature: string;

  const payer = sessionInfo.devWallet;

  // Generate new keypair for Mint Account
  const mintKeypair = Keypair.generate();
  //   Address for Mint Account
  const mint = mintKeypair.publicKey;

  const feeBasisPoints = sessionInfo.tokenInfo.fee * 100 || 100; // 100 basis points = 1%
  const maxFee = BigInt(
    ((sessionInfo.tokenInfo.tokenAmount * sessionInfo.tokenInfo.maxFee) / 100) *
      10 ** sessionInfo.tokenInfo.tokenDecimals ||
      5_000 * 10 ** sessionInfo.tokenInfo.tokenDecimals
  ); // Maximum fee in tokens

  const metadata: TokenMetadata = {
    mint: mint,
    name: sessionInfo.tokenInfo.tokenName,
    symbol: sessionInfo.tokenInfo.tokenSymbol,
    uri: metadataUrl,
    additionalMetadata: [], // Add any additional metadata fields here
  };

  const extensions = [
    ExtensionType.TransferFeeConfig,
    ExtensionType.MetadataPointer,
  ];
  // Size of Mint Account with extension
  const mintLen = getMintLen(extensions);

  // Size of MetadataExtension 2 bytes for type, 2 bytes for length, Size of metadata
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

  const mintLamports = await connection.getMinimumBalanceForRentExemption(
    mintLen + metadataLen
  );

  // Generate a new Keypair for the token account
  const owner = Keypair.generate();
  const tokenAccount = owner.publicKey;

  // Get the rent-exempt balance needed for a token account
  const tokenAccountRentExemption =
    await connection.getMinimumBalanceForRentExemption(165); // 165 bytes is the space needed for a token account

  const mintAmount =
    BigInt(sessionInfo.tokenInfo.tokenAmount) *
    BigInt(10 ** sessionInfo.tokenInfo.tokenDecimals);

  // Minimum lamports required for Mint Account
  const mintTransaction = new Transaction().add(
    // Instruction to invoke System Program to create new account
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
      newAccountPubkey: mint, // Address of the account to create
      space: mintLen, // Amount of bytes to allocate to the created account
      lamports: mintLamports, // Amount of lamports transferred to created account
      programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
    }),

    createInitializeTransferFeeConfigInstruction(
      mint,
      payer.publicKey,
      new PublicKey(env.FEE_RECEIVER_ADDRESS),
      feeBasisPoints,
      maxFee,
      TOKEN_2022_PROGRAM_ID
    ),
    // Instruction to initialize the MetadataPointer Extension
    createInitializeMetadataPointerInstruction(
      mint, // Mint Account address
      payer.publicKey, // Authority that can set the metadata address
      mint, // Account address that holds the metadata
      TOKEN_2022_PROGRAM_ID
    ),
    // note: the above instructions are required before initializing the mint
    // Instruction to initialize Mint Account data
    createInitializeMintInstruction(
      mint, // Mint Account Address
      sessionInfo.tokenInfo.tokenDecimals, // Decimals of Mint
      payer.publicKey, // Designated Mint Authority
      null, // Optional Freeze Authority
      TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    ),
    // Instruction to initialize Metadata Account data
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      mint: mint, // Mint Account address
      metadata: mint, // Account address that holds the metadata
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
      mintAuthority: payer.publicKey, // Designated Mint Authority
      updateAuthority: payer.publicKey, // Authority that can update the metadata
    })
  );
  // console.log("mintTransaction->", mintTransaction);

  // Send the transaction with the required signers
  const signature = await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [sessionInfo.devWallet, mintKeypair] // Ensure all keypairs are included
  );
  console.log(
    "\n[Create Mint Account]:",
    `https://solana.fm/tx/${signature}?cluster=devnet-solana`
  );
  console.log(
    "[Mint Account]:",
    `https://solana.fm/address/${mint}?cluster=devnet-solana`
  );

  const sourceTokenAccount = await getAssociatedTokenAddress(
    mint,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      sourceTokenAccount,
      payer.publicKey,
      mint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createMintToInstruction(
      mint,
      sourceTokenAccount,
      payer.publicKey,
      mintAmount,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  const mintSig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
    { skipPreflight: true }
  );

  console.log(
    "\n[Tokens Minted]:",
    `https://solana.fm/tx/${mintSig}?cluster=devnet-solana`
  );
  console.log(
    "[Token Account]:",
    `https://solana.fm/address/${tokenAccount}?cluster=devnet-solana`
  );

  return tokenAccount;
}

// Mint Tokens to Account
export async function mintTokensToAccount(
  mint: PublicKey,
  sessionInfo: SessionInfo
) {
  const owner = Keypair.generate();
  const tokenAccount = await createAccount(
    connection,
    sessionInfo.devWallet,
    mint,
    owner.publicKey,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const mintAmount =
    BigInt(sessionInfo.tokenInfo.tokenAmount) *
    BigInt(10 ** sessionInfo.tokenInfo.tokenDecimals);

  await mintTo(
    connection,
    sessionInfo.devWallet,
    mint,
    tokenAccount,
    sessionInfo.devWallet,
    mintAmount,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  return tokenAccount;
}

// Transfer Tokens with Fee
export async function transferTokensWithFee(
  mint: PublicKey,
  sourceAccount: PublicKey,
  sessionInfo: SessionInfo,
  amount: bigint
) {
  const destinationAccount = await createAccount(
    connection,
    sessionInfo.devWallet,
    mint,
    sessionInfo.devWallet.publicKey,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  const transferAmount = BigInt(amount || 1_000_000);
  const fee =
    (transferAmount * BigInt(sessionInfo.tokenInfo.fee * 100 || 100)) /
    BigInt(10_000);

  await transferCheckedWithFee(
    connection,
    sessionInfo.devWallet,
    sourceAccount,
    mint,
    destinationAccount,
    sessionInfo.devWallet,
    transferAmount,
    sessionInfo.tokenDecimals,
    fee,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  return destinationAccount;
}

// Withdraw Withheld Fees
export async function withdrawWithheldFees(
  mint: PublicKey,
  sessionInfo: SessionInfo
) {
  const allAccounts = await connection.getProgramAccounts(
    TOKEN_2022_PROGRAM_ID,
    {
      commitment: "confirmed",
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: mint.toString(),
          },
        },
      ],
    }
  );

  const accountsToWithdrawFrom = allAccounts.map(
    (accountInfo) => accountInfo.pubkey
  );

  if (accountsToWithdrawFrom.length > 0) {
    await withdrawWithheldTokensFromAccounts(
      connection,
      sessionInfo.devWallet,
      mint,
      new PublicKey(env.FEE_RECEIVER_ADDRESS),
      sessionInfo.devWallet.publicKey,
      [],
      accountsToWithdrawFrom,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  } else {
    console.log("No accounts with withheld fees found.");
  }
}
