import { Signer } from "did-jwt";

export type KeyPairRequirements = {
    kid: string;
    did: string;
    privKeyHex?: string;
    signer?: Signer;
};
