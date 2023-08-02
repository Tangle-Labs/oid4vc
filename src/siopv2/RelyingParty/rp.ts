import { nanoid } from "nanoid";
import { objectToQueryString } from "../../utils/query";
import { CreateRequestOptions, RPOptions, AuthResponse } from "./index.types";
import * as didJWT from "did-jwt";
import { PEX } from "@sphereon/pex";
import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import { buildSigner } from "../../utils/signer";
import { RESOLVER } from "../../config";

export class RelyingParty {
    private metadata: RPOptions;
    private did: string;
    private kid: string;
    private privKeyHex: string;
    private signer: didJWT.Signer;

    /**
     * Create a new instance of the Relying Party class
     *
     * @param {RPOptions} args
     */

    constructor(args: RPOptions) {
        this.metadata = args;
        this.did = args.did;
        this.kid = args.kid;
        this.privKeyHex = args.privKeyHex;
        this.signer = buildSigner(this.privKeyHex);
    }

    /**
     * Create a new SIOP Request
     */

    createRequest(args: CreateRequestOptions) {
        const {
            requestBy,
            overrideLogo,
            overrideClientName,
            ...requestOptions
        } = args;
        const { privKeyHex, did, kid, ...metadata } = this.metadata;
        const requestData = {
            ...requestOptions,
            ...metadata,
            scope: "openid",
            responseMode: "post",
        };
        requestData.clientMetadata.logo_uri =
            overrideLogo ?? requestData.clientMetadata.logo_uri;
        requestData.clientMetadata.client_name =
            overrideClientName ?? requestData.clientMetadata.client_name;

        const requestQuery = objectToQueryString(requestData);

        return `siopv2://idtoken${requestQuery}`;
    }

    async validateJwt(jwt: string): Promise<Record<string, any>> {
        const result = await didJWT.verifyJWT(jwt, {
            resolver: RESOLVER,
            policies: {
                aud: false,
            },
        });
        if (!result.verified) throw new Error("Invalid JWT");
        return result.payload;
    }

    async verifyAuthResponse(
        authResponse: AuthResponse,
        presentationDefinition?: PresentationDefinitionV2
    ) {
        if (
            !(
                authResponse.id_token ||
                (authResponse.vp_token && authResponse.presentation_submission)
            )
        )
            throw new Error("Bad response");
        if (authResponse.id_token) {
            await this.validateJwt(authResponse.id_token);
            return;
        } else if (
            authResponse.vp_token &&
            authResponse.presentation_submission
        ) {
            const { vp } = await this.validateJwt(authResponse.vp_token);
            const verifiableCredential = Array.isArray(vp.verifiableCredential)
                ? await Promise.all(
                      vp.verifiableCredential.map(
                          async (vc: string) => (await this.validateJwt(vc)).vc
                      )
                  )
                : await this.validateJwt(vp.verifiableCredential);
            const presentation = { ...vp, verifiableCredential };
            const pex = new PEX();
            const { areRequiredCredentialsPresent } = pex.evaluatePresentation(
                presentationDefinition,
                presentation,
                {
                    generatePresentationSubmission: true,
                }
            );

            if (areRequiredCredentialsPresent === "error")
                throw new Error("Invalid Credentials Shared");
        }
    }

    async createAuthToken(did: string) {
        const token = await didJWT.createJWT(
            {
                aud: did,
                exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
                iat: Math.floor(Date.now() / 1000),
                iss: this.did,
            },
            { issuer: this.did, signer: this.signer },
            { alg: "EdDSA", kid: this.kid }
        );
        return token;
    }
}

export * from "./index.types";
