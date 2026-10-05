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
            setParticipants(extractList(response.data));
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

    const updateAttendance = async (studentProgramId: number, status: string) => {
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
                    attendance_status: 'PRESENT',
                })),
            });
            toast.add({ title: 'Success', type: 'success', description: 'Semua ditandai hadir' });
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
                    attendance_status: notesAttendance,
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
                <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
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

            <div className="max-h-100 overflow-auto rounded-md border">
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
                                            disabled={locked}
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
                                            disabled={locked}
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
