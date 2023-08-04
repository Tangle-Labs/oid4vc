import { resolver } from "../mocks/iota-resolver";
import { testingKeys } from "../mocks/keys.mock";
import { parseQueryStringToJson } from "../utils/query";
import { OpenidProvider, RelyingParty, SigningAlgs, SiopRequest } from "./siop";

describe("SIOPv2", () => {
    let requestByValue: string;
    let responseByValue: Record<string, any>;

    const op = new OpenidProvider({
        ...testingKeys.op,
        resolver,
    });
    const rp = new RelyingParty({
        ...testingKeys.rp,
        clientId: "tanglelabs.io",
        redirectUri: "http://localhost:5000/api/auth",
        clientMetadata: {
            idTokenSigningAlgValuesSupported: [SigningAlgs.EdDSA],
            subjectSyntaxTypesSupported: ["did:iota"],
        },
        resolver,
    });

    test("create SIOP request by value", async () => {
        requestByValue = await rp.createRequest({
            requestBy: "value",
            responseType: "id_token",
        });

        expect(requestByValue).toMatch(
            /^siopv2:\/\/idtoken\?client_id=([^&]+)&request=([^&]+)$/
        );
    });

    test("create SIOP response by value", async () => {
        const parsedRequest = parseQueryStringToJson(requestByValue);
        responseByValue = await op.createIDTokenResponse(
            parsedRequest as SiopRequest
        );
        expect(responseByValue.id_token).toBeDefined();
    });

    test("validate SIOP ID Token Response", async () => {
        await rp.verifyAuthResponse(responseByValue);
    });
});
