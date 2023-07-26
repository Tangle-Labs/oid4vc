export type CreateTokenRequestOptions = {
    preAuthCode: string;
    userPin: number;
    issuerState: string;
};

export type TokenRequest = {
    grant_type: string;
    "pre-authorized_code": string;
    user_pin: number;
    issuer_state: string;
};
