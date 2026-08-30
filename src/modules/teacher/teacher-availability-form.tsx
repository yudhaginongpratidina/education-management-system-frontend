'use client';

import * as z from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
] as const;

const dayLabels: Record<string, string> = {
    monday: 'Senin',
    tuesday: 'Selasa',
    wednesday: 'Rabu',
    thursday: 'Kamis',
    friday: 'Jumat',
    saturday: 'Sabtu',
    sunday: 'Minggu',
};

const formSchema = z.object({
    teacher_id: z.number(),
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TeacherAvailabilityForm({
    teacherId,
    onSuccess,
}: {
    teacherId: number;
    onSuccess: () => void;
}) {
    const [isExisting, setIsExisting] = useState(false);
    const [id, setId] = useState<number | null>(null);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            teacher_id: teacherId,
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
        },
    });

    const getAvailability = async () => {
        try {
            const response = await http.get(`/teacher-availability/${teacherId}`);
            const data = response.data.data;
            setId(data.id);
            setIsExisting(true);
            form.reset({
                teacher_id: teacherId,
                monday: !!data.monday,
                tuesday: !!data.tuesday,
                wednesday: !!data.wednesday,
                thursday: !!data.thursday,
                friday: !!data.friday,
                saturday: !!data.saturday,
                sunday: !!data.sunday,
            });
        } catch (error: any) {
            if (error.response?.data?.error?.code === 'AVAILABILITY_NOT_FOUND') {
                setIsExisting(false);
            } else {
                const { message } = parseAxiosError(error);
                toast.add({ title: 'Error', type: 'error', description: message });
            }
        }
    };

    useEffect(() => {
        getAvailability();
    }, [teacherId]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (isExisting && id) {
                await http.patch(`/teacher-availability/${id}`, values);
            } else {
                await http.post('/teacher-availability', values);
            }
            toast.add({
                title: 'Success',
                type: 'success',
                description: 'Availability saved successfully',
            });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup>
                {days.map((day) => (
                    <Controller
                        key={day}
                        name={day}
                        control={form.control}
                        render={({ field }) => (
                            <Field orientation="horizontal" className="items-center gap-2">
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id={day}
                                />
                                <FieldLabel htmlFor={day}>{dayLabels[day]}</FieldLabel>
                            </Field>
                        )}
                    />
                ))}
            </FieldGroup>
            <Button type="submit" className="w-full">
                Simpan
            </Button>
        </form>
    );
}
