import { SiopRequest } from "../index.types";
import { OPOptions } from "./index.types";
import * as didJWT from "did-jwt";
import { PresentationDefinitionV2 } from "@sphereon/pex-models";
export declare class OpenidProvider {
    did: string;
    kid: string;
    privKeyHex: string;
    signer: didJWT.Signer;
    constructor(args: OPOptions);
    createIDTokenResponse(request: SiopRequest): Promise<{
        id_token: string;
    }>;
    private encodeJwtVp;
    private decodeVcJwt;
    getCredentialsFromRequest(request: string, credentials: any[]): Promise<import("@sphereon/ssi-types").OriginalVerifiableCredential[]>;
    createVPTokenResponse(presentationDefinition: PresentationDefinitionV2, credentials: any[], request: SiopRequest): Promise<{
        vp_token: string;
        presentation_submission: import("@sphereon/pex-models").PresentationSubmission;
    }>;
    sendAuthResponse(request: string, credentials?: any[]): Promise<Record<string, any>>;
}
export * from "./index.types";
