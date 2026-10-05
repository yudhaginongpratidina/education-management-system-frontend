'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList, formatDate, formatTime } from '@/lib/ems-constants';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';

type TimeSlot = { start_time: string; end_time: string };

const datesInRange = (from: string, to: string): string[] => {
    const out: string[] = [];
    const cursor = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    while (cursor <= end && out.length < 180) {
        out.push(cursor.toISOString().slice(0, 10));
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return out;
};

export default function SessionBulkForm({
    classId,
    onSuccess,
}: {
    classId?: number;
    onSuccess: () => void;
}) {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>(classId ? String(classId) : '');
    const [teachers, setTeachers] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    const [teacherId, setTeacherId] = useState<string>('');
    const [dates, setDates] = useState<string[]>([]);
    const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 10));
    const [rangeFrom, setRangeFrom] = useState<string>('');
    const [rangeTo, setRangeTo] = useState<string>('');

    const [slots, setSlots] = useState<TimeSlot[]>([{ start_time: '09:00', end_time: '10:00' }]);
    const [slotStart, setSlotStart] = useState<string>('09:00');
    const [slotEnd, setSlotEnd] = useState<string>('10:00');

    const [studentProgramIds, setStudentProgramIds] = useState<number[]>([]);
    const [notes, setNotes] = useState<string>('');
    const [skipConflicts, setSkipConflicts] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const getClasses = async () => {
        try {
            const response = await http.get('/classes');
            setClasses(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getReferences = async () => {
        if (!selectedClassId) {
            setTeachers([]);
            setMembers([]);
            setStudentProgramIds([]);
            return;
        }
        try {
            const [teachersRes, membersRes] = await Promise.all([
                http.get(`/classes/${selectedClassId}/teachers`),
                http.get(`/classes/${selectedClassId}/students`),
            ]);

            // One entry per teacher, prefer the first (most recent) assignment.
            const teacherMap = new Map<string, any>();
            for (const row of extractList(teachersRes.data)) {
                if (!teacherMap.has(String(row.teacher_id))) {
                    teacherMap.set(String(row.teacher_id), row);
                }
            }
            setTeachers([...teacherMap.values()]);

            const activeMembers = extractList(membersRes.data).filter(
                (member: any) => !member.left_at,
            );
            setMembers(activeMembers);
            setStudentProgramIds(activeMembers.map((member: any) => member.student_program_id));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        if (!classId) getClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]);

    useEffect(() => {
        getReferences();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId]);

    const addDate = (value: string) => {
        if (!value) return;
        setDates((current) => (current.includes(value) ? current : [...current, value].sort()));
    };

    const removeDate = (value: string) => {
        setDates((current) => current.filter((date) => date !== value));
    };

    const addRange = () => {
        if (!rangeFrom || !rangeTo) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Isi tanggal awal dan akhir rentang',
            });
            return;
        }
        if (rangeFrom > rangeTo) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Tanggal awal harus sebelum tanggal akhir',
            });
            return;
        }
        const generated = datesInRange(rangeFrom, rangeTo);
        setDates((current) => [...new Set([...current, ...generated])].sort());
        setRangeFrom('');
        setRangeTo('');
    };

    const addSlot = () => {
        if (!slotStart || !slotEnd) return;
        if (slotEnd <= slotStart) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Jam selesai harus lebih besar dari jam mulai',
            });
            return;
        }
        setSlots((current) => {
            if (
                current.some((slot) => slot.start_time === slotStart && slot.end_time === slotEnd)
            ) {
                return current;
            }
            return [...current, { start_time: slotStart, end_time: slotEnd }].sort((a, b) =>
                a.start_time.localeCompare(b.start_time),
            );
        });
    };

    const removeSlot = (index: number) => {
        setSlots((current) => current.filter((_, position) => position !== index));
    };

    const toggleMember = (studentProgramId: number) => {
        setStudentProgramIds((current) =>
            current.includes(studentProgramId)
                ? current.filter((id) => id !== studentProgramId)
                : [...current, studentProgramId],
        );
    };

    const allSelected = members.length > 0 && studentProgramIds.length === members.length;

    const toggleAll = () => {
        setStudentProgramIds(allSelected ? [] : members.map((member) => member.student_program_id));
    };

    const onSubmit = async () => {
        if (!selectedClassId) {
            toast.add({ title: 'Error', type: 'error', description: 'Kelas wajib dipilih' });
            return;
        }
        if (!teacherId) {
            toast.add({ title: 'Error', type: 'error', description: 'Guru wajib dipilih' });
            return;
        }
        if (dates.length === 0) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Pilih minimal satu tanggal',
            });
            return;
        }
        if (slots.length === 0) {
            toast.add({ title: 'Error', type: 'error', description: 'Tambah minimal satu jam' });
            return;
        }

        setSubmitting(true);
        try {
            const response = await http.post(`/classes/${selectedClassId}/sessions/bulk`, {
                teacher_id: Number(teacherId),
                dates,
                time_slots: slots,
                student_program_ids: studentProgramIds,
                notes: notes || undefined,
                skip_conflicts: skipConflicts,
            });
            const data = response.data.data;
            setResult(data);
            toast.add({
                title: 'Success',
                type: 'success',
                description: `${data.created_count} sesi dibuat${data.skipped_count > 0 ? `, ${data.skipped_count} dilewati` : ''}`,
            });
            if (data.skipped_count === 0) {
                onSuccess();
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setSubmitting(false);
        }
    };

    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.teacher_id),
        label: `${teacher.teacher_name}${teacher.role === 'SUBSTITUTE' ? ' (Pengganti)' : ''}`,
    }));

    const totalSessions = dates.length * slots.length;

    return (
        <div className="space-y-5">
            {!classId && (
                <Field>
                    <FieldLabel htmlFor="bulk_class">Kelas</FieldLabel>
                    <Select
                        value={selectedClassId || null}
                        onValueChange={(value) => {
                            setSelectedClassId(value ?? '');
                            setTeacherId('');
                            setResult(null);
                        }}
                        items={classes.map((item) => ({
                            value: String(item.id),
                            label: `${item.name} (${item.code})`,
                        }))}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih kelas" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((item) => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                    {item.name} ({item.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            )}
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="bulk_teacher">Guru Pengajar</FieldLabel>
                    <Select
                        value={teacherId || null}
                        onValueChange={(value) => setTeacherId(value ?? '')}
                        items={teacherItems}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih guru" />
                        </SelectTrigger>
                        <SelectContent>
                            {teachers.map((teacher) => (
                                <SelectItem
                                    key={teacher.teacher_id}
                                    value={String(teacher.teacher_id)}
                                >
                                    {teacher.teacher_name}
                                    {teacher.role === 'SUBSTITUTE' ? ' (Pengganti)' : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="bulk_notes">Catatan (opsional)</FieldLabel>
                    <Input
                        id="bulk_notes"
                        className="h-10"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Catatan untuk semua sesi"
                    />
                </Field>
            </div>

            {/* DATES */}
            <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                    <FieldLabel>Tanggal Sesi</FieldLabel>
                    <Badge variant="secondary">{dates.length} tanggal</Badge>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <Input
                        type="date"
                        className="h-10 w-40"
                        value={dateInput}
                        onChange={(event) => setDateInput(event.target.value)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="h-10"
                        onClick={() => addDate(dateInput)}
                    >
                        <Icon icon="mdi:plus" /> Tambah
                    </Button>
                    <div className="mx-1 h-6 w-px bg-border" />
                    <Input
                        type="date"
                        className="h-10 w-40"
                        value={rangeFrom}
                        onChange={(event) => setRangeFrom(event.target.value)}
                        placeholder="Dari"
                    />
                    <Input
                        type="date"
                        className="h-10 w-40"
                        value={rangeTo}
                        onChange={(event) => setRangeTo(event.target.value)}
                        placeholder="Sampai"
                    />
                    <Button type="button" variant="outline" className="h-10" onClick={addRange}>
                        <Icon icon="mdi:calendar-range" /> Tambah Rentang
                    </Button>
                </div>
                {dates.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {dates.map((date) => (
                            <Badge key={date} variant="outline" className="gap-1.5">
                                {formatDate(date)}
                                <button
                                    type="button"
                                    onClick={() => removeDate(date)}
                                    aria-label={`Hapus ${date}`}
                                >
                                    <Icon icon="mdi:close" className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* TIME SLOTS */}
            <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                    <FieldLabel>Jam Sesi</FieldLabel>
                    <Badge variant="secondary">{slots.length} jam</Badge>
                </div>
                <div className="flex flex-wrap items-end gap-2">
                    <Input
                        type="time"
                        className="h-10 w-32"
                        value={slotStart}
                        onChange={(event) => setSlotStart(event.target.value)}
                    />
                    <span className="text-muted-foreground pb-2.5">-</span>
                    <Input
                        type="time"
                        className="h-10 w-32"
                        value={slotEnd}
                        onChange={(event) => setSlotEnd(event.target.value)}
                    />
                    <Button type="button" variant="outline" className="h-10" onClick={addSlot}>
                        <Icon icon="mdi:plus" /> Tambah Jam
                    </Button>
                </div>
                {slots.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {slots.map((slot, index) => (
                            <Badge
                                key={`${slot.start_time}-${slot.end_time}`}
                                variant="outline"
                                className="gap-1.5"
                            >
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                <button
                                    type="button"
                                    onClick={() => removeSlot(index)}
                                    aria-label="Hapus jam"
                                >
                                    <Icon icon="mdi:close" className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* STUDENTS */}
            <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                    <FieldLabel>Peserta Sesi</FieldLabel>
                    <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                            {studentProgramIds.length}/{members.length} siswa
                        </Badge>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={toggleAll}
                            disabled={members.length === 0}
                        >
                            {allSelected ? 'Kosongkan' : 'Pilih Semua'}
                        </Button>
                    </div>
                </div>
                <div className="max-h-40 space-y-2 overflow-auto">
                    {members.length === 0 && (
                        <p className="text-muted-foreground text-sm">
                            Belum ada siswa aktif pada kelas ini.
                        </p>
                    )}
                    {members.map((member) => (
                        <div key={member.student_program_id} className="flex items-center gap-2">
                            <Checkbox
                                id={`bulk-member-${member.student_program_id}`}
                                checked={studentProgramIds.includes(member.student_program_id)}
                                onCheckedChange={() => toggleMember(member.student_program_id)}
                            />
                            <FieldLabel htmlFor={`bulk-member-${member.student_program_id}`}>
                                {member.student_name}
                                <span className="text-muted-foreground ml-1 font-normal">
                                    {member.package_name ? `• ${member.package_name}` : ''}
                                </span>
                            </FieldLabel>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="bulk_skip_conflicts"
                    checked={skipConflicts}
                    onCheckedChange={(checked) => setSkipConflicts(checked === true)}
                />
                <FieldLabel htmlFor="bulk_skip_conflicts" className="font-normal">
                    Lewati jadwal yang bentrok, tetap buat sesi lain yang aman
                </FieldLabel>
            </div>

            {result && (
                <div className="space-y-2 rounded-lg border border-info/30 bg-info/5 p-3">
                    <p className="text-sm font-medium">
                        {result.created_count} sesi dibuat, {result.skipped_count} dilewati
                    </p>
                    {result.skipped?.length > 0 && (
                        <div className="max-h-40 overflow-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="text-muted-foreground">
                                    <tr>
                                        <th className="py-1 pr-2">Tanggal</th>
                                        <th className="py-1 pr-2">Jam</th>
                                        <th className="py-1">Alasan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.skipped.map((item: any, index: number) => (
                                        <tr key={index} className="border-t border-border/50">
                                            <td className="py-1 pr-2">
                                                {formatDate(item.scheduled_date)}
                                            </td>
                                            <td className="py-1 pr-2">
                                                {formatTime(item.start_time)} -{' '}
                                                {formatTime(item.end_time)}
                                            </td>
                                            <td className="py-1">
                                                {item.reason}
                                                {item.code ? (
                                                    <span className="text-muted-foreground">
                                                        {' '}
                                                        ({item.code})
                                                    </span>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-sm">
                    Akan dibuat <span className="font-medium text-foreground">{totalSessions}</span>{' '}
                    sesi ({dates.length} tanggal × {slots.length} jam).
                </p>
                <Button className="h-10" onClick={onSubmit} disabled={submitting}>
                    <Icon icon="mdi:calendar-multiple-check" />
                    {submitting ? 'Menyimpan...' : 'Buat Semua Sesi'}
                </Button>
            </div>
        </div>
    );
}
