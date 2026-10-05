'use client';

// dependencies
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { CLASS_STATUS_OPTIONS, extractList } from '@/lib/ems-constants';

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
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';

const formSchema = z.object({
    branch_id: z.coerce.number().min(1, 'Cabang wajib dipilih'),
    name: z.string().min(1, 'Nama kelas wajib diisi'),
    code: z.string().min(1, 'Kode kelas wajib diisi'),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
});

type ClassFormValues = z.infer<typeof formSchema>;
type ClassInputValues = z.input<typeof formSchema>;

type ClassFormProps = {
    type: 'create' | 'update';
    classData?: any;
    onSuccess: () => void;
};

export default function ClassForm({ type, classData, onSuccess }: ClassFormProps) {
    const [branches, setBranches] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [programId, setProgramId] = useState<string>(
        classData?.program_id ? String(classData.program_id) : '',
    );
    const [levelId, setLevelId] = useState<string>(
        classData?.program_level_id ? String(classData.program_level_id) : '',
    );

    const form = useForm<ClassInputValues, any, ClassFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            branch_id: undefined,
            name: '',
            code: '',
            description: '',
            status: 'ACTIVE',
        },
    });

    const getReferences = async () => {
        try {
            const [branchesRes, programsRes] = await Promise.all([
                http.get('/branches'),
                http.get('/programs'),
            ]);
            setBranches(extractList(branchesRes.data));
            setPrograms(extractList(programsRes.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const loadLevels = async (programSlug: string) => {
        if (!programSlug) {
            setLevels([]);
            return;
        }
        try {
            const response = await http.get(`/program-levels/${programSlug}`);
            setLevels(extractList(response.data));
        } catch {
            setLevels([]);
        }
    };

    useEffect(() => {
        getReferences();
    }, []);

    useEffect(() => {
        if (classData) {
            form.reset({
                branch_id: classData.branch_id,
                name: classData.name ?? '',
                code: classData.code ?? '',
                description: classData.description ?? '',
                status: classData.status ?? 'ACTIVE',
            });
            setProgramId(classData.program_id ? String(classData.program_id) : '');
            setLevelId(classData.program_level_id ? String(classData.program_level_id) : '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classData]);

    // Keep level options in sync with the selected program.
    useEffect(() => {
        const program = programs.find((item) => String(item.id) === programId);
        if (program) loadLevels(program.slug);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId, programs]);

    const onSubmit = async (values: ClassFormValues) => {
        if (!programId) {
            toast.add({ title: 'Error', type: 'error', description: 'Program wajib dipilih' });
            return;
        }
        const payload = {
            branch_id: Number(values.branch_id),
            program_id: Number(programId),
            program_level_id: levelId ? Number(levelId) : null,
            name: values.name,
            code: values.code,
            description: values.description || undefined,
            status: values.status,
        };

        try {
            if (type === 'create') {
                const response = await http.post('/classes', payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Kelas berhasil ditambahkan',
                });
            } else {
                const response = await http.put(`/classes/${classData.id}`, payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Kelas berhasil diperbarui',
                });
            }
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const branchItems = branches.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }));
    const programItems = programs.map((program) => ({
        value: String(program.id),
        label: program.name,
    }));
    const levelItems = levels.map((level) => ({
        value: String(level.id),
        label: level.name,
    }));

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="branch_id"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="branch_id">Cabang</FieldLabel>
                            <Select
                                value={field.value ? String(field.value) : null}
                                onValueChange={(value) => field.onChange(value)}
                                items={branchItems}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih Cabang" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={String(branch.id)}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="program_id">Program</FieldLabel>
                        <Select
                            value={programId || null}
                            onValueChange={(value) => {
                                setProgramId(value ?? '');
                                setLevelId('');
                            }}
                            items={programItems}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Pilih Program" />
                            </SelectTrigger>
                            <SelectContent>
                                {programs.map((program) => (
                                    <SelectItem key={program.id} value={String(program.id)}>
                                        {program.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                            Kelas ini hanya untuk siswa yang mengambil program tersebut.
                        </p>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="program_level_id">Level (opsional)</FieldLabel>
                        <Select
                            value={levelId || null}
                            onValueChange={(value) => setLevelId(value ?? '')}
                            items={levelItems}
                        >
                            <SelectTrigger className="h-10">
                                <SelectValue placeholder="Semua level" />
                            </SelectTrigger>
                            <SelectContent>
                                {levels.map((level) => (
                                    <SelectItem key={level.id} value={String(level.id)}>
                                        {level.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="name">Nama Kelas</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                id="name"
                                type="text"
                                placeholder="Contoh: Tahsin Class A"
                                className="h-10"
                                required
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="code">Kode Kelas</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                id="code"
                                type="text"
                                placeholder="Contoh: THS-A-2026"
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
                            <Textarea
                                {...field}
                                value={field.value ?? ''}
                                id="description"
                                placeholder="Deskripsi kelas"
                                className="min-h-10"
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
                                items={CLASS_STATUS_OPTIONS}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLASS_STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Button type="submit" className="h-10">
                    {type === 'create' ? 'Simpan' : 'Update'}
                </Button>
            </FieldGroup>
        </form>
    );
}
