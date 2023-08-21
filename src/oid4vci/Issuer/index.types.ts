import { Resolvable } from "did-resolver";
import { KeyPairRequirements } from "../../common/index.types";

type CryptographicSuites = "EdDSA";
type CryptographicMethods = "did:iota" | "did:key";
type ProofTypes = "jwt";

export type SupportedCredentials = {
    name: string;
    type: string;
};

export type VcIssuerOptions = {
    credentialEndpoint: string;
    tokenEndpoint: string;
    batchCredentialEndpoint: string;
    credentialIssuer: string;
    cryptographicBindingMethodsSupported: CryptographicMethods[];
    cryptographicSuitesSupported: CryptographicSuites[];
    proofTypesSupported: ProofTypes[];
    store: IIssuerStore<IssuerStoreData>;
    logoUri?: string;
    clientName?: string;
    resolver: Resolvable;
    supportedCredentials?: SupportedCredentials[];
} & KeyPairRequirements;

export type IssuerStoreData = { id: string; pin: number };

type CreateCredentialOfferByValue = {
    requestBy: "value";
    credentials: string[];
    pinRequired?: boolean;
};

type CreateCredentialOfferByReference = {
    requestBy: "reference";
    credentialOfferUri: string;
    credentials: string[];
    pinRequired?: boolean;
};

export type CreateCredentialOfferOptions =
    | CreateCredentialOfferByReference
    | CreateCredentialOfferByValue;

export interface IIssuerStore<T> {
    create: (payload: T) => Promise<T> | T;
    getAll: () => Promise<T[]> | T[];
    getById: (id: string) => Promise<T> | T;
    updateById: (id: string, payload: Partial<T>) => Promise<T> | T;
    deleteById: (id: string) => Promise<T>;
}
