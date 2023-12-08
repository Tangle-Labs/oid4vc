import { nanoid } from "nanoid";
import { requestsMap } from "../mocks/server";
import { op, rp } from "../mocks/openid";

export const siopSuite = () => {
    let requestByValue: string;
    let responseByValue: Record<string, any>;
    let requestByReference: string;
    let responseByReference: Record<string, any>;

    test("create request by value", async () => {
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

    test("create response by value", async () => {
        responseByValue = await op.sendAuthResponse(requestByValue);
    });

    test("create request by reference", async () => {
        const id = nanoid();
        const rawRequest = await rp.createRequest({
            requestBy: "reference",
            requestUri: `http://localhost:5999/siop/${id}`,
            responseType: "id_token",
        });
        requestByReference = rawRequest.uri;
        requestsMap.set(id, rawRequest.request);
        expect(requestByReference).toMatch(
            /^siopv2:\/\/idtoken\?client_id=([^&]+)&request_uri=([^&]+)$/
        );
    });

    test("create response by reference", async () => {
        responseByReference = await op.sendAuthResponse(requestByReference);
    });
};
