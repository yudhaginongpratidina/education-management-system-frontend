import { jwtDecode } from 'jwt-decode';

export type JwtPayload = {
    sub: string;
    sid: string;
    iss: string;
    aud: string;
    iat: number;
    exp: number;
};

export function decodeJWT(token: string): JwtPayload | null {
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}
