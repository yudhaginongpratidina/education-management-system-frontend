'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
    { href: '/', label: 'Beranda' },
    { href: '/about', label: 'Tentang' },
    { href: '/course', label: 'Program' },
    { href: '/trainers', label: 'Pengajar' },
    { href: '/contact', label: 'Kontak' },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="glass sticky top-0 z-50 border-b border-border/60">
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-brand">
                        <GraduationCap className="size-5" />
                    </span>
                    <span className="leading-tight">
                        <span className="block font-heading text-lg font-bold tracking-tight">
                            Bimbel Cerdas
                        </span>
                        <span className="block text-[0.6875rem] text-muted-foreground">
                            Belajar jadi menyenangkan
                        </span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => {
                        const active =
                            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Button
                        variant="ghost"
                        size="sm"
                        nativeButton={false}
                        render={<Link href="/login" />}
                    >
                        Masuk
                    </Button>
                    <Button size="sm" nativeButton={false} render={<Link href="/contact" />}>
                        Daftar Sekarang
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="text-2xl text-foreground md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Buka menu"
                >
                    {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <nav className="animate-fade-in border-t border-border/60 bg-card px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Button
                            className="mt-2"
                            nativeButton={false}
                            render={<Link href="/contact" />}
                        >
                            Daftar Sekarang
                        </Button>
                        <Button
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/login" />}
                        >
                            Masuk
                        </Button>
                    </div>
                </nav>
            )}
        </header>
    );
}
