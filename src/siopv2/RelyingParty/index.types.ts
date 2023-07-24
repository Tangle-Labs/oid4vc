import { PresentationDefinitionV2 } from "@sphereon/pex-models";

export type AuthResponse = {
    id_token?: string;
    vp_token?: string;
    presentation_submission?: PresentationDefinitionV2;
};

export type RPOptions = {
    redirectUri: string;
    clientId: string;
    clientMetadata: {
        subjectSyntaxTypesSupported: string[];
        idTokenSigningAlgValuesSupported: SigningAlgs[];
    };
};

type IDTokenRequestByValueOptions = {
    requestBy: "value";
    responseType: "id_token";
};

type VPTokenRequestByValueOptions = {
    requestBy: "value";
    responseType: "vp_token";
    presentationDefinition: PresentationDefinitionV2;
};

export type SiopRequestByReference = {
    requestBy: "reference";
    requestUri: string;
};

export type CreateRequestOptions =
    | VPTokenRequestByValueOptions
    | IDTokenRequestByValueOptions
    | SiopRequestByReference;

export enum SigningAlgs {
    ES256K = "ES256K",
    EdDSA = "EdDSA",
}
