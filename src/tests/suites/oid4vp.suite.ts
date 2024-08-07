import { nanoid } from "nanoid";
import { presentationDefinition } from "../mocks/presentation-defs";
import { requestsMap } from "../mocks/server";
import { credentials } from "../mocks/keys.mock";
import { OpenidProvider, RelyingParty } from "../../siopv2/siop";

export const oid4vpSuite = (op: OpenidProvider, rp: RelyingParty) => {
    return () => {
        let requestByValue: string;
        let responseByValue: Record<string, any>;
        let requestByReference: string;
        let responseByReference: Record<string, any>;

        test("create request by value", async () => {
            requestByValue = (
                await rp.createRequest({
                    requestBy: "value",
                    responseType: "vp_token",
                    presentationDefinition,
                })
            ).uri;

            expect(requestByValue).toMatch(
                /^siopv2:\/\/idtoken\?client_id=([^&]+)&request=([^&]+)$/
            );
        });

        test("create response by value", async () => {
            responseByValue = await op.sendAuthResponse(
                requestByValue,
                credentials
            );
        });

        test("create request by reference", async () => {
            const id = nanoid();
            const rawRequest = await rp.createRequest({
                requestBy: "reference",
                requestUri: `http://localhost:5999/siop/${id}`,
                responseType: "vp_token",
                state: "asdf",
                presentationDefinition,
            });
            requestByReference = rawRequest.uri;
            requestsMap.set(id, rawRequest.request);
            expect(requestByReference).toMatch(
                /^siopv2:\/\/idtoken\?client_id=([^&]+)&request_uri=([^&]+)$/
            );
        });

        test("create response by reference", async () => {
            responseByReference = await op.sendAuthResponse(
                requestByReference,
                credentials
            );
        });

        test("get request from reference", async () => {
            const response = op.getRequestFromOffer(requestByReference);
        });
    };
};
