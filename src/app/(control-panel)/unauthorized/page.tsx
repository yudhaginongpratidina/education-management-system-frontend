'use client';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Page() {
    const router = useRouter();

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 text-center">
            <div className="rounded-full bg-destructive/10 p-6">
                <Icon icon="mdi:alert-octagon-outline" className="size-16 text-destructive" />
            </div>
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">403 - Akses Ditolak</h1>
                <p className="text-lg text-muted-foreground max-w-md">
                    Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Mohon hubungi
                    administrator jika ini adalah kesalahan.
                </p>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="h-10 px-6">
                Kembali ke Dashboard
            </Button>
        </div>
    );
}
