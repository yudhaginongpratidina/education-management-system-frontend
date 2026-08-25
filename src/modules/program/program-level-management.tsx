'use client';

// dependencies
import * as z from 'zod';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';

const formSchema = z.object({
    level: z.coerce.number().min(1, 'Level is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type InputFormValues = z.input<typeof formSchema>;

export default function ProgramLevelManagement({ program_slug }: { program_slug: string }) {
    const [programLevels, setProgramLevels] = useState<any[]>([]);
    const [editingLevel, setEditingLevel] = useState<number | null>(null);

    const form = useForm<InputFormValues, any, FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            level: 1,
            name: '',
            description: '',
            status: 'ACTIVE',
        },
    });

    const getProgramLevels = async () => {
        try {
            const response = await http.get(`/program-levels/${program_slug}`);
            setProgramLevels(response.data.data);
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
        getProgramLevels();
    }, []);

    const onSubmit = async (values: FormValues) => {
        try {
            if (editingLevel) {
                await http.patch(`/program-levels/${program_slug}/${editingLevel}`, values);
                toast.add({ title: 'Success', type: 'success', description: 'Data updated' });
                setEditingLevel(null);
            } else {
                await http.post(`/program-levels/${program_slug}`, values);
                toast.add({ title: 'Success', type: 'success', description: 'Data created' });
            }
            form.reset();
            getProgramLevels();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const onDelete = async (level: number) => {
        try {
            await http.delete(`/program-levels/${program_slug}/${level}`);
            toast.add({ title: 'Success', type: 'success', description: 'Data deleted' });
            getProgramLevels();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller
                        name="level"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="level">Level</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value == null ? '' : String(field.value)}
                                    id="level"
                                    type="number"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
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
                                    placeholder="Pemula"
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
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="status"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="status">Status</FieldLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Aktif</SelectItem>
                                        <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <div className=" flex flex-col gap-2">
                        <Button type="submit" className="w-full h-10">
                            {editingLevel ? 'Update' : 'Simpan'}
                        </Button>
                        {editingLevel && (
                            <Button
                                type="button"
                                className="w-full h-10"
                                onClick={() => {
                                    setEditingLevel(null);
                                    form.reset();
                                }}
                            >
                                Batal
                            </Button>
                        )}
                    </div>
                </FieldGroup>
            </form>

            <div className="w-full h-40 overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">Level</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programLevels.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="text-center">{item.level}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Button
                                        size="icon"
                                        onClick={() => {
                                            setEditingLevel(item.level);
                                            form.setValue('level', item.level);
                                            form.setValue('name', item.name);
                                            form.setValue('description', item.description || '');
                                            form.setValue('status', item.status);
                                        }}
                                    >
                                        <Icon icon="boxicons:pencil-square" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={() => onDelete(item.level)}
                                    >
                                        <Icon icon="bi:trash-fill" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
