'use client';

import { Icon } from '@iconify/react';

import { useLandingSection } from './landing-content';

export default function Facilities() {
    const facilities = useLandingSection('facilities');

    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Fasilitas
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Belajar nyaman, orang tua tenang
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Kami memperhatikan hal-hal kecil yang membuat siswa betah dan fokus selama
                        sesi belajar.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {facilities.map((item) => (
                        <div
                            key={item.id ?? item.title}
                            className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-colors hover:border-primary/30"
                        >
                            <div className="bg-brand-gradient-soft text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl">
                                <Icon icon={item.icon} className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-heading mb-1 font-semibold">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
