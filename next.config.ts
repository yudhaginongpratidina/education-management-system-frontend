import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
            },
        ],
    },
    async rewrites() {
        const apiUrl = process.env.API_URL || 'http://localhost:4000';
        return [
            {
                source: '/storage/:path*',
                destination: `${apiUrl}/storage/:path*`,
            },
        ];
    },
};

export default nextConfig;
