'use client';

import { Icon } from '@iconify/react';

import { useLandingSection } from './landing-content';

export default function TrustBar() {
    const items = useLandingSection('trust');

    return (
        <section className="border-b border-border/60 bg-muted/50">
            <div className="container mx-auto grid gap-4 px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => (
                    <div key={item.id ?? item.label} className="flex items-center gap-3">
                        <span className="bg-card text-primary flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60">
                            <Icon icon={item.icon} className="text-lg" />
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
