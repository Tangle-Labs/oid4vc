import { holder, issuer } from "../mocks/openid";
import { offersMap } from "../mocks/server";

export const oid4vciSuite = () => {
    let singleCredOfferByValue: any;
    let batchCredOfferByValue: any;
    let singleCredOfferByReference: any;
    let batchCredOfferByReference: any;
    test("create single credential offer by value", async () => {
        singleCredOfferByValue = await issuer.createCredentialOffer({
            requestBy: "value",
            credentials: ["wa_driving_license"],
        });
    });

    test("get single credential from endpoint", async () => {
        const credentials = await holder.getCredentialFromOffer(
            singleCredOfferByValue.uri
        );
        expect(credentials).toHaveLength(1);
    });

    test("create batch credential offer by value", async () => {
        batchCredOfferByValue = await issuer.createCredentialOffer({
            requestBy: "value",
            credentials: ["wa_driving_license", "wa_driving_license"],
        });
    });

    test("get batch credential from endpoint", async () => {
        const credentials = await holder.getCredentialFromOffer(
            batchCredOfferByValue.uri
        );
        expect(credentials).toHaveLength(2);
    });

    test("create single credential offer by reference", async () => {
        singleCredOfferByReference = await issuer.createCredentialOffer({
            requestBy: "reference",
            credentialOfferUri: "http://localhost:5000/api/offers/single",
            credentials: ["wa_driving_license"],
        });
        offersMap.set("single", singleCredOfferByReference.offer);
    });

    test("get single credential from endpoint", async () => {
        const credentials = await holder.getCredentialFromOffer(
            singleCredOfferByReference.uri
        );
        expect(credentials).toHaveLength(1);
    });

    test("create batch credential offer by reference", async () => {
        batchCredOfferByReference = await issuer.createCredentialOffer({
            requestBy: "reference",
            credentialOfferUri: "http://localhost:5000/api/offers/batch",
            credentials: ["wa_driving_license", "wa_driving_license"],
        });
        offersMap.set("batch", batchCredOfferByReference.offer);
    });

    test("get batch credential from endpoint by reference", async () => {
        const credentials = await holder.getCredentialFromOffer(
            batchCredOfferByReference.uri
        );
        expect(credentials).toHaveLength(2);
    });
};
