import { CreateTokenRequestOptions } from "./index.types";
import { KeyPairRequirements } from "../../common/index.types";
export declare class VcHolder {
    private holderKeys;
    private signer;
    constructor(args: KeyPairRequirements);
    createTokenRequest(args: CreateTokenRequestOptions): Promise<{
        grant_type: string;
        "pre-authorized_code": string;
    }>;
    parseCredentialOffer(offer: string): Record<string, any>;
    retrieveMetadata(credentialOffer: string): Promise<any>;
    retrieveCredential(path: string, accessToken: string, credentials: string[], proof: string): Promise<string[]>;
    getCredentialFromOffer(credentialOffer: string, pin?: number): Promise<string[]>;
}
export * from "./index.types";
