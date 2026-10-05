'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { SESSION_STATUS_OPTIONS, formatDate, formatTime, extractList } from '@/lib/ems-constants';

// components
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
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { toast } from '@/components/ui/toast';

// module components
import MySessionAttendance from '@/modules/teacher-session/my-session-attendance';

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: 'Minggu Ini' },
    { value: 'month', label: 'Bulan Ini' },
    { value: 'upcoming', label: 'Akan Datang' },
    { value: 'past', label: 'Sudah Lewat' },
    { value: 'all', label: 'Semua' },
];

export default function MySessionList() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>({});
    const [period, setPeriod] = useState<string>('upcoming');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [attendanceSession, setAttendanceSession] = useState<any | null>(null);

    const buildParams = (extra: Record<string, string> = {}) => {
        const params = new URLSearchParams();
        if (dateFilter) {
            params.set('scheduled_date', dateFilter);
        } else if (period !== 'all') {
            params.set('period', period);
        }
        if (statusFilter !== 'all') params.set('status', statusFilter);
        for (const [key, value] of Object.entries(extra)) params.set(key, value);
        return params;
    };

    const getSessions = async () => {
        try {
            const params = buildParams();
            const query = params.toString();
            const response = await http.get(
                query ? `/teacher/sessions?${query}` : '/teacher/sessions',
            );
            setSessions(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getSummary = async () => {
        try {
            const params = buildParams();
            const query = params.toString();
            const response = await http.get(
                query ? `/teacher/sessions/summary?${query}` : '/teacher/sessions/summary',
            );
            setSummary(response.data.data ?? {});
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getSessions();
        getSummary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period, statusFilter, dateFilter]);

    const updateStatus = async (sessionId: number, status: string) => {
        try {
            await http.patch(`/teacher/sessions/${sessionId}/status`, { status });
            toast.add({ title: 'Success', type: 'success', description: 'Status sesi diperbarui' });
            getSessions();
            getSummary();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const cards = [
        {
            key: 'total',
            label: 'Total Sesi',
            icon: 'mdi:calendar-month-outline',
            tone: 'text-primary',
        },
        { key: 'scheduled', label: 'Terjadwal', icon: 'mdi:calendar-clock', tone: 'text-info' },
        {
            key: 'ongoing',
            label: 'Berlangsung',
            icon: 'mdi:play-circle-outline',
            tone: 'text-warning',
        },
        {
            key: 'completed',
            label: 'Selesai',
            icon: 'mdi:check-circle-outline',
            tone: 'text-success',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.key} size="sm">
                        <CardContent className="flex items-center gap-3">
                            <div className={`rounded-lg bg-muted p-2 ${card.tone}`}>
                                <Icon icon={card.icon} className="size-5" />
                            </div>
                            <div className="leading-tight">
                                <p className="text-muted-foreground text-xs">{card.label}</p>
                                <p className="text-lg font-semibold">{summary[card.key] ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-wrap items-end gap-2">
                <Select
                    value={period}
                    onValueChange={(value) => setPeriod(value ?? 'upcoming')}
                    items={PERIOD_OPTIONS}
                    disabled={!!dateFilter}
                >
                    <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="Periode" />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIOD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value ?? 'all')}
                    items={[
                        { value: 'all', label: 'Semua Status' },
                        ...SESSION_STATUS_OPTIONS.map((option) => ({
                            value: option.value,
                            label: option.label,
                        })),
                    ]}
                >
                    <SelectTrigger className="h-10 w-44">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {SESSION_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    className="h-10 w-40"
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                />
                {dateFilter && (
                    <Button variant="ghost" className="h-10" onClick={() => setDateFilter('')}>
                        <Icon icon="mdi:close" /> Reset Tanggal
                    </Button>
                )}
            </div>

            <div className="max-h-150 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>Lokasi</TableHead>
                            <TableHead>Peserta</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground"
                                >
                                    Tidak ada sesi pada periode ini.
                                </TableCell>
                            </TableRow>
                        )}
                        {sessions.map((session) => (
                            <TableRow key={session.id}>
                                <TableCell className="font-medium">
                                    {formatDate(session.scheduled_date)}
                                </TableCell>
                                <TableCell>
                                    {formatTime(session.start_time)} -{' '}
                                    {formatTime(session.end_time)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{session.class_name ?? '-'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {session.class_code ?? ''}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{session.branch_name ?? '-'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {session.branch_address ?? ''}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {session.present_count ?? 0}/{session.participant_count ?? 0}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={session.status} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        <Dialog
                                            open={attendanceSession?.id === session.id}
                                            onOpenChange={(open) =>
                                                setAttendanceSession(open ? session : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:account-group" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>ABSENSI SISWA</DialogTitle>
                                                    <DialogDescription>
                                                        {session.class_name} •{' '}
                                                        {formatDate(session.scheduled_date)} •{' '}
                                                        {formatTime(session.start_time)}-
                                                        {formatTime(session.end_time)}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <MySessionAttendance
                                                    sessionId={session.id}
                                                    sessionStatus={session.status}
                                                    onChanged={() => {
                                                        getSessions();
                                                        getSummary();
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        {session.status === 'SCHEDULED' && (
                                            <Button
                                                size="sm"
                                                className="h-9"
                                                onClick={() => updateStatus(session.id, 'ONGOING')}
                                            >
                                                <Icon icon="mdi:play" /> Mulai
                                            </Button>
                                        )}
                                        {session.status === 'ONGOING' && (
                                            <Button
                                                size="sm"
                                                className="h-9"
                                                onClick={() =>
                                                    updateStatus(session.id, 'COMPLETED')
                                                }
                                            >
                                                <Icon icon="mdi:check" /> Selesai
                                            </Button>
                                        )}
                                        {['SCHEDULED', 'ONGOING'].includes(session.status) && (
                                            <AlertDialog>
                                                <AlertDialogTrigger
                                                    render={
                                                        <Button size="icon" variant="outline">
                                                            <Icon icon="mdi:cancel" />
                                                        </Button>
                                                    }
                                                />
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            BATALKAN SESI
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Yakin ingin membatalkan sesi ini?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Kembali
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                updateStatus(
                                                                    session.id,
                                                                    'CANCELLED',
                                                                )
                                                            }
                                                        >
                                                            Ya, Batalkan
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
