import { Resolver } from "did-resolver";

export let RESOLVER: Resolver = null;

export function init<T extends Resolver>(resolver: T) {
    RESOLVER = resolver;
}
