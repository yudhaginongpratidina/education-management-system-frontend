'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { ATTENDANCE_STATUS_OPTIONS, extractList } from '@/lib/ems-constants';

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
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { StatusBadge } from '@/components/status-badge';

const CLOSED_STATUSES = ['COMPLETED', 'CANCELLED', 'RESCHEDULED'];

export default function MySessionAttendance({
    sessionId,
    sessionStatus,
    onChanged,
}: {
    sessionId: number;
    sessionStatus?: string | null;
    onChanged?: () => void;
}) {
    const [participants, setParticipants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [notesItem, setNotesItem] = useState<any | null>(null);
    const [notesValue, setNotesValue] = useState<string>('');
    const [notesAttendance, setNotesAttendance] = useState<string>('PRESENT');

    const locked = !!sessionStatus && CLOSED_STATUSES.includes(sessionStatus);

    const getParticipants = async () => {
        setLoading(true);
        try {
            const response = await http.get(`/teacher/sessions/${sessionId}/students`);
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
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getParticipants();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    const updateAttendance = async (studentProgramId: number, status: string | null) => {
        try {
            await http.patch(
                `/teacher/sessions/${sessionId}/students/${studentProgramId}/attendance`,
                {
                    attendance_status: status,
                },
            );
            toast.add({ title: 'Success', type: 'success', description: 'Kehadiran diperbarui' });
            getParticipants();
            onChanged?.();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const markAllPresent = async () => {
        if (participants.length === 0) return;
        try {
            await http.patch(`/teacher/sessions/${sessionId}/attendance`, {
                records: participants.map((item) => ({
                    student_program_id: item.student_program_id,
                    attendance_status:
                        item.program_status === 'ON_LEAVE' ? 'PERMISSION' : 'PRESENT',
                    notes:
                        item.program_status === 'ON_LEAVE'
                            ? item.notes || 'Siswa Sedang Cuti'
                            : item.notes,
                })),
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: 'Presensi diperbarui (siswa cuti otomatis izin)',
            });
            getParticipants();
            onChanged?.();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const saveNotes = async () => {
        if (!notesItem) return;
        try {
            await http.patch(
                `/teacher/sessions/${sessionId}/students/${notesItem.student_program_id}/attendance`,
                {
                    attendance_status: notesAttendance ? notesAttendance : null,
                    notes: notesValue || null,
                },
            );
            toast.add({
                title: 'Success',
                type: 'success',
                description: 'Data peserta diperbarui',
            });
            setNotesItem(null);
            getParticipants();
            onChanged?.();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    return (
        <div className="space-y-4">
            {locked && (
                <div className="rounded-sm border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                    Sesi sudah {sessionStatus}. Kehadiran tidak dapat diubah lagi.
                </div>
            )}

            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                    {participants.length} siswa terdaftar pada sesi ini.
                </p>
                <Button
                    className="h-10"
                    variant="outline"
                    onClick={markAllPresent}
                    disabled={locked || participants.length === 0}
                >
                    <Icon icon="mdi:check-all" /> Tandai Semua Hadir
                </Button>
            </div>

            <div className="max-h-100 overflow-auto rounded-sm border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead>Paket / Level</TableHead>
                            <TableHead>Kehadiran</TableHead>
                            <TableHead>Catatan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!loading && participants.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada peserta pada sesi ini.
                                </TableCell>
                            </TableRow>
                        )}
                        {participants.map((item) => (
                            <TableRow key={item.student_program_id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span>{item.student_name}</span>
                                            {item.program_status && (
                                                <StatusBadge status={item.program_status} />
                                            )}
                                        </div>
                                        {item.program_status === 'ON_LEAVE' && item.leave_until && (
                                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-normal">
                                                Cuti s.d. {String(item.leave_until).slice(0, 10)}
                                            </span>
                                        )}
                                        {item.last_active_at && (
                                            <span className="text-[10px] text-muted-foreground font-normal">
                                                Terakhir aktif:{' '}
                                                {String(item.last_active_at).slice(0, 10)}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{item.package_name ?? '-'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {item.level_name ?? '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="w-44">
                                        <Select
                                            value={item.attendance_status || 'NONE'}
                                            onValueChange={(value) =>
                                                updateAttendance(
                                                    item.student_program_id,
                                                    value === 'NONE' ? null : value ?? null,
                                                )
                                            }
                                            items={[
                                                {
                                                    value: 'NONE',
                                                    label: '— Belum Presensi (Kosong) —',
                                                },
                                                ...ATTENDANCE_STATUS_OPTIONS,
                                            ]}
                                            disabled={locked}
                                        >
                                            <SelectTrigger className="h-10 text-xs">
                                                <SelectValue placeholder="— Pilih Kehadiran —">
                                                    {item.attendance_status ? (
                                                        ATTENDANCE_STATUS_OPTIONS.find(
                                                            (o) =>
                                                                o.value === item.attendance_status,
                                                        )?.label ?? item.attendance_status
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
                                            disabled={locked}
                                            onClick={() => {
                                                setNotesItem(item);
                                                setNotesValue(item.notes ?? '');
                                                setNotesAttendance(item.attendance_status || '');
                                            }}
                                        >
                                            <Icon icon="mingcute:edit-line" />
                                        </Button>
                                    </div>
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
                            <FieldLabel htmlFor="teacher_notes_attendance">Kehadiran</FieldLabel>
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
                                <SelectTrigger className="h-10 text-xs">
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
                            <FieldLabel htmlFor="teacher_notes_value">Catatan</FieldLabel>
                            <Textarea
                                id="teacher_notes_value"
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
        </div>
    );
}
