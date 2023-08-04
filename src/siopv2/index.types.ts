import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import { RPOptions } from "./RelyingParty/rp";

type IdTokenRequestByReference = { requestUri: string } & IdTokenRequestByValue;
type VpTokenRequestByReference = { requestUri: string } & VpTokenRequestByValue;

type IdTokenRequestByValue = RPOptions & {
    nonce?: string;
    state?: string;
    redirectUri: string;
    responseMode: "post";
    responseType: "id_token";
};

type VpTokenRequestByValue = RPOptions & {
    nonce?: string;
    state?: string;
    redirectUri: string;
    responseMode: "post";
    responseType: "vp_token";
    presentationDefinition: PresentationDefinitionV2;
};

export type SiopRequest =
    | VpTokenRequestByValue
    | IdTokenRequestByValue
    | VpTokenRequestByReference
    | IdTokenRequestByReference;
