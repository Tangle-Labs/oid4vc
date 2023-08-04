import { OpenidProvider, RelyingParty, SigningAlgs } from "../../src";
import { resolver } from "./iota-resolver";
import { testingKeys } from "./keys.mock";

export const op = new OpenidProvider({
    ...testingKeys.op,
    resolver,
});
export const rp = new RelyingParty({
    ...testingKeys.rp,
    clientId: "tanglelabs.io",
    redirectUri: "http://localhost:5000/api/auth",
    clientMetadata: {
        idTokenSigningAlgValuesSupported: [SigningAlgs.EdDSA],
        subjectSyntaxTypesSupported: ["did:iota"],
    },
    resolver,
});
