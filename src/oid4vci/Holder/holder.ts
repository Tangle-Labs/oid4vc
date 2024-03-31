import axios from "axios";
import { parseQueryStringToJson } from "../../utils/query";
import { CreateTokenRequestOptions } from "./index.types";
import { KeyPairRequirements } from "../../common/index.types";
import * as didJWT from "did-jwt";
import { buildSigner, snakeToCamelRecursive } from "../../utils/utils";
import { joinUrls } from "../../utils/url";

export class VcHolder {
    private holderKeys: KeyPairRequirements;
    private signer: didJWT.Signer;

    constructor(args: KeyPairRequirements) {
        this.holderKeys = args;
        this.signer = args.signer ?? buildSigner(args.privKeyHex);
    }

    async createTokenRequest(args: CreateTokenRequestOptions) {
        const response = {
            grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
            "pre-authorized_code": args.preAuthCode,
        };
        // @ts-ignore
        if (args.userPin) response.user_pin = args.userPin;
        return response;
    }

    async parseCredentialOffer(offer: string): Promise<Record<string, any>> {
        const rawOffer = parseQueryStringToJson(
            offer.split("openid-credential-offer://")[1]
        );
        let credentialOffer;
        if (rawOffer.credentialOfferUri) {
            const { data } = await axios.get(rawOffer.credentialOfferUri);
            credentialOffer = snakeToCamelRecursive(data);
        } else {
            credentialOffer = snakeToCamelRecursive(rawOffer.credentialOffer);
        }

        return credentialOffer;
    }

    async retrieveMetadata(credentialOffer: string) {
        const offerRaw = await this.parseCredentialOffer(credentialOffer);
        const metadataEndpoint = joinUrls(
            offerRaw.credentialIssuer,
            ".well-known/openid-credential-issuer"
        );
        const oauthMetadataUrl = joinUrls(
            offerRaw.credentialIssuer,
            ".well-known/oauth-authorization-server"
        );
        const { data } = await axios.get(metadataEndpoint);
        const { data: oauthServerMetadata } = await axios.get(oauthMetadataUrl);
        const metadata = {
            ...snakeToCamelRecursive(data),
            ...snakeToCamelRecursive(oauthServerMetadata),
        };

        const display =
            metadata.display &&
            metadata.display.find((d: any) => d.locale === "en-US");
        metadata.display = display;

        return metadata;
    }

    async retrieveCredential(
        path: string,
        accessToken: string,
        credentials: string[],
        proof: string
    ): Promise<string[]> {
        const payload =
            credentials.length > 1
                ? {
                      credential_requests: [
                          ...credentials.map((c) => ({
                              format: "jwt_vc_json",
                              //   credentials,
                              proof: {
                                  proof_type: "jwt",
                                  jwt: proof,
                              },
                          })),
                      ],
                  }
                : {
                      format: "jwt_vc_json",
                      //   credentials,
                      proof: {
                          proof_type: "jwt",
                          jwt: proof,
                      },
                  };
        const { data } = await axios.post(path, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const response =
            Object.keys(credentials).length > 1
                ? data.credential_responses.map(
                      (c: { format: string; credential: string }) =>
                          c.credential
                  )
                : [data.credential];
        return response;
    }

    async getCredentialFromOffer(credentialOffer: string, pin?: number) {
        const offer = await this.parseCredentialOffer(credentialOffer);
        const { grants, credentialIssuer, credentials } = offer;
        const metadata = await this.retrieveMetadata(credentialOffer);
        const createTokenPayload: { preAuthCode: any; userPin?: number } = {
            preAuthCode:
                grants["urn:ietf:params:oauth:grant-type:pre-authorized_code"][
                    "pre-authorized_code"
                ],
        };

        if (
            grants["urn:ietf:params:oauth:grant-type:pre-authorized_code"][
                "user_pin_required"
            ]
        )
            createTokenPayload.userPin = Number(pin);

        const tokenRequest = await this.createTokenRequest(createTokenPayload);

        const tokenResponse = await axios.post(
            metadata.tokenEndpoint,
            tokenRequest
        );

        const token = await didJWT.createJWT(
            {
                aud: credentialIssuer,
                nonce: tokenResponse.data.c_nonce,
            },
            { signer: this.signer, issuer: this.holderKeys.did },
            { alg: "EdDSA", kid: this.holderKeys.kid }
        );

        const endpoint =
            Object.keys(credentials).length > 1
                ? metadata.batchCredentialEndpoint
                : metadata.credentialEndpoint;

        return this.retrieveCredential(
            endpoint,
            tokenResponse.data.access_token,
            credentials,
            token
        );
    }
}

export * from "./index.types";
