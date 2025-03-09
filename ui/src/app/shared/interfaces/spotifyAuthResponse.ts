export interface SpotifyAuthResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface SpotifyAuth {
    accessToken: string
    tokenType: string
    expirationTime: number
}