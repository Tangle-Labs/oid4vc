import { PresentationDefinitionV2 } from "@sphereon/pex-models";
import { KeyPairRequirements } from "../../common/index.types";
import { Resolvable } from "did-resolver";

export type AuthResponse = {
  id_token?: string;
  vp_token?: string;
  issuer_state?: string;
  presentation_submission?: PresentationDefinitionV2;
};
export type RPMetadata = {
  subjectSyntaxTypesSupported: string[];
  idTokenSigningAlgValuesSupported: SigningAlgs[];
  logoUri?: string;
  clientName?: string;
  vpFormats?: Record<string, any>;
};

export type RPOptions = {
  redirectUri: string;
  clientId: string;
  resolver: Resolvable;
  clientMetadata: RPMetadata;
} & KeyPairRequirements;

type IDTokenRequestByValueOptions = {
  requestBy: "value";
  responseType: "id_token";
  nonce?: string;
  state?: string;
  clientMetadata?: Partial<RPMetadata>;
};

export type VPTokenRequestByReferenceOptions = {
  requestBy: "reference";
  requestUri: string;
  responseType: "vp_token";
  presentationDefinition: PresentationDefinitionV2;
  nonce?: string;
  state?: string;
  clientMetadata?: Partial<RPMetadata>;
};

export type IDTokenRequestByReferenceOptions = {
  requestBy: "reference";
  requestUri: string;
  responseType: "id_token";
  nonce?: string;
  state?: string;
  clientMetadata?: Partial<RPMetadata>;
};

export type VPTokenRequestByValueOptions = {
  requestBy: "value";
  responseType: "vp_token";
  presentationDefinition: PresentationDefinitionV2;
  nonce?: string;
  state?: string;
  clientMetadata?: Partial<RPMetadata>;
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
