/**
 * Formats image URLs so that local assets, external URLs, and uploaded storage files
 * render correctly in both development and production.
 */
export function formatImageUrl(url?: string | null): string {
    if (!url || typeof url !== 'string' || url.trim() === '' || url === '-' || url === 'null') {
        return '';
    }

    const trimmed = url.trim();

    // Full URL or data/blob URI
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed;
    }

    // Local assets in Next.js public directory
    if (trimmed.startsWith('/assets/') || trimmed.startsWith('assets/')) {
        return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    }

    // Storage path from backend (e.g. /storage/1789085270804-wallpaper-01.png)
    if (trimmed.startsWith('/storage/')) {
        return trimmed;
    }

    if (trimmed.startsWith('storage/')) {
        return `/${trimmed}`;
    }

    // If pure storage filename/slug (e.g. "1789085270804-wallpaper-01.png")
    if (/^\d+-[a-zA-Z0-9_\-\.]+\.(png|jpe?g|webp|svg|gif)$/i.test(trimmed)) {
        return `/storage/${trimmed}`;
    }

    // Default return
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
