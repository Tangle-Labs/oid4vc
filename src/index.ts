import * as identity from "@iota/identity-node";
import { OpenidProvider } from "./siopv2/OpenidProvider";
import { RelyingParty, SigningAlgs } from "./siopv2/RelyingParty/";
import { stringToBytes } from "./utils/bytes";

const credentials = [
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTAwNzkxNjksImF1ZCI6ImRpZDppb3RhOkVmZXk5eWFCQ2d2TG1XSjhIaFJBOXVmYlNDYXR5OExKeUMxZjdlWFhwVkMiLCJuYmYiOjE2OTAwNzkxNjksImp0aSI6Imh0dHA6Ly9jcmVkLmNvbS93YV9kcml2aW5nX2xpY2Vuc2UiLCJzdWIiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwidmMiOnsiQGNvbnRleHQiOiJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImlkIjoiaHR0cDovL2NyZWQuY29tL3dhX2RyaXZpbmdfbGljZW5zZSIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJ3YV9kcml2aW5nX2xpY2Vuc2UiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwibmFtZSI6IkpvZSBTY2htb2UifSwiaXNzdWVyIjoiZGlkOmlvdGE6OGVlSlZld3R1NWRMUkRONm1VS2FUQU5BejhTYldHNHNYenBGd2pNeFVLbTkiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA3LTIzVDAyOjI2OjA5WiJ9LCJpc3MiOiJkaWQ6aW90YTo4ZWVKVmV3dHU1ZExSRE42bVVLYVRBTkF6OFNiV0c0c1h6cEZ3ak14VUttOSJ9.5wpWEUPjHp7ic8mfuv7HKbBIGtaqHn-gpmed6JG3VaenAIflRhLwpxgH2_nyKzYFO5U0Jv_AC1f65KqmRP7kDw",
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2OTAwNzkxNjksImF1ZCI6ImRpZDppb3RhOkVmZXk5eWFCQ2d2TG1XSjhIaFJBOXVmYlNDYXR5OExKeUMxZjdlWFhwVkMiLCJuYmYiOjE2OTAwNzkxNjksImp0aSI6Imh0dHA6Ly9jcmVkLmNvbS93YV9kcml2aW5nX2xpY2Vuc2UiLCJzdWIiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwidmMiOnsiQGNvbnRleHQiOiJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImlkIjoiaHR0cDovL2NyZWQuY29tL3dhX2RyaXZpbmdfbGljZW5zZSIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJ3YV9kcml2aW5nX2xpY2Vuc2UiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6aW90YTpFZmV5OXlhQkNndkxtV0o4SGhSQTl1ZmJTQ2F0eThMSnlDMWY3ZVhYcFZDIiwibmFtZSI6IkpvZSBTY2htb2UifSwiaXNzdWVyIjoiZGlkOmlvdGE6OGVlSlZld3R1NWRMUkRONm1VS2FUQU5BejhTYldHNHNYenBGd2pNeFVLbTkiLCJpc3N1YW5jZURhdGUiOiIyMDIzLTA3LTIzVDAyOjI2OjA5WiJ9LCJpc3MiOiJkaWQ6aW90YTo4ZWVKVmV3dHU1ZExSRE42bVVLYVRBTkF6OFNiV0c0c1h6cEZ3ak14VUttOSJ9.5wpWEUPjHp7ic8mfuv7HKbBIGtaqHn-gpmed6JG3VaenAIflRhLwpxgH2_nyKzYFO5U0Jv_AC1f65KqmRP7kDw",
];

const presentationDefinition = {
    id: "32f54163-7166-48f1-93d8-ff217bdb0653",
    input_descriptors: [
        {
            id: "wa_driver_license",
            name: "Washington State Business License",
            purpose:
                "We can only allow licensed Washington State business representatives into the WA Business Conference",
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
    });

    const request = rp.createRequest({
        requestBy: "value",
        responseType: "vp_token",
        presentationDefinition,
    });

    const op = new OpenidProvider({
        did: "did:iota:Efey9yaBCgvLmWJ8HhRA9ufbSCaty8LJyC1f7eXXpVC",
        kid: "did:iota:Efey9yaBCgvLmWJ8HhRA9ufbSCaty8LJyC1f7eXXpVC#vc-signature",
        privKeyHex:
            "5125c37a17368011550f00ca606999677619814cb9a00b2f53d61c1ae028c461",
    });

    console.log(request);

    const response = await op.sendAuthResponse(request, credentials);
    console.log(response);
    rp.verifyAuthResponse(response, presentationDefinition);
}

run();
