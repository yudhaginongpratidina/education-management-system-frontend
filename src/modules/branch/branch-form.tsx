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
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    radius: z.string().optional(),
});

type ProgramFormProps = {
    type: 'create' | 'update';
    slug?: string;
    onSuccess: () => void;
};

export default function BranchForm({ type, slug, onSuccess }: ProgramFormProps) {
    const [branchId, setBranchId] = useState<number>(0);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            address: '',
            latitude: '',
            longitude: '',
            radius: '',
        },
    });

    const onCreate = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await http.post('/branches', values);
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
            const response = await http.patch(`branches/${branchId}`, values);
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

    const getBranch = async () => {
        try {
            const response = await http.get(`branches?slug=${slug}`);
            const { id, name, address, latitude, longitude, radius } = response.data.data;
            setBranchId(id);
            form.setValue('name', name);
            form.setValue('address', address);
            form.setValue('latitude', latitude);
            form.setValue('longitude', longitude);
            form.setValue('radius', parseFloat(radius).toFixed(0));
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
            getBranch();
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
                                <FieldLabel htmlFor="name">Nama Program</FieldLabel>
                                <Input
                                    {...field}
                                    id="name"
                                    type="text"
                                    placeholder="Masukan Nama Program"
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
                                <Input
                                    {...field}
                                    id="address"
                                    type="text"
                                    placeholder="Masukan Alamat"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="latitude"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                                <Input
                                    {...field}
                                    id="latitude"
                                    type="text"
                                    placeholder="Masukan Latitude"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="longitude"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="longitude">Longtitude</FieldLabel>
                                <Input
                                    {...field}
                                    id="longitude"
                                    type="text"
                                    placeholder="Masukan Longitude"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="radius"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="radius">Radius</FieldLabel>
                                <Input
                                    {...field}
                                    id="radius"
                                    type="text"
                                    placeholder="Masukan Radius (Meter)"
                                    className="h-10"
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
