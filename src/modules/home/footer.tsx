'use client';

import { Icon } from '@iconify/react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useLandingSection } from './landing-content';

const usefulLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Tentang Kami', href: '/about' },
    { label: 'Program', href: '/course' },
    { label: 'Pengajar', href: '/trainers' },
    { label: 'Kontak', href: '/contact' },
];

const services = ['Bimbel SD', 'Bimbel SMP', 'Bimbel SMA', 'Persiapan UTBK', 'Kelas Privat'];

export default function Footer() {
    const footer = useLandingSection('footer');

    return (
        <footer className="border-t border-border/60 bg-muted/40">
            <div className="container mx-auto px-4 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/" className="mb-4 flex items-center gap-2.5">
                            <span className="bg-brand-gradient text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-brand">
                                <GraduationCap className="size-5" />
                            </span>
                            <span className="font-heading text-lg font-bold">{footer.brand}</span>
                        </Link>
                        <p className="mb-4 text-sm text-muted-foreground">{footer.address}</p>
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Telepon:</strong> {footer.phone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            <strong className="text-foreground">Email:</strong> {footer.email}
                        </p>
                        <div className="mt-6 flex gap-2">
                            {footer.socials.map((social) => (
                                <Link
                                    key={social.id ?? social.icon}
                                    href={social.href}
                                    className="hover:bg-brand-gradient flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground transition-colors hover:text-primary-foreground"
                                >
                                    <Icon icon={social.icon} className="text-lg" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-heading mb-4 text-base font-semibold">Tautan</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            {usefulLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading mb-4 text-base font-semibold">Layanan</h4>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            {services.map((service) => (
                                <li key={service}>
                                    <Link
                                        href="/course"
                                        className="hover:text-primary transition-colors"
                                    >
                                        {service}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading mb-4 text-base font-semibold">Newsletter</h4>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Dapatkan info promo dan tips belajar terbaru.
                        </p>
                        <form className="flex gap-2">
                            <Input type="email" placeholder="Email Anda" />
                            <Button type="submit">Kirim</Button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-8 text-sm text-muted-foreground md:flex-row">
                    <p>
                        © {new Date().getFullYear()}{' '}
                        <strong className="text-foreground">{footer.brand}</strong>. Seluruh hak
                        cipta dilindungi.
                    </p>
                    <p>Dibuat dengan ❤️ untuk pendidikan Indonesia</p>
                </div>
            </div>
        </footer>
    );
}
