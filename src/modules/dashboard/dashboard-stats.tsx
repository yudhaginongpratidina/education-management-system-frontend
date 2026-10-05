'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import {
    Building2,
    CalendarClock,
    GraduationCap,
    LayoutGrid,
    UserCheck,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatCurrency } from '@/lib/currency';
import {
    ATTENDANCE_STATUS_OPTIONS,
    STUDENT_PROGRAM_STATUS_OPTIONS,
    formatDate,
    formatTime,
} from '@/lib/ems-constants';
import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/status-badge';
import { StatsCard, type StatTone } from './stats-card';

const ATTENDANCE_TONES: Record<string, string> = {
    PRESENT: 'bg-success',
    ABSENT: 'bg-destructive',
    SICK: 'bg-warning',
    PERMISSION: 'bg-info',
    RESCHEDULED: 'bg-chart-3',
};

const SEVERITY_STYLES: Record<string, string> = {
    danger: 'border-destructive/30 bg-destructive/5',
    warning: 'border-warning/30 bg-warning/5',
    info: 'border-info/30 bg-info/5',
};

const SEVERITY_ICON: Record<string, string> = {
    danger: 'mdi:alert-octagon-outline',
    warning: 'mdi:alert-outline',
    info: 'mdi:information-outline',
};

function Panel({
    title,
    description,
    icon,
    action,
    children,
    className,
}: {
    title: string;
    description?: string;
    icon?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    {icon ? <Icon icon={icon} className="text-primary text-lg" /> : null}
                    {title}
                </CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
                {action ? <div className="col-start-2 row-span-2 row-start-1">{action}</div> : null}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function Metric({
    label,
    value,
    tone = 'text-foreground',
}: {
    label: string;
    value: React.ReactNode;
    tone?: string;
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-3">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className={cn('font-heading mt-1 text-xl font-bold tabular-nums', tone)}>{value}</p>
        </div>
    );
}

function DistributionList({ items }: { items: { label: string; value: number; bar: string }[] }) {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    const max = Math.max(1, ...items.map((item) => item.value));
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground tabular-nums">
                            {item.value}
                            {total > 0 ? ` · ${Math.round((item.value / total) * 100)}%` : ''}
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn('h-full rounded-full', item.bar)}
                            style={{ width: `${(item.value / max) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TrendChart({ trend }: { trend: { month: string; label: string; count: number }[] }) {
    const max = Math.max(1, ...trend.map((item) => item.count));
    const hasData = trend.some((item) => item.count > 0);

    if (!hasData) {
        return (
            <p className="text-muted-foreground py-12 text-center text-sm">
                Belum ada data pendaftaran untuk ditampilkan.
            </p>
        );
    }

    return (
        <div className="flex items-stretch gap-1.5">
            {trend.map((item) => (
                <div
                    key={item.month}
                    className="group flex flex-1 flex-col items-center justify-end gap-1.5"
                >
                    <div className="flex w-full items-end" style={{ height: 150 }}>
                        <div
                            className="bg-brand-gradient w-full rounded-t-md transition-all"
                            style={{
                                height: `${Math.max(
                                    (item.count / max) * 150,
                                    item.count > 0 ? 5 : 2,
                                )}px`,
                            }}
                            title={`${item.label}: ${item.count}`}
                        />
                    </div>
                    <span className="text-muted-foreground text-[0.625rem] whitespace-nowrap">
                        {item.label.split(' ')[0]}
                    </span>
                </div>
            ))}
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 w-full rounded-xl" />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="h-72 w-full rounded-xl" />
            </div>
        </div>
    );
}

export function DashboardStats() {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        http.get('/dashboard/overview')
            .then((response) => {
                if (mounted) setData(response.data?.data ?? null);
            })
            .catch((err) => {
                if (mounted) setError(parseAxiosError(err).message);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <DashboardSkeleton />;

    if (!data) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                    <Icon icon="mdi:cloud-off-outline" className="text-muted-foreground text-3xl" />
                    <p className="font-medium">Gagal memuat dashboard</p>
                    <p className="text-muted-foreground text-sm">
                        {error ?? 'Data dashboard tidak tersedia.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    const kpis = data.kpis ?? {};
    const enrollment = data.enrollment ?? {};
    const sessions = data.sessions ?? {};
    const attendance = data.attendance ?? {};
    const student = attendance.student ?? {};
    const teacherToday = attendance.teacher_today ?? {};
    const byStatus = enrollment.by_status ?? {};
    const trend: any[] = enrollment.trend ?? [];
    const revenue = (data.branches ?? []).reduce(
        (sum: number, branch: any) => sum + Number(branch.revenue ?? 0),
        0,
    );
    const trendGrowth = (enrollment.this_month ?? 0) - (enrollment.last_month ?? 0);

    const kpiCards: {
        title: string;
        value: number | string;
        desc: string;
        sub: string;
        icon: typeof Users;
        tone: StatTone;
    }[] = [
        {
            title: 'Siswa Aktif',
            value: kpis.students_active ?? 0,
            desc: 'Siswa dengan program aktif',
            sub: `dari ${kpis.students_total ?? 0} total siswa`,
            icon: Users,
            tone: 'primary',
        },
        {
            title: 'Guru Aktif',
            value: kpis.teachers_active ?? 0,
            desc: 'Pengajar aktif bekerja',
            sub: `dari ${kpis.teachers_total ?? 0} total guru`,
            icon: GraduationCap,
            tone: 'violet',
        },
        {
            title: 'Kelas Aktif',
            value: kpis.classes_active ?? 0,
            desc: 'Kelompok belajar aktif',
            sub: `${sessions.this_week ?? 0} sesi minggu ini`,
            icon: LayoutGrid,
            tone: 'emerald',
        },
        {
            title: 'Cabang',
            value: kpis.branches_total ?? 0,
            desc: 'Cabang terdaftar',
            sub: `${kpis.programs_active ?? 0} program · ${kpis.packages_active ?? 0} paket`,
            icon: Building2,
            tone: 'amber',
        },
        {
            title: 'Sesi Hari Ini',
            value: sessions.today ?? 0,
            desc: `${sessions.upcoming ?? 0} sesi akan datang`,
            sub: `${sessions.completed_this_month ?? 0} selesai bulan ini`,
            icon: CalendarClock,
            tone: 'sky',
        },
        {
            title: 'Pendaftaran Bulan Ini',
            value: kpis.new_enrollments_this_month ?? 0,
            desc: 'Pendaftaran program baru',
            sub: `${trendGrowth >= 0 ? '+' : ''}${trendGrowth} dari bulan lalu`,
            icon: UserCheck,
            tone: 'rose',
        },
        {
            title: 'Estimasi Pendapatan',
            value: `Rp ${formatCurrency(revenue)}`,
            desc: 'Total harga jual program aktif',
            sub: 'Akumulasi seluruh cabang',
            icon: Wallet,
            tone: 'emerald',
        },
        {
            title: 'Pengguna Sistem',
            value: kpis.users_total ?? 0,
            desc: 'Akun pengguna terdaftar',
            sub: 'Termasuk guru & admin',
            icon: UserCog,
            tone: 'primary',
        },
    ];

    const enrollmentItems = STUDENT_PROGRAM_STATUS_OPTIONS.map((option) => ({
        label: option.label,
        value: Number(byStatus[option.value] ?? 0),
        bar:
            option.value === 'ACTIVE'
                ? 'bg-success'
                : option.value === 'PENDING' || option.value === 'TRIAL'
                  ? 'bg-warning'
                  : option.value === 'COMPLETED'
                    ? 'bg-info'
                    : 'bg-destructive',
    }));

    const studentAttendanceItems = ATTENDANCE_STATUS_OPTIONS.map((option) => ({
        label: option.label,
        value: Number(student[option.value] ?? 0),
        bar: ATTENDANCE_TONES[option.value] ?? 'bg-primary',
    }));

    const teacherAttendanceItems = [
        { key: 'PRESENT', label: 'Hadir', bar: 'bg-success' },
        { key: 'LATE', label: 'Terlambat', bar: 'bg-warning' },
        { key: 'SICK', label: 'Sakit', bar: 'bg-warning' },
        { key: 'LEAVE', label: 'Izin', bar: 'bg-info' },
        { key: 'REMOTE', label: 'Remote', bar: 'bg-chart-3' },
        { key: 'OFFICIAL_DUTY', label: 'Dinas', bar: 'bg-chart-3' },
        { key: 'ABSENT', label: 'Alfa', bar: 'bg-destructive' },
    ]
        .map((item) => ({ ...item, value: Number(teacherToday[item.key] ?? 0) }))
        .filter((item) => item.value > 0);

    const attention: any[] = data.attention ?? [];

    return (
        <div className="space-y-6">
            {/* HERO */}
            <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-primary-foreground shadow-brand md:p-8">
                <div className="grid-pattern absolute inset-0 opacity-15" />
                <div className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
                <div className="relative grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="space-y-1.5">
                        <p className="text-sm text-primary-foreground/80">Dashboard Operasional</p>
                        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                            Ringkasan bimbel Anda hari ini 👋
                        </h1>
                        <p className="max-w-2xl text-sm text-primary-foreground/85">
                            Siswa, pengajar, sesi, kehadiran, dan performa cabang dalam satu
                            tampilan. Diperbarui {formatDate(data.generated_at)}.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs text-primary-foreground/80">Kehadiran siswa</p>
                            <p className="font-heading text-2xl font-bold">{student.rate ?? 0}%</p>
                        </div>
                        <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                            <p className="text-xs text-primary-foreground/80">Sesi hari ini</p>
                            <p className="font-heading text-2xl font-bold">{sessions.today ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ATTENTION */}
            {attention.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {attention.map((item) => (
                        <div
                            key={item.code}
                            className={cn(
                                'flex items-start gap-3 rounded-xl border p-4',
                                SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.info,
                            )}
                        >
                            <Icon
                                icon={SEVERITY_ICON[item.severity] ?? SEVERITY_ICON.info}
                                className="mt-0.5 text-xl"
                            />
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-heading font-semibold">{item.title}</span>
                                    <Badge variant="secondary">{item.count}</Badge>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-xs">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* KPI GRID */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((card) => (
                    <StatsCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        desc={card.desc}
                        sub={card.sub}
                        icon={card.icon}
                        tone={card.tone}
                    />
                ))}
            </div>

            {/* ENROLLMENT */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Panel
                    title="Tren Pendaftaran"
                    description="Jumlah pendaftaran program per bulan (12 bulan terakhir)"
                    icon="mdi:chart-timeline-variant"
                    action={
                        <div className="text-right">
                            <p className="text-muted-foreground text-xs">Bulan ini</p>
                            <p className="font-heading text-lg font-bold">
                                {enrollment.this_month ?? 0}
                            </p>
                        </div>
                    }
                >
                    <TrendChart trend={trend} />
                </Panel>

                <Panel
                    title="Status Program Siswa"
                    description={`Total ${enrollment.total ?? 0} pendaftaran program`}
                    icon="mdi:account-multiple-check-outline"
                >
                    <DistributionList items={enrollmentItems} />
                </Panel>
            </div>

            {/* SESSIONS + ATTENDANCE */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Panel
                    title="Aktivitas Sesi"
                    description="Rekap sesi pembelajaran"
                    icon="mdi:calendar-clock"
                >
                    <div className="grid grid-cols-2 gap-3">
                        <Metric label="Hari ini" value={sessions.today ?? 0} tone="text-primary" />
                        <Metric label="Minggu ini" value={sessions.this_week ?? 0} />
                        <Metric
                            label="Akan datang"
                            value={sessions.upcoming ?? 0}
                            tone="text-info"
                        />
                        <Metric
                            label="Selesai bulan ini"
                            value={sessions.completed_this_month ?? 0}
                            tone="text-success"
                        />
                        <Metric
                            label="Dibatalkan"
                            value={sessions.cancelled_this_month ?? 0}
                            tone="text-destructive"
                        />
                        <Metric label="Total sesi" value={sessions.total ?? 0} />
                    </div>
                </Panel>

                <Panel
                    title="Kehadiran Siswa"
                    description={`${attendance.period_days ?? 30} hari terakhir`}
                    icon="mdi:account-check-outline"
                    action={
                        <div className="text-right">
                            <p className="font-heading text-2xl font-bold text-success">
                                {student.rate ?? 0}%
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {student.PRESENT ?? 0} hadir
                            </p>
                        </div>
                    }
                >
                    {Number(student.total ?? 0) === 0 ? (
                        <p className="text-muted-foreground text-sm">Belum ada data kehadiran.</p>
                    ) : (
                        <DistributionList items={studentAttendanceItems} />
                    )}
                </Panel>

                <Panel
                    title="Kehadiran Guru Hari Ini"
                    description={`${teacherToday.checked_in ?? 0} dari ${teacherToday.total_active ?? 0} guru aktif`}
                    icon="mdi:human-male-board"
                >
                    <div className="grid grid-cols-3 gap-3">
                        <Metric
                            label="Sudah absen"
                            value={teacherToday.checked_in ?? 0}
                            tone="text-success"
                        />
                        <Metric
                            label="Belum absen"
                            value={teacherToday.not_checked_in ?? 0}
                            tone="text-warning"
                        />
                        <Metric label="Total guru" value={teacherToday.total_active ?? 0} />
                    </div>
                    {teacherAttendanceItems.length > 0 && (
                        <div className="mt-4 space-y-3">
                            {teacherAttendanceItems.map((item) => (
                                <div key={item.key}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{item.label}</span>
                                        <span className="text-muted-foreground tabular-nums">
                                            {item.value}
                                        </span>
                                    </div>
                                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn('h-full rounded-full', item.bar)}
                                            style={{
                                                width: `${Math.min((item.value / Math.max(teacherToday.total_active ?? 1, 1)) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            {/* UPCOMING SESSIONS */}
            <Panel
                title="Sesi Akan Datang"
                description="Jadwal sesi terdekat yang belum berjalan"
                icon="mdi:calendar-arrow-right"
            >
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Guru</TableHead>
                                <TableHead>Cabang</TableHead>
                                <TableHead className="text-right">Peserta</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(data.upcoming_sessions ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-muted-foreground text-center"
                                    >
                                        Tidak ada sesi yang akan datang.
                                    </TableCell>
                                </TableRow>
                            )}
                            {(data.upcoming_sessions ?? []).map((session: any) => (
                                <TableRow key={session.id}>
                                    <TableCell className="font-medium">
                                        {formatDate(session.scheduled_date)}
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        {formatTime(session.start_time)} -{' '}
                                        {formatTime(session.end_time)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{session.class_name}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {session.class_code}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{session.teacher_name ?? '-'}</TableCell>
                                    <TableCell>{session.branch_name ?? '-'}</TableCell>
                                    <TableCell className="text-right tabular-nums">
                                        {session.participant_count ?? 0}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Panel>

            {/* RECENT ENROLLMENTS + LEADERBOARD */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Panel
                    title="Pendaftaran Terbaru"
                    description="8 pendaftaran program terakhir"
                    icon="mdi:account-plus-outline"
                    className="lg:col-span-2"
                >
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Siswa</TableHead>
                                    <TableHead>Program</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data.recent_enrollments ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-muted-foreground text-center"
                                        >
                                            Belum ada pendaftaran.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(data.recent_enrollments ?? []).map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">
                                            {row.student_name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{row.program_name ?? '-'}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {row.package_name ?? '-'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{row.branch_name ?? '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(row.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={row.status} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Panel>

                <Panel
                    title="Guru Teraktif"
                    description="Berdasarkan sesi selesai bulan ini"
                    icon="mdi:star-circle-outline"
                >
                    <div className="space-y-3">
                        {(data.teacher_leaderboard ?? []).length === 0 && (
                            <p className="text-muted-foreground text-sm">
                                Belum ada aktivitas sesi bulan ini.
                            </p>
                        )}
                        {(data.teacher_leaderboard ?? []).map((teacher: any, index: number) => (
                            <div
                                key={teacher.id}
                                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3"
                            >
                                <span className="bg-brand-gradient-soft text-primary font-heading flex size-8 shrink-0 items-center justify-center rounded-lg font-semibold">
                                    {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{teacher.name}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {teacher.completed_sessions} selesai ·{' '}
                                        {teacher.total_sessions} total sesi
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {/* BRANCH + PROGRAMS */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Panel
                    title="Performa Cabang"
                    description="Siswa, guru, kelas, dan sesi per cabang"
                    icon="mdi:office-building-marker-outline"
                    className="lg:col-span-2"
                >
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead className="text-right">Siswa</TableHead>
                                    <TableHead className="text-right">Guru</TableHead>
                                    <TableHead className="text-right">Kelas</TableHead>
                                    <TableHead className="text-right">Sesi/bln</TableHead>
                                    <TableHead className="text-right">Pendapatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data.branches ?? []).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-muted-foreground text-center"
                                        >
                                            Belum ada cabang.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {(data.branches ?? []).map((branch: any) => (
                                    <TableRow key={branch.id}>
                                        <TableCell className="font-medium">{branch.name}</TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {branch.students}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {branch.teachers}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {branch.classes}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {branch.sessions_this_month}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            Rp {formatCurrency(branch.revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Panel>

                <Panel
                    title="Program Terpopuler"
                    description="Berdasarkan siswa aktif"
                    icon="mdi:book-open-variant"
                >
                    <div className="space-y-4">
                        {(data.top_programs ?? []).length === 0 && (
                            <p className="text-muted-foreground text-sm">Belum ada data program.</p>
                        )}
                        {(data.top_programs ?? []).map((program: any) => (
                            <div key={program.id}>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{program.name}</span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {program.students} siswa
                                    </span>
                                </div>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="bg-brand-gradient h-full rounded-full"
                                        style={{
                                            width: `${
                                                (program.students /
                                                    Math.max(
                                                        ...(data.top_programs ?? []).map(
                                                            (item: any) => item.students,
                                                        ),
                                                        1,
                                                    )) *
                                                100
                                            }%`,
                                        }}
                                    />
                                </div>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Rp {formatCurrency(program.revenue)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </div>
    );
}
