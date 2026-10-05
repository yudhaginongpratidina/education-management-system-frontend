'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatDate, extractList, todayLocal, monthStartLocal } from '@/lib/ems-constants';
import { cn } from '@/lib/utils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { toast } from '@/components/ui/toast';

const timeOf = (value?: string | null): string => {
    if (!value) return '-';
    const text = String(value);
    if (text.includes('T') || text.includes('Z')) {
        const date = new Date(text);
        if (!Number.isNaN(date.getTime())) {
            return `${String(date.getHours()).padStart(2, '0')}:${String(
                date.getMinutes(),
            ).padStart(2, '0')}`;
        }
    }
    return text.slice(0, 5);
};

const formatDuration = (minutes?: number | null): string => {
    const value = Number(minutes ?? 0);
    if (value <= 0) return '-';
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    if (hours === 0) return `${rest} menit`;
    return `${hours} jam ${rest} mnt`;
};

export default function ReportsDashboard() {
    const [branches, setBranches] = useState<any[]>([]);
    const [dateFrom, setDateFrom] = useState<string>(monthStartLocal());
    const [dateTo, setDateTo] = useState<string>(todayLocal());
    const [branchId, setBranchId] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<string>('guru');

    const [overview, setOverview] = useState<any>(null);
    const [teacherReport, setTeacherReport] = useState<any>(null);
    const [studentReport, setStudentReport] = useState<any>(null);
    const [studentSummary, setStudentSummary] = useState<any>(null);
    const [sessionReport, setSessionReport] = useState<any>(null);
    const [rescheduleReport, setRescheduleReport] = useState<any>(null);
    const [studentView, setStudentView] = useState<string>('rekap');
    const [loading, setLoading] = useState(false);

    const buildParams = (extra: Record<string, string> = {}) => {
        const params = new URLSearchParams();
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (branchId !== 'all') params.set('branch_id', branchId);
        for (const [key, value] of Object.entries(extra)) params.set(key, value);
        return params;
    };

    const loadOverview = async () => {
        try {
            const response = await http.get(`/reports/overview?${buildParams().toString()}`);
            setOverview(response.data.data ?? null);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const loadActiveTab = async () => {
        setLoading(true);
        try {
            const query = buildParams().toString();
            if (activeTab === 'guru') {
                const response = await http.get(`/reports/teacher-attendance?${query}`);
                setTeacherReport({ data: extractList(response.data), stats: response.data.stats });
            } else if (activeTab === 'siswa') {
                const [detail, summary] = await Promise.all([
                    http.get(`/reports/student-attendance?${query}&limit=200`),
                    http.get(`/reports/student-attendance/summary?${query}`),
                ]);
                setStudentReport({ data: extractList(detail.data), stats: detail.data.stats });
                setStudentSummary(extractList(summary.data));
            } else if (activeTab === 'sesi') {
                const response = await http.get(`/reports/sessions?${query}`);
                setSessionReport({ data: extractList(response.data), stats: response.data.stats });
            } else if (activeTab === 'reschedule') {
                const response = await http.get(`/reports/reschedules?${query}&limit=200`);
                setRescheduleReport({
                    data: extractList(response.data),
                    stats: response.data.stats,
                });
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOverview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo, branchId]);

    useEffect(() => {
        loadActiveTab();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, dateFrom, dateTo, branchId]);

    useEffect(() => {
        http.get('/branches')
            .then((response) => setBranches(extractList(response.data)))
            .catch(() => setBranches([]));
    }, []);

    const exportExcel = async (kind: string, filename: string) => {
        try {
            const response = await http.get(`/reports/export/${kind}?${buildParams().toString()}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const kpis = overview?.kpis ?? {};
    const branchItems = [
        { value: 'all', label: 'Semua Cabang' },
        ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
    ];

    const kpiCards = [
        {
            label: 'Kehadiran Guru',
            value: kpis.teacher_attendance_total ?? 0,
            sub: `${kpis.teacher_total_hours ?? 0} jam kerja`,
            icon: 'mdi:human-male-board',
            tone: 'text-primary',
        },
        {
            label: 'Kehadiran Siswa',
            value: `${kpis.student_attendance_rate ?? 0}%`,
            sub: `${kpis.student_attendance_total ?? 0} catatan`,
            icon: 'mdi:account-check-outline',
            tone: 'text-success',
        },
        {
            label: 'Sesi',
            value: kpis.sessions_total ?? 0,
            sub: `${kpis.sessions_completed ?? 0} selesai · ${kpis.sessions_cancelled ?? 0} batal`,
            icon: 'mdi:calendar-clock',
            tone: 'text-info',
        },
        {
            label: 'Reschedule',
            value: kpis.reschedules_total ?? 0,
            sub: 'Sesi, guru, siswa',
            icon: 'mdi:calendar-swap',
            tone: 'text-warning',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight">
                        Laporan Lengkap
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Absensi guru (datang, keluar, durasi), absensi siswa, sesi, dan reschedule.
                    </p>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap items-end gap-2">
                <Input
                    type="date"
                    className="h-10 w-40"
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                />
                <Input
                    type="date"
                    className="h-10 w-40"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                />
                <Select
                    value={branchId}
                    onValueChange={(value) => setBranchId(value ?? 'all')}
                    items={branchItems}
                >
                    <SelectTrigger className="h-10 w-48">
                        <SelectValue placeholder="Semua Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                        {branchItems.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* OVERVIEW */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card) => (
                    <Card key={card.label} size="sm">
                        <CardContent className="flex items-center gap-3">
                            <span
                                className={cn(
                                    'flex size-11 items-center justify-center rounded-xl bg-muted',
                                    card.tone,
                                )}
                            >
                                <Icon icon={card.icon} className="text-xl" />
                            </span>
                            <div>
                                <p className="text-muted-foreground text-xs">{card.label}</p>
                                <p className="font-heading text-xl font-bold">{card.value}</p>
                                <p className="text-muted-foreground text-xs">{card.sub}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value ?? 'guru')}>
                <TabsList>
                    <TabsTrigger value="guru">Absensi Guru</TabsTrigger>
                    <TabsTrigger value="siswa">Absensi Siswa</TabsTrigger>
                    <TabsTrigger value="sesi">Sesi</TabsTrigger>
                    <TabsTrigger value="reschedule">Reschedule</TabsTrigger>
                </TabsList>

                {/* TEACHER */}
                <TabsContent value="guru" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {teacherReport?.stats && (
                            <div className="flex flex-wrap gap-2 text-sm">
                                <Badge variant="success">
                                    Hadir {teacherReport.stats.by_status?.PRESENT ?? 0}
                                </Badge>
                                <Badge variant="warning">
                                    Terlambat {teacherReport.stats.by_status?.LATE ?? 0}
                                </Badge>
                                <Badge variant="info">
                                    Izin {teacherReport.stats.by_status?.LEAVE ?? 0}
                                </Badge>
                                <Badge variant="destructive">
                                    Alfa {teacherReport.stats.by_status?.ABSENT ?? 0}
                                </Badge>
                                <Badge variant="secondary">
                                    {teacherReport.stats.total_hours ?? 0} jam · rata-rata{' '}
                                    {teacherReport.stats.average_minutes ?? 0} mnt
                                </Badge>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="h-9"
                            onClick={() =>
                                exportExcel('teacher-attendance', 'laporan-absensi-guru.xlsx')
                            }
                        >
                            <Icon icon="mdi:file-excel" /> Export
                        </Button>
                    </div>
                    <div className="overflow-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Guru</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Datang</TableHead>
                                    <TableHead>Keluar</TableHead>
                                    <TableHead>Durasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && (teacherReport?.data ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data absensi guru.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(teacherReport?.data ?? []).map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(row.attendance_date)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {row.teacher_name}
                                        </TableCell>
                                        <TableCell>{row.branch_name ?? '-'}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={row.status} />
                                        </TableCell>
                                        <TableCell>{timeOf(row.check_in_at)}</TableCell>
                                        <TableCell>{timeOf(row.check_out_at)}</TableCell>
                                        <TableCell>
                                            {formatDuration(row.duration_minutes)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* STUDENT */}
                <TabsContent value="siswa" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Select
                                value={studentView}
                                onValueChange={(value) => setStudentView(value ?? 'rekap')}
                                items={[
                                    { value: 'rekap', label: 'Rekap per Siswa' },
                                    { value: 'detail', label: 'Detail Absensi' },
                                ]}
                            >
                                <SelectTrigger className="h-9 w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rekap">Rekap per Siswa</SelectItem>
                                    <SelectItem value="detail">Detail Absensi</SelectItem>
                                </SelectContent>
                            </Select>
                            {studentReport?.stats && (
                                <Badge variant="success">
                                    Kehadiran {studentReport.stats.attendance_rate ?? 0}%
                                </Badge>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            className="h-9"
                            onClick={() =>
                                exportExcel('student-attendance', 'laporan-absensi-siswa.xlsx')
                            }
                        >
                            <Icon icon="mdi:file-excel" /> Export
                        </Button>
                    </div>

                    {studentView === 'rekap' ? (
                        <div className="overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Siswa</TableHead>
                                        <TableHead>Cabang</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Hadir</TableHead>
                                        <TableHead className="text-right">Alfa</TableHead>
                                        <TableHead className="text-right">Sakit</TableHead>
                                        <TableHead className="text-right">Izin</TableHead>
                                        <TableHead className="text-right">Reschedule</TableHead>
                                        <TableHead className="text-right">%</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!loading && (studentSummary ?? []).length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={9}
                                                className="text-center text-muted-foreground"
                                            >
                                                Tidak ada data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {(studentSummary ?? []).map((row: any) => (
                                        <TableRow key={row.student_id}>
                                            <TableCell className="font-medium">
                                                {row.student_name}
                                            </TableCell>
                                            <TableCell>{row.branch_name ?? '-'}</TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.total}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-success">
                                                {row.present}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums text-destructive">
                                                {row.absent}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.sick}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.permission}
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">
                                                {row.rescheduled}
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {row.rate}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="max-h-150 overflow-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Siswa</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Guru</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {!loading && (studentReport?.data ?? []).length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center text-muted-foreground"
                                            >
                                                Tidak ada data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {(studentReport?.data ?? []).map((row: any, index: number) => (
                                        <TableRow
                                            key={`${row.session_id}-${row.student_program_id}-${index}`}
                                        >
                                            <TableCell className="whitespace-nowrap">
                                                {formatDate(row.scheduled_date)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {row.student_name}
                                            </TableCell>
                                            <TableCell>{row.class_name}</TableCell>
                                            <TableCell>{row.teacher_name ?? '-'}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={row.attendance_status} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>

                {/* SESSIONS */}
                <TabsContent value="sesi" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {sessionReport?.stats && (
                            <div className="flex flex-wrap gap-2 text-sm">
                                <Badge variant="secondary">{sessionReport.stats.total} sesi</Badge>
                                <Badge variant="success">
                                    Kehadiran {sessionReport.stats.attendance_rate ?? 0}%
                                </Badge>
                                <Badge variant="info">
                                    {sessionReport.stats.participants} peserta
                                </Badge>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="h-9"
                            onClick={() => exportExcel('sessions', 'laporan-sesi.xlsx')}
                        >
                            <Icon icon="mdi:file-excel" /> Export
                        </Button>
                    </div>
                    <div className="max-h-150 overflow-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead>Guru</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Peserta</TableHead>
                                    <TableHead className="text-right">Hadir</TableHead>
                                    <TableHead className="text-right">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && (sessionReport?.data ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data sesi.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(sessionReport?.data ?? []).map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {formatDate(row.scheduled_date)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {row.class_name}
                                        </TableCell>
                                        <TableCell>{row.teacher_name ?? '-'}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={row.status} />
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {row.participant_count}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-success">
                                            {row.present}
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {row.attendance_rate}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* RESCHEDULE */}
                <TabsContent value="reschedule" className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {rescheduleReport?.stats && (
                            <div className="flex flex-wrap gap-2 text-sm">
                                <Badge variant="info">
                                    Sesi {rescheduleReport.stats.by_type?.SESSION ?? 0}
                                </Badge>
                                <Badge variant="warning">
                                    Guru {rescheduleReport.stats.by_type?.TEACHER ?? 0}
                                </Badge>
                                <Badge variant="success">
                                    Siswa {rescheduleReport.stats.by_type?.STUDENT ?? 0}
                                </Badge>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="h-9"
                            onClick={() => exportExcel('reschedules', 'laporan-reschedule.xlsx')}
                        >
                            <Icon icon="mdi:file-excel" /> Export
                        </Button>
                    </div>
                    <div className="max-h-150 overflow-auto rounded-md border">
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
                                {!loading && (rescheduleReport?.data ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada data reschedule.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(rescheduleReport?.data ?? []).map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    item.type === 'STUDENT'
                                                        ? 'success'
                                                        : item.type === 'TEACHER'
                                                          ? 'warning'
                                                          : 'info'
                                                }
                                            >
                                                {item.type === 'STUDENT'
                                                    ? 'Siswa'
                                                    : item.type === 'TEACHER'
                                                      ? 'Guru'
                                                      : 'Sesi'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>
                                                    {item.type === 'STUDENT'
                                                        ? (item.student_name ?? '-')
                                                        : item.type === 'TEACHER'
                                                          ? `${item.from_teacher_name ?? '-'} → ${item.to_teacher_name ?? '-'}`
                                                          : `Sesi ${item.from_session_id} → ${item.to_session_id}`}
                                                </span>
                                                <span className="text-muted-foreground text-xs">
                                                    {item.class_name ?? '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.from_date ? formatDate(item.from_date) : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.to_date ? formatDate(item.to_date) : '-'}
                                        </TableCell>
                                        <TableCell className="max-w-50 truncate">
                                            {item.reason || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {formatDate(item.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
