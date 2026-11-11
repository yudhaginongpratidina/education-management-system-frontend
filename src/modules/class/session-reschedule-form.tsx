'use client';

// dependencies
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList, formatDate } from '@/lib/ems-constants';

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
    const [loadingTeachers, setLoadingTeachers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [scheduledDate, setScheduledDate] = useState<string>(
        String(session.scheduled_date ?? '').slice(0, 10),
    );
    const [startTime, setStartTime] = useState<string>(
        session.start_time ? String(session.start_time).slice(0, 5) : '09:00',
    );
    const [endTime, setEndTime] = useState<string>(
        session.end_time ? String(session.end_time).slice(0, 5) : '10:00',
    );
    const [teacherId, setTeacherId] = useState<string>(
        session.teacher_id ? String(session.teacher_id) : '',
    );
    const [notes, setNotes] = useState<string>('');
    const [force, setForce] = useState<boolean>(false);

    const getTeachers = async (targetDate: string) => {
        setLoadingTeachers(true);
        try {
            const classId = session.class_id;
            let list: any[] = [];
            if (classId) {
                const response = await http.get(`/classes/${classId}/teachers`);
                const allClassTeachers = extractList(response.data);

                // Filter by target date
                list = allClassTeachers.filter((row: any) => {
                    const started = row.started_at ? String(row.started_at).slice(0, 10) : null;
                    const ended = row.ended_at ? String(row.ended_at).slice(0, 10) : null;
                    return (!started || started <= targetDate) && (!ended || ended >= targetDate);
                });

                // If no active teacher on that specific date, fallback to all assigned teachers for this class
                if (list.length === 0 && allClassTeachers.length > 0) {
                    list = allClassTeachers;
                }
            }

            // Fallback to /teachers if still empty
            if (list.length === 0) {
                const globalTeachersRes = await http.get('/teachers');
                list = extractList(globalTeachersRes.data).map((t: any) => ({
                    teacher_id: t.id,
                    teacher_name: t.full_name,
                    role: 'PRIMARY',
                }));
            }

            // Always ensure the session's current teacher is in the list
            if (
                session.teacher_id &&
                !list.some((r) => String(r.teacher_id) === String(session.teacher_id))
            ) {
                list.unshift({
                    teacher_id: session.teacher_id,
                    teacher_name: session.teacher_name || 'Guru Saat Ini',
                    role: 'PRIMARY',
                });
            }

            // Deduplicate by teacher_id
            const map = new Map<string, any>();
            for (const row of list) {
                const tid = String(row.teacher_id);
                if (!map.has(tid)) {
                    map.set(tid, row);
                }
            }
            const uniqueTeachers = [...map.values()];
            setTeachers(uniqueTeachers);

            // Ensure teacherId is set
            if (!teacherId && uniqueTeachers.length > 0) {
                setTeacherId(String(session.teacher_id || uniqueTeachers[0].teacher_id));
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Guru', type: 'error', description: message });
        } finally {
            setLoadingTeachers(false);
        }
    };

    useEffect(() => {
        if (scheduledDate) {
            getTeachers(scheduledDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduledDate]);

    const onSubmit = async () => {
        if (!scheduledDate) {
            toast.add({ title: 'Error', type: 'error', description: 'Tanggal baru wajib diisi' });
            return;
        }
        if (!startTime || !endTime) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Jam mulai dan selesai wajib diisi',
            });
            return;
        }
        if (endTime <= startTime) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Jam selesai harus lebih besar dari jam mulai',
            });
            return;
        }
        if (!teacherId) {
            toast.add({ title: 'Error', type: 'error', description: 'Guru wajib dipilih' });
            return;
        }

        setIsSubmitting(true);
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
                title: 'Berhasil Dijadwalkan Ulang',
                type: 'success',
                description: response.data.message ?? 'Sesi berhasil dijadwalkan ulang.',
            });
            onSuccess();
        } catch (error) {
            const parsed = parseAxiosError(error);
            if (parsed.code === 'ENROLLMENT_WINDOW_EXCEEDED') {
                toast.add({
                    title: 'Di Luar Periode Paket Siswa',
                    type: 'error',
                    description:
                        'Tanggal baru berada di luar masa aktif paket siswa peserta. Centang opsi "Tetap jadwalkan walau di luar periode paket siswa" untuk tetap melanjutkan.',
                });
            } else {
                toast.add({
                    title: 'Gagal Menjadwalkan Ulang',
                    type: 'error',
                    description: parsed.message,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.teacher_id),
        label: `${teacher.teacher_name}${teacher.role === 'SUBSTITUTE' ? ' (Pengganti)' : ''}`,
    }));

    return (
        <FieldGroup className="space-y-4 pt-1">
            <div className="bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-sm border p-3 text-xs leading-relaxed flex items-start gap-2">
                <Icon icon="mdi:information-outline" className="size-4 shrink-0 mt-0.5" />
                <span>
                    Penjadwalan ulang sesi akan membuat sesi terjadwal baru dan memindahkan seluruh
                    peserta. Tanggal baru sebaiknya berada dalam periode paket setiap siswa.
                </span>
            </div>

            <Field>
                <FieldLabel htmlFor="reschedule_date" className="text-xs font-semibold">
                    Tanggal Baru
                </FieldLabel>
                <Input
                    id="reschedule_date"
                    type="date"
                    className="h-10 text-sm"
                    value={scheduledDate}
                    onChange={(event) => setScheduledDate(event.target.value)}
                />
                <p className="text-muted-foreground mt-1 text-[11px]">
                    Tanggal lama: <b>{formatDate(session.scheduled_date)}</b>
                </p>
            </Field>

            <div className="grid gap-3 grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="reschedule_start" className="text-xs font-semibold">
                        Jam Mulai
                    </FieldLabel>
                    <Input
                        id="reschedule_start"
                        type="time"
                        className="h-10 text-sm"
                        value={startTime}
                        onChange={(event) => setStartTime(event.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="reschedule_end" className="text-xs font-semibold">
                        Jam Selesai
                    </FieldLabel>
                    <Input
                        id="reschedule_end"
                        type="time"
                        className="h-10 text-sm"
                        value={endTime}
                        onChange={(event) => setEndTime(event.target.value)}
                    />
                </Field>
            </div>

            <Field>
                <FieldLabel htmlFor="reschedule_teacher" className="text-xs font-semibold">
                    Guru Pengajar
                </FieldLabel>
                <Select
                    value={teacherId || null}
                    onValueChange={(value) => setTeacherId(value ?? '')}
                    items={teacherItems}
                    disabled={loadingTeachers}
                >
                    <SelectTrigger className="h-10 text-sm">
                        <SelectValue
                            placeholder={loadingTeachers ? 'Memuat guru...' : 'Pilih guru'}
                        />
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
                <p className="text-muted-foreground mt-1 text-[11px]">
                    Pilih guru pengajar yang bertugas pada sesi ini.
                </p>
            </Field>

            <Field>
                <FieldLabel htmlFor="reschedule_notes" className="text-xs font-semibold">
                    Catatan / Alasan
                </FieldLabel>
                <Textarea
                    id="reschedule_notes"
                    className="min-h-16 text-xs"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Alasan penjadwalan ulang..."
                />
            </Field>

            <Field orientation="horizontal" className="pt-1">
                <Checkbox
                    id="reschedule_force"
                    checked={force}
                    onCheckedChange={(checked) => setForce(checked === true)}
                />
                <FieldLabel
                    htmlFor="reschedule_force"
                    className="font-normal text-xs cursor-pointer"
                >
                    Tetap jadwalkan walau di luar periode paket siswa
                </FieldLabel>
            </Field>

            <div className="pt-2">
                <Button
                    className="w-full h-10 gap-1.5"
                    onClick={onSubmit}
                    disabled={isSubmitting || loadingTeachers}
                >
                    <Icon icon="mdi:calendar-clock" className="size-4" />
                    {isSubmitting ? 'Menjadwalkan Ulang...' : 'Jadwalkan Ulang Sesi'}
                </Button>
            </div>
        </FieldGroup>
    );
}
