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
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { StatusBadge } from '@/components/status-badge';

// module components
import SessionForm from '@/modules/class/session-form';
import SessionRescheduleForm from '@/modules/class/session-reschedule-form';
import SessionSubstituteForm from '@/modules/class/session-substitute-form';
import SessionStudentManagement from '@/modules/class/session-student-management';

export default function ClassSessionManagement({
    classId,
    branchId,
}: {
    classId?: number;
    branchId?: number;
}) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [generateFrom, setGenerateFrom] = useState<string>('');
    const [generateTo, setGenerateTo] = useState<string>('');
    const [editSession, setEditSession] = useState<any | null>(null);
    const [rescheduleSession, setRescheduleSession] = useState<any | null>(null);
    const [substituteSession, setSubstituteSession] = useState<any | null>(null);
    const [participantSession, setParticipantSession] = useState<any | null>(null);

    const getSessions = async () => {
        try {
            let url: string;
            const params = new URLSearchParams();
            if (classId) {
                url = `/classes/${classId}/sessions`;
            } else {
                url = '/sessions';
                if (classFilter !== 'all') params.set('class_id', classFilter);
                if (branchId) params.set('branch_id', String(branchId));
            }
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (dateFrom) params.set('date_from', dateFrom);
            if (dateTo) params.set('date_to', dateTo);
            const query = params.toString();
            const response = await http.get(query ? `${url}?${query}` : url);
            setSessions(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getClasses = async () => {
        try {
            const response = await http.get('/classes');
            setClasses(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, branchId, statusFilter, classFilter, dateFrom, dateTo]);

    useEffect(() => {
        if (!classId) getClasses();
    }, [classId]);

    const generateSessions = async () => {
        if (!classId) return;
        try {
            const response = await http.post(`/classes/${classId}/sessions/generate`, {
                from: generateFrom,
                to: generateTo,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Sesi berhasil digenerate',
            });
            setIsGenerateOpen(false);
            setGenerateFrom('');
            setGenerateTo('');
            getSessions();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const updateStatus = async (sessionId: number, status: string) => {
        try {
            await http.patch(`/sessions/${sessionId}`, { status });
            toast.add({ title: 'Success', type: 'success', description: 'Status sesi diperbarui' });
            getSessions();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const deleteSession = async (sessionId: number) => {
        try {
            const response = await http.delete(`/sessions/${sessionId}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Sesi dihapus',
            });
            getSessions();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const classItems = [
        { value: 'all', label: 'Semua Kelas' },
        ...classes.map((item) => ({ value: String(item.id), label: item.name })),
    ];
    const statusFilterItems = [
        { value: 'all', label: 'Semua Status' },
        ...SESSION_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
                {!classId && (
                    <Select
                        value={classFilter}
                        onValueChange={(value) => setClassFilter(value ?? 'all')}
                        items={classItems}
                    >
                        <SelectTrigger className="h-10 w-48">
                            <SelectValue placeholder="Semua Kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kelas</SelectItem>
                            {classes.map((item) => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value ?? 'all')}
                    items={statusFilterItems}
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
                    value={dateFrom}
                    onChange={(event) => setDateFrom(event.target.value)}
                />
                <Input
                    type="date"
                    className="h-10 w-40"
                    value={dateTo}
                    onChange={(event) => setDateTo(event.target.value)}
                />
                <div className="ml-auto flex gap-2">
                    {classId && (
                        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                            <DialogTrigger
                                render={
                                    <Button variant="outline" className="h-10">
                                        <Icon icon="mdi:calendar-sync" /> Generate
                                    </Button>
                                }
                            />
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>GENERATE SESI</DialogTitle>
                                    <DialogDescription>
                                        Buat sesi otomatis dari jadwal rutin pada rentang tanggal.
                                    </DialogDescription>
                                </DialogHeader>
                                <FieldGroup>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field>
                                            <FieldLabel htmlFor="generate_from">Dari</FieldLabel>
                                            <Input
                                                id="generate_from"
                                                type="date"
                                                className="h-10"
                                                value={generateFrom}
                                                onChange={(event) =>
                                                    setGenerateFrom(event.target.value)
                                                }
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="generate_to">Sampai</FieldLabel>
                                            <Input
                                                id="generate_to"
                                                type="date"
                                                className="h-10"
                                                value={generateTo}
                                                onChange={(event) =>
                                                    setGenerateTo(event.target.value)
                                                }
                                            />
                                        </Field>
                                    </div>
                                    <Button className="h-10" onClick={generateSessions}>
                                        Generate
                                    </Button>
                                </FieldGroup>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger
                            render={
                                <Button className="h-10">
                                    <Icon icon="mdi:plus" /> Tambah Sesi
                                </Button>
                            }
                        />
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>TAMBAH SESI</DialogTitle>
                                <DialogDescription>Buat sesi pembelajaran baru.</DialogDescription>
                            </DialogHeader>
                            <SessionForm
                                type="create"
                                classId={classId}
                                onSuccess={() => {
                                    setIsCreateOpen(false);
                                    getSessions();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="max-h-150 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Waktu</TableHead>
                            {!classId && <TableHead>Kelas</TableHead>}
                            <TableHead>Guru</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sessions.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={classId ? 5 : 6}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada sesi.
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
                                {!classId && (
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{session.class_name ?? '-'}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {session.class_code ?? ''}
                                            </span>
                                        </div>
                                    </TableCell>
                                )}
                                <TableCell>{session.teacher_name ?? '-'}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={session.status} />
                                        <Select
                                            value={session.status}
                                            onValueChange={(value) =>
                                                updateStatus(session.id, value ?? session.status)
                                            }
                                            items={SESSION_STATUS_OPTIONS}
                                        >
                                            <SelectTrigger size="sm" className="w-30">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SESSION_STATUS_OPTIONS.map((option) => (
                                                    <SelectItem
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        <Dialog
                                            open={participantSession?.id === session.id}
                                            onOpenChange={(open) =>
                                                setParticipantSession(open ? session : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:account-group" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>PESERTA SESI</DialogTitle>
                                                    <DialogDescription>
                                                        Kelola peserta dan kehadiran sesi.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <SessionStudentManagement
                                                    sessionId={session.id}
                                                    classId={session.class_id ?? classId}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={editSession?.id === session.id}
                                            onOpenChange={(open) =>
                                                setEditSession(open ? session : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mingcute:edit-line" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                                                <DialogHeader>
                                                    <DialogTitle>EDIT SESI</DialogTitle>
                                                </DialogHeader>
                                                <SessionForm
                                                    type="update"
                                                    classId={session.class_id ?? classId}
                                                    session={session}
                                                    onSuccess={() => {
                                                        setEditSession(null);
                                                        getSessions();
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={rescheduleSession?.id === session.id}
                                            onOpenChange={(open) =>
                                                setRescheduleSession(open ? session : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:calendar-clock" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>JADWALKAN ULANG</DialogTitle>
                                                </DialogHeader>
                                                <SessionRescheduleForm
                                                    session={session}
                                                    onSuccess={() => {
                                                        setRescheduleSession(null);
                                                        getSessions();
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={substituteSession?.id === session.id}
                                            onOpenChange={(open) =>
                                                setSubstituteSession(open ? session : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:account-switch" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>GURU PENGGANTI</DialogTitle>
                                                </DialogHeader>
                                                <SessionSubstituteForm
                                                    session={session}
                                                    onSuccess={() => {
                                                        setSubstituteSession(null);
                                                        getSessions();
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:trash" />
                                                    </Button>
                                                }
                                            />
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>HAPUS SESI</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Yakin ingin menghapus sesi ini?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteSession(session.id)}
                                                    >
                                                        Ya
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
