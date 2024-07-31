import { Signer } from "did-jwt";
import { SigningAlgs } from "../siopv2/siop";

export type KeyPairRequirements = {
    kid: string;
    did: string;
    privKeyHex?: string;
    signer?: Signer;
    signingAlgorithm: SigningAlgs;
};
