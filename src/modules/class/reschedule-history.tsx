'use client';

import { useEffect, useState } from 'react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList, formatDate, formatTime } from '@/lib/ems-constants';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

const TYPE_OPTIONS = [
    { value: 'all', label: 'Semua Jenis' },
    { value: 'SESSION', label: 'Sesi' },
    { value: 'TEACHER', label: 'Guru' },
    { value: 'STUDENT', label: 'Siswa' },
];

const TYPE_META: Record<string, { label: string; variant: 'info' | 'warning' | 'success' }> = {
    SESSION: { label: 'Sesi', variant: 'info' },
    TEACHER: { label: 'Guru', variant: 'warning' },
    STUDENT: { label: 'Siswa', variant: 'success' },
};

export default function RescheduleHistory({ classId }: { classId?: number }) {
    const [items, setItems] = useState<any[]>([]);
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    const getItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (classId) params.set('class_id', String(classId));
            if (typeFilter !== 'all') params.set('type', typeFilter);
            const query = params.toString();
            const response = await http.get(
                query ? `/session-reschedules?${query}` : '/session-reschedules',
            );
            setItems(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, typeFilter]);

    const describe = (item: any) => {
        if (item.type === 'STUDENT') {
            return `Siswa: ${item.student_name ?? '-'}`;
        }
        if (item.type === 'TEACHER') {
            return `${item.from_teacher_name ?? '-'} → ${item.to_teacher_name ?? '-'}`;
        }
        return `Sesi ${item.from_session_id ?? '-'} → ${item.to_session_id ?? '-'}`;
    };

    const fromSchedule = (item: any) => {
        if (item.from_date) {
            return `${formatDate(item.from_date)} · ${formatTime(item.from_start_time)}-${formatTime(item.from_end_time)}`;
        }
        return '-';
    };

    const toSchedule = (item: any) => {
        if (item.to_date) {
            return `${formatDate(item.to_date)} · ${formatTime(item.to_start_time)}-${formatTime(item.to_end_time)}`;
        }
        return '-';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    Riwayat penjadwalan ulang sesi, pergantian guru, dan perpindahan sesi siswa.
                </p>
                <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value ?? 'all')}
                    items={TYPE_OPTIONS}
                >
                    <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="max-h-125 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Jenis</TableHead>
                            <TableHead>Detail</TableHead>
                            <TableHead>Dari</TableHead>
                            <TableHead>Ke</TableHead>
                            <TableHead>Alasan</TableHead>
                            <TableHead>Waktu</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!loading && items.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada riwayat reschedule.
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((item) => {
                            const meta = TYPE_META[item.type] ?? {
                                label: item.type,
                                variant: 'info' as const,
                            };
                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Badge variant={meta.variant}>{meta.label}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{describe(item)}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {item.class_name ?? '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {fromSchedule(item)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {toSchedule(item)}
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate">
                                        {item.reason || '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {formatDate(item.created_at)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
