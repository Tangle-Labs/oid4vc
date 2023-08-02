import nacl from "tweetnacl";
import { bytesToString, stringToBytes } from "./bytes";
import * as didJWT from "did-jwt";
export const buildSigner = (privKeyHex) => {
    const key = nacl.box.keyPair.fromSecretKey(stringToBytes(privKeyHex));
    const secret = privKeyHex + bytesToString(key.publicKey);
    const keyPair = stringToBytes(secret);
    return didJWT.EdDSASigner(keyPair);
};
//# sourceMappingURL=signer.js.map