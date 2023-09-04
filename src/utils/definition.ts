import { PEXv2 } from "@sphereon/pex";

export function normalizePresentationDefinition(definition: PEXv2) {
    const stringifiedPexDef = JSON.stringify(definition);
    const normalizedDefinition = stringifiedPexDef.replace(/\$\.vc\./g, "$.");
    return JSON.parse(normalizedDefinition);
}
