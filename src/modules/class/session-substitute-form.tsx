'use client';

// dependencies
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

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
    const [teacherId, setTeacherId] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [loadingTeachers, setLoadingTeachers] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const getTeachers = async () => {
        setLoadingTeachers(true);
        try {
            const sessionDate = String(session.scheduled_date ?? '').slice(0, 10);
            const currentTeacherId = String(session.teacher_id ?? '');

            // 1. Fetch class teachers
            let classTeachers: any[] = [];
            if (session.class_id) {
                const classRes = await http.get(`/classes/${session.class_id}/teachers`);
                classTeachers = extractList(classRes.data);
            }

            // 2. Fetch all teachers for fallback/branch options
            let allTeachers: any[] = [];
            try {
                const teachersRes = await http.get('/teachers');
                allTeachers = extractList(teachersRes.data);
            } catch {
                // If global teachers fail, proceed with class teachers
            }

            // Map and combine options, prioritizing registered SUBSTITUTE teachers for this class
            const combinedMap = new Map<string, any>();

            // First: Registered substitutes for this class
            classTeachers
                .filter((row: any) => {
                    if (row.role !== 'SUBSTITUTE') return false;
                    const started = row.started_at ? String(row.started_at).slice(0, 10) : null;
                    const ended = row.ended_at ? String(row.ended_at).slice(0, 10) : null;
                    return (!started || started <= sessionDate) && (!ended || ended >= sessionDate);
                })
                .forEach((row: any) => {
                    const tid = String(row.teacher_id);
                    if (tid !== currentTeacherId) {
                        combinedMap.set(tid, {
                            id: tid,
                            name: row.teacher_name || `Guru #${tid}`,
                            badge: 'Pengganti Terdaftar',
                        });
                    }
                });

            // Second: Other class teachers (if any other active teachers exist)
            classTeachers.forEach((row: any) => {
                const tid = String(row.teacher_id);
                if (tid !== currentTeacherId && !combinedMap.has(tid)) {
                    combinedMap.set(tid, {
                        id: tid,
                        name: row.teacher_name || `Guru #${tid}`,
                        badge: 'Guru Kelas',
                    });
                }
            });

            // Third: Other general teachers
            allTeachers.forEach((row: any) => {
                const tid = String(row.id);
                if (tid !== currentTeacherId && !combinedMap.has(tid)) {
                    combinedMap.set(tid, {
                        id: tid,
                        name: row.full_name || `Guru #${tid}`,
                        badge: '',
                    });
                }
            });

            const list = [...combinedMap.values()];
            setTeachers(list);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Guru', type: 'error', description: message });
        } finally {
            setLoadingTeachers(false);
        }
    };

    useEffect(() => {
        getTeachers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.id, session.class_id]);

    const onSubmit = async () => {
        if (!teacherId) {
            toast.add({
                title: 'Pilih Guru',
                type: 'error',
                description: 'Guru pengganti wajib dipilih',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await http.post(`/sessions/${session.id}/substitute-teacher`, {
                teacher_id: Number(teacherId),
                notes: notes || undefined,
            });
            toast.add({
                title: 'Berhasil',
                type: 'success',
                description: response.data.message ?? 'Guru pengganti berhasil ditetapkan.',
            });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Gagal Menetapkan Guru Pengganti',
                type: 'error',
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTeacher = teachers.find((t) => String(t.id) === String(teacherId));

    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.id),
        label: teacher.name,
    }));

    return (
        <FieldGroup className="space-y-4 pt-1">
            {/* Info Session & Current Teacher */}
            <div className="rounded-sm border bg-muted/40 p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guru Saat Ini:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Icon icon="mdi:account" className="size-3.5 text-primary" />
                        {session.teacher_name || `Guru #${session.teacher_id}`}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Jadwal Sesi:</span>
                    <span className="font-medium text-foreground">
                        {formatDate(session.scheduled_date)} · {formatTime(session.start_time)}-
                        {formatTime(session.end_time)}
                    </span>
                </div>
            </div>

            <Field>
                <FieldLabel htmlFor="substitute_teacher" className="text-xs font-semibold">
                    Guru Pengganti
                </FieldLabel>
                <Select
                    value={teacherId || null}
                    onValueChange={(value) => setTeacherId(value ?? '')}
                    items={teacherItems}
                    disabled={loadingTeachers || isSubmitting}
                >
                    <SelectTrigger className="h-10 text-sm">
                        <SelectValue placeholder="Pilih guru pengganti...">
                            {selectedTeacher ? selectedTeacher.name : undefined}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={String(teacher.id)}>
                                <span className="flex items-center justify-between w-full gap-2">
                                    <span>{teacher.name}</span>
                                    {teacher.badge && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm">
                                            {teacher.badge}
                                        </span>
                                    )}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {loadingTeachers ? (
                    <p className="text-muted-foreground mt-1 text-[11px] flex items-center gap-1">
                        <Icon icon="mdi:loading" className="size-3 animate-spin text-primary" />
                        Memuat daftar guru...
                    </p>
                ) : teachers.length === 0 ? (
                    <p className="text-rose-600 dark:text-rose-400 mt-1 text-[11px]">
                        Tidak ada guru lain yang tersedia untuk menggantikan sesi ini.
                    </p>
                ) : (
                    <p className="text-muted-foreground mt-1 text-[11px]">
                        Pilih guru yang akan menggantikan tugas mengajar pada sesi ini.
                    </p>
                )}
            </Field>

            <Field>
                <FieldLabel htmlFor="substitute_notes" className="text-xs font-semibold">
                    Catatan / Alasan Pergantian
                </FieldLabel>
                <Textarea
                    id="substitute_notes"
                    className="min-h-16 text-xs"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Alasan pergantian guru (misal: guru berhalangan hadir / sakit)..."
                />
            </Field>

            <div className="pt-2">
                <Button
                    className="w-full h-10 gap-1.5"
                    onClick={onSubmit}
                    disabled={isSubmitting || loadingTeachers || !teacherId}
                >
                    <Icon
                        icon={isSubmitting ? 'mdi:loading' : 'mdi:account-switch'}
                        className={`size-4 ${isSubmitting ? 'animate-spin' : ''}`}
                    />
                    {isSubmitting ? 'Menetapkan Guru...' : 'Tetapkan Guru Pengganti'}
                </Button>
            </div>
        </FieldGroup>
    );
}
