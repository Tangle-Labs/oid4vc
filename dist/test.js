import { readFile, writeFile } from "fs/promises";
import { VcIssuer } from "./oid4vci/Issuer";
import { RelyingParty, SigningAlgs } from "./siopv2/RelyingParty";
import { SimpleStore } from "./utils/simple-store";
import { VcHolder } from "./oid4vci/Holder";
const credentials = [
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTAwNzkxNjksImF1ZCI6ImRpZDppb3RhOkVmZXk5eWFCQ2d2TG1XSjhIaFJBOXVmYlNDYXR5OExKeUMxZjdlWFhwVkMiLCJuYmYiOjE2OTAwNzkxNjksImp0aSI6Imh0dHA6Ly9jcmVkLmNvbS93YV9kcml2aW5nX2xpY2Vuc2UiLCJzdWIiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwidmMiOnsiQGNvbnRleHQiOiJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImlkIjoiaHR0cDovL2NyZWQuY29tL3dhX2RyaXZpbmdfbGljZW5zZSIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJ3YV9kcml2aW5nX2xpY2Vuc2UiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwibmFtZSI6IkpvZSBTY2htb2UifSwiaXNzdWVyIjoiZGlkOmlvdGE6OGVlSlZld3R1NWRMUkRONm1VS2FUQU5BejhTYldHNHNYenBGd2pNeFVLbTkiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA3LTIzVDAyOjI2OjA5WiJ9LCJpc3MiOiJkaWQ6aW90YTo4ZWVKVmV3dHU1ZExSRE42bVVLYVRBTkF6OFNiV0c0c1h6cEZ3ak14VUttOSJ9.5wpWEUPjHp7ic8mfuv7HKbBIGtaqHn-gpmed6JG3VaenAIflRhLwpxgH2_nyKzYFO5U0Jv_AC1f65KqmRP7kDw",
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTAwNzkxNjksImF1ZCI6ImRpZDppb3RhOkVmZXk5eWFCQ2d2TG1XSjhIaFJBOXVmYlNDYXR5OExKeUMxZjdlWFhwVkMiLCJuYmYiOjE2OTAwNzkxNjksImp0aSI6Imh0dHA6Ly9jcmVkLmNvbS93YV9kcml2aW5nX2xpY2Vuc2UiLCJzdWIiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwidmMiOnsiQGNvbnRleHQiOiJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImlkIjoiaHR0cDovL2NyZWQuY29tL3dhX2RyaXZpbmdfbGljZW5zZSIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJ3YV9kcml2aW5nX2xpY2Vuc2UiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwibmFtZSI6IkpvZSBTY2htb2UifSwiaXNzdWVyIjoiZGlkOmlvdGE6OGVlSlZld3R1NWRMUkRONm1VS2FUQU5BejhTYldHNHNYenBGd2pNeFVLbTkiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA3LTIzVDAyOjI2OjA5WiJ9LCJpc3MiOiJkaWQ6aW90YTo4ZWVKVmV3dHU1ZExSRE42bVVLYVRBTkF6OFNiV0c0c1h6cEZ3ak14VUttOSJ9.5wpWEUPjHp7ic8mfuv7HKbBIGtaqHn-gpmed6JG3VaenAIflRhLwpxgH2_nyKzYFO5U0Jv_AC1f65KqmRP7kDw",
];
const opKeys = {
    did: "did:iota:Efey9yaBCgvLmWJ8HhRA9ufbSCaty8LJyC1f7eXXpVC",
    kid: "did:iota:Efey9yaBCgvLmWJ8HhRA9ufbSCaty8LJyC1f7eXXpVC#vc-signature",
    privKeyHex: "5125c37a17368011550f00ca606999677619814cb9a00b2f53d61c1ae028c461",
};
const rpKeys = {
    privKeyHex: "e402aa94b0113c14bc10259dbbb15fba9042029ddf2e9243238237af025a05f3",
    did: "did:iota:2UPUvGJkHuoJwFoFuZYqhmCipERNecdvqXebpfD7mKSB",
    kid: "did:iota:2UPUvGJkHuoJwFoFuZYqhmCipERNecdvqXebpfD7mKSB#vc-signature",
};
const presentationDefinition = {
    id: "32f54163-7166-48f1-93d8-ff217bdb0653",
    input_descriptors: [
        {
            id: "wa_driver_license",
            name: "Washington State Business License",
            purpose: "We can only allow licensed Washington State business representatives into the WA Business Conference",
            constraints: {
                fields: [
                    {
                        path: ["$.credentialSubject.name"],
                    },
                ],
            },
        },
    ],
};
async function run() {
    const rp = new RelyingParty({
        redirectUri: "http://localhost:5000/poggers",
        clientId: "did:iota:AUMDtBCbC6g8iUFMDQUzprUEMpZMgyE3jcxGtmTRAnmR",
        clientMetadata: {
            subjectSyntaxTypesSupported: ["did:iota"],
            idTokenSigningAlgValuesSupported: [SigningAlgs.EdDSA],
        },
        ...rpKeys,
    });
    // const request = rp.createRequest({
    //     requestBy: "value",
    //     responseType: "vp_token",
    //     presentationDefinition,
    // });
    // const op = new OpenidProvider({
    //     ...opKeys,
    // });
    // const response = await op.sendAuthResponse(request, credentials);
    // await rp.verifyAuthResponse(response, presentationDefinition);
    // const token = await rp.createAuthToken(op.did);
    const reader = async () => {
        const raw = await readFile("./test.json");
        try {
            return JSON.parse(raw.toString());
        }
        catch {
            return [];
        }
    };
    const writer = async (data) => {
        await writeFile("./test.json", JSON.stringify(data));
    };
    const issuer = new VcIssuer({
        credentialEndpoint: "http://localhost:5000/",
        batchCredentialEndpoint: "http://localhost:5000/",
        credentialIssuer: "http://localhost:5000/",
        cryptographicBindingMethodsSupported: ["did:iota"],
        cryptographicSuitesSupported: ["EdDSA"],
        proofTypesSupported: ["jwt"],
        store: new SimpleStore({ reader, writer }),
        ...rpKeys,
    });
    const holder = new VcHolder();
    const offer = "openid-credential-offer://?credential_issuer=http://localhost:4269/&credentials=%5B%7B%22format%22%3A%22jwt_vc_json%22%2C%22credential_type%22%3A%22UniversityDegree%22%7D%5D&grants=%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%22eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDppb3RhOjJVUFV2R0prSHVvSndGb0Z1WllxaG1DaXBFUk5lY2R2cVhlYnBmRDdtS1NCI3ZjLXNpZ25hdHVyZSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTAzODAyOTIsImV4cCI6MTY5MDQ2NjY5MiwiaWQiOiJlakpES2tiRFpfVTlqNUIxeVhaQXEiLCJpc3MiOiJkaWQ6aW90YToyVVBVdkdKa0h1b0p3Rm9GdVpZcWhtQ2lwRVJOZWNkdnFYZWJwZkQ3bUtTQiJ9.CO6DCP74UFNRZ8Owv_IttALeA4fhNKqCwR2uIU7KaSzioMlwN7JMEiu_NPnoFM3ULnTKL_ICrnxH9hXHcmTSDA%22%2C%22user_pin_required%22%3Atrue%7D%7D";
    const pin = 785651;
    const result = await holder.getCredentialFromOffer(offer, pin);
    console.log(result);
}
run();
//# sourceMappingURL=test.js.map