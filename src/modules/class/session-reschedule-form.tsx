'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatTime, extractList } from '@/lib/ems-constants';

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

    const getTeachers = async () => {
        try {
            const response = await http.get('/teachers');
            setTeachers(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getTeachers();
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
        value: String(teacher.id),
        label: teacher.full_name,
    }));

    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="reschedule_date">Tanggal Baru</FieldLabel>
                <Input
                    id="reschedule_date"
                    type="date"
                    className="h-10"
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                />
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
                    value={teacherId || undefined}
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
                <FieldLabel htmlFor="reschedule_notes">Catatan</FieldLabel>
                <Textarea
                    id="reschedule_notes"
                    className="min-h-10"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Alasan penjadwalan ulang"
                />
            </Field>
            <Button className="h-10" onClick={onSubmit}>
                Jadwalkan Ulang
            </Button>
        </FieldGroup>
    );
}
