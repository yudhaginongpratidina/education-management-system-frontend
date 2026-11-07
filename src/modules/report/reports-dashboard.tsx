'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Camera, CameraOff, Maximize2, ExternalLink, Search, UserCheck, X } from 'lucide-react';

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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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

function resolveAttendancePhotoUrl(photo?: string | null): string | null {
    if (
        !photo ||
        typeof photo !== 'string' ||
        photo.trim() === '' ||
        photo === '-' ||
        photo === 'null'
    ) {
        return null;
    }
    const trimmed = photo.trim();
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed;
    }
    if (trimmed.startsWith('/storage/')) {
        return trimmed;
    }
    if (trimmed.startsWith('storage/')) {
        return `/${trimmed}`;
    }
    if (trimmed.startsWith('/uploads/')) {
        return trimmed;
    }
    const cleanSlug = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `/storage/${cleanSlug}`;
}

function AttendancePhotoThumbnail({
    photo,
    type,
    teacherName,
    date,
    time,
    branchName,
}: {
    photo?: string | null;
    type: 'check_in' | 'check_out';
    teacherName?: string;
    date: string;
    time?: string | null;
    branchName?: string;
}) {
    const label = type === 'check_in' ? 'Check-in (Datang)' : 'Check-out (Keluar)';
    const photoUrl = resolveAttendancePhotoUrl(photo);

    if (!photoUrl) {
        return (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 px-1.5 py-0.5 rounded-sm bg-muted/40 border border-dashed border-border/60">
                <CameraOff className="size-3 opacity-60" />-
            </span>
        );
    }

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <button
                        type="button"
                        className="group relative inline-flex items-center justify-center size-10 overflow-hidden rounded-sm border border-border/80 bg-muted/40 shadow-xs hover:border-primary/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all shrink-0 cursor-pointer"
                        title={`Lihat foto ${label}`}
                    >
                        <img
                            src={photoUrl}
                            alt={`Foto ${label}`}
                            className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.fallback) {
                                    target.dataset.fallback = 'true';
                                    target.src = `http://localhost:4000${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
                                }
                            }}
                        />
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                            <Maximize2 className="size-3 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </span>
                    </button>
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Camera className="size-4 text-primary" />
                        Foto Bukti {label}
                    </DialogTitle>
                    <DialogDescription>
                        {teacherName ? `Guru: ${teacherName} • ` : ''}Cabang: {branchName || '-'} •{' '}
                        {formatDate(date)} {time && time !== '-' ? `(${time} WIB)` : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-2 overflow-hidden rounded-sm border border-border/80 bg-muted/20 flex items-center justify-center min-h-[240px] max-h-[65vh]">
                    <img
                        src={photoUrl}
                        alt={`Foto Bukti ${label}`}
                        className="max-h-[60vh] w-auto max-w-full rounded-sm object-contain"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallback) {
                                target.dataset.fallback = 'true';
                                target.src = `http://localhost:4000${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
                            }
                        }}
                    />
                </div>

                <DialogFooter className="mt-2 flex flex-row items-center justify-between sm:justify-between w-full">
                    <a
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                        <ExternalLink className="size-3.5" />
                        Buka Foto Asli
                    </a>
                    <DialogClose
                        render={
                            <Button variant="outline" size="sm">
                                Tutup
                            </Button>
                        }
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ReportsDashboard() {
    const [branches, setBranches] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [dateFrom, setDateFrom] = useState<string>(monthStartLocal());
    const [dateTo, setDateTo] = useState<string>(todayLocal());
    const [branchId, setBranchId] = useState<string>('all');
    const [teacherId, setTeacherId] = useState<string>('all');
    const [studentQuery, setStudentQuery] = useState<string>('');
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
        if (activeTab === 'guru' && teacherId !== 'all') {
            params.set('teacher_id', teacherId);
        }
        if (activeTab === 'siswa' && studentQuery.trim()) {
            params.set('student_name', studentQuery.trim());
        }
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
    }, [activeTab, dateFrom, dateTo, branchId, teacherId, studentQuery]);

    useEffect(() => {
        http.get('/branches')
            .then((response) => setBranches(extractList(response.data)))
            .catch(() => setBranches([]));
        http.get('/teachers')
            .then((response) => setTeachers(extractList(response.data)))
            .catch(() => setTeachers([]));
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

    const teacherItems = [
        { value: 'all', label: 'Semua Guru' },
        ...teachers.map((t) => ({ value: String(t.id), label: t.full_name })),
    ];

    const selectedTeacher = teachers.find((t) => String(t.id) === teacherId);
    const teacherExportFilename = selectedTeacher
        ? `laporan-absensi-guru-${selectedTeacher.full_name.toLowerCase().replace(/\s+/g, '-')}.xlsx`
        : 'laporan-absensi-guru.xlsx';

    const studentExportFilename = studentQuery.trim()
        ? `laporan-absensi-siswa-${studentQuery.trim().toLowerCase().replace(/\s+/g, '-')}.xlsx`
        : 'laporan-absensi-siswa.xlsx';

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
                        Absensi guru (datang, keluar, durasi & foto), absensi siswa, sesi, dan
                        reschedule.
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
                                    'flex size-11 items-center justify-center rounded-sm bg-muted',
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
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filter Guru */}
                            <Select
                                value={teacherId}
                                onValueChange={(value) => setTeacherId(value ?? 'all')}
                                items={teacherItems}
                            >
                                <SelectTrigger className="h-9 w-52">
                                    <SelectValue placeholder="Pilih / Filter Guru" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teacherItems.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {teacherReport?.stats && (
                                <div className="flex flex-wrap gap-1.5 text-xs">
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
                        </div>

                        <Button
                            variant="outline"
                            className="h-9 gap-1.5"
                            onClick={() => exportExcel('teacher-attendance', teacherExportFilename)}
                        >
                            <Icon icon="mdi:file-excel" className="text-emerald-600 text-base" />
                            <span>
                                Export{' '}
                                {selectedTeacher
                                    ? `(${selectedTeacher.full_name})`
                                    : 'Absensi Guru'}
                            </span>
                        </Button>
                    </div>

                    <div className="overflow-auto rounded-sm border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Guru</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Foto Datang</TableHead>
                                    <TableHead>Datang</TableHead>
                                    <TableHead className="text-center">Foto Keluar</TableHead>
                                    <TableHead>Keluar</TableHead>
                                    <TableHead>Durasi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && (teacherReport?.data ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center text-muted-foreground py-8"
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
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <AttendancePhotoThumbnail
                                                    photo={row.check_in_photo}
                                                    type="check_in"
                                                    teacherName={row.teacher_name}
                                                    date={row.attendance_date}
                                                    time={timeOf(row.check_in_at)}
                                                    branchName={row.branch_name}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {timeOf(row.check_in_at)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center">
                                                <AttendancePhotoThumbnail
                                                    photo={row.check_out_photo}
                                                    type="check_out"
                                                    teacherName={row.teacher_name}
                                                    date={row.attendance_date}
                                                    time={timeOf(row.check_out_at)}
                                                    branchName={row.branch_name}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {timeOf(row.check_out_at)}
                                        </TableCell>
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
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                value={studentView}
                                onValueChange={(value) => setStudentView(value ?? 'rekap')}
                                items={[
                                    { value: 'rekap', label: 'Rekap per Siswa' },
                                    { value: 'detail', label: 'Detail Absensi' },
                                ]}
                            >
                                <SelectTrigger className="h-9 w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rekap">Rekap per Siswa</SelectItem>
                                    <SelectItem value="detail">Detail Absensi</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Input Filter / Tandai Siswa */}
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Tandai / Cari nama siswa..."
                                    className="h-9 w-60 pr-8 text-xs"
                                    value={studentQuery}
                                    onChange={(e) => setStudentQuery(e.target.value)}
                                />
                                {studentQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setStudentQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                ) : (
                                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                )}
                            </div>

                            {studentReport?.stats && (
                                <Badge variant="success">
                                    Kehadiran {studentReport.stats.attendance_rate ?? 0}%
                                </Badge>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="h-9 gap-1.5"
                            onClick={() => exportExcel('student-attendance', studentExportFilename)}
                        >
                            <Icon icon="mdi:file-excel" className="text-emerald-600 text-base" />
                            <span>
                                Export{' '}
                                {studentQuery.trim() ? `(${studentQuery.trim()})` : 'Absensi Siswa'}
                            </span>
                        </Button>
                    </div>

                    {studentQuery.trim() && (
                        <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-sm">
                            <UserCheck className="size-4 shrink-0" />
                            <span>
                                Menandai dan memfilter absensi siswa dengan nama:{' '}
                                <strong>"{studentQuery.trim()}"</strong>
                            </span>
                            <button
                                type="button"
                                onClick={() => setStudentQuery('')}
                                className="ml-auto underline hover:text-primary-foreground font-medium cursor-pointer"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}

                    {studentView === 'rekap' ? (
                        <div className="overflow-auto rounded-sm border">
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
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Tidak ada data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {(studentSummary ?? []).map((row: any) => {
                                        const isMatched =
                                            studentQuery.trim() &&
                                            row.student_name
                                                ?.toLowerCase()
                                                .includes(studentQuery.trim().toLowerCase());

                                        return (
                                            <TableRow
                                                key={row.student_id}
                                                className={cn(
                                                    isMatched && 'bg-primary/5 font-semibold',
                                                )}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setStudentQuery(row.student_name)
                                                            }
                                                            className="text-left hover:underline cursor-pointer"
                                                            title="Klik untuk menandai siswa ini"
                                                        >
                                                            {row.student_name}
                                                        </button>
                                                        {isMatched && (
                                                            <Badge
                                                                variant="default"
                                                                className="text-[10px] h-4 px-1.5 py-0 gap-0.5"
                                                            >
                                                                <UserCheck className="size-2.5" />{' '}
                                                                Ditandai
                                                            </Badge>
                                                        )}
                                                    </div>
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
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="max-h-150 overflow-auto rounded-sm border">
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
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Tidak ada data.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {(studentReport?.data ?? []).map((row: any, index: number) => {
                                        const isMatched =
                                            studentQuery.trim() &&
                                            row.student_name
                                                ?.toLowerCase()
                                                .includes(studentQuery.trim().toLowerCase());

                                        return (
                                            <TableRow
                                                key={`${row.session_id}-${row.student_program_id}-${index}`}
                                                className={cn(
                                                    isMatched && 'bg-primary/5 font-semibold',
                                                )}
                                            >
                                                <TableCell className="whitespace-nowrap">
                                                    {formatDate(row.scheduled_date)}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setStudentQuery(row.student_name)
                                                            }
                                                            className="text-left hover:underline cursor-pointer"
                                                            title="Klik untuk menandai siswa ini"
                                                        >
                                                            {row.student_name}
                                                        </button>
                                                        {isMatched && (
                                                            <Badge
                                                                variant="default"
                                                                className="text-[10px] h-4 px-1.5 py-0 gap-0.5"
                                                            >
                                                                <UserCheck className="size-2.5" />{' '}
                                                                Ditandai
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{row.class_name}</TableCell>
                                                <TableCell>{row.teacher_name ?? '-'}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={row.attendance_status} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
                            className="h-9 gap-1.5"
                            onClick={() => exportExcel('sessions', 'laporan-sesi.xlsx')}
                        >
                            <Icon icon="mdi:file-excel" className="text-emerald-600 text-base" />
                            <span>Export Sesi</span>
                        </Button>
                    </div>
                    <div className="max-h-150 overflow-auto rounded-sm border">
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
                    <div className="max-h-150 overflow-auto rounded-sm border">
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
