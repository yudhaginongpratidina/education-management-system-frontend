'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { useLandingSection } from './landing-content';

export default function FAQ() {
    const faqs = useLandingSection('faqs');
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto max-w-3xl px-4">
                <div className="mb-12 text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        FAQ
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Pertanyaan yang sering diajukan
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Belum menemukan jawabannya? Hubungi kami, biasanya kami balas dalam satu
                        hari kerja.
                    </p>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const open = openIndex === index;
                        return (
                            <div
                                key={faq.id ?? faq.question}
                                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
                            >
                                <button
                                    className="hover:bg-accent/50 font-heading flex w-full items-center justify-between gap-4 p-5 text-left font-semibold transition-colors"
                                    onClick={() => setOpenIndex(open ? null : index)}
                                >
                                    {faq.question}
                                    <span className="bg-brand-gradient-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                                        {open ? (
                                            <Minus className="size-4" />
                                        ) : (
                                            <Plus className="size-4" />
                                        )}
                                    </span>
                                </button>
                                {open && (
                                    <div className="animate-fade-in px-5 pb-5 leading-relaxed text-muted-foreground">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
