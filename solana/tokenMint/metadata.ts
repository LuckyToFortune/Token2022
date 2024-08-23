import path from "path";
import fs from "fs";
import { SessionInfo } from "./../../types/context";
import { Metadata } from "../../types/metadata";

// Prepare metadata
export async function prepareMetadata(
  sessionInfo: SessionInfo
): Promise<Metadata> {
  const tokenInfo = sessionInfo.tokenInfo;

  const metadata: Metadata = {
    name: tokenInfo.tokenName,
    symbol: tokenInfo.tokenSymbol,
    description: tokenInfo.tokenDescription,
    image: tokenInfo.image,
    external_url: tokenInfo.website,
    extensions: {
      twitter: tokenInfo.twitter,
      telegram: tokenInfo.telegram,
      discord: tokenInfo.discord,
    },
    twitter: tokenInfo.twitter,
    telegram: tokenInfo.telegram,
    discord: tokenInfo.discord,
    website: tokenInfo.website,
  };

  return metadata;
}
