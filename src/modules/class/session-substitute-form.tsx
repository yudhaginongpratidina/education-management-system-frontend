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
        value: String(teacher.id),
        label: teacher.full_name,
    }));

    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="substitute_teacher">Guru Pengganti</FieldLabel>
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
