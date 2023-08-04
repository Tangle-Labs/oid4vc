import {
    DIDResolutionOptions,
    DIDResolutionResult,
    Resolver,
} from "did-resolver";
import { Client } from "@iota/identity-wasm/node";

const clientConfig = {
    permanodes: [{ url: "https://chrysalis-chronicle.iota.org/api/mainnet/" }],
};

class IotaDIDResolver extends Resolver {
    async resolve(
        did: string,
        options?: DIDResolutionOptions | undefined
    ): Promise<DIDResolutionResult> {
        const client = await Client.fromConfig(clientConfig);
        const doc = await client.resolve(did);
        return {
            didResolutionMetadata: {
                contentType: "application/did+ld+json",
            },
            didDocument: doc.document().toJSON().doc,
            didDocumentMetadata: {},
        };
    }
}

export const resolver = new IotaDIDResolver();
