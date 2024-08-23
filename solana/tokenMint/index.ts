// import { uploadMetadataToPinata } from "../../utils/pinata";
import { MyContext, SessionInfo } from "../../types/context";
import { prepareMetadata } from "./metadata";
import {
  createMintWithTransferFee,
  delay,
  mintTokensToAccount,
  transferTokensWithFee,
  withdrawWithheldFees,
} from "./token2022";
import { Metadata } from "../../types/metadata";
import { PublicKey } from "@solana/web3.js";

export const mintToken = async (sessionInfo: SessionInfo) => {
  console.log("Welcome to mintToken!");
  try {
    // 1. Upload metadata to Pinata
    // const metadata = await prepareMetadata(sessionInfo);
    // console.log("[metadata]", metadata);
    // const metadataUrl = await uploadMetadataToPinata(metadata);
    // if (!metadataUrl) {
    //   throw new Error("Failed to upload metadata to Pinata");
    // } else {
    //   console.log("Succeed to upload metadata mintToken!", metadataUrl);
    // }

    const metadataUrl =
      "https://salmon-occupational-spider-382.mypinata.cloud/ipfs/QmTySyzK269AcwHkFtKBWX6aSG1qpUitDmHco7CuqATkaG";

    // 2. Create Mint with Transfer Fee
    // const tokenAccount = await createMintWithTransferFee(
    //   sessionInfo,
    //   metadataUrl
    // );
    // return tokenAccount.toString();

    // // 4. Transfer Tokens with Fee
    // const amount: bigint = BigInt(10);
    // await transferTokensWithFee(mint, tokenAccount, sessionInfo, amount);

    // // 5. Withdraw Withheld Fees
    const mint = new PublicKey("2SjvXzrucowqvPy29N4DRj9jhH1miQMQZeAJMMTw6jDk");
    await withdrawWithheldFees(mint, sessionInfo);

    // console.log(
    //   "Successfully minted tokens with transfer fee (Mint:",
    //   mint.toString(),
    //   ")"
    // );
  } catch (error) {
    console.error("Error minting tokens:", error);
    return null;
  }
};
