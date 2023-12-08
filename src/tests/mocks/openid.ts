import { readFile, writeFile } from "fs/promises";
import {
    IssuerStoreData,
    OpenidProvider,
    RelyingParty,
    SigningAlgs,
    SimpleStore,
    VcHolder,
    VcIssuer,
} from "../..";
import { resolver } from "./iota-resolver";
import { testingKeys } from "./keys.mock";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const op = new OpenidProvider({
    ...testingKeys.op,
    resolver,
});
export const rp = new RelyingParty({
    ...testingKeys.rp,
    clientId: "tanglelabs.io",
    redirectUri: "http://localhost:5999/api/auth",
    clientMetadata: {
        idTokenSigningAlgValuesSupported: [SigningAlgs.EdDSA],
        subjectSyntaxTypesSupported: ["did:iota"],
    },
    resolver,
});

const file = path.resolve(__dirname, "./store.test-mock");

// @ts-ignore
const reader = async () => {
    const raw = await readFile(file).catch((e) => {
        if (e.code === "ENOENT") writer([]);
        return Buffer.from(JSON.stringify([]));
    });
    return JSON.parse(raw.toString());
};

const writer = async (data: IssuerStoreData[]) => {
    await writeFile(file, JSON.stringify(data));
};

export const issuer = new VcIssuer({
    ...testingKeys.rp,
    batchCredentialEndpoint: "http://localhost:5999/api/credentials",
    credentialEndpoint: "http://localhost:5999/api/credential",
    credentialIssuer: "http://localhost:5999/",
    proofTypesSupported: ["jwt"],
    cryptographicBindingMethodsSupported: ["did:key"],
    cryptographicSuitesSupported: ["EdDSA"],
    resolver,
    tokenEndpoint: "http://localhost:5999/token",
    store: new SimpleStore({ reader, writer }),
    supportedCredentials: [
        {
            name: "National ID",
            type: "National ID",
        },
    ],
});

export const holder = new VcHolder({
    ...testingKeys.op,
});
