'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { SESSION_STATUS_OPTIONS, toDateInput, formatTime, extractList } from '@/lib/ems-constants';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

type SessionFormProps = {
    type: 'create' | 'update';
    classId?: number;
    session?: any;
    onSuccess: () => void;
};

export default function SessionForm({ type, classId, session, onSuccess }: SessionFormProps) {
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>(classId ? String(classId) : '');
    const [scheduledDate, setScheduledDate] = useState<string>(
        toDateInput(session?.scheduled_date) || new Date().toISOString().slice(0, 10),
    );
    const [startTime, setStartTime] = useState<string>(
        session ? formatTime(session.start_time) : '09:00',
    );
    const [endTime, setEndTime] = useState<string>(
        session ? formatTime(session.end_time) : '10:00',
    );
    const [teacherId, setTeacherId] = useState<string>(
        session?.teacher_id ? String(session.teacher_id) : '',
    );
    const [status, setStatus] = useState<string>(session?.status ?? 'SCHEDULED');
    const [notes, setNotes] = useState<string>(session?.notes ?? '');
    const [studentProgramIds, setStudentProgramIds] = useState<number[]>([]);

    const getReferences = async () => {
        try {
            const [classesRes, teachersRes] = await Promise.all([
                http.get('/classes'),
                http.get('/teachers'),
            ]);
            setClasses(extractList(classesRes.data));
            setTeachers(extractList(teachersRes.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    useEffect(() => {
        const loadMembers = async () => {
            if (type !== 'create' || !selectedClassId) {
                setMembers([]);
                return;
            }
            try {
                const response = await http.get(`/classes/${selectedClassId}/student-quotas`);
                const quotaRows = extractList(response.data);
                setMembers(quotaRows);
                setStudentProgramIds(
                    quotaRows
                        .filter((member: any) => member.can_join)
                        .map((member: any) => member.student_program_id),
                );
            } catch (error) {
                const { message } = parseAxiosError(error);
                toast.add({ title: 'Error', type: 'error', description: message });
            }
        };
        loadMembers();
    }, [selectedClassId, type]);

    const toggleMember = (studentProgramId: number) => {
        setStudentProgramIds((current) =>
            current.includes(studentProgramId)
                ? current.filter((id) => id !== studentProgramId)
                : [...current, studentProgramId],
        );
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

        const payload = {
            scheduled_date: scheduledDate,
            start_time: startTime,
            end_time: endTime,
            teacher_id: Number(teacherId),
            status,
            notes: notes || undefined,
        };

        try {
            if (type === 'create') {
                const response = await http.post(`/classes/${selectedClassId}/sessions`, {
                    ...payload,
                    student_program_ids: studentProgramIds,
                });
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Sesi berhasil dibuat',
                });
            } else {
                const response = await http.patch(`/sessions/${session.id}`, payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Sesi berhasil diperbarui',
                });
            }
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const classItems = classes.map((item) => ({
        value: String(item.id),
        label: `${item.name} (${item.code})`,
    }));
    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.id),
        label: teacher.full_name,
    }));

    return (
        <FieldGroup>
            {!classId && (
                <Field>
                    <FieldLabel htmlFor="session_class">Kelas</FieldLabel>
                    <Select
                        value={selectedClassId || null}
                        onValueChange={(value) => setSelectedClassId(value ?? '')}
                        disabled={type === 'update'}
                        items={classItems}
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
            <Field>
                <FieldLabel htmlFor="scheduled_date">Tanggal Sesi</FieldLabel>
                <Input
                    id="scheduled_date"
                    type="date"
                    className="h-10"
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="session_start">Jam Mulai</FieldLabel>
                    <Input
                        id="session_start"
                        type="time"
                        className="h-10"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="session_end">Jam Selesai</FieldLabel>
                    <Input
                        id="session_end"
                        type="time"
                        className="h-10"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                    />
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor="session_teacher">Guru</FieldLabel>
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
                            <SelectItem key={teacher.id} value={String(teacher.id)}>
                                {teacher.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field>
                <FieldLabel htmlFor="session_status">Status</FieldLabel>
                <Select
                    value={status}
                    onValueChange={(value) => setStatus(value ?? 'SCHEDULED')}
                    items={SESSION_STATUS_OPTIONS}
                >
                    <SelectTrigger className="h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {SESSION_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
            <Field>
                <FieldLabel htmlFor="session_notes">Catatan</FieldLabel>
                <Textarea
                    id="session_notes"
                    className="min-h-10"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Catatan sesi"
                />
            </Field>

            {type === 'create' && classId && members.length > 0 && (
                <Field>
                    <FieldLabel>Peserta Sesi</FieldLabel>
                    <div className="max-h-40 space-y-2 overflow-auto rounded-md border p-2">
                        {members.map((member) => (
                            <div
                                key={member.student_program_id}
                                className="flex items-center gap-2"
                            >
                                <Checkbox
                                    id={`member-${member.student_program_id}`}
                                    checked={studentProgramIds.includes(member.student_program_id)}
                                    onCheckedChange={() => toggleMember(member.student_program_id)}
                                    disabled={!member.can_join}
                                />
                                <FieldLabel
                                    htmlFor={`member-${member.student_program_id}`}
                                    className="flex items-center gap-2"
                                >
                                    <span>{member.student_name}</span>
                                    {member.branch_name && (
                                        <span className="text-muted-foreground text-xs">
                                            ({member.branch_name})
                                        </span>
                                    )}
                                    {member.total_sessions != null && (
                                        <span
                                            className={
                                                member.can_join
                                                    ? 'text-muted-foreground text-xs'
                                                    : 'text-destructive text-xs'
                                            }
                                        >
                                            {member.used}/{member.total_sessions} sesi
                                            {member.can_join
                                                ? ` · sisa ${member.remaining}`
                                                : ' · kuota penuh, gunakan reschedule'}
                                        </span>
                                    )}
                                </FieldLabel>
                            </div>
                        ))}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        Siswa dengan kuota penuh tidak dapat ditambahkan ke sesi baru. Gunakan fitur
                        reschedule untuk memindahkan sesinya.
                    </p>
                </Field>
            )}

            <Button className="h-10" onClick={onSubmit}>
                {type === 'create' ? 'Simpan Sesi' : 'Update Sesi'}
            </Button>
        </FieldGroup>
    );
}
