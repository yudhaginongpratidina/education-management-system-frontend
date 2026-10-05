'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatDate } from '@/lib/ems-constants';
import { intensityLabel } from '@/lib/enrollment';
import { toast } from '@/components/ui/toast';

export default function StudentProgramSummary({ id }: { id: number }) {
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        let mounted = true;
        http.get(`/student-programs/${id}/summary`)
            .then((response) => {
                if (mounted) setData(response.data?.data ?? response.data);
            })
            .catch((error) => {
                if (mounted) {
                    toast.add({
                        title: 'Error',
                        type: 'error',
                        description: parseAxiosError(error).message,
                    });
                }
            });
        return () => {
            mounted = false;
        };
    }, [id]);

    if (!data) {
        return (
            <p className="text-muted-foreground py-6 text-center text-sm">
                Memuat ringkasan paket...
            </p>
        );
    }

    const usage = data.usage ?? {};
    const byStatus = usage.by_status ?? {};
    const remaining = Number(usage.remaining ?? 0);

    const rows = [
        { label: 'Total sesi paket', value: usage.total_sessions ?? 0 },
        { label: 'Terjadwal', value: usage.total_scheduled ?? 0 },
        { label: 'Hadir', value: byStatus.present ?? 0 },
        { label: 'Alfa', value: byStatus.absent ?? 0 },
        { label: 'Sakit', value: byStatus.sick ?? 0 },
        { label: 'Izin', value: byStatus.permission ?? 0 },
        { label: 'Dijadwalkan ulang', value: byStatus.rescheduled ?? 0 },
    ];

    return (
        <div className="space-y-4">
            <div className="bg-muted/40 rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Icon icon="mdi:package-variant-closed-check" className="text-primary" />
                    Ketentuan Paket
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                    <dt className="text-muted-foreground">Periode</dt>
                    <dd className="text-right font-medium">
                        {formatDate(data.period?.started_at)} – {formatDate(data.period?.ended_at)}
                    </dd>
                    <dt className="text-muted-foreground">Durasi</dt>
                    <dd className="text-right font-medium">
                        {data.intensity?.duration_months ?? 0} bulan
                    </dd>
                    <dt className="text-muted-foreground">Intensitas</dt>
                    <dd className="text-right font-medium">
                        {intensityLabel(
                            data.intensity?.sessions_per_period,
                            data.intensity?.session_period,
                        )}
                    </dd>
                </dl>
            </div>

            <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">Pemakaian sesi</span>
                    <span className="text-muted-foreground">
                        {usage.total_scheduled ?? 0}/{usage.total_sessions ?? 0}
                    </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                        className="bg-brand-gradient h-full rounded-full"
                        style={{ width: `${usage.used_percent ?? 0}%` }}
                    />
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs">
                    {remaining} sesi tersisa
                    {remaining === 0 ? ' · paket telah terpakai penuh' : ''}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {rows.map((row) => (
                    <div
                        key={row.label}
                        className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm"
                    >
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-medium tabular-nums">{row.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
