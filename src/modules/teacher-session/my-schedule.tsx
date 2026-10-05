'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { DAY_OF_WEEK_OPTIONS, extractList, formatTime } from '@/lib/ems-constants';

// components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

export default function MySchedule() {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const getSchedule = async () => {
        try {
            const response = await http.get('/teacher/schedule');
            setSchedule(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSchedule();
    }, []);

    const days = DAY_OF_WEEK_OPTIONS.map((option) => ({
        value: Number(option.value),
        label: option.label,
        items: schedule.filter((item) => Number(item.day_of_week) === Number(option.value)),
    }));

    return (
        <div className="space-y-4">
            {!loading && schedule.length === 0 && (
                <div className="rounded-md border p-6 text-center text-muted-foreground">
                    Belum ada jadwal mengajar yang terdaftar.
                </div>
            )}
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {days
                    .filter((day) => day.items.length > 0)
                    .map((day) => (
                        <Card key={day.value} size="sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Icon icon="mdi:calendar-today" className="text-primary" />
                                    {day.label}
                                </CardTitle>
                                <CardDescription>{day.items.length} jadwal</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {day.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-border/70 bg-card p-3"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium">
                                                {formatTime(item.start_time)} -{' '}
                                                {formatTime(item.end_time)}
                                            </span>
                                            <Badge
                                                variant={
                                                    item.teacher_role === 'SUBSTITUTE'
                                                        ? 'secondary'
                                                        : 'default'
                                                }
                                            >
                                                {item.teacher_role === 'SUBSTITUTE'
                                                    ? 'Pengganti'
                                                    : 'Utama'}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm">{item.class_name}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {item.class_code}
                                        </p>
                                        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                                            <Icon
                                                icon="mdi:map-marker"
                                                className="mt-0.5 size-3.5 shrink-0"
                                            />
                                            <span>
                                                {item.branch_name ?? '-'}
                                                {item.branch_address
                                                    ? ` • ${item.branch_address}`
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
}
