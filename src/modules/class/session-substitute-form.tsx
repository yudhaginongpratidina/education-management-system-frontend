'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

export default function SessionSubstituteForm({
    session,
    onSuccess,
}: {
    session: any;
    onSuccess: () => void;
}) {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [teacherId, setTeacherId] = useState<string>(
        session.teacher_id ? String(session.teacher_id) : '',
    );
    const [notes, setNotes] = useState<string>('');

    const getTeachers = async () => {
        try {
            const sessionDate = String(session.scheduled_date ?? '').slice(0, 10);
            const response = await http.get(`/classes/${session.class_id}/teachers`);
            const substitutes = extractList(response.data).filter((row: any) => {
                if (row.role !== 'SUBSTITUTE') return false;
                const started = row.started_at ? String(row.started_at).slice(0, 10) : null;
                const ended = row.ended_at ? String(row.ended_at).slice(0, 10) : null;
                return (!started || started <= sessionDate) && (!ended || ended >= sessionDate);
            });

            const map = new Map<string, any>();
            for (const row of substitutes) {
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
            const response = await http.post(`/sessions/${session.id}/substitute-teacher`, {
                teacher_id: Number(teacherId),
                notes: notes || undefined,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Guru pengganti ditetapkan',
            });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.teacher_id),
        label: teacher.teacher_name,
    }));

    return (
        <FieldGroup>
            <div className="bg-muted/40 rounded-lg border p-3 text-xs text-muted-foreground">
                Daftar guru pengganti berisi guru yang ditugaskan sebagai SUBSTITUTE untuk kelas ini
                dan aktif pada tanggal sesi.
            </div>
            <Field>
                <FieldLabel htmlFor="substitute_teacher">Guru Pengganti</FieldLabel>
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
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {teachers.length === 0 && (
                    <p className="text-muted-foreground mt-1 text-xs">
                        Belum ada guru pengganti yang ditugaskan pada kelas ini.
                    </p>
                )}
            </Field>
            <Field>
                <FieldLabel htmlFor="substitute_notes">Catatan</FieldLabel>
                <Textarea
                    id="substitute_notes"
                    className="min-h-10"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Alasan pergantian guru"
                />
            </Field>
            <Button className="h-10" onClick={onSubmit}>
                Tetapkan Guru Pengganti
            </Button>
        </FieldGroup>
    );
}
