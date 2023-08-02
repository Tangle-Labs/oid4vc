import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import { RPOptions } from "./RelyingParty/rp";
type IdTokenRequestByValue = RPOptions & {
    nonce: string;
    redirectUri: string;
    responseMode: "post";
    responseType: "id_token";
};
type VpTokenRequestByValue = RPOptions & {
    nonce: string;
    redirectUri: string;
    responseMode: "post";
    responseType: "vp_token";
    presentationDefinition: PresentationDefinitionV2;
};
export type SiopRequest = VpTokenRequestByValue | IdTokenRequestByValue;
export {};
