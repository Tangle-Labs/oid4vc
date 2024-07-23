import { bytesToString, stringToBytes } from "./bytes";
import * as didJWT from "did-jwt";

export const buildSigner = (privKeyHex: string) => {
    return didJWT.ES256Signer(stringToBytes(privKeyHex));
};
