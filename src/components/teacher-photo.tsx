'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import axios from 'axios';
import { http } from '@/lib/http';
import { cn } from '@/lib/utils';

// Slugs that failed to load (missing file / server error) — skip re-requesting them.
const failedSlugs = new Set<string>();

function isValidSlug(slug?: string | null): slug is string {
    return !!slug && slug.trim() !== '' && slug !== '-' && slug !== 'null';
}

export default function TeacherPhoto({
    slug,
    className,
    iconClassName,
    alt = 'Teacher',
}: {
    slug?: string | null;
    className?: string;
    iconClassName?: string;
    alt?: string;
}) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(() => isValidSlug(slug) && !failedSlugs.has(slug!));

    useEffect(() => {
        setImageUrl(null);

        if (!isValidSlug(slug) || failedSlugs.has(slug)) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let objectUrl: string | null = null;
        setLoading(true);

        const fetchImage = async () => {
            try {
                const response = await http.get(`/storage/${slug}`, {
                    responseType: 'blob',
                    signal: controller.signal,
                });
                const blob = response.data as Blob;
                if (!blob || blob.size === 0 || !blob.type.startsWith('image/')) {
                    failedSlugs.add(slug);
                    return;
                }
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (error) {
                if (axios.isCancel(error)) return;
                failedSlugs.add(slug);
                console.warn(`Foto guru tidak dapat dimuat (slug: ${slug})`);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [slug]);

    if (loading) {
        return (
            <span
                className={cn('block animate-pulse bg-muted', className ?? 'size-10 rounded-full')}
            />
        );
    }

    if (!imageUrl) {
        return (
            <span
                className={cn(
                    'flex items-center justify-center bg-muted text-muted-foreground',
                    className ?? 'size-10 rounded-full',
                )}
            >
                <Icon icon="mdi:account" className={iconClassName ?? 'size-5'} />
            </span>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={cn('object-cover', className ?? 'size-10 rounded-full')}
            onError={() => setImageUrl(null)}
        />
    );
}
