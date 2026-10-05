'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatTime, extractList, formatDate } from '@/lib/ems-constants';

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

export default function SessionRescheduleForm({
    session,
    onSuccess,
}: {
    session: any;
    onSuccess: () => void;
}) {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [scheduledDate, setScheduledDate] = useState<string>(
        String(session.scheduled_date ?? '').slice(0, 10),
    );
    const [startTime, setStartTime] = useState<string>(formatTime(session.start_time));
    const [endTime, setEndTime] = useState<string>(formatTime(session.end_time));
    const [teacherId, setTeacherId] = useState<string>(
        session.teacher_id ? String(session.teacher_id) : '',
    );
    const [notes, setNotes] = useState<string>('');
    const [force, setForce] = useState<boolean>(false);

    const getTeachers = async () => {
        try {
            const sessionDate = String(session.scheduled_date ?? '').slice(0, 10);
            const response = await http.get(`/classes/${session.class_id}/teachers`);
            const active = extractList(response.data).filter((row: any) => {
                const started = row.started_at ? String(row.started_at).slice(0, 10) : null;
                const ended = row.ended_at ? String(row.ended_at).slice(0, 10) : null;
                return (!started || started <= sessionDate) && (!ended || ended >= sessionDate);
            });

            // One option per teacher (prefer the most recent assignment).
            const map = new Map<string, any>();
            for (const row of active) {
                if (!map.has(String(row.teacher_id))) map.set(String(row.teacher_id), row);
            }
            setTeachers([...map.values()]);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getTeachers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async () => {
        if (!teacherId) {
            toast.add({ title: 'Error', type: 'error', description: 'Guru wajib dipilih' });
            return;
        }
        try {
            const response = await http.post(`/sessions/${session.id}/reschedule`, {
                scheduled_date: scheduledDate,
                start_time: startTime,
                end_time: endTime,
                teacher_id: Number(teacherId),
                notes: notes || undefined,
                force,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Sesi berhasil dijadwalkan ulang',
            });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.teacher_id),
        label: `${teacher.teacher_name}${teacher.role === 'SUBSTITUTE' ? ' (Pengganti)' : ''}`,
    }));

    return (
        <FieldGroup>
            <div className="bg-muted/40 rounded-lg border p-3 text-xs text-muted-foreground">
                Sesi ini memiliki peserta. Tanggal baru harus berada dalam periode paket setiap
                siswa agar sesi tidak melewati masa berlaku program.
            </div>
            <Field>
                <FieldLabel htmlFor="reschedule_date">Tanggal Baru</FieldLabel>
                <Input
                    id="reschedule_date"
                    type="date"
                    className="h-10"
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                />
                <p className="text-muted-foreground mt-1 text-xs">
                    Tanggal lama: {formatDate(session.scheduled_date)}
                </p>
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="reschedule_start">Jam Mulai</FieldLabel>
                    <Input
                        id="reschedule_start"
                        type="time"
                        className="h-10"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="reschedule_end">Jam Selesai</FieldLabel>
                    <Input
                        id="reschedule_end"
                        type="time"
                        className="h-10"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                    />
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor="reschedule_teacher">Guru</FieldLabel>
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
                            <SelectItem key={teacher.teacher_id} value={String(teacher.teacher_id)}>
                                {teacher.teacher_name}
                                {teacher.role === 'SUBSTITUTE' ? ' (Pengganti)' : ''}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-muted-foreground mt-1 text-xs">
                    Hanya guru yang ditugaskan pada kelas ini yang dapat dipilih.
                </p>
            </Field>
            <Field>
                <FieldLabel htmlFor="reschedule_notes">Catatan</FieldLabel>
                <Textarea
                    id="reschedule_notes"
                    className="min-h-10"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Alasan penjadwalan ulang"
                />
            </Field>
            <Field orientation="horizontal">
                <Checkbox
                    id="reschedule_force"
                    checked={force}
                    onCheckedChange={(checked) => setForce(checked === true)}
                />
                <FieldLabel htmlFor="reschedule_force" className="font-normal">
                    Tetap jadwalkan walau di luar periode paket siswa
                </FieldLabel>
            </Field>
            <Button className="h-10" onClick={onSubmit}>
                Jadwalkan Ulang
            </Button>
        </FieldGroup>
    );
}
