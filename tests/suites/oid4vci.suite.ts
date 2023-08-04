import { issuer } from "../mocks/openid";

export const oid4vciSuite = () => {
    test("create credential offer by value", async () => {
        const offer = await issuer.createCredentialOffer({
            credentials: ["wa_driving_license"],
        });
        console.log(offer);
    });
};
