export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface LoginRequest {
    username: string;
    password: string;
    grant_type?: string;
    scope?: string;
    client_id?: string;
    client_secret?: string;
}