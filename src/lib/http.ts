import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { decodeJWT } from './decode-jwt';

type ErrorResponse = {
    error?: {
        code: string;
        message: string;
    };
};

export const http = axios.create({
    baseURL: '',
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('menu');
    document.cookie = 'authenticated=; Max-Age=0; path=/;';
    document.cookie = 'refresh_token=; Max-Age=0; path=/;';

    window.location.href = '/login';
}

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // Dynamically set baseURL if running in browser
    if (typeof window !== 'undefined') {
        const apiUrl = (window as any).API_URL;
        if (apiUrl) {
            config.baseURL = apiUrl;
        }
    }

    if (typeof window === 'undefined') {
        return config;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        return config;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
        logout();
        return Promise.reject(new Error('Invalid token'));
    }

    config.headers.Authorization = `Bearer ${token}`;

    return config;
});

http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            logout();
        }

        if (error.response && error.response.status >= 500) {
            console.error('Server error:', error.response.data);
        }

        return Promise.reject(error);
    },
);
