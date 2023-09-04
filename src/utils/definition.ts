import { PresentationDefinitionV2 } from "@sphereon/pex-models";

export function normalizePresentationDefinition(
    definition: PresentationDefinitionV2
) {
    const stringifiedPexDef = JSON.stringify(definition);
    const normalizedDefinition = stringifiedPexDef.replace(/\$\.vc\./g, "$.");
    return JSON.parse(normalizedDefinition);
}
