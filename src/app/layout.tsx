import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toast';

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
});

const sora = Sora({
    subsets: ['latin'],
    variable: '--font-heading',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'EMS — Education Management System',
        template: '%s · EMS',
    },
    description:
        'Sistem manajemen bimbel untuk mengelola cabang, program, kelas, guru, siswa, dan kehadiran dalam satu platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html
            lang="id"
            className={cn('h-full', plusJakarta.variable, sora.variable, 'font-sans')}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
