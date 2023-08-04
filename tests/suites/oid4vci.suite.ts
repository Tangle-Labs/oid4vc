import { holder, issuer } from "../mocks/openid";

export const oid4vciSuite = () => {
    let singleCredOffer: { uri: string; pin?: number };
    let batchCredOffer: { uri: string; pin?: number };

    test("create single credential offer by value", async () => {
        singleCredOffer = await issuer.createCredentialOffer({
            credentials: ["wa_driving_license"],
        });
    });

    test("get single credential from endpoint", async () => {
        const credentials = await holder.getCredentialFromOffer(
            singleCredOffer.uri
        );
        expect(credentials).toHaveLength(1);
    });

    test("create batch credential offer by value", async () => {
        batchCredOffer = await issuer.createCredentialOffer({
            credentials: ["wa_driving_license", "wa_driving_license"],
        });
    });

    test("get batch credential from endpoint", async () => {
        const credentials = await holder.getCredentialFromOffer(
            batchCredOffer.uri
        );
        expect(credentials).toHaveLength(2);
    });
};
