// solana/token/mint.ts

import { mintToken } from "./index";
import { initialSessionInfo } from "./template";

// Call the mintToken function with the initial session information
mintToken(initialSessionInfo).then((result) => {
  if (result) {
    console.log("Minting successful:", result);
  } else {
    console.log("Minting failed.");
  }
});
