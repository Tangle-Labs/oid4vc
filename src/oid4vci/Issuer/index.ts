import { nanoid } from "nanoid";
import { objectToQueryString } from "../../utils/query";
import {
    CreateCredentialOfferOptions,
    IIssuerStore,
    IssuerStoreData,
    VcIssuerOptions,
} from "./index.types";
import { generatePin } from "../../utils/pin";
import { TokenRequest } from "../Holder/index.types";
import * as didJWT from "did-jwt";
import { IotaDIDResolver } from "../../utils/resolver";
import { buildSigner } from "../../utils/signer";
import { KeyPairRequirements } from "../../common/index.types";

export class VcIssuer {
    metadata: Omit<VcIssuerOptions, "store" | "did" | "kid" | "privKeyHex">;
    store: IIssuerStore<IssuerStoreData>;
    signer: didJWT.Signer;
    did: string;
    kid: string;
    private privKeyHex: string;

    constructor(options: VcIssuerOptions) {
        const { store, did, privKeyHex, kid, ...others } = options;
        this.metadata = others;
        this.store = store;
        this.signer = buildSigner(options.privKeyHex);
        this.did = did;
        this.kid = kid;
        this.privKeyHex = privKeyHex;
    }

    getIssuerMetadata() {
        return {
            credential_issuer: this.metadata.credentialIssuer,
            credential_endpoint: this.metadata.credentialEndpoint,
            credentials_supported: [
                {
                    format: "jwt_vc_json",
                    cryptographic_binding_methods_supported:
                        this.metadata.cryptographicBindingMethodsSupported,
                    cryprographic_suites_supported:
                        this.metadata.cryptographicSuitesSupported,
                    proof_types_supported: this.metadata.proofTypesSupported,
                },
            ],
        };
    }

    async createCredentialOffer(args: CreateCredentialOfferOptions): Promise<{
        request: string;
        pin: number;
    }> {
        const { credentialType, format, ...options } = args;

        const id = nanoid();
        const offer = {
            credentialIssuer: this.metadata.credentialIssuer,
            ...options,
            credentials: [
                {
                    format,
                    credentialType,
                },
            ],
            issuerState: id,
        };
        const pin = generatePin();

        await this.store.create({ id, pin });
        const request = `openid-credential-offer://${objectToQueryString(
            offer
        )}`;
        return { request, pin };
    }

    async createTokenResponse(response: TokenRequest) {
        const { pin } = await this.store.getById(response.issuer_state);
        if (
            !response.grant_type ||
            !response.issuer_state ||
            !response["pre-authorized_code"] ||
            !response.user_pin
        )
            throw new Error("invalid_request");
        if (pin !== response.user_pin) throw new Error("invalid_grant");
        const {
            signer,
            payload: { aud },
        } = await didJWT
            .verifyJWT(response["pre-authorized_code"], {
                resolver: new IotaDIDResolver(),
                policies: { aud: false },
            })
            .catch(() => {
                throw new Error("invalid_request");
            });
        if (signer.controller !== this.metadata.preAuthTokenIssuer)
            throw new Error("invalid_request");
        const access_token = await didJWT.createJWT(
            { aud, iat: Math.floor(Date.now() / 1000) },
            {
                issuer: this.did,
                signer: this.signer,
                expiresIn: 24 * 60 * 60,
            },
            { alg: "EdDSA", kid: this.kid }
        );

        return {
            access_token,
            token_type: "bearer",
            expires_in: 86400,
        };
    }

    async createSendCredentialsResponse({
        token,
        credential,
    }: {
        token?: string;
        credential: string;
    }) {
        if (!token) throw new Error("invalid_request");
        const { payload, signer } = await didJWT.verifyJWT(token, {
            policies: { aud: false },
        });
        if (
            signer.controller !== this.did ||
            payload.exp > Math.floor(Date.now() / 1000)
        )
            throw new Error("Invalid Token");
        return {
            format: "jwt_vc_json",
            credential,
        };
    }
}

export * from "./index.types";
