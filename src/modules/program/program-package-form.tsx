'use client';

// dependencies
import * as z from 'zod';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// components
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    duration_months: z.number().int().min(1, 'Duration must be 1 or greater'),
    sessions_per_period: z.number().int().min(1, 'Sessions per period must be 1 or greater'),
    session_period: z.enum(['WEEK', 'MONTH', 'DURATION']),
    normal_price: z.number().int().min(0, 'Normal price must be 0 or greater'),
    selling_price: z.number().int().min(0, 'Selling price must be 0 or greater'),
    bonus_duration_months: z
        .number()
        .int()
        .min(0, 'Bonus duration must be 0 or greater')
        .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
type ProgramPackageFormProps = {
    type: 'create' | 'update';
    slug?: string;
    initialData?: z.infer<typeof formSchema>;
    onSuccess: () => void;
};

export default function ProgramPackageForm({
    type,
    slug,
    initialData,
    onSuccess,
}: ProgramPackageFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            duration_months: 1,
            sessions_per_period: 1,
            session_period: 'MONTH',
            normal_price: 0,
            selling_price: 0,
            bonus_duration_months: 0,
            status: 'ACTIVE',
        },
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                ...initialData,
                normal_price: Math.floor(initialData.normal_price),
                selling_price: Math.floor(initialData.selling_price),
                duration_months: Math.floor(initialData.duration_months),
                sessions_per_period: Math.floor(initialData.sessions_per_period),
                bonus_duration_months: initialData.bonus_duration_months
                    ? Math.floor(initialData.bonus_duration_months)
                    : 0,
            });
        }
    }, [initialData, form]);

    const onCreate = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.post(`/program-packages/${slug}`, values);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const onUpdate = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.patch(`/program-packages/${slug}`, values);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (type === 'create') {
            await onCreate(values);
        } else {
            await onUpdate(values);
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit, (errors) =>
                console.error('Form validation errors:', errors),
            )}
        >
            <FieldGroup>
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Nama</FieldLabel>
                            <Input {...field} placeholder="Nama Paket" className="h-10" />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="duration_months"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Durasi</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                type="number"
                                className="h-10"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="sessions_per_period"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Jumlah Pertemuan Per Periode</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                type="number"
                                className="h-10"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="session_period"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Jenis Periode</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Periode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEK">Minggu</SelectItem>
                                    <SelectItem value="MONTH">Bulan</SelectItem>
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="normal_price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Harga Normal</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                type="number"
                                className="h-10"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="selling_price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Harga Diskon</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                type="number"
                                className="h-10"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="bonus_duration_months"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel>Bonus Durasi (bulan)</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                type="number"
                                className="h-10"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Button type="submit" className="h-10">
                    Simpan
                </Button>
            </FieldGroup>
        </form>
    );
}
