import axios from "axios";
import { parseQueryStringToJson } from "../../utils/query";
import { CreateTokenRequestOptions } from "./index.types";

export class VcHolder {
    async createTokenRequest(args: CreateTokenRequestOptions) {
        const response = {
            grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
            "pre-authorized_code": args.preAuthCode,
        };
        console.log("res", response);
        // @ts-ignore
        if (args.userPin) response.user_pin = args.userPin;
        return response;
    }

    parseCredentialOffer(offer: string): Record<string, any> {
        return parseQueryStringToJson(
            offer.split("openid-credential-offer://")[1]
        );
    }

    async retrieveMetadata(credentialOffer: string) {
        const { credentialIssuer } = this.parseCredentialOffer(credentialOffer);
        const metadataEndpoint = new URL(
            ".well-known/openid-credential-issuer",
            credentialIssuer
        ).toString();
        const { data } = await axios.get(metadataEndpoint);
        return data;
    }

    async retrieveCredential(
        path: string,
        accessToken: string,
        credentials: string[]
    ): Promise<string[]> {
        const { data } = await axios.post(
            path,
            { format: "jwt_vc_json", credentials },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
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
        const { grants, credentials } =
            this.parseCredentialOffer(credentialOffer);
        const metadata = await this.retrieveMetadata(credentialOffer);
        console.log("meta", metadata);
        const createTokenPayload = {
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
        console.log("token request", tokenRequest);

        const tokenResponse = await axios.post(
            new URL(
                "/token",
                metadata.authorization_server ?? metadata.credential_issuer
            ).toString(),
            tokenRequest
        );

        const endpoint =
            Object.keys(credentials).length > 1
                ? metadata.batch_credential_endpoint
                : metadata.credential_endpoint;

        return this.retrieveCredential(
            endpoint,
            tokenResponse.data.access_token,
            credentials
        );
    }
}

export * from "./index.types";
