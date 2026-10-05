'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

import { useLandingSection } from './landing-content';

export default function EnrollmentCta() {
    const enrollment = useLandingSection('enrollment');
    const steps = enrollment.steps;

    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-card md:p-10">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                        <div>
                            <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                                Cara Mendaftar
                            </span>
                            <h2 className="font-heading mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                                Mulai dalam empat langkah
                            </h2>
                            <p className="mb-8 leading-relaxed text-muted-foreground">
                                Tidak perlu langsung memutuskan. Coba dulu satu sesi gratis, lihat
                                apakah cocok untuk anak Anda, baru lanjutkan.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    size="lg"
                                    nativeButton={false}
                                    render={<Link href="/contact" />}
                                >
                                    Coba Kelas Gratis
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    nativeButton={false}
                                    render={
                                        <a
                                            href={`https://wa.me/${enrollment.whatsapp}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    }
                                >
                                    <Icon icon="mdi:whatsapp" className="text-lg" />
                                    Tanya via WhatsApp
                                </Button>
                            </div>
                            <p className="mt-4 text-sm text-muted-foreground">
                                {enrollment.hours} · {enrollment.phone}
                            </p>
                        </div>

                        <ol className="relative space-y-6 border-l border-dashed border-border pl-8">
                            {steps.map((step, index) => (
                                <li key={step.id ?? step.title} className="relative">
                                    <span className="bg-brand-gradient font-heading absolute top-0 -left-[3.25rem] flex size-9 items-center justify-center rounded-full text-sm font-semibold text-primary-foreground shadow-brand">
                                        {index + 1}
                                    </span>
                                    <h3 className="font-heading font-semibold">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    );
}
