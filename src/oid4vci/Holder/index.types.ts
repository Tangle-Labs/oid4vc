export type CreateTokenRequestOptions = {
    preAuthCode: string;
    userPin: number;
};

export type TokenRequest = {
    grant_type: string;
    "pre-authorized_code": string;
    user_pin: number;
};
