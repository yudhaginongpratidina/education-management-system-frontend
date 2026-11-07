'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { CustomThemeProvider } from '@/lib/theme-context';

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            <CustomThemeProvider>{children}</CustomThemeProvider>
        </NextThemesProvider>
    );
}
