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
import { buildSigner } from "../../utils/signer";
import { RESOLVER } from "../../config";

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

        const code = await didJWT.createJWT(
            { id, iat: Math.floor(Date.now() / 1000) },
            {
                issuer: this.did,
                signer: this.signer,
                expiresIn: 24 * 60 * 60,
            },
            { alg: "EdDSA", kid: this.kid }
        );

        const offer = {
            credentialIssuer: this.metadata.credentialIssuer,
            ...options,
            credentials: [
                {
                    format,
                    credentialType,
                },
            ],
            grants: {
                "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
                    "pre-authorized_code": code,
                    user_pin_required: true,
                },
            },
        };
        const pin = generatePin();

        await this.store.create({ id, pin });
        const request = `openid-credential-offer://${objectToQueryString(
            offer
        )}`;
        return { request, pin };
    }

    async createTokenResponse(request: TokenRequest) {
        console.log(request);
        if (
            !request.grant_type ||
            !request["pre-authorized_code"] ||
            !request.user_pin
        )
            throw new Error("invalid_request");
        const { signer, payload } = await didJWT
            .verifyJWT(request["pre-authorized_code"], {
                resolver: RESOLVER,
                policies: { aud: false },
            })
            .catch((e) => {
                throw new Error("invalid_request");
            });
        const { pin } = await this.store.getById(payload.id);

        if (pin !== request.user_pin) throw new Error("invalid_grant");
        if (signer.controller !== this.did) throw new Error("invalid_token");
        const access_token = await didJWT.createJWT(
            { aud: payload.aud, iat: Math.floor(Date.now() / 1000) },
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
            resolver: RESOLVER,
        });
        if (
            signer.controller !== this.did ||
            payload.exp < Math.floor(Date.now() / 1000)
        )
            throw new Error("invalid_token");
        return {
            format: "jwt_vc_json",
            credential,
        };
    }
}

export * from "./index.types";
