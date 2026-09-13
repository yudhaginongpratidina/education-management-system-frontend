import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Info } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: number | string;
    desc: string;
    sub: string;
}

export function StatsCard({ title, value, desc, sub }: StatsCardProps) {
    return (
        <Card className="@container/card">
            <CardHeader>
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {value}
                </CardTitle>
                <CardAction>
                    <Info className="size-4" />
                </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">{desc}</div>
                <div className="text-muted-foreground">{sub}</div>
            </CardFooter>
        </Card>
    );
}
