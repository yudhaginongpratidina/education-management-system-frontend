import type { ComponentType } from 'react';
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTone = 'primary' | 'violet' | 'sky' | 'emerald' | 'amber' | 'rose';

const toneClasses: Record<StatTone, string> = {
    primary: 'bg-primary/12 text-primary',
    violet: 'bg-chart-3/15 text-chart-3',
    sky: 'bg-info/12 text-info',
    emerald: 'bg-success/12 text-success',
    amber: 'bg-warning/15 text-warning',
    rose: 'bg-destructive/12 text-destructive',
};

interface StatsCardProps {
    title: string;
    value: number | string;
    desc: string;
    sub: string;
    icon: ComponentType<{ className?: string }>;
    tone?: StatTone;
}

export function StatsCard({
    title,
    value,
    desc,
    sub,
    icon: Icon,
    tone = 'primary',
}: StatsCardProps) {
    return (
        <Card className="@container/card group relative overflow-hidden">
            <div
                className={cn(
                    'pointer-events-none absolute -top-16 -right-16 size-40 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60',
                    toneClasses[tone],
                )}
            />
            <CardHeader>
                <CardDescription className="flex items-center gap-2.5 text-sm font-medium">
                    <span
                        className={cn(
                            'flex size-9 items-center justify-center rounded-xl',
                            toneClasses[tone],
                        )}
                    >
                        <Icon className="size-4.5" />
                    </span>
                    {title}
                </CardDescription>
                <CardTitle className="font-heading text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
                    {value}
                </CardTitle>
                <CardAction>
                    <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/12 group-hover:text-primary">
                        <ArrowUpRight className="size-4" />
                    </span>
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 font-medium">{desc}</div>
                <div className="text-muted-foreground">{sub}</div>
            </CardFooter>
        </Card>
    );
}
