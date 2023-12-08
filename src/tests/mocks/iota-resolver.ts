import { Resolver } from "did-resolver";
import KeyResolver from "key-did-resolver";

const keyDIDResolver = KeyResolver.getResolver();
export const resolver = new Resolver(keyDIDResolver);
