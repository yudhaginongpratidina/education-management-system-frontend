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
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    parent_id: z.number().optional(),
    name: z.string().trim().min(1, { message: 'Name is required' }),
    type: z.enum(['GROUP', 'ITEM']),
    icon: z.string().optional(),
    url: z.string().optional(),
    description: z.string().trim().min(1, { message: 'Description is required' }),
    sort_order: z.number().optional(),
    is_active: z.boolean().optional(),
});

type MenuFormProps = {
    type: 'create' | 'update';
    slug?: string;
    onSuccess: () => void;
};

export default function MenuForm({ type, slug, onSuccess }: MenuFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            parent_id: undefined,
            name: '',
            type: 'GROUP',
            icon: '',
            url: '',
            description: '-',
            sort_order: 0,
            is_active: true,
        },
    });

    const onCreate = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.post('/menus', values);
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
            const response = await http.patch(`menus/${slug}`, values);
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

    const getMenu = async () => {
        try {
            const response = await http.get(`menus?slug=${slug}`);
            const { data } = response.data;
            form.setValue('name', data.name || '');
            form.setValue('type', data.type || 'GROUP');
            form.setValue('icon', data.icon || '');
            form.setValue('url', data.url || '');
            form.setValue('description', data.description || '');
            form.setValue('sort_order', data.sort_order || 0);
            form.setValue('is_active', data.is_active ?? true);
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
            getMenu();
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
                                <FieldLabel htmlFor="name">Nama</FieldLabel>
                                <Input
                                    {...field}
                                    id="name"
                                    type="text"
                                    placeholder="Masukan Nama Menu"
                                    className="h-10"
                                    required
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="type"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="type">Tipe</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GROUP">Group</SelectItem>
                                        <SelectItem value="ITEM">Item</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="icon"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="icon">Ikon</FieldLabel>
                                <Input
                                    {...field}
                                    id="icon"
                                    placeholder="Masukan Ikon"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="url"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="url">URL</FieldLabel>
                                <Input
                                    {...field}
                                    id="url"
                                    placeholder="Masukan URL"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="sort_order"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="sort_order">Urutan</FieldLabel>
                                <Input
                                    {...field}
                                    id="sort_order"
                                    type="number"
                                    placeholder="Masukan Urutan"
                                    className="h-10"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="is_active"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="is_active">Status Aktif</FieldLabel>
                                <Select
                                    value={field.value ? 'Aktif' : 'Tidak Aktif'}
                                    onValueChange={(val) => field.onChange(val === 'true')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Aktif</SelectItem>
                                        <SelectItem value="false">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
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
