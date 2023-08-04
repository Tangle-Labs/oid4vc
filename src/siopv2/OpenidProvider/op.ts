import { PEX } from "@sphereon/pex";
import { parseQueryStringToJson } from "../../utils/query";
import { OPOptions } from "./index.types";
import * as didJWT from "did-jwt";
import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import axios from "axios";
import { buildSigner } from "../../utils/signer";
import { Resolvable } from "did-resolver";
import { SiopRequest } from "../index.types";

export class OpenidProvider {
    private did: string;
    private kid: string;
    private privKeyHex: string;
    private signer: didJWT.Signer;
    private resolver: Resolvable;

    constructor(args: OPOptions) {
        this.did = args.did;
        this.kid = args.kid;
        this.privKeyHex = args.privKeyHex;
        this.signer = buildSigner(this.privKeyHex);
        this.resolver = args.resolver;
    }

    async createIDTokenResponse(request: SiopRequest) {
        const jwt = await didJWT.createJWT(
            {
                aud: request.clientId,
                iat: undefined,
                sub: this.did,
                exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
            },
            {
                issuer: this.did,
                signer: this.signer,
            },
            { alg: "EdDSA", kid: this.kid }
        );

        return { id_token: jwt };
    }

    private async encodeJwtVp(
        vp: Record<string, any>,
        request: SiopRequest
    ): Promise<string> {
        const vpToken = await didJWT.createJWT(
            {
                sub: this.did,
                aud: request.clientId,
                vp: { ...vp },
            },
            { issuer: this.did, signer: this.signer },
            { alg: "EdDSA", kid: this.kid }
        );
        return vpToken;
    }

    private async decodeVcJwt(jwt: string) {
        const {
            payload: { vc },
        } = didJWT.decodeJWT(jwt);
        return vc;
    }

    async getCredentialsFromRequest(request: string, credentials: any[]) {
        const pex = new PEX();
        const requestOptions = parseQueryStringToJson(
            request.split("siopv2://idtoken")[1]
        ) as SiopRequest;

        if (requestOptions.responseType !== "vp_token")
            throw new Error("invalid response type");
        const selected = pex.selectFrom(
            requestOptions.presentationDefinition,
            credentials
        );
        if (selected.areRequiredCredentialsPresent === "error")
            throw new Error("credentials not found");

        return selected.verifiableCredential;
    }

    async createVPTokenResponse(
        presentationDefinition: PresentationDefinitionV2,
        credentials: string[],
        request: SiopRequest
    ) {
        const pex = new PEX();
        const rawCredentials = await Promise.all(
            credentials.map(async (c) => this.decodeVcJwt(c))
        );
        pex.evaluateCredentials(presentationDefinition, rawCredentials);
        const { presentation, presentationSubmission } = pex.presentationFrom(
            presentationDefinition,
            rawCredentials,
            { holderDID: this.did }
        );

        const selectedCreds = await Promise.all(
            credentials.filter(async (c) => {
                presentation.verifiableCredential.includes(
                    await this.decodeVcJwt(c)
                );
            })
        );

        presentation.verifiableCredential = selectedCreds;
        const vp_token = await this.encodeJwtVp(presentation, request);
        return {
            vp_token,
            presentation_submission: presentationSubmission,
        };
    }

    async sendAuthResponse(request: string, credentials?: any[]) {
        const requestRaw = parseQueryStringToJson(
            request.split("siopv2://idtoken")[1]
        );
        let requestJwt: string;
        requestRaw.requestUri
            ? (requestJwt = (await axios.get(requestRaw.requestUri)).data)
            : (requestJwt = requestRaw.request);

        const requestOptions = (
            await didJWT.verifyJWT(requestJwt, {
                resolver: this.resolver,
            })
        ).payload as SiopRequest;
        let response: Record<string, any>;
        if (requestOptions.responseType === "id_token") {
            response = await this.createIDTokenResponse(requestOptions);
        } else if (requestOptions.responseType === "vp_token") {
            if (!credentials) throw new Error("credentials not passed");
            response = await this.createVPTokenResponse(
                requestOptions.presentationDefinition,
                credentials,
                requestOptions
            );
        }
        response = { ...response, nonce: requestOptions.nonce };
        await axios.post(requestOptions.redirectUri, response).catch(() => {
            throw new Error("unable to send response");
        });

        return response;
    }
}

export * from "./index.types";
