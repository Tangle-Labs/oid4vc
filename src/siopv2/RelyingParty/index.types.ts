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

export type VPTokenRequestByReferenceOptions = {
    requestBy: "reference";
    requestUri: string;
    responseType: "vp_token";
    presentationDefinition: PresentationDefinitionV2;
    nonce?: string;
    state?: string;
};

export type IDTokenRequestByReferenceOptions = {
    requestBy: "reference";
    requestUri: string;
    responseType: "id_token";
    nonce?: string;
    state?: string;
};

export type VPTokenRequestByValueOptions = {
    requestBy: "value";
    responseType: "vp_token";
    presentationDefinition: PresentationDefinitionV2;
    nonce?: string;
    state?: string;
};

export type SiopRequestResult = {
    uri: `siopv2://idtoken${string}`;
    request: string;
    requestOptions: Partial<
        VPTokenRequestByValueOptions | IDTokenRequestByValueOptions
    >;
};

export type CreateRequestOptions =
    | VPTokenRequestByValueOptions
    | IDTokenRequestByValueOptions
    | VPTokenRequestByReferenceOptions
    | IDTokenRequestByReferenceOptions;

export enum SigningAlgs {
    ES256K = "ES256K",
    EdDSA = "EdDSA",
}
