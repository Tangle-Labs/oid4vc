import { nanoid } from "nanoid";
import { objectToSnakeCaseQueryString } from "../../utils/query";
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
import { Resolvable } from "did-resolver";

export class VcIssuer {
    metadata: Omit<VcIssuerOptions, "store" | "did" | "kid" | "privKeyHex">;
    store: IIssuerStore<IssuerStoreData>;
    signer: didJWT.Signer;
    did: string;
    kid: string;
    resolver: Resolvable;

    constructor(options: VcIssuerOptions) {
        const { store, did, privKeyHex, kid, ...others } = options;
        this.metadata = others;
        this.store = store;
        this.signer = buildSigner(options.privKeyHex);
        this.did = did;
        this.kid = kid;
        this.resolver = options.resolver;
    }

    getIssuerMetadata() {
        return {
            credential_issuer: this.metadata.credentialIssuer,
            credential_endpoint: this.metadata.credentialEndpoint,
            batch_credential_endpoint: this.metadata.batchCredentialEndpoint,
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
            display: {
                logo_uri: this.metadata.logo_uri,
                client_name: this.metadata.client_name,
            },
        };
    }

    async createCredentialOffer(
        args: CreateCredentialOfferOptions,
        extras: Record<string, any> = {}
    ): Promise<{
        request: string;
        pin?: number;
    }> {
        const { credentials, ...options } = args;
        const pinNeeded = !!args.pinRequired;

        const id = nanoid();

        const code = await didJWT.createJWT(
            { id, iat: Math.floor(Date.now() / 1000), ...extras },
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
            credentials: [...credentials],
            grants: {
                "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
                    "pre-authorized_code": code,
                    user_pin_required: pinNeeded,
                },
            },
        };
        const pin = args.pinRequired ? generatePin() : null;

        await this.store.create({ id, pin });
        const request = `openid-credential-offer://${objectToSnakeCaseQueryString(
            { credential_offer: offer }
        )}`;
        return { request, pin };
    }

    async createTokenResponse(request: TokenRequest) {
        if (!request.grant_type || !request["pre-authorized_code"])
            throw new Error("invalid_request");
        const { signer, payload } = await didJWT
            .verifyJWT(request["pre-authorized_code"], {
                resolver: this.resolver,
                policies: { aud: false },
            })
            .catch((e) => {
                throw new Error("invalid_request");
            });
        const { pin } = await this.store.getById(payload.id);
        const { iat, aud, iss, ...extrasRaw } = payload;
        const extras = extrasRaw ?? {};

        if (pin && pin !== request.user_pin) throw new Error("invalid_grant");
        if (signer.controller !== this.did) throw new Error("invalid_token");
        const access_token = await didJWT.createJWT(
            {
                aud: payload.aud,
                iat: Math.floor(Date.now() / 1000),
                ...extras,
            },
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
            c_nonce: nanoid(),
            c_nonce_expires_in: 86400,
        };
    }

    async validateCredentialsResponse({
        token,
        proof,
    }: {
        token?: string;
        proof?: string;
    }) {
        if (!token || !proof) throw new Error("invalid_request");
        const { payload, signer } = await didJWT.verifyJWT(token, {
            policies: { aud: false },
            resolver: this.resolver,
        });
        if (
            signer.controller !== this.did ||
            payload.exp < Math.floor(Date.now() / 1000)
        )
            throw new Error("invalid_token");
        const { signer: didSigner } = await didJWT.verifyJWT(proof, {
            policies: { aud: false },
            resolver: this.resolver,
        });

        return didSigner.controller;
    }

    async createSendCredentialsResponse({
        credentials,
    }: {
        credentials: string[];
    }) {
        let response;
        if (credentials.length > 1) {
            // @ts-ignore
            response = { credential_responses: [] };
            response.credential_responses = credentials.map((credential) => ({
                format: "jwt_vc_json",
                credential,
            }));
        } else {
            response = {
                format: "jwt_vc_json",
                credential: credentials[0],
            };
        }

        return response;
    }
}

export * from "./index.types";
