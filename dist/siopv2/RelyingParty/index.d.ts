import { CreateRequestOptions, RPOptions, AuthResponse } from "./index.types";
import { PresentationDefinitionV2 } from "@sphereon/pex-models";
export declare class RelyingParty {
    private metadata;
    private did;
    private kid;
    private privKeyHex;
    private signer;
    /**
     * Create a new instance of the Relying Party class
     *
     * @param {RPOptions} args
     */
    constructor(args: RPOptions);
    /**
     * Create a new SIOP Request
     */
    createRequest(args: CreateRequestOptions): string;
    validateJwt(jwt: string): Promise<Record<string, any>>;
    verifyAuthResponse(authResponse: AuthResponse, presentationDefinition?: PresentationDefinitionV2): Promise<void>;
    createAuthToken(did: string): Promise<string>;
}
export * from "./index.types";
