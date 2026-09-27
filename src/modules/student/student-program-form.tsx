'use client';

// dependencies
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { STUDENT_PROGRAM_STATUS_OPTIONS, toDateInput, extractList } from '@/lib/ems-constants';

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
    program_slug: z.string().min(1, 'Program wajib dipilih'),
    program_package_id: z.coerce.number().min(1, 'Paket program wajib dipilih'),
    program_level_id: z.coerce.number().min(1, 'Level program wajib dipilih'),
    status: z.enum(['PENDING', 'TRIAL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED']),
    started_at: z.string().optional(),
    ended_at: z.string().optional(),
    normal_price: z.coerce.number().min(0, 'Harga normal tidak valid'),
    selling_price: z.coerce.number().min(0, 'Harga jual tidak valid'),
    notes: z.string().optional(),
});

type StudentProgramFormValues = z.infer<typeof formSchema>;
type StudentProgramInputValues = z.input<typeof formSchema>;

type StudentProgramFormProps = {
    type: 'create' | 'update';
    studentId: number;
    id?: number;
    onSuccess: () => void;
};

export default function StudentProgramForm({
    type,
    studentId,
    id,
    onSuccess,
}: StudentProgramFormProps) {
    const [programs, setPrograms] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const form = useForm<StudentProgramInputValues, any, StudentProgramFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            branch_id: undefined,
            program_slug: '',
            program_package_id: undefined,
            program_level_id: undefined,
            status: 'PENDING',
            started_at: '',
            ended_at: '',
            normal_price: 0,
            selling_price: 0,
            notes: '',
        },
    });

    const loadPackagesAndLevels = async (slug: string) => {
        const [packagesRes, levelsRes] = await Promise.all([
            http.get(`/program-packages/${slug}`),
            http.get(`/program-levels/${slug}`),
        ]);
        const packageList = extractList(packagesRes.data);
        const levelList = extractList(levelsRes.data);
        setPackages(packageList);
        setLevels(levelList);
        return { packageList, levelList };
    };

    const findProgramByPackageOrLevel = async (
        programList: any[],
        packageId?: number,
        levelId?: number,
    ) => {
        const results = await Promise.all(
            programList.map(async (program) => {
                const [packagesRes, levelsRes] = await Promise.all([
                    http.get(`/program-packages/${program.slug}`),
                    http.get(`/program-levels/${program.slug}`),
                ]);
                return {
                    slug: program.slug,
                    packages: extractList(packagesRes.data),
                    levels: extractList(levelsRes.data),
                };
            }),
        );

        return (
            results.find((result) => result.packages.some((item: any) => item.id === packageId)) ??
            results.find((result) => result.levels.some((item: any) => item.id === levelId)) ??
            null
        );
    };

    const getStudentProgram = async (programList: any[]) => {
        try {
            const response = await http.get(`/student-programs/${id}`);
            const data = response.data.data ?? response.data;

            const found = await findProgramByPackageOrLevel(
                programList,
                data.program_package_id,
                data.program_level_id,
            );
            if (found) {
                setPackages(found.packages);
                setLevels(found.levels);
            }

            form.reset({
                branch_id: data.branch_id,
                program_slug: found?.slug ?? '',
                program_package_id: data.program_package_id,
                program_level_id: data.program_level_id,
                status: data.status,
                started_at: toDateInput(data.started_at),
                ended_at: toDateInput(data.ended_at),
                normal_price: Number(data.normal_price ?? 0),
                selling_price: Number(data.selling_price ?? 0),
                notes: data.notes ?? '',
            });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getReferences = async () => {
        setLoading(true);
        try {
            const [programsRes, branchesRes] = await Promise.all([
                http.get('/programs'),
                http.get('/branches'),
            ]);
            const programList = extractList(programsRes.data);
            setPrograms(programList);
            setBranches(extractList(branchesRes.data));

            if (type === 'update' && id) {
                await getStudentProgram(programList);
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getReferences();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId, id, type]);

    const handleProgramChange = async (value: string, onChange: (value: any) => void) => {
        onChange(value);
        form.setValue('program_package_id', undefined as any);
        form.setValue('program_level_id', undefined as any);
        setPackages([]);
        setLevels([]);
        if (!value) return;
        try {
            await loadPackagesAndLevels(value);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handlePackageChange = (value: string, onChange: (value: any) => void) => {
        onChange(value);
        const selected = packages.find((item) => String(item.id) === value);
        if (selected) {
            form.setValue('normal_price', Number(selected.normal_price ?? 0));
            form.setValue('selling_price', Number(selected.selling_price ?? 0));
        }
    };

    const onSubmit = async (values: StudentProgramFormValues) => {
        const payload = {
            student_id: studentId,
            branch_id: Number(values.branch_id),
            program_package_id: Number(values.program_package_id),
            program_level_id: Number(values.program_level_id),
            status: values.status,
            started_at: values.started_at || undefined,
            ended_at: values.ended_at || undefined,
            normal_price: Number(values.normal_price),
            selling_price: Number(values.selling_price),
            notes: values.notes || undefined,
        };

        try {
            if (type === 'create') {
                const response = await http.post('/student-programs', payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Program siswa berhasil ditambahkan',
                });
            } else {
                const response = await http.put(`/student-programs/${id}`, payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Program siswa berhasil diperbarui',
                });
            }
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    if (loading) return <div className="py-4 text-muted-foreground">Memuat data...</div>;

    const branchItems = branches.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }));
    const programItems = programs.map((program) => ({
        value: program.slug,
        label: program.name,
    }));
    const packageItems = packages.map((item) => ({ value: String(item.id), label: item.name }));
    const levelItems = levels.map((item) => ({ value: String(item.id), label: item.name }));

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
                <Controller
                    name="program_slug"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="program_slug">Program</FieldLabel>
                            <Select
                                value={field.value || null}
                                onValueChange={(value) =>
                                    handleProgramChange(value ?? '', field.onChange)
                                }
                                items={programItems}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih Program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map((program) => (
                                        <SelectItem key={program.slug} value={program.slug}>
                                            {program.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="program_package_id"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="program_package_id">Paket Program</FieldLabel>
                                <Select
                                    value={field.value ? String(field.value) : null}
                                    onValueChange={(value) =>
                                        handlePackageChange(value ?? '', field.onChange)
                                    }
                                    items={packageItems}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Pilih Paket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {packages.map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="program_level_id"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="program_level_id">Level Program</FieldLabel>
                                <Select
                                    value={field.value ? String(field.value) : null}
                                    onValueChange={(value) => field.onChange(value)}
                                    items={levelItems}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Pilih Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {levels.map((item) => (
                                            <SelectItem key={item.id} value={String(item.id)}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <Controller
                    name="status"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="status">Status</FieldLabel>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                items={STUDENT_PROGRAM_STATUS_OPTIONS}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STUDENT_PROGRAM_STATUS_OPTIONS.map((option) => (
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
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="started_at"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="started_at">Tanggal Mulai</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="started_at"
                                    type="date"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="ended_at"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="ended_at">Tanggal Selesai</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="ended_at"
                                    type="date"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="normal_price"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="normal_price">Harga Normal</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value == null ? '' : String(field.value)}
                                    id="normal_price"
                                    type="number"
                                    placeholder="0"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="selling_price"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="selling_price">Harga Jual</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value == null ? '' : String(field.value)}
                                    id="selling_price"
                                    type="number"
                                    placeholder="0"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <Controller
                    name="notes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                            <Textarea
                                {...field}
                                value={field.value ?? ''}
                                id="notes"
                                placeholder="Catatan tambahan"
                                className="min-h-10"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Button type="submit" className="h-10">
                    {type === 'create' ? 'Simpan Program' : 'Update Program'}
                </Button>
            </FieldGroup>
        </form>
    );
}
