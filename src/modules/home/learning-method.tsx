'use client';

import { Icon } from '@iconify/react';

import { useLandingSection } from './landing-content';

export default function LearningMethod() {
    const steps = useLandingSection('method');

    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Cara Kami Mengajar
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Empat langkah yang terukur
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Bukan sekadar masuk kelas lalu pulang. Ada proses yang jelas dari awal
                        sampai laporan belajar.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <div
                            key={step.id ?? step.title}
                            className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-card"
                        >
                            <span className="font-heading absolute top-5 right-5 text-3xl font-bold text-muted-foreground/25">
                                {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="bg-brand-gradient-soft text-primary mb-5 flex size-12 items-center justify-center rounded-2xl">
                                <Icon icon={step.icon} className="text-2xl" />
                            </div>
                            <h3 className="font-heading mb-1 text-lg font-semibold">
                                {step.title}
                            </h3>
                            <p className="text-primary mb-3 text-xs font-semibold tracking-wide uppercase">
                                {step.duration}
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
