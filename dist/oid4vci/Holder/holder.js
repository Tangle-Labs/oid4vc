import axios from "axios";
import { parseQueryStringToJson } from "../../utils/query";
import * as didJWT from "did-jwt";
import { buildSigner } from "../../utils/utils";
export class VcHolder {
    holderKeys;
    signer;
    constructor(args) {
        this.holderKeys = args;
        this.signer = buildSigner(args.privKeyHex);
    }
    async createTokenRequest(args) {
        const response = {
            grant_type: "urn:ietf:params:oauth:grant-type:pre-authorized_code",
            "pre-authorized_code": args.preAuthCode,
        };
        // @ts-ignore
        if (args.userPin)
            response.user_pin = args.userPin;
        return response;
    }
    parseCredentialOffer(offer) {
        return parseQueryStringToJson(offer.split("openid-credential-offer://")[1]);
    }
    async retrieveMetadata(credentialOffer) {
        const { credentialIssuer } = this.parseCredentialOffer(credentialOffer);
        const metadataEndpoint = new URL(".well-known/openid-credential-issuer", credentialIssuer).toString();
        const { data } = await axios.get(metadataEndpoint);
        return data;
    }
    async retrieveCredential(path, accessToken, credentials, proof) {
        const { data } = await axios.post(path, {
            format: "jwt_vc_json",
            credentials,
            proof: {
                proof_type: "jwt",
                jwt: proof,
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const response = Object.keys(credentials).length > 1
            ? data.credential_responses.map((c) => c.credential)
            : [data.credential];
        return response;
    }
    async getCredentialFromOffer(credentialOffer, pin) {
        const { grants, credentials, credentialIssuer } = this.parseCredentialOffer(credentialOffer);
        const metadata = await this.retrieveMetadata(credentialOffer);
        const createTokenPayload = {
            preAuthCode: grants["urn:ietf:params:oauth:grant-type:pre-authorized_code"]["pre-authorized_code"],
        };
        if (grants["urn:ietf:params:oauth:grant-type:pre-authorized_code"]["user_pin_required"])
            createTokenPayload.userPin = Number(pin);
        const tokenRequest = await this.createTokenRequest(createTokenPayload);
        const tokenResponse = await axios.post(new URL("/token", metadata.authorization_server ?? metadata.credential_issuer).toString(), tokenRequest);
        const token = await didJWT.createJWT({
            aud: credentialIssuer,
            nonce: tokenResponse.data.c_nonce,
        }, { signer: this.signer, issuer: this.holderKeys.did }, { alg: "EdDSA", kid: this.holderKeys.kid });
        const endpoint = Object.keys(credentials).length > 1
            ? metadata.batch_credential_endpoint
            : metadata.credential_endpoint;
        return this.retrieveCredential(endpoint, tokenResponse.data.access_token, credentials, token);
    }
}
export * from "./index.types";
//# sourceMappingURL=holder.js.map