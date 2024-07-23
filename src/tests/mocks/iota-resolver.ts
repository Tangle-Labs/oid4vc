import { Resolver } from "did-resolver";
import KeyResolver from "key-did-resolver";
import JwtResolver from "@sphereon/did-resolver-jwk";

const keyDIDResolver = KeyResolver.getResolver();
export const resolver = new Resolver({
    ...keyDIDResolver,
    ...JwtResolver.getDidJwkResolver(),
});
