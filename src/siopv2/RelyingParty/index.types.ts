import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import { KeyPairRequirements } from "../../common/index.types";
import { Resolvable } from "did-resolver";

export type AuthResponse = {
    id_token?: string;
    vp_token?: string;
    issuer_state?: string;
    presentation_submission?: PresentationDefinitionV2;
};

export type RPOptions = {
    redirectUri: string;
    clientId: string;
    resolver: Resolvable;
    clientMetadata: {
        subjectSyntaxTypesSupported: string[];
        idTokenSigningAlgValuesSupported: SigningAlgs[];
        logo_uri?: string;
        client_name?: string;
    };
} & KeyPairRequirements;

type IDTokenRequestByValueOptions = {
    requestBy: "value";
    responseType: "id_token";
    nonce?: string;
    state?: string;
};

type VPTokenRequestByValueOptions = {
    requestBy: "value";
    responseType: "vp_token";
    presentationDefinition: PresentationDefinitionV2;
    nonce?: string;
    state?: string;
};

export type SiopRequestByReference = {
    requestBy: "reference";
    requestUri: string;
    nonce?: string;
    state?: string;
};

export type CreateRequestOptions =
    | VPTokenRequestByValueOptions
    | IDTokenRequestByValueOptions
    | SiopRequestByReference;

export enum SigningAlgs {
    ES256K = "ES256K",
    EdDSA = "EdDSA",
}
