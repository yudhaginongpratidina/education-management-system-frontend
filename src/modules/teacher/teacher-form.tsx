'use client';

// dependencies
import * as z from 'zod';
import { useEffect, useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
    position: z.string().optional(),
    still_actively_working: z.boolean(),
});

type TeacherFormValues = z.infer<typeof formSchema>;

type TeacherFormProps = {
    type: 'create' | 'update';
    slug?: string;
    onSuccess: () => void;
};

export default function TeacherForm({ type, slug, onSuccess }: TeacherFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const form = useForm<TeacherFormValues>({
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
            position: '',
            still_actively_working: true,
        },
    });

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await http.post('/storage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.data.slug;
        } catch (error) {
            console.error('File upload failed', error);
            return null;
        }
    };

    const onCreate = async (values: TeacherFormValues) => {
        try {
            let photoSlug = values.photo;
            if (file) {
                const uploadedSlug = await uploadFile(file);
                if (uploadedSlug) photoSlug = uploadedSlug;
            }
            const response = await http.post('/teachers', { ...values, photo: photoSlug });
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

    const onUpdate = async (values: TeacherFormValues) => {
        try {
            let photoSlug = values.photo;
            if (file) {
                const uploadedSlug = await uploadFile(file);
                if (uploadedSlug) photoSlug = uploadedSlug;
            }
            const response = await http.patch(`teachers/${slug}`, { ...values, photo: photoSlug });
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
                position,
                still_actively_working,
            } = response.data.data[0];
            form.setValue('full_name', full_name);
            form.setValue('email', email);
            form.setValue('phone_number', phone_number);
            form.setValue('address', address);
            form.setValue('place_and_dob', place_and_dob);
            form.setValue('last_education', last_education);
            form.setValue('photo', photo);
            form.setValue('user_id', String(user_id));
            form.setValue('position', position);
            form.setValue('still_actively_working', Boolean(still_actively_working));
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

                    <Field>
                        <FieldLabel htmlFor="photo">Foto</FieldLabel>
                        <Input
                            id="photo"
                            type="file"
                            className="h-10"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </Field>

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
                    <Controller
                        name="position"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="position">Posisi</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="position"
                                    type="text"
                                    placeholder="Masukan Posisi"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="still_actively_working"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FieldGroup className="w-56">
                                <Field orientation="horizontal">
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id="still_actively_working"
                                        name="still_actively_working"
                                    />
                                    <FieldLabel htmlFor="still_actively_working">
                                        Masih Aktif Bekerja
                                    </FieldLabel>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            </FieldGroup>
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
