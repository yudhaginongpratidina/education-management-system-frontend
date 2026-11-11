'use client';

// dependencies
import { Icon } from '@iconify/react';
import React, { useEffect, useMemo, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatCurrency } from '@/lib/currency';
import { formatDate, extractList, STUDENT_PROGRAM_STATUS_OPTIONS } from '@/lib/ems-constants';
import { intensityLabel } from '@/lib/enrollment';

// components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// module components
import StudentProgramForm from '@/modules/student/student-program-form';
import StudentProgramSummary from '@/modules/student/student-program-summary';

export interface MonthDurationInfo {
    totalMonths: number;
    elapsedMonths: number;
    remainingMonths: number;
    percentElapsed: number;
    isExpired: boolean;
    isNotStarted: boolean;
    statusLabel: string;
}

export function calculateMonthProgress(
    startedAt?: string | null,
    endedAt?: string | null,
    durationMonths?: number | null,
): MonthDurationInfo {
    const now = new Date();
    let total = Number(durationMonths) || 0;

    if (!startedAt) {
        return {
            totalMonths: total,
            elapsedMonths: 0,
            remainingMonths: total,
            percentElapsed: 0,
            isExpired: false,
            isNotStarted: true,
            statusLabel: 'Belum mulai',
        };
    }

    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : null;

    // If total not provided, calculate difference between start and end
    if (!total && end && !isNaN(end.getTime()) && !isNaN(start.getTime())) {
        total = Math.max(
            1,
            (end.getFullYear() - start.getFullYear()) * 12 +
                (end.getMonth() - start.getMonth()) +
                (end.getDate() >= start.getDate() ? 1 : 0),
        );
    }

    if (total <= 0) total = 1;

    let elapsed = 0;
    let isExpired = false;
    let isNotStarted = false;

    if (now < start) {
        elapsed = 0;
        isNotStarted = true;
    } else if (end && now >= end) {
        elapsed = total;
        isExpired = true;
    } else {
        const monthDiff =
            (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        elapsed = Math.min(
            total,
            Math.max(1, monthDiff + (now.getDate() >= start.getDate() ? 1 : 0)),
        );
    }

    const remaining = Math.max(0, total - elapsed);
    const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

    let statusLabel = `${remaining} bulan tersisa`;
    if (isExpired) statusLabel = 'Periode berakhir';
    else if (isNotStarted) statusLabel = 'Belum dimulai';
    else if (remaining === 0) statusLabel = 'Bulan terakhir';

    return {
        totalMonths: total,
        elapsedMonths: elapsed,
        remainingMonths: remaining,
        percentElapsed: percent,
        isExpired,
        isNotStarted,
        statusLabel,
    };
}

interface StudentProgramsListProps {
    studentId: number;
    student?: any;
    onChanged?: () => void;
}

export default function StudentProgramsList({
    studentId,
    student,
    onChanged,
}: StudentProgramsListProps) {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Centralized dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedEditItem, setSelectedEditItem] = useState<any | null>(null);
    const [selectedSummaryItem, setSelectedSummaryItem] = useState<any | null>(null);
    const [selectedDeleteItem, setSelectedDeleteItem] = useState<any | null>(null);

    const getItems = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ student_id: String(studentId) });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            const response = await http.get(`/student-programs?${params.toString()}`);
            setItems(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Program', type: 'error', description: message });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId, statusFilter]);

    const deleteItem = async (id: number) => {
        try {
            const response = await http.delete(`/student-programs/${id}`);
            toast.add({
                title: 'Berhasil Dihapus',
                type: 'success',
                description: response.data.message ?? 'Program siswa berhasil dihapus.',
            });
            setSelectedDeleteItem(null);
            getItems();
            onChanged?.();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menghapus Program', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setSelectedEditItem(null);
        getItems();
        onChanged?.();
    };

    // Calculate overall totals
    const summaryMetrics = useMemo(() => {
        const totalPrograms = items.length;
        const activePrograms = items.filter((i) => i.status === 'ACTIVE').length;
        const leavePrograms = items.filter((i) => i.status === 'ON_LEAVE').length;
        const totalSessions = items.reduce(
            (acc, curr) => acc + (Number(curr.total_sessions) || 0),
            0,
        );
        const totalDuration = items.reduce(
            (acc, curr) =>
                acc + (Number(curr.duration_months) || Number(curr.package_duration_months) || 0),
            0,
        );

        return {
            totalPrograms,
            activePrograms,
            leavePrograms,
            totalSessions,
            totalDuration,
        };
    }, [items]);

    return (
        <div className="space-y-4">
            {/* Student Header & Quick Summary */}
            <div className="rounded-sm border bg-muted/30 p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="size-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                <Icon icon="mdi:book-education" className="size-4" />
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-foreground">
                                {student?.full_name
                                    ? `Program Siswa: ${student.full_name}`
                                    : 'Daftar Program Siswa'}
                            </h3>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                #{studentId}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Kelola paket kursus, durasi bulan aktif, sesi pertemuan, dan status
                            keaktifan belajar.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Button
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                            className="h-8.5 text-xs gap-1.5 shadow-xs"
                        >
                            <Icon icon="mdi:plus" className="size-4" />
                            Tambah Program
                        </Button>
                    </div>
                </div>

                {/* Mini Stat Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-border/50 text-xs">
                    <div className="p-2 rounded bg-background border flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-muted-foreground block">
                                Total Program
                            </span>
                            <span className="text-base font-bold text-foreground">
                                {summaryMetrics.totalPrograms}
                            </span>
                        </div>
                        <Icon
                            icon="mdi:book-multiple"
                            className="size-4 text-muted-foreground/70"
                        />
                    </div>

                    <div className="p-2 rounded bg-background border flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
                                Program Aktif
                            </span>
                            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                                {summaryMetrics.activePrograms}
                            </span>
                        </div>
                        <Icon icon="mdi:check-circle" className="size-4 text-emerald-500" />
                    </div>

                    <div className="p-2 rounded bg-background border flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-amber-700 dark:text-amber-400 block">
                                Program Cuti
                            </span>
                            <span className="text-base font-bold text-amber-700 dark:text-amber-400">
                                {summaryMetrics.leavePrograms}
                            </span>
                        </div>
                        <Icon icon="mdi:pause-circle" className="size-4 text-amber-500" />
                    </div>

                    <div className="p-2 rounded bg-background border flex items-center justify-between">
                        <div>
                            <span className="text-[11px] text-muted-foreground block">
                                Total Sesi Paket
                            </span>
                            <span className="text-base font-bold text-foreground">
                                {summaryMetrics.totalSessions}{' '}
                                <span className="text-[10px] font-normal text-muted-foreground">
                                    sesi
                                </span>
                            </span>
                        </div>
                        <Icon icon="mdi:calendar-clock" className="size-4 text-primary" />
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                        Filter Status:
                    </span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-8.5 rounded-sm border border-input bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-ring"
                    >
                        <option value="all">Semua Status</option>
                        {STUDENT_PROGRAM_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <span className="text-xs text-muted-foreground">
                    Menampilkan <strong>{items.length}</strong> program terdaftar
                </span>
            </div>

            {/* Program Table with Requested Month Columns */}
            <div className="overflow-hidden rounded-sm border border-border/80 bg-card shadow-xs">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="min-w-[190px] py-3 text-xs font-bold text-foreground">
                                    Paket & Cabang
                                </TableHead>
                                <TableHead className="min-w-[210px] py-3 text-xs font-bold text-foreground">
                                    Durasi & Masa Aktif Bulan
                                </TableHead>
                                <TableHead className="min-w-[160px] py-3 text-xs font-bold text-foreground">
                                    Periode Belajar
                                </TableHead>
                                <TableHead className="min-w-[110px] py-3 text-xs font-bold text-foreground text-center">
                                    Sesi & Intensitas
                                </TableHead>
                                <TableHead className="min-w-[110px] py-3 text-xs font-bold text-foreground">
                                    Biaya
                                </TableHead>
                                <TableHead className="w-24 py-3 text-xs font-bold text-foreground text-center">
                                    Status
                                </TableHead>
                                <TableHead className="w-28 py-3 text-xs font-bold text-foreground text-center">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-10 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Icon
                                                icon="mdi:loading"
                                                className="size-5 animate-spin text-primary"
                                            />
                                            <span className="text-xs">Memuat data program...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center py-10 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1.5 max-w-sm mx-auto">
                                            <Icon
                                                icon="mdi:book-open-page-variant"
                                                className="size-8 text-muted-foreground/50"
                                            />
                                            <p className="text-xs font-semibold text-foreground">
                                                Belum Ada Program Terdaftar
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Siswa ini belum memiliki paket program belajar
                                                aktif.
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setIsCreateOpen(true)}
                                                className="text-xs mt-1.5 gap-1"
                                            >
                                                <Icon icon="mdi:plus" className="size-3.5" />
                                                Assign Program Sekarang
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => {
                                    const monthInfo = calculateMonthProgress(
                                        item.started_at,
                                        item.ended_at,
                                        item.duration_months ?? item.package_duration_months,
                                    );

                                    return (
                                        <TableRow
                                            key={item.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            {/* Column 1: Package, Level & Branch */}
                                            <TableCell className="py-3">
                                                <div className="space-y-1">
                                                    <div className="font-bold text-foreground text-xs sm:text-sm flex items-center gap-1.5">
                                                        <Icon
                                                            icon="mdi:package-variant"
                                                            className="size-4 text-primary shrink-0"
                                                        />
                                                        <span>
                                                            {item.package_name ||
                                                                'Paket Tanpa Nama'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] py-0 px-1.5 bg-background"
                                                        >
                                                            {item.level_name || 'Level -'}
                                                        </Badge>

                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                            <Icon
                                                                icon="mdi:office-building"
                                                                className="size-3 text-muted-foreground/70"
                                                            />
                                                            {item.branch_name || 'Cabang -'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Column 2: Total Months, Elapsed Months & Remaining Months (Key Requested Feature) */}
                                            <TableCell className="py-3">
                                                <div className="space-y-1.5 text-xs">
                                                    {/* 3 Metric Pills */}
                                                    <div className="grid grid-cols-3 gap-1 text-center">
                                                        {/* Total Months */}
                                                        <div className="rounded border bg-muted/20 px-1.5 py-1">
                                                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-semibold">
                                                                Total
                                                            </span>
                                                            <span className="font-bold text-foreground text-xs">
                                                                {monthInfo.totalMonths}{' '}
                                                                <span className="text-[9px] font-normal">
                                                                    Bln
                                                                </span>
                                                            </span>
                                                        </div>

                                                        {/* Elapsed Months */}
                                                        <div className="rounded border bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-900/60 px-1.5 py-1">
                                                            <span className="text-[9px] uppercase tracking-wider text-blue-700 dark:text-blue-300 block font-semibold">
                                                                Berjalan
                                                            </span>
                                                            <span className="font-bold text-blue-700 dark:text-blue-300 text-xs">
                                                                {monthInfo.elapsedMonths}{' '}
                                                                <span className="text-[9px] font-normal">
                                                                    Bln
                                                                </span>
                                                            </span>
                                                        </div>

                                                        {/* Remaining Months */}
                                                        <div
                                                            className={`rounded border px-1.5 py-1 ${
                                                                monthInfo.isExpired
                                                                    ? 'bg-muted/40 text-muted-foreground'
                                                                    : monthInfo.remainingMonths <= 1
                                                                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 text-amber-700 dark:text-amber-300'
                                                                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            <span className="text-[9px] uppercase tracking-wider block font-semibold opacity-80">
                                                                Sisa
                                                            </span>
                                                            <span className="font-bold text-xs">
                                                                {monthInfo.remainingMonths}{' '}
                                                                <span className="text-[9px] font-normal">
                                                                    Bln
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Mini Visual Progress Bar */}
                                                    <div className="space-y-0.5">
                                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all rounded-full ${
                                                                    monthInfo.isExpired
                                                                        ? 'bg-muted-foreground'
                                                                        : monthInfo.percentElapsed >
                                                                            80
                                                                          ? 'bg-amber-500'
                                                                          : 'bg-primary'
                                                                }`}
                                                                style={{
                                                                    width: `${monthInfo.percentElapsed}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                                            <span>
                                                                Progres: {monthInfo.percentElapsed}%
                                                            </span>
                                                            <span className="font-medium text-foreground">
                                                                {monthInfo.statusLabel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Column 3: Dates Period */}
                                            <TableCell className="py-3 text-xs">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <span className="text-[10px] w-10 text-muted-foreground/70">
                                                            Mulai:
                                                        </span>
                                                        <span className="font-medium text-foreground">
                                                            {formatDate(item.started_at)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <span className="text-[10px] w-10 text-muted-foreground/70">
                                                            Selesai:
                                                        </span>
                                                        <span className="font-medium text-foreground">
                                                            {formatDate(item.ended_at)}
                                                        </span>
                                                    </div>
                                                    {item.status === 'ON_LEAVE' &&
                                                        item.leave_until && (
                                                            <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-0.5">
                                                                <span>Cuti s.d:</span>
                                                                <span>
                                                                    {formatDate(item.leave_until)}
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                            </TableCell>

                                            {/* Column 4: Sessions & Intensity */}
                                            <TableCell className="py-3 text-xs text-center">
                                                <div className="space-y-0.5">
                                                    <span className="font-bold text-foreground text-sm block">
                                                        {item.total_sessions != null
                                                            ? `${item.total_sessions}`
                                                            : '-'}{' '}
                                                        <span className="text-[10px] font-normal text-muted-foreground">
                                                            Sesi
                                                        </span>
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground block">
                                                        {intensityLabel(
                                                            item.sessions_per_period,
                                                            item.session_period,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Column 5: Price */}
                                            <TableCell className="py-3 text-xs">
                                                <div className="flex flex-col">
                                                    {Number(item.selling_price) > 0 &&
                                                        Number(item.normal_price) >
                                                            Number(item.selling_price) && (
                                                            <del className="text-muted-foreground text-[10px]">
                                                                {formatCurrency(item.normal_price)}
                                                            </del>
                                                        )}
                                                    <span className="font-bold text-foreground text-xs">
                                                        {formatCurrency(
                                                            Number(item.selling_price) > 0
                                                                ? item.selling_price
                                                                : item.normal_price,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Column 6: Status */}
                                            <TableCell className="py-3 text-center">
                                                <Badge
                                                    variant={
                                                        item.status === 'ACTIVE'
                                                            ? 'success'
                                                            : item.status === 'ON_LEAVE'
                                                              ? 'warning'
                                                              : item.status === 'INACTIVE'
                                                                ? 'destructive'
                                                                : item.status === 'TRIAL'
                                                                  ? 'info'
                                                                  : 'secondary'
                                                    }
                                                    className="text-[10px] font-bold px-2 py-0.5"
                                                >
                                                    {item.status === 'ACTIVE'
                                                        ? '● Aktif'
                                                        : item.status === 'ON_LEAVE'
                                                          ? '⏸ Cuti'
                                                          : item.status === 'INACTIVE'
                                                            ? '⏹ Non Aktif'
                                                            : item.status === 'TRIAL'
                                                              ? 'Trial'
                                                              : item.status}
                                                </Badge>
                                            </TableCell>

                                            {/* Column 7: Actions */}
                                            <TableCell className="py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Summary / Usage dialog */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7 text-primary hover:bg-primary/10"
                                                        title="Lihat Pemakaian Sesi Paket"
                                                        onClick={() => setSelectedSummaryItem(item)}
                                                    >
                                                        <Icon
                                                            icon="mdi:chart-box-outline"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Edit program dialog */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7 text-blue-600 hover:bg-blue-500/10"
                                                        title="Edit Data Program"
                                                        onClick={() => setSelectedEditItem(item)}
                                                    >
                                                        <Icon
                                                            icon="mingcute:edit-line"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Delete program alert */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7 text-destructive hover:bg-destructive/10"
                                                        title="Hapus Program Siswa"
                                                        onClick={() => setSelectedDeleteItem(item)}
                                                    >
                                                        <Icon
                                                            icon="mdi:trash-can-outline"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* CREATE STUDENT PROGRAM DIALOG */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>TAMBAH PROGRAM SISWA</DialogTitle>
                        <DialogDescription>
                            Pilih cabang, paket kursus, level, dan periode waktu untuk siswa ini.
                        </DialogDescription>
                    </DialogHeader>
                    <StudentProgramForm
                        type="create"
                        studentId={studentId}
                        onSuccess={handleSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* EDIT STUDENT PROGRAM DIALOG */}
            <Dialog
                open={Boolean(selectedEditItem)}
                onOpenChange={(open) => !open && setSelectedEditItem(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>EDIT PROGRAM SISWA</DialogTitle>
                        <DialogDescription>
                            Perbarui rincian paket, periode belajar, atau status keaktifan.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEditItem && (
                        <StudentProgramForm
                            type="update"
                            studentId={studentId}
                            id={selectedEditItem.id}
                            onSuccess={handleSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* SESSION USAGE SUMMARY DIALOG */}
            <Dialog
                open={Boolean(selectedSummaryItem)}
                onOpenChange={(open) => !open && setSelectedSummaryItem(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-1.5">
                            <Icon icon="mdi:chart-box-outline" className="text-primary size-5" />
                            RINGKASAN PEMAKAIAN PAKET
                        </DialogTitle>
                        <DialogDescription>
                            Rincian ketentuan sesi, durasi bulan, dan riwayat kehadiran siswa.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSummaryItem && <StudentProgramSummary id={selectedSummaryItem.id} />}
                </DialogContent>
            </Dialog>

            {/* DELETE PROGRAM CONFIRMATION ALERT */}
            <AlertDialog
                open={Boolean(selectedDeleteItem)}
                onOpenChange={(open) => !open && setSelectedDeleteItem(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>KONFIRMASI HAPUS PROGRAM</AlertDialogTitle>
                        <AlertDialogDescription>
                            Yakin ingin menghapus penugasan paket{' '}
                            <strong>{selectedDeleteItem?.package_name}</strong> dari siswa ini?
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedDeleteItem(null)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedDeleteItem && deleteItem(selectedDeleteItem.id)}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            Ya, Hapus Program
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
