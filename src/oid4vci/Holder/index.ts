import axios from "axios";
import { parseQueryStringToJson } from "../../utils/query";
import { CreateTokenRequestOptions } from "./index.types";

export class VcHolder {
    async createTokenRequest(args: CreateTokenRequestOptions) {
        return {
            grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
            "pre-authorized_code": args.preAuthCode,
            user_pin: args.userPin,
        };
    }

    parseCredentialOffer(offer: string): Record<string, any> {
        return parseQueryStringToJson(
            offer.split("openid-credential-offer://")[1]
        );
    }

    async retrieveMetadata(credentialOffer: string) {
        const { credentialIssuer } = this.parseCredentialOffer(credentialOffer);
        const { data } = await axios.get(
            new URL(
                ".well-known/openid-credential-issuer",
                credentialIssuer
            ).toString()
        );
        return data;
    }

    async retrieveCredential(path: string, accessToken: string) {
        const { data } = await axios.post(
            path,
            { format: "jwt_vc_json" },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        return data.credential;
    }

    async getCredentialFromOffer(credentialOffer: string, pin: number) {
        const { grants } = this.parseCredentialOffer(credentialOffer);
        const metadata = await this.retrieveMetadata(credentialOffer);
        const tokenRequest = await this.createTokenRequest({
            preAuthCode:
                grants["urn:ietf:params:oauth:grant-type:pre-authorized_code"][
                    "pre-authorized_code"
                ],
            userPin: Number(pin),
        });
        console.log("here?");
        const tokenResponse = await axios.post(
            new URL(
                "/token",
                metadata.authorization_server ?? metadata.credential_issuer
            ).toString(),
            tokenRequest
        );
        console.log("here??");

        return this.retrieveCredential(
            metadata.credential_endpoint,
            tokenResponse.data.access_token
        );
    }
}

export * from "./index.types";
