'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import {
    ATTENDANCE_STATUS_OPTIONS,
    extractList,
    formatDate,
    formatTime,
} from '@/lib/ems-constants';

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
    DialogFooter,
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

export default function SessionStudentManagement({
    sessionId,
    classId,
}: {
    sessionId: number;
    classId?: number;
}) {
    const [participants, setParticipants] = useState<any[]>([]);
    const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
    const [fullQuotaStudents, setFullQuotaStudents] = useState<string[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [attendanceStatus, setAttendanceStatus] = useState<string>('PRESENT');
    const [notesItem, setNotesItem] = useState<any | null>(null);
    const [notesValue, setNotesValue] = useState<string>('');
    const [notesAttendance, setNotesAttendance] = useState<string>('PRESENT');
    const [rescheduleItem, setRescheduleItem] = useState<any | null>(null);
    const [targetSessions, setTargetSessions] = useState<any[]>([]);
    const [targetSessionId, setTargetSessionId] = useState<string>('');
    const [rescheduleReason, setRescheduleReason] = useState<string>('');

    const getParticipants = async () => {
        try {
            const response = await http.get(`/sessions/${sessionId}/students`);
            setParticipants(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getAvailablePrograms = async () => {
        try {
            if (classId) {
                const response = await http.get(`/classes/${classId}/student-quotas`);
                const rows = extractList(response.data);
                setFullQuotaStudents(
                    rows
                        .filter((member: any) => !member.can_join)
                        .map((member: any) => member.student_name),
                );
                setAvailablePrograms(
                    rows
                        .filter((member: any) => member.can_join)
                        .map((member: any) => ({
                            id: member.student_program_id,
                            student_full_name: member.student_name,
                            package_name: member.package_name,
                            branch_name: member.branch_name,
                            used: member.used,
                            total_sessions: member.total_sessions,
                            remaining: member.remaining,
                        })),
                );
            } else {
                const response = await http.get('/student-programs');
                setAvailablePrograms(extractList(response.data));
                setFullQuotaStudents([]);
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getParticipants();
        getAvailablePrograms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, classId]);

    const participantIds = participants.map((item) => item.student_program_id);
    const options = availablePrograms.filter((program) => !participantIds.includes(program.id));

    const addParticipant = async () => {
        if (!selectedProgramId) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Pilih siswa terlebih dahulu',
            });
            return;
        }
        try {
            const response = await http.post(`/sessions/${sessionId}/students`, {
                student_program_id: Number(selectedProgramId),
                attendance_status: attendanceStatus,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Peserta ditambahkan',
            });
            setSelectedProgramId('');
            setAttendanceStatus('PRESENT');
            getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const updateAttendance = async (studentProgramId: number, status: string) => {
        try {
            await http.patch(`/sessions/${sessionId}/students/${studentProgramId}`, {
                attendance_status: status,
            });
            toast.add({ title: 'Success', type: 'success', description: 'Kehadiran diperbarui' });
            getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const saveNotes = async () => {
        if (!notesItem) return;
        try {
            await http.patch(`/sessions/${sessionId}/students/${notesItem.student_program_id}`, {
                attendance_status: notesAttendance,
                notes: notesValue || null,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: 'Data peserta diperbarui',
            });
            setNotesItem(null);
            getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const markAllPresent = async () => {
        if (participants.length === 0) return;
        try {
            await http.patch(`/sessions/${sessionId}/attendance`, {
                records: participants.map((item) => ({
                    student_program_id: item.student_program_id,
                    attendance_status: 'PRESENT',
                })),
            });
            toast.add({ title: 'Success', type: 'success', description: 'Semua ditandai hadir' });
            getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const removeParticipant = async (studentProgramId: number) => {
        try {
            const response = await http.delete(
                `/sessions/${sessionId}/students/${studentProgramId}`,
            );
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Peserta dihapus',
            });
            getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const studentItems = options.map((program) => ({
        value: String(program.id),
        label: `${program.student_full_name} - ${program.package_name ?? '-'}${
            program.branch_name ? ` · ${program.branch_name}` : ''
        }${program.total_sessions != null ? ` · sisa ${program.remaining} sesi` : ''}`,
    }));

    const openReschedule = async (item: any) => {
        setRescheduleItem(item);
        setTargetSessionId('');
        setRescheduleReason('');
        setTargetSessions([]);
        try {
            const url = classId ? `/classes/${classId}/sessions` : '/sessions';
            const response = await http.get(url);
            const list = extractList(response.data).filter(
                (session: any) =>
                    session.id !== sessionId &&
                    !['CANCELLED', 'RESCHEDULED'].includes(session.status),
            );
            setTargetSessions(list);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const submitReschedule = async () => {
        if (!rescheduleItem || !targetSessionId) {
            toast.add({ title: 'Error', type: 'error', description: 'Pilih sesi tujuan' });
            return;
        }
        try {
            const response = await http.post(
                `/sessions/${sessionId}/students/${rescheduleItem.student_program_id}/reschedule`,
                {
                    target_session_id: Number(targetSessionId),
                    reason: rescheduleReason || undefined,
                },
            );
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Siswa dijadwalkan ulang',
            });
            setRescheduleItem(null);
            getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const targetItems = targetSessions.map((session) => ({
        value: String(session.id),
        label: `${formatDate(session.scheduled_date)} · ${formatTime(session.start_time)}-${formatTime(session.end_time)}${session.class_name ? ` · ${session.class_name}` : ''}`,
    }));

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-3">
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="student_program_id">Siswa</FieldLabel>
                            <Select
                                value={selectedProgramId || null}
                                onValueChange={(value) => setSelectedProgramId(value ?? '')}
                                items={studentItems}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih siswa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.map((program) => (
                                        <SelectItem key={program.id} value={String(program.id)}>
                                            {program.student_full_name} -{' '}
                                            {program.package_name ?? '-'}
                                            {program.branch_name ? ` · ${program.branch_name}` : ''}
                                            {program.total_sessions != null
                                                ? ` · sisa ${program.remaining} sesi`
                                                : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="attendance_status">Status Kehadiran</FieldLabel>
                            <Select
                                value={attendanceStatus}
                                onValueChange={(value) => setAttendanceStatus(value ?? 'PRESENT')}
                                items={ATTENDANCE_STATUS_OPTIONS}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                    <div className="flex gap-2">
                        <Button className="h-10 w-fit" onClick={addParticipant}>
                            <Icon icon="mdi:account-plus" /> Tambah Peserta
                        </Button>
                        <Button className="h-10 w-fit" variant="outline" onClick={markAllPresent}>
                            <Icon icon="mdi:check-all" /> Tandai Semua Hadir
                        </Button>
                    </div>
                </FieldGroup>
            </div>

            {fullQuotaStudents.length > 0 && (
                <p className="text-muted-foreground text-xs">
                    Kuota penuh: <span className="font-medium">{fullQuotaStudents.join(', ')}</span>
                    . Gunakan tombol jadwalkan ulang siswa untuk memindahkan sesinya.
                </p>
            )}

            <div className="max-h-100 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead>Paket / Level</TableHead>
                            <TableHead>Kehadiran</TableHead>
                            <TableHead>Catatan</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada peserta pada sesi ini.
                                </TableCell>
                            </TableRow>
                        )}
                        {participants.map((item) => (
                            <TableRow key={item.student_program_id}>
                                <TableCell className="font-medium">{item.student_name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{item.package_name ?? '-'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {item.level_name ?? '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="w-40">
                                        <Select
                                            value={item.attendance_status}
                                            onValueChange={(value) =>
                                                updateAttendance(
                                                    item.student_program_id,
                                                    value ?? 'PRESENT',
                                                )
                                            }
                                            items={ATTENDANCE_STATUS_OPTIONS}
                                        >
                                            <SelectTrigger size="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ATTENDANCE_STATUS_OPTIONS.map((option) => (
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
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">
                                            {item.notes || '-'}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => {
                                                setNotesItem(item);
                                                setNotesValue(item.notes ?? '');
                                                setNotesAttendance(item.attendance_status);
                                            }}
                                        >
                                            <Icon icon="mingcute:edit-line" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        title="Jadwalkan ulang siswa"
                                        onClick={() => openReschedule(item)}
                                    >
                                        <Icon icon="mdi:calendar-swap" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger
                                            render={
                                                <Button size="icon" variant="outline">
                                                    <Icon icon="mdi:account-remove" />
                                                </Button>
                                            }
                                        />
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>HAPUS PESERTA</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Yakin ingin menghapus siswa dari sesi ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        removeParticipant(item.student_program_id)
                                                    }
                                                >
                                                    Ya
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!notesItem} onOpenChange={(open) => !open && setNotesItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>CATATAN PESERTA</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="notes_attendance">Kehadiran</FieldLabel>
                            <Select
                                value={notesAttendance}
                                onValueChange={(value) => setNotesAttendance(value ?? 'PRESENT')}
                                items={ATTENDANCE_STATUS_OPTIONS}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="notes_value">Catatan</FieldLabel>
                            <Textarea
                                id="notes_value"
                                className="min-h-10"
                                value={notesValue}
                                onChange={(event) => setNotesValue(event.target.value)}
                                placeholder="Catatan untuk peserta"
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button className="h-10" onClick={saveNotes}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!rescheduleItem}
                onOpenChange={(open) => !open && setRescheduleItem(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>JADWALKAN ULANG SISWA</DialogTitle>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Siswa</FieldLabel>
                            <p className="text-sm font-medium">
                                {rescheduleItem?.student_name ?? '-'}
                            </p>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="target_session">Sesi Tujuan</FieldLabel>
                            <Select
                                value={targetSessionId || null}
                                onValueChange={(value) => setTargetSessionId(value ?? '')}
                                items={targetItems}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih sesi tujuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {targetSessions.map((session) => (
                                        <SelectItem key={session.id} value={String(session.id)}>
                                            {formatDate(session.scheduled_date)} ·{' '}
                                            {formatTime(session.start_time)}-
                                            {formatTime(session.end_time)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Sesi tujuan harus masih dalam periode paket siswa.
                            </p>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="reschedule_reason">Alasan</FieldLabel>
                            <Textarea
                                id="reschedule_reason"
                                className="min-h-10"
                                value={rescheduleReason}
                                onChange={(event) => setRescheduleReason(event.target.value)}
                                placeholder="Alasan reschedule"
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <Button className="h-10" onClick={submitReschedule}>
                            Jadwalkan Ulang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
