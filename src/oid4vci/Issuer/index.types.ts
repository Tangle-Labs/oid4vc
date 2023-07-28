import { KeyPairRequirements } from "../../common/index.types";

type CryptographicSuites = "EdDSA";
type CryptographicMethods = "did:iota" | "did:key";
type ProofTypes = "jwt";

export type VcIssuerOptions = {
    credentialEndpoint: string;
    credentialIssuer: string;
    cryptographicBindingMethodsSupported: CryptographicMethods[];
    cryptographicSuitesSupported: CryptographicSuites[];
    proofTypesSupported: ProofTypes[];
    store: IIssuerStore<IssuerStoreData>;
} & KeyPairRequirements;

export type IssuerStoreData = { id: string; pin: number };

export type CreateCredentialOfferOptions = {
    format: "jwt_vc_json";
    credentialType: string;
};

export interface IIssuerStore<T> {
    create: (payload: T) => Promise<T> | T;
    getAll: () => Promise<T[]> | T[];
    getById: (id: string) => Promise<T> | T;
    updateById: (id: string, payload: Partial<T>) => Promise<T> | T;
    deleteById: (id: string) => Promise<T>;
}
