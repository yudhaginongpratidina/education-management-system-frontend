'use client';

// dependencies
import { createContext, useContext, useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';

// data (defaults fallback when an API section is not set yet)
import { initialContent, type LandingContent } from '@/modules/landing-cms/data';

type LandingContentValue = Partial<LandingContent>;

const LandingContentContext = createContext<LandingContentValue>({});

/**
 * Loads the landing page content from the CMS API once and shares it with every
 * section below. While loading (or when the backend has no content yet) each
 * section falls back to the bundled default content.
 */
export function LandingContentProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<LandingContentValue>({});

    useEffect(() => {
        let active = true;
        http.get('/landing/content')
            .then((response) => {
                if (active) setContent(response.data?.data ?? {});
            })
            .catch(() => {
                // Public page must keep working even if the CMS is unreachable.
            });
        return () => {
            active = false;
        };
    }, []);

    return (
        <LandingContentContext.Provider value={content}>{children}</LandingContentContext.Provider>
    );
}

export function useLandingSection<K extends keyof LandingContent>(key: K): LandingContent[K] {
    const context = useContext(LandingContentContext);
    return (context[key] as LandingContent[K] | undefined) ?? initialContent[key];
}
