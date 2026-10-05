'use client';

import { Icon } from '@iconify/react';

import { useLandingSection } from './landing-content';

const testimonialImage = (image: string): string => {
    if (!image) return '/assets/img/testimonials/testimonials-1.jpg';
    return image.startsWith('/') ? image : `/assets/img/testimonials/${image}`;
};

export default function Testimonials() {
    const testimonials = useLandingSection('testimonials');

    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Testimoni
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Cerita dari siswa dan orang tua
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Beberapa catatan yang kami terima, ditulis apa adanya tanpa diedit.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((t) => (
                        <figure
                            key={t.id ?? `${t.name}-${t.result}`}
                            className="hover:border-primary/30 flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-warning flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Icon key={i} icon="mdi:star" />
                                    ))}
                                </div>
                                <span className="bg-success/12 text-success rounded-full px-2.5 py-1 text-xs font-medium">
                                    {t.result}
                                </span>
                            </div>
                            <blockquote className="flex-1 leading-relaxed text-muted-foreground">
                                &ldquo;{t.text}&rdquo;
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                                <img
                                    src={testimonialImage(t.image)}
                                    alt={t.name}
                                    className="size-11 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-heading font-semibold">{t.name}</p>
                                    <p className="text-sm text-muted-foreground">{t.role}</p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
