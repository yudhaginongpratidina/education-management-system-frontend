'use client';

import { Icon } from '@iconify/react';

import { useLandingSection } from './landing-content';

export default function About() {
    const about = useLandingSection('about');

    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="relative">
                        <img
                            src="/assets/img/about.jpg"
                            alt="Suasana belajar"
                            className="w-full rounded-3xl object-cover shadow-soft"
                        />
                        <div className="bg-brand-gradient absolute -right-4 -bottom-6 hidden rounded-2xl p-6 text-primary-foreground shadow-brand md:block">
                            <p className="font-heading text-3xl font-bold">{about.badgeYear}</p>
                            <p className="text-sm text-primary-foreground/85">{about.badgeLabel}</p>
                        </div>
                    </div>
                    <div>
                        <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                            Tentang Kami
                        </span>
                        <h3 className="font-heading mb-5 text-3xl font-bold tracking-tight md:text-4xl">
                            {about.heading}
                        </h3>
                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            {about.paragraph}
                        </p>
                        <ul className="space-y-4">
                            {about.points.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="bg-success/12 text-success mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                                        <Icon icon="mdi:check-bold" className="text-xs" />
                                    </span>
                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {about.milestones.map((milestone) => (
                        <li
                            key={milestone.id ?? milestone.year}
                            className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
                        >
                            <p className="font-heading text-primary text-2xl font-bold">
                                {milestone.year}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {milestone.text}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
