import { PEX } from "@sphereon/pex";
import { bytesToString, stringToBytes } from "../../utils/bytes";
import { parseQueryStringToJson } from "../../utils/query";
import { SiopRequest } from "../index.types";
import { OPOptions } from "./index.types";
import * as didJWT from "did-jwt";
import nacl from "tweetnacl";
import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import axios from "axios";

export class OpenidProvider {
    did: string;
    kid: string;
    privKeyHex: string;
    signer: didJWT.Signer;

    constructor(args: OPOptions) {
        this.did = args.did;
        this.kid = args.kid;
        this.privKeyHex = args.privKeyHex;
        const key = nacl.box.keyPair.fromSecretKey(
            stringToBytes(this.privKeyHex)
        );
        const secret = this.privKeyHex + bytesToString(key.publicKey);
        const keyPair = stringToBytes(secret);
        this.signer = didJWT.EdDSASigner(keyPair);
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

    async createVPTokenResponse(
        presentationDefinition: PresentationDefinitionV2,
        credentials: any[],
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
        console.log(presentation);
        const vp_token = await this.encodeJwtVp(presentation, request);
        return {
            vp_token,
            presentation_submission: presentationSubmission,
        };
    }

    async sendAuthResponse(request: string, credentials?: any[]) {
        const requestOptions = parseQueryStringToJson(
            request.split("siopv2://idtoken")[1]
        ) as SiopRequest;
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
        return response;
        // return axios.post(requestOptions.redirectUri, response).catch(() => {
        //     throw new Error("unable to send response");
        // });
    }
}

export * from "./index.types";
