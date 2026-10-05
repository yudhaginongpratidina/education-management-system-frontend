'use client';

import { Icon } from '@iconify/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { useLandingSection } from './landing-content';

export default function Schedule() {
    const schedules = useLandingSection('schedule');

    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Jadwal
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Pilih waktu yang paling pas
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Tersedia sesi sore dan akhir pekan. Kelas baru dibuka setiap awal bulan.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Program</TableHead>
                                <TableHead>Hari</TableHead>
                                <TableHead>Jam</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead className="text-right">Kuota</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.map((row) => (
                                <TableRow key={row.id ?? row.program}>
                                    <TableCell className="font-medium">{row.program}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {row.days}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground tabular-nums">
                                        {row.time}
                                    </TableCell>
                                    <TableCell>
                                        <span className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium">
                                            {row.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {row.quota}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Icon icon="mdi:information-outline" className="text-primary" />
                    Jadwal dapat menyesuaikan ketersediaan kelas di cabang masing-masing.
                </p>
            </div>
        </section>
    );
}
