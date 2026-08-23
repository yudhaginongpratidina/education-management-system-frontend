import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { decodeJWT } from './decode-jwt';

export const http = axios.create({
    baseURL: '',
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('menu');
        document.cookie = 'authenticated=; Max-Age=0; path=/;';
        document.cookie = 'refresh_token=; Max-Age=0; path=/;';

        window.location.href = '/login';
    }
}

let cachedApiUrl: string | null = null;

async function getApiUrl() {
    if (cachedApiUrl) return cachedApiUrl;

    try {
        const res = await fetch('/api/config');
        const data = await res.json();
        cachedApiUrl = data.apiUrl;
        return cachedApiUrl;
    } catch (e) {
        console.error('Failed to fetch API config, falling back to default');
        return 'http://localhost:4000';
    }
}

http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
        const apiUrl = await getApiUrl();
        // Convert string | null to string | undefined
        config.baseURL = apiUrl || undefined;
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
