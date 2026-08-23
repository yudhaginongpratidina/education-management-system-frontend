import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { decodeJWT } from './decode-jwt';

type RefreshResponse = {
    success: boolean;
    data: {
        access_token: string;
    };
};

type ErrorResponse = {
    error?: {
        code: string;
        message: string;
    };
};

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

export const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('menu');
    document.cookie = 'authenticated=; Max-Age=0; path=/;';
    document.cookie = 'refresh_token=; Max-Age=0; path=/;';

    window.location.href = '/login';
}

async function refreshAccessToken(): Promise<string> {
    try {
        const response = await axios.get<RefreshResponse>(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/token`,
            {
                withCredentials: true,
            },
        );

        const newAccessToken = response.data.data.access_token;
        localStorage.setItem('token', newAccessToken);
        return newAccessToken;
    } catch (error) {
        logout();

        throw error;
    }
}

http.interceptors.request.use(async (config: CustomAxiosRequestConfig) => {
    if (typeof window === 'undefined') {
        return config;
    }

    let token = localStorage.getItem('token');
    if (!token) {
        return config;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
        logout();
        return Promise.reject(new Error('Invalid token'));
    }

    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
        if (!isRefreshing) {
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                token = newToken;
                onRefreshed(newToken);
            } catch (error) {
                // refreshAccessToken already calls logout()
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        } else {
            token = await new Promise<string>((resolve) => {
                subscribeTokenRefresh((newToken: string) => {
                    resolve(newToken);
                });
            });
        }
    }

    config.headers.Authorization = `Bearer ${token}`;

    return config;
});

http.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        if (!error.response) {
            console.error('Network error:', error.message);

            return Promise.reject(error);
        }

        const status = error.response.status;
        const errorCode = (error.response.data as ErrorResponse)?.error?.code;

        if (
            status === 401 &&
            (errorCode === 'ACCESS_TOKEN_EXPIRED' ||
                errorCode === 'INVALID_SESSION' ||
                errorCode === 'REFRESH_TOKEN_EXPIRED')
        ) {
            if (errorCode === 'REFRESH_TOKEN_EXPIRED') {
                logout();
                return Promise.reject(error);
            }

            if (originalRequest._retry) {
                logout();

                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return http(originalRequest);
            } catch (refreshError) {
                // refreshAccessToken already calls logout()
                return Promise.reject(refreshError);
            }
        }

        if (status >= 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    },
);
