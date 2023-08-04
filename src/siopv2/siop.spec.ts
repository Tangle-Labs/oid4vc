import { nanoid } from "nanoid";
import { resolver } from "../mocks/iota-resolver";
import { testingKeys } from "../mocks/keys.mock";
import { parseQueryStringToJson } from "../utils/query";
import { OpenidProvider, RelyingParty, SigningAlgs, SiopRequest } from "./siop";
import { requestsMap, startServer } from "../mocks/server";

describe("SIOPv2", () => {
    let requestByValue: string;
    let responseByValue: Record<string, any>;
    let requestByReference: string;
    let responseByReference: Record<string, any>;

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

    startServer(rp);
    test("create SIOP request by value", async () => {
        requestByValue = (
            await rp.createRequest({
                requestBy: "value",
                responseType: "id_token",
            })
        ).uri;

        expect(requestByValue).toMatch(
            /^siopv2:\/\/idtoken\?client_id=([^&]+)&request=([^&]+)$/
        );
    });

    test("create SIOP response by value", async () => {
        responseByValue = await op.sendAuthResponse(requestByValue);
    });

    test("create SIOP request by reference", async () => {
        const id = nanoid();
        const rawRequest = await rp.createRequest({
            requestBy: "reference",
            requestUri: `http://localhost:5000/siop/${id}`,
            responseType: "id_token",
        });
        requestByReference = rawRequest.uri;
        requestsMap.set(id, rawRequest.request);
        expect(requestByReference).toMatch(
            /^siopv2:\/\/idtoken\?client_id=([^&]+)&request_uri=([^&]+)$/
        );
    });

    test("create SIOP response by reference", async () => {
        responseByReference = await op.sendAuthResponse(requestByReference);
    });
});
