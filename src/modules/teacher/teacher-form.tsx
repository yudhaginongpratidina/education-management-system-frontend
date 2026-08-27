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
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';

const formSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address').optional(),
    user_id: z.string().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    place_and_dob: z.string().optional(),
    last_education: z.string().optional(),
    photo: z.string().optional(),
});

type TeacherFormProps = {
    type: 'create' | 'update';
    slug?: string;
    onSuccess: () => void;
};

export default function TeacherForm({ type, slug, onSuccess }: TeacherFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: '',
            email: '',
            user_id: undefined,
            phone_number: '',
            address: '',
            place_and_dob: '',
            last_education: '',
            photo: '-',
        },
    });

    const onCreate = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.post('/teachers ', values);
            // console.log(response.data);
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
            const response = await http.patch(`teachers/${slug}`, values);
            // console.log(response.data);
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

    const getTeacher = async () => {
        try {
            const response = await http.get(`teachers?slug=${slug}`);
            const {
                full_name,
                email,
                phone_number,
                address,
                place_and_dob,
                last_education,
                photo,
                user_id,
            } = response.data.data[0];
            console.log(response.data.data[0]);
            form.setValue('full_name', full_name);
            form.setValue('email', email);
            form.setValue('phone_number', phone_number);
            form.setValue('address', address);
            form.setValue('place_and_dob', place_and_dob);
            form.setValue('last_education', last_education);
            form.setValue('photo', photo);
            form.setValue('user_id', String(user_id));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    useEffect(() => {
        if (slug) {
            getTeacher();
        }
    }, [slug]);

    return (
        <>
            <form
                onSubmit={form.handleSubmit(type === 'create' ? onCreate : onUpdate, (errors) =>
                    console.log('Form errors:', errors),
                )}
            >
                <FieldGroup>
                    <Controller
                        name="full_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="full_name">Full Name</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="full_name"
                                    type="text"
                                    placeholder="Masukan Nama"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="last_education"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="last_education">
                                    Pendidikan Terakhir
                                </FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="last_education"
                                    type="text"
                                    placeholder="Pendidikan Terakhir"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    {type === 'create' && (
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">E-Mail</FieldLabel>
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        id="email"
                                        type="email"
                                        placeholder="Masukan Email"
                                        className="h-10"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    )}
                    {type === 'update' && (
                        <Controller
                            name="user_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid} className="hidden">
                                    <FieldLabel htmlFor="user_id">User ID</FieldLabel>
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        id="user_id"
                                        type="number"
                                        placeholder="Masukan User ID"
                                        className="h-10"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    )}

                    <Controller
                        name="phone_number"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="phone_number">Nomer Telepon</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="phone_number"
                                    type="text"
                                    placeholder="Masukan Nomor Telepon"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="address"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="address">Alamat</FieldLabel>
                                <Textarea
                                    {...field}
                                    value={field.value ?? ''}
                                    id="address"
                                    placeholder="Masukan Alamat"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="place_and_dob"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="place_and_dob">
                                    Tempat, Tanggal Lahir
                                </FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="place_and_dob"
                                    type="text"
                                    placeholder="Tempat Lahir, Tanggal - Bulan - Tahun"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Button type="submit" className="h-10">
                        {type === 'create' ? 'Tambah' : 'Update'}
                    </Button>
                </FieldGroup>
            </form>
        </>
    );
}
