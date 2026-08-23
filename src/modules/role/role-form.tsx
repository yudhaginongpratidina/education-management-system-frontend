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

const formSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name is required' }),
    description: z.string().trim().min(1, { message: 'Description is required' }),
});

type RoleFormProps = {
    type: 'create' | 'update';
    slug?: string;
    onSuccess: () => void;
};

export default function RoleForm({ type, slug, onSuccess }: RoleFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
        },
    });

    const onCreate = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.post('/roles', values);
            console.log(response.data);
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
            const response = await http.patch(`roles/${slug}`, values);
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

    const getRole = async () => {
        try {
            const response = await http.get(`roles?slug=${slug}`);
            const { name, description } = response.data.data;
            form.setValue('name', name);
            form.setValue('description', description);
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
            getRole();
        }
    }, [slug]);

    return (
        <>
            <form onSubmit={form.handleSubmit(type === 'create' ? onCreate : onUpdate)}>
                <FieldGroup>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="name">Nama Role</FieldLabel>
                                <Input
                                    {...field}
                                    id="name"
                                    type="text"
                                    placeholder="Masukan Nama Role"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="description"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                                <Input
                                    {...field}
                                    id="description"
                                    type="text"
                                    placeholder="Masukan Deskripsi"
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
