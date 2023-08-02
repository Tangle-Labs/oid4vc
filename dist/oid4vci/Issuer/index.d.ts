import { CreateCredentialOfferOptions, IIssuerStore, IssuerStoreData, VcIssuerOptions } from "./index.types";
import { TokenRequest } from "../Holder/index.types";
import * as didJWT from "did-jwt";
export declare class VcIssuer {
    metadata: Omit<VcIssuerOptions, "store" | "did" | "kid" | "privKeyHex">;
    store: IIssuerStore<IssuerStoreData>;
    signer: didJWT.Signer;
    did: string;
    kid: string;
    private privKeyHex;
    constructor(options: VcIssuerOptions);
    getIssuerMetadata(): {
        credential_issuer: string;
        credential_endpoint: string;
        batch_credential_endpoint: string;
        credentials_supported: {
            format: string;
            cryptographic_binding_methods_supported: ("did:iota" | "did:key")[];
            cryprographic_suites_supported: "EdDSA"[];
            proof_types_supported: "jwt"[];
        }[];
        display: {
            logo_uri: string;
            client_name: string;
        };
    };
    createCredentialOffer(args: CreateCredentialOfferOptions, extras?: Record<string, any>): Promise<{
        request: string;
        pin?: number;
    }>;
    createTokenResponse(request: TokenRequest): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
        c_nonce: string;
        c_nonce_expires_in: number;
    }>;
    validateCredentialsResponse({ token, proof, }: {
        token?: string;
        proof?: string;
    }): Promise<string>;
    createSendCredentialsResponse({ credentials, }: {
        credentials: string[];
    }): Promise<{
        credential_responses: any[];
        format?: undefined;
        credential?: undefined;
    } | {
        format: string;
        credential: string;
        credential_responses?: undefined;
    }>;
}
export * from "./index.types";
