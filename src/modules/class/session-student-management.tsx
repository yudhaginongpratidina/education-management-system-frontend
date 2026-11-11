'use client';

// dependencies
import { Icon } from '@iconify/react';
import React, { useEffect, useMemo, useState } from 'react';

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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { StatusBadge } from '@/components/status-badge';

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
    const [newStudentAttendance, setNewStudentAttendance] = useState<string>('');

    // Staged Attendance Draft state: student_program_id -> { status, notes }
    const [attendanceDraft, setAttendanceDraft] = useState<
        Record<number, { status: string; notes: string }>
    >({});
    const [isSavingAttendance, setIsSavingAttendance] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Notes dialog state
    const [notesItem, setNotesItem] = useState<any | null>(null);
    const [notesValue, setNotesValue] = useState<string>('');
    const [notesAttendance, setNotesAttendance] = useState<string>('');

    // Reschedule dialog state
    const [rescheduleItem, setRescheduleItem] = useState<any | null>(null);
    const [targetSessions, setTargetSessions] = useState<any[]>([]);
    const [targetSessionId, setTargetSessionId] = useState<string>('');
    const [rescheduleReason, setRescheduleReason] = useState<string>('');
    const [isLoadingTargetSessions, setIsLoadingTargetSessions] = useState(false);
    const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

    const getParticipants = async () => {
        setIsLoading(true);
        try {
            const response = await http.get(`/sessions/${sessionId}/students`);
            const list = extractList(response.data).map((item: any) => {
                // When student is ON_LEAVE, attendance automatically defaults to PERMISSION (Izin)
                if (
                    item.program_status === 'ON_LEAVE' &&
                    (!item.attendance_status || item.attendance_status === 'ABSENT')
                ) {
                    return {
                        ...item,
                        attendance_status: 'PERMISSION',
                        notes: item.notes || 'Siswa Sedang Cuti',
                    };
                }
                return item;
            });

            setParticipants(list);

            // Initialize draft attendance from fetched list (empty by default, unless ON_LEAVE)
            const initialDraft: Record<number, { status: string; notes: string }> = {};
            list.forEach((item: any) => {
                initialDraft[item.student_program_id] = {
                    status:
                        item.program_status === 'ON_LEAVE'
                            ? 'PERMISSION'
                            : item.attendance_status || '',
                    notes:
                        item.program_status === 'ON_LEAVE'
                            ? item.notes || 'Siswa Sedang Cuti'
                            : item.notes || '',
                };
            });
            setAttendanceDraft(initialDraft);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Peserta', type: 'error', description: message });
        } finally {
            setIsLoading(false);
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

    // Attendance draft update helpers
    const handleStatusDraftChange = (studentProgramId: number, status: string) => {
        setAttendanceDraft((prev) => ({
            ...prev,
            [studentProgramId]: {
                status,
                notes: prev[studentProgramId]?.notes || '',
            },
        }));
    };

    // Mark all present in draft
    const markAllPresentDraft = () => {
        if (participants.length === 0) return;
        setAttendanceDraft((prev) => {
            const next = { ...prev };
            participants.forEach((item) => {
                const isLeave = item.program_status === 'ON_LEAVE';
                next[item.student_program_id] = {
                    status: isLeave ? 'PERMISSION' : 'PRESENT',
                    notes: isLeave
                        ? item.notes || 'Siswa Sedang Cuti'
                        : prev[item.student_program_id]?.notes || '',
                };
            });
            return next;
        });

        toast.add({
            title: 'Draft Kehadiran Diperbarui',
            type: 'info',
            description:
                'Semua siswa ditandai Hadir di draft (siswa cuti otomatis Izin). Klik tombol "Terapkan & Simpan Kehadiran" untuk menyimpan ke record.',
        });
    };

    // Reset draft changes back to server state
    const resetDraftChanges = () => {
        const reset: Record<number, { status: string; notes: string }> = {};
        participants.forEach((item: any) => {
            const isLeave = item.program_status === 'ON_LEAVE';
            reset[item.student_program_id] = {
                status: isLeave ? 'PERMISSION' : item.attendance_status || '',
                notes: isLeave ? item.notes || 'Siswa Sedang Cuti' : item.notes || '',
            };
        });
        setAttendanceDraft(reset);
        toast.add({
            title: 'Draft Direset',
            type: 'info',
            description: 'Status kehadiran dikembalikan sesuai data tersimpan terakhir.',
        });
    };

    // Calculate changed records count
    const changedRecords = useMemo(() => {
        return participants.filter((item) => {
            const draft = attendanceDraft[item.student_program_id];
            if (!draft) return false;
            const isLeave = item.program_status === 'ON_LEAVE';
            const originalStatus = isLeave ? 'PERMISSION' : item.attendance_status || '';
            const originalNotes = isLeave ? item.notes || 'Siswa Sedang Cuti' : item.notes || '';
            return draft.status !== originalStatus || draft.notes !== originalNotes;
        });
    }, [participants, attendanceDraft]);

    const hasChanges = changedRecords.length > 0;

    // Save all drafted attendance to server records
    const saveAllAttendance = async () => {
        if (participants.length === 0) return;

        setIsSavingAttendance(true);
        try {
            const records = participants.map((item) => {
                const draft = attendanceDraft[item.student_program_id];
                const isLeave = item.program_status === 'ON_LEAVE';
                const finalStatus = draft
                    ? draft.status
                    : isLeave
                      ? 'PERMISSION'
                      : item.attendance_status || '';
                return {
                    student_program_id: item.student_program_id,
                    attendance_status: finalStatus ? finalStatus : null,
                    notes: draft?.notes !== undefined ? draft.notes || null : item.notes || null,
                };
            });

            await http.patch(`/sessions/${sessionId}/attendance`, {
                records,
            });

            toast.add({
                title: 'Kehadiran Berhasil Disimpan',
                type: 'success',
                description: `Data presensi untuk ${records.length} peserta sesi telah berhasil disimpan dan dimasukkan ke record.`,
            });

            await getParticipants();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menyimpan Kehadiran', type: 'error', description: message });
        } finally {
            setIsSavingAttendance(false);
        }
    };

    // Add new participant
    const addParticipant = async () => {
        if (!selectedProgramId) {
            toast.add({
                title: 'Pilih Siswa',
                type: 'error',
                description: 'Silakan pilih siswa yang akan ditambahkan ke sesi ini.',
            });
            return;
        }
        try {
            const selectedProg = availablePrograms.find(
                (p) => String(p.id) === String(selectedProgramId),
            );
            const isLeave =
                selectedProg?.status === 'ON_LEAVE' ||
                selectedProg?.enrollment_status === 'ON_LEAVE';
            const statusToSave = isLeave
                ? 'PERMISSION'
                : newStudentAttendance
                  ? newStudentAttendance
                  : null;
            const notesToSave = isLeave ? 'Siswa Sedang Cuti' : undefined;

            const response = await http.post(`/sessions/${sessionId}/students`, {
                student_program_id: Number(selectedProgramId),
                attendance_status: statusToSave,
                notes: notesToSave,
            });
            toast.add({
                title: 'Peserta Ditambahkan',
                type: 'success',
                description: response.data.message ?? 'Peserta baru berhasil ditambahkan ke sesi.',
            });
            setSelectedProgramId('');
            setNewStudentAttendance('');
            getParticipants();
            getAvailablePrograms();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menambah Peserta', type: 'error', description: message });
        }
    };

    // Save notes from modal
    const saveNotes = () => {
        if (!notesItem) return;
        setAttendanceDraft((prev) => ({
            ...prev,
            [notesItem.student_program_id]: {
                status: notesAttendance,
                notes: notesValue,
            },
        }));
        setNotesItem(null);
        toast.add({
            title: 'Catatan Ditambahkan ke Draft',
            type: 'info',
            description: 'Klik tombol "Terapkan & Simpan Kehadiran" untuk menyimpan ke record.',
        });
    };

    const removeParticipant = async (studentProgramId: number) => {
        try {
            const response = await http.delete(
                `/sessions/${sessionId}/students/${studentProgramId}`,
            );
            toast.add({
                title: 'Peserta Dihapus',
                type: 'success',
                description: response.data.message ?? 'Peserta telah dihapus dari sesi.',
            });
            getParticipants();
            getAvailablePrograms();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menghapus Peserta', type: 'error', description: message });
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
        setIsLoadingTargetSessions(true);
        try {
            const url = `/sessions/${sessionId}/students/${item.student_program_id}/reschedule-targets`;
            const response = await http.get(url);
            const list = extractList(response.data);
            setTargetSessions(list);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Sesi', type: 'error', description: message });
        } finally {
            setIsLoadingTargetSessions(false);
        }
    };

    const submitReschedule = async () => {
        if (!rescheduleItem || !targetSessionId) {
            toast.add({ title: 'Error', type: 'error', description: 'Pilih sesi tujuan' });
            return;
        }
        setIsSubmittingReschedule(true);
        try {
            const response = await http.post(
                `/sessions/${sessionId}/students/${rescheduleItem.student_program_id}/reschedule`,
                {
                    target_session_id: Number(targetSessionId),
                    reason: rescheduleReason || undefined,
                },
            );
            toast.add({
                title: 'Berhasil Dijadwalkan Ulang',
                type: 'success',
                description: response.data.message ?? 'Siswa berhasil dijadwalkan ulang.',
            });
            setRescheduleItem(null);
            await Promise.all([getParticipants(), getAvailablePrograms()]);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menjadwalkan Ulang', type: 'error', description: message });
        } finally {
            setIsSubmittingReschedule(false);
        }
    };

    const targetItems = targetSessions.map((session) => ({
        value: String(session.id),
        label: `${formatDate(session.scheduled_date)} · ${formatTime(session.start_time)}-${formatTime(session.end_time)}${session.class_name ? ` · ${session.class_name}` : ''}`,
    }));

    // Summary of current drafted status
    const draftSummary = useMemo(() => {
        let present = 0;
        let permission = 0;
        let sick = 0;
        let absent = 0;
        let rescheduled = 0;
        let unmarked = 0;

        participants.forEach((p) => {
            const isLeave = p.program_status === 'ON_LEAVE';
            const st =
                attendanceDraft[p.student_program_id]?.status !== undefined
                    ? attendanceDraft[p.student_program_id].status
                    : isLeave
                      ? 'PERMISSION'
                      : p.attendance_status || '';
            if (st === 'PRESENT') present++;
            else if (st === 'PERMISSION') permission++;
            else if (st === 'SICK') sick++;
            else if (st === 'ABSENT') absent++;
            else if (st === 'RESCHEDULED') rescheduled++;
            else unmarked++;
        });

        return { present, permission, sick, absent, rescheduled, unmarked };
    }, [participants, attendanceDraft]);

    return (
        <div className="space-y-4">
            {/* Add Participant Card */}
            <div className="rounded-sm border bg-card p-3.5 shadow-2xs">
                <FieldGroup>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field>
                            <FieldLabel
                                htmlFor="student_program_id"
                                className="text-xs font-semibold"
                            >
                                Tambah Siswa ke Sesi Ini
                            </FieldLabel>
                            <Select
                                value={selectedProgramId || null}
                                onValueChange={(value) => {
                                    setSelectedProgramId(value ?? '');
                                    const prog = availablePrograms.find(
                                        (p) => String(p.id) === String(value),
                                    );
                                    if (
                                        prog?.status === 'ON_LEAVE' ||
                                        prog?.enrollment_status === 'ON_LEAVE'
                                    ) {
                                        setNewStudentAttendance('PERMISSION');
                                    } else {
                                        setNewStudentAttendance('');
                                    }
                                }}
                                items={studentItems}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="Pilih siswa yang terdaftar..." />
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
                            <FieldLabel
                                htmlFor="attendance_status"
                                className="text-xs font-semibold"
                            >
                                Status Kehadiran Awal
                            </FieldLabel>
                            <div className="flex gap-2">
                                <Select
                                    value={newStudentAttendance || 'NONE'}
                                    onValueChange={(value) =>
                                        setNewStudentAttendance(
                                            value === 'NONE' ? '' : value ?? '',
                                        )
                                    }
                                    items={[
                                        { value: 'NONE', label: '— Belum Ditentukan (Kosong) —' },
                                        ...ATTENDANCE_STATUS_OPTIONS,
                                    ]}
                                >
                                    <SelectTrigger className="h-9 text-xs flex-1">
                                        <SelectValue placeholder="— Pilih status (default kosong) —">
                                            {newStudentAttendance ? (
                                                ATTENDANCE_STATUS_OPTIONS.find(
                                                    (o) => o.value === newStudentAttendance,
                                                )?.label ?? newStudentAttendance
                                            ) : (
                                                <span className="text-muted-foreground font-normal italic">
                                                    Belum Ditentukan (Kosong)
                                                </span>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NONE">
                                            <span className="text-muted-foreground text-xs italic">
                                                — Belum Ditentukan (Kosong) —
                                            </span>
                                        </SelectItem>
                                        {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    size="sm"
                                    className="h-9 text-xs gap-1.5 shrink-0"
                                    onClick={addParticipant}
                                    disabled={!selectedProgramId}
                                >
                                    <Icon icon="mdi:account-plus" className="size-4" /> Tambah
                                </Button>
                            </div>
                        </Field>
                    </div>
                </FieldGroup>
            </div>

            {fullQuotaStudents.length > 0 && (
                <div className="p-2.5 rounded-sm bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Icon
                        icon="mdi:alert-circle-outline"
                        className="size-4 shrink-0 text-amber-600"
                    />
                    <span>
                        <strong>Siswa dengan Kuota Penuh:</strong> {fullQuotaStudents.join(', ')}.
                        Gunakan fitur jadwal ulang untuk memindahkan sesinya.
                    </span>
                </div>
            )}

            {/* Attendance Action Bar: Mark all present & Apply/Save button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-sm border bg-muted/30">
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8.5 text-xs gap-1.5 bg-background shadow-2xs"
                        onClick={markAllPresentDraft}
                        disabled={participants.length === 0}
                    >
                        <Icon icon="mdi:check-all" className="size-4 text-emerald-600" />
                        Tandai Semua Hadir (Draft)
                    </Button>

                    {hasChanges && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8.5 text-xs text-muted-foreground hover:text-foreground"
                            onClick={resetDraftChanges}
                        >
                            <Icon icon="mdi:undo" className="size-3.5 mr-1" />
                            Batal Perubahan
                        </Button>
                    )}
                </div>

                {/* THE MAIN ACTION BUTTON REQUESTED BY USER: Apply & Save Attendance to Record */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={saveAllAttendance}
                        disabled={isSavingAttendance || participants.length === 0}
                        className={`h-8.5 text-xs font-semibold gap-1.5 shadow-sm transition-all ${
                            hasChanges
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/20 animate-pulse'
                                : 'bg-primary text-primary-foreground'
                        }`}
                    >
                        {isSavingAttendance ? (
                            <Icon icon="mdi:loading" className="size-4 animate-spin" />
                        ) : (
                            <Icon icon="mdi:content-save-check" className="size-4" />
                        )}
                        <span>
                            {hasChanges
                                ? `Terapkan & Simpan (${changedRecords.length} Diubah)`
                                : 'Simpan Kehadiran ke Record'}
                        </span>
                    </Button>
                </div>
            </div>

            {/* Change Indicator Notice Banner */}
            {hasChanges && (
                <div className="p-2.5 rounded-sm bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:information" className="size-4 text-emerald-600 shrink-0" />
                        <span>
                            Ada <strong>{changedRecords.length}</strong> kehadiran siswa yang diubah
                            di draft. Tekan tombol <strong>&ldquo;Terapkan & Simpan&rdquo;</strong>{' '}
                            untuk memasukkannya ke database record.
                        </span>
                    </div>
                    <Badge
                        variant="outline"
                        className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-background text-[10px]"
                    >
                        Draft Belum Disimpan
                    </Badge>
                </div>
            )}

            {/* Participants Attendance Table */}
            <div className="overflow-hidden rounded-sm border border-border/80 bg-card shadow-xs">
                <div className="max-h-[50vh] overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/60 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="min-w-[190px] text-xs font-bold text-foreground py-2.5">
                                    Nama Siswa
                                </TableHead>
                                <TableHead className="min-w-[150px] text-xs font-bold text-foreground py-2.5">
                                    Paket & Level
                                </TableHead>
                                <TableHead className="min-w-[190px] text-xs font-bold text-foreground py-2.5">
                                    Status Kehadiran
                                </TableHead>
                                <TableHead className="min-w-[170px] text-xs font-bold text-foreground py-2.5">
                                    Catatan Kehadiran
                                </TableHead>
                                <TableHead className="w-24 text-center text-xs font-bold text-foreground py-2.5">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-12 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Icon
                                                icon="mdi:loading"
                                                className="size-5 animate-spin text-primary"
                                            />
                                            <span className="text-xs">
                                                Memuat daftar peserta sesi...
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : participants.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-10 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1.5 max-w-sm mx-auto">
                                            <Icon
                                                icon="mdi:account-group-outline"
                                                className="size-8 text-muted-foreground/50"
                                            />
                                            <p className="text-xs font-semibold text-foreground">
                                                Belum Ada Peserta di Sesi Ini
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Gunakan form di atas untuk menambahkan siswa ke sesi
                                                ini.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                participants.map((item) => {
                                    const currentDraft = attendanceDraft[item.student_program_id];
                                    const isLeave = item.program_status === 'ON_LEAVE';
                                    const currentStatus =
                                        currentDraft?.status !== undefined
                                            ? currentDraft.status
                                            : isLeave
                                              ? 'PERMISSION'
                                              : item.attendance_status || '';
                                    const currentNotes =
                                        currentDraft?.notes !== undefined
                                            ? currentDraft.notes
                                            : isLeave
                                              ? item.notes || 'Siswa Sedang Cuti'
                                              : item.notes || '';

                                    const originalStatus = isLeave
                                        ? 'PERMISSION'
                                        : item.attendance_status || '';
                                    const originalNotes = isLeave
                                        ? item.notes || 'Siswa Sedang Cuti'
                                        : item.notes || '';

                                    const isRowChanged =
                                        currentStatus !== originalStatus ||
                                        currentNotes !== originalNotes;

                                    return (
                                        <TableRow
                                            key={item.student_program_id}
                                            className={`transition-colors hover:bg-muted/40 ${
                                                isRowChanged
                                                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-l-2 border-l-emerald-500'
                                                    : ''
                                            }`}
                                        >
                                            {/* Column 1: Student info */}
                                            <TableCell className="py-2.5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-foreground">
                                                            {item.student_name}
                                                        </span>
                                                        {item.program_status && (
                                                            <StatusBadge
                                                                status={item.program_status}
                                                            />
                                                        )}
                                                        {isRowChanged && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[9px] py-0 px-1 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                                                            >
                                                                * Draft Diubah
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {item.program_status === 'ON_LEAVE' &&
                                                        item.leave_until && (
                                                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">
                                                                Cuti s.d.{' '}
                                                                {formatDate(item.leave_until)}
                                                            </span>
                                                        )}

                                                    {item.last_active_at && (
                                                        <span className="text-[10px] text-muted-foreground block">
                                                            Terakhir aktif:{' '}
                                                            {formatDate(item.last_active_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Column 2: Package & Level */}
                                            <TableCell className="py-2.5 text-xs">
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-foreground block">
                                                        {item.package_name ?? '-'}
                                                    </span>
                                                    <span className="text-muted-foreground text-[11px] block">
                                                        {item.level_name ?? '-'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Column 3: Attendance Selection (Updates Draft First!) */}
                                            <TableCell className="py-2.5">
                                                <div className="w-44">
                                                    <Select
                                                        value={currentStatus || 'NONE'}
                                                        onValueChange={(val) =>
                                                            handleStatusDraftChange(
                                                                item.student_program_id,
                                                                val === 'NONE' ? '' : val ?? '',
                                                            )
                                                        }
                                                        items={[
                                                            {
                                                                value: 'NONE',
                                                                label: '— Belum Presensi (Kosong) —',
                                                            },
                                                            ...ATTENDANCE_STATUS_OPTIONS,
                                                        ]}
                                                    >
                                                        <SelectTrigger
                                                            size="sm"
                                                            className={`h-8 text-xs font-medium ${
                                                                currentStatus === 'PRESENT'
                                                                    ? 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20'
                                                                    : currentStatus === 'PERMISSION'
                                                                      ? 'text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20'
                                                                      : currentStatus === 'SICK'
                                                                        ? 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20'
                                                                        : currentStatus === 'ABSENT'
                                                                          ? 'text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20'
                                                                          : currentStatus ===
                                                                              'RESCHEDULED'
                                                                            ? 'text-amber-600 border-amber-300 bg-amber-50/40'
                                                                            : 'text-muted-foreground border-dashed bg-muted/20'
                                                            }`}
                                                        >
                                                            <SelectValue placeholder="— Pilih Kehadiran —">
                                                                {currentStatus ? (
                                                                    ATTENDANCE_STATUS_OPTIONS.find(
                                                                        (o) =>
                                                                            o.value ===
                                                                            currentStatus,
                                                                    )?.label ?? currentStatus
                                                                ) : (
                                                                    <span className="text-muted-foreground font-normal italic">
                                                                        Belum Presensi (Kosong)
                                                                    </span>
                                                                )}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NONE">
                                                                <span className="text-muted-foreground text-xs italic flex items-center gap-1.5">
                                                                    <span className="size-2 rounded-full border border-dashed border-muted-foreground" />
                                                                    Belum Presensi (Kosong)
                                                                </span>
                                                            </SelectItem>
                                                            {ATTENDANCE_STATUS_OPTIONS.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={option.value}
                                                                        value={option.value}
                                                                    >
                                                                        <span className="flex items-center gap-1.5 text-xs">
                                                                            <span
                                                                                className={`size-2 rounded-full ${
                                                                                    option.value ===
                                                                                    'PRESENT'
                                                                                        ? 'bg-emerald-500'
                                                                                        : option.value ===
                                                                                              'PERMISSION'
                                                                                          ? 'bg-blue-500'
                                                                                          : option.value ===
                                                                                                'SICK'
                                                                                            ? 'bg-amber-500'
                                                                                            : option.value ===
                                                                                                  'ABSENT'
                                                                                                ? 'bg-rose-500'
                                                                                                : 'bg-muted-foreground'
                                                                                }`}
                                                                            />
                                                                            {option.label}
                                                                        </span>
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>

                                            {/* Column 4: Notes */}
                                            <TableCell className="py-2.5 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="text-muted-foreground truncate max-w-[140px]"
                                                        title={currentNotes}
                                                    >
                                                        {currentNotes || '-'}
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7 text-muted-foreground hover:text-foreground"
                                                        title="Tulis catatan presensi"
                                                        onClick={() => {
                                                            setNotesItem(item);
                                                            setNotesValue(currentNotes);
                                                            setNotesAttendance(currentStatus);
                                                        }}
                                                    >
                                                        <Icon
                                                            icon="mingcute:edit-line"
                                                            className="size-3.5"
                                                        />
                                                    </Button>
                                                </div>
                                            </TableCell>

                                            {/* Column 5: Actions */}
                                            <TableCell className="py-2.5 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Reschedule Button */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-7 text-amber-600 hover:bg-amber-50"
                                                        title={
                                                            item.attendance_status === 'RESCHEDULED'
                                                                ? 'Siswa sudah dijadwalkan ulang dari sesi ini'
                                                                : item.attendance_status ===
                                                                    'PRESENT'
                                                                  ? 'Siswa sudah hadir pada sesi ini'
                                                                  : 'Jadwalkan ulang sesi siswa (make-up / susulan)'
                                                        }
                                                        disabled={
                                                            item.attendance_status ===
                                                                'RESCHEDULED' ||
                                                            item.attendance_status === 'PRESENT'
                                                        }
                                                        onClick={() => openReschedule(item)}
                                                    >
                                                        <Icon
                                                            icon="mdi:calendar-sync"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Remove Participant Alert */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            render={
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="size-7 text-destructive hover:bg-destructive/10"
                                                                    title="Hapus peserta dari sesi"
                                                                >
                                                                    <Icon
                                                                        icon="mdi:account-remove"
                                                                        className="size-4"
                                                                    />
                                                                </Button>
                                                            }
                                                        />
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    HAPUS PESERTA SESI
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Yakin ingin menghapus siswa{' '}
                                                                    <strong>
                                                                        {item.student_name}
                                                                    </strong>{' '}
                                                                    dari sesi ini?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Batal
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        removeParticipant(
                                                                            item.student_program_id,
                                                                        )
                                                                    }
                                                                >
                                                                    Ya, Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Bar: Quick counts & Save button */}
                {participants.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-muted/20 border-t border-border/80 text-xs">
                        <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                            <span className="font-semibold text-foreground">
                                Ringkasan Kehadiran:
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                <span className="size-2 rounded-full bg-emerald-500" />
                                {draftSummary.present} Hadir
                            </span>
                            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300 font-medium">
                                <span className="size-2 rounded-full bg-blue-500" />
                                {draftSummary.permission} Izin
                            </span>
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-medium">
                                <span className="size-2 rounded-full bg-amber-500" />
                                {draftSummary.sick} Sakit
                            </span>
                            <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-medium">
                                <span className="size-2 rounded-full bg-rose-500" />
                                {draftSummary.absent} Alfa
                            </span>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            {hasChanges && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={resetDraftChanges}
                                >
                                    Batal Perubahan
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={saveAllAttendance}
                                disabled={isSavingAttendance}
                                className={`h-8 text-xs font-semibold gap-1.5 shadow-sm ${
                                    hasChanges
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-primary text-primary-foreground'
                                }`}
                            >
                                {isSavingAttendance ? (
                                    <Icon icon="mdi:loading" className="size-3.5 animate-spin" />
                                ) : (
                                    <Icon icon="mdi:content-save-check" className="size-3.5" />
                                )}
                                <span>
                                    {hasChanges
                                        ? `Simpan Kehadiran (${changedRecords.length} Diubah)`
                                        : 'Simpan Kehadiran ke Record'}
                                </span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT NOTES & ATTENDANCE DIALOG */}
            <Dialog open={!!notesItem} onOpenChange={(open) => !open && setNotesItem(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Icon icon="mingcute:edit-line" className="size-4 text-primary" />
                            CATATAN PRESENSI PESERTA
                        </DialogTitle>
                    </DialogHeader>
                    <FieldGroup className="space-y-3 pt-2">
                        <Field>
                            <FieldLabel htmlFor="notes_student" className="text-xs font-semibold">
                                Siswa
                            </FieldLabel>
                            <p className="text-sm font-bold text-foreground">
                                {notesItem?.student_name ?? '-'}
                            </p>
                        </Field>

                        <Field>
                            <FieldLabel
                                htmlFor="notes_attendance"
                                className="text-xs font-semibold"
                            >
                                Status Kehadiran
                            </FieldLabel>
                            <Select
                                value={notesAttendance || 'NONE'}
                                onValueChange={(value) =>
                                    setNotesAttendance(value === 'NONE' ? '' : value ?? '')
                                }
                                items={[
                                    { value: 'NONE', label: '— Belum Presensi (Kosong) —' },
                                    ...ATTENDANCE_STATUS_OPTIONS,
                                ]}
                            >
                                <SelectTrigger className="h-9 text-xs">
                                    <SelectValue placeholder="— Pilih Kehadiran —">
                                        {notesAttendance ? (
                                            ATTENDANCE_STATUS_OPTIONS.find(
                                                (o) => o.value === notesAttendance,
                                            )?.label ?? notesAttendance
                                        ) : (
                                            <span className="text-muted-foreground font-normal italic">
                                                Belum Presensi (Kosong)
                                            </span>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NONE">
                                        <span className="text-muted-foreground text-xs italic">
                                            — Belum Presensi (Kosong) —
                                        </span>
                                    </SelectItem>
                                    {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="notes_value" className="text-xs font-semibold">
                                Catatan Khusus
                            </FieldLabel>
                            <Textarea
                                id="notes_value"
                                className="min-h-16 text-xs"
                                value={notesValue}
                                onChange={(event) => setNotesValue(event.target.value)}
                                placeholder="Contoh: Izin terlambat 15 menit karena hujan, atau sakit demam..."
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter className="pt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setNotesItem(null)}
                        >
                            Batal
                        </Button>
                        <Button size="sm" className="h-8 text-xs gap-1" onClick={saveNotes}>
                            <Icon icon="mdi:check" className="size-3.5" />
                            Terapkan ke Draft
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* RESCHEDULE DIALOG */}
            <Dialog
                open={!!rescheduleItem}
                onOpenChange={(open) => !open && setRescheduleItem(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Icon icon="mdi:calendar-sync" className="size-4 text-amber-600" />
                            JADWALKAN ULANG SISWA
                        </DialogTitle>
                    </DialogHeader>
                    <FieldGroup className="space-y-3 pt-2">
                        <Field>
                            <FieldLabel className="text-xs font-semibold">Siswa</FieldLabel>
                            <p className="text-sm font-bold text-foreground">
                                {rescheduleItem?.student_name ?? '-'}
                            </p>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="target_session" className="text-xs font-semibold">
                                Sesi Pengganti Tujuan
                            </FieldLabel>
                            {isLoadingTargetSessions ? (
                                <div className="text-xs text-muted-foreground py-2 flex items-center gap-1.5">
                                    <Icon
                                        icon="mdi:loading"
                                        className="size-4 animate-spin text-primary"
                                    />
                                    <span>Memuat daftar sesi tersedia...</span>
                                </div>
                            ) : targetSessions.length === 0 ? (
                                <div className="rounded-sm bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300 p-2.5 text-xs border leading-relaxed">
                                    Tidak ada sesi terjadwal lain yang dapat dipilih untuk siswa
                                    ini. Hal ini terjadi karena seluruh sesi terjadwal yang ada
                                    sudah diikuti oleh siswa, atau belum ada sesi pengganti yang
                                    dijadwalkan di kelas ini / cabang.
                                    <div className="mt-1 font-semibold">
                                        Solusi: Silakan buat sesi terjadwal baru terlebih dahulu di
                                        menu Sesi Kelas agar siswa dapat dijadwalkan ulang ke sesi
                                        tersebut.
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Select
                                        value={targetSessionId || null}
                                        onValueChange={(value) => setTargetSessionId(value ?? '')}
                                        items={targetItems}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Pilih sesi tanggal & jam lain...">
                                                {(() => {
                                                    const sel = targetSessions.find(
                                                        (s) =>
                                                            String(s.id) ===
                                                            String(targetSessionId),
                                                    );
                                                    return sel
                                                        ? `${formatDate(sel.scheduled_date)} · ${formatTime(sel.start_time)}-${formatTime(sel.end_time)}${sel.class_name ? ` · ${sel.class_name}` : ''}`
                                                        : undefined;
                                                })()}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {targetSessions.map((session) => (
                                                <SelectItem
                                                    key={session.id}
                                                    value={String(session.id)}
                                                >
                                                    <span className="flex flex-col gap-0.5 text-left py-0.5">
                                                        <span className="font-medium text-xs">
                                                            {formatDate(session.scheduled_date)} ·{' '}
                                                            {formatTime(session.start_time)}-
                                                            {formatTime(session.end_time)}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {session.class_name
                                                                ? `Kelas: ${session.class_name}`
                                                                : ''}
                                                            {session.teacher_name
                                                                ? ` · Guru: ${session.teacher_name}`
                                                                : ''}
                                                        </span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-muted-foreground mt-1 text-[11px]">
                                        *Hanya menampilkan sesi terjadwal yang belum diikuti oleh
                                        siswa ini dan masih dalam masa aktif paket.
                                    </p>
                                </>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel
                                htmlFor="reschedule_reason"
                                className="text-xs font-semibold"
                            >
                                Alasan Penjadwalan Ulang
                            </FieldLabel>
                            <Textarea
                                id="reschedule_reason"
                                className="min-h-16 text-xs"
                                value={rescheduleReason}
                                onChange={(event) => setRescheduleReason(event.target.value)}
                                placeholder="Alasan jadwal ulang..."
                            />
                        </Field>
                    </FieldGroup>
                    <DialogFooter className="pt-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => setRescheduleItem(null)}
                            disabled={isSubmittingReschedule}
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            className="h-8 text-xs gap-1"
                            onClick={submitReschedule}
                            disabled={
                                !targetSessionId ||
                                isSubmittingReschedule ||
                                isLoadingTargetSessions
                            }
                        >
                            <Icon
                                icon={isSubmittingReschedule ? 'mdi:loading' : 'mdi:calendar-check'}
                                className={`size-3.5 ${isSubmittingReschedule ? 'animate-spin' : ''}`}
                            />
                            {isSubmittingReschedule ? 'Menjadwalkan...' : 'Jadwalkan Ulang'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
