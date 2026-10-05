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
import { PROGRAM_STATUS_OPTIONS } from '@/lib/ems-constants';

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
import { StatusBadge } from '@/components/status-badge';
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
        <div className="space-y-6 min-w-0">
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            name="status"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="status">Status</FieldLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        items={PROGRAM_STATUS_OPTIONS}
                                    >
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
                    </div>
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
                                    placeholder="Masukan Deskripsi"
                                    className="h-10"
                                    value={field.value || ''}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <div className="flex items-center justify-end gap-2 pt-2">
                        {editingLevel && (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10"
                                onClick={() => {
                                    setEditingLevel(null);
                                    form.reset({
                                        level: 1,
                                        name: '',
                                        description: '',
                                        status: 'ACTIVE',
                                    });
                                }}
                            >
                                Batal
                            </Button>
                        )}
                        <Button type="submit" className="h-10 min-w-24">
                            {editingLevel ? 'Update' : 'Simpan'}
                        </Button>
                    </div>
                </FieldGroup>
            </form>

            <div className="rounded-lg border border-border/60 overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">Level</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="w-28 text-center">Status</TableHead>
                                <TableHead className="w-24 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {programLevels.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                                        Belum ada data level
                                    </TableCell>
                                </TableRow>
                            ) : (
                                programLevels.map((item) => (
                                    <TableRow key={item.id ?? item.level}>
                                        <TableCell className="text-center font-medium">{item.level}</TableCell>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell
                                            className="max-w-[200px] truncate text-muted-foreground"
                                            title={item.description || '-'}
                                        >
                                            {item.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <StatusBadge status={item.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="icon-sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingLevel(item.level);
                                                        form.setValue('level', item.level);
                                                        form.setValue('name', item.name);
                                                        form.setValue('description', item.description || '');
                                                        form.setValue('status', item.status);
                                                    }}
                                                >
                                                    <Icon icon="boxicons:pencil-square" className="size-4" />
                                                </Button>
                                                <Button
                                                    size="icon-sm"
                                                    variant="destructive"
                                                    onClick={() => onDelete(item.level)}
                                                >
                                                    <Icon icon="bi:trash-fill" className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
