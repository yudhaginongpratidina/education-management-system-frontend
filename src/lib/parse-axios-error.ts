import axios from 'axios';

type ParsedError = {
    code?: string;
    message: string;
};

export function parseAxiosError(err: unknown): ParsedError {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        // Handle custom backend format
        if (data?.error) {
            return {
                code: data.error.code,
                message: data.error.message,
            };
        }

        // fallback umum
        return {
            message: data?.message || err.message || 'Unknown server error',
        };
    }

    if (err instanceof Error) {
        return { message: err.message };
    }

    return { message: 'Unknown error' };
}
