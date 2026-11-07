'use client';

// dependencies
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { AlertCircle, Loader2, UserCheck, ArrowRight } from 'lucide-react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toDateInput } from '@/lib/ems-constants';

// components
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';

const formSchema = z.object({
    full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
    address: z.string().optional(),
    place_birth: z.string().optional(),
    birth_date: z.string().optional(),
    school_level: z.string().optional(),
    father_name: z.string().optional(),
    mother_name: z.string().optional(),
    guardian_name: z.string().optional(),
    guardian_phone_number: z.string().optional(),
    instagram: z.string().optional(),
    information_source: z.string().optional(),
    photos_of_children_may_be_posted: z.boolean(),
});

type StudentFormValues = z.infer<typeof formSchema>;

type StudentFormProps = {
    type: 'create' | 'update';
    student?: any;
    studentId?: number;
    onSuccess: (student?: any) => void;
};

const defaultValues: StudentFormValues = {
    full_name: '',
    address: '',
    place_birth: '',
    birth_date: '',
    school_level: '',
    father_name: '',
    mother_name: '',
    guardian_name: '',
    guardian_phone_number: '',
    instagram: '',
    information_source: '',
    photos_of_children_may_be_posted: true,
};

export default function StudentForm({ type, student, studentId, onSuccess }: StudentFormProps) {
    const form = useForm<StudentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const [existingStudent, setExistingStudent] = useState<any | null>(null);
    const [isCheckingName, setIsCheckingName] = useState<boolean>(false);

    const watchedFullName = useWatch({
        control: form.control,
        name: 'full_name',
    });

    const fillForm = (data: any) => {
        form.reset({
            full_name: data.full_name ?? '',
            address: data.address ?? '',
            place_birth: data.place_birth ?? '',
            birth_date: toDateInput(data.birth_date),
            school_level: data.school_level ?? '',
            father_name: data.father_name ?? '',
            mother_name: data.mother_name ?? '',
            guardian_name: data.guardian_name ?? '',
            guardian_phone_number: data.guardian_phone_number ?? '',
            instagram: data.instagram ?? '',
            information_source: data.information_source ?? '',
            photos_of_children_may_be_posted: Boolean(data.photos_of_children_may_be_posted),
        });
    };

    const getStudent = async () => {
        try {
            const response = await http.get(`/students/${studentId}`);
            fillForm(response.data.data ?? response.data);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        if (student) {
            fillForm(student);
        } else if (type === 'update' && studentId) {
            getStudent();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student, studentId, type]);

    // Check if student with full_name already exists (debounced)
    useEffect(() => {
        if (type !== 'create') return;

        const name = (watchedFullName || '').trim();
        if (name.length < 2) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (existingStudent) setExistingStudent(null);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsCheckingName(false);
            return;
        }

        // Avoid refetching if current existing student already matches this exact name
        if (
            existingStudent &&
            existingStudent.full_name?.trim().toLowerCase() === name.toLowerCase()
        ) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCheckingName(true);
        const timer = setTimeout(async () => {
            try {
                const response = await http.get('/students/check-name', {
                    params: { name },
                });
                if (response.data?.exists && response.data?.data) {
                    const found = response.data.data;
                    setExistingStudent(found);
                    fillForm(found);
                    toast.add({
                        title: 'Siswa Sudah Terdaftar',
                        type: 'info',
                        description: `Data siswa "${found.full_name}" telah dimuat otomatis untuk menghindari duplikasi.`,
                    });
                } else {
                    setExistingStudent(null);
                }
            } catch {
                // Ignore background check error
            } finally {
                setIsCheckingName(false);
            }
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedFullName, type]);

    const buildPayload = (values: StudentFormValues) => ({
        full_name: values.full_name,
        address: values.address || undefined,
        place_birth: values.place_birth || undefined,
        birth_date: values.birth_date || undefined,
        school_level: values.school_level || undefined,
        father_name: values.father_name || undefined,
        mother_name: values.mother_name || undefined,
        guardian_name: values.guardian_name || undefined,
        guardian_phone_number: values.guardian_phone_number || undefined,
        instagram: values.instagram || undefined,
        information_source: values.information_source || undefined,
        photos_of_children_may_be_posted: values.photos_of_children_may_be_posted,
    });

    const onSubmit = async (values: StudentFormValues) => {
        try {
            if (existingStudent?.id) {
                // If student already exists, update their record instead of creating duplicate
                const response = await http.put(
                    `/students/${existingStudent.id}`,
                    buildPayload(values),
                );
                toast.add({
                    title: 'Data Siswa Dimuat',
                    type: 'success',
                    description: `Menggunakan data siswa "${values.full_name}" (ID: #${existingStudent.id}). Melanjutkan ke assign program...`,
                });
                onSuccess({
                    ...values,
                    id: existingStudent.id,
                    ...(response.data?.data ?? response.data ?? {}),
                });
            } else if (type === 'create') {
                const response = await http.post('/students', buildPayload(values));
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Siswa berhasil ditambahkan',
                });
                onSuccess({ ...values, ...(response.data.data ?? {}) });
            } else {
                const response = await http.put(`/students/${studentId}`, buildPayload(values));
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Siswa berhasil diperbarui',
                });
                onSuccess({ ...values, ...(response.data.data ?? {}) });
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller
                    name="full_name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="full_name">Nama Lengkap *</FieldLabel>
                                {isCheckingName && (
                                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <Loader2 className="size-3 animate-spin text-primary" />
                                        Mengecek ketersediaan nama...
                                    </span>
                                )}
                                {!isCheckingName && existingStudent && (
                                    <Badge
                                        variant="warning"
                                        className="gap-1 text-[10px] font-medium"
                                    >
                                        <UserCheck className="size-3" /> Siswa Sudah Terdaftar (ID:
                                        #{existingStudent.id})
                                    </Badge>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="full_name"
                                    type="text"
                                    placeholder="Masukan Nama Lengkap"
                                    className={`h-10 ${
                                        existingStudent
                                            ? 'border-amber-500 focus-visible:ring-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                                            : ''
                                    }`}
                                    required
                                />
                                {isCheckingName && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </div>

                            {/* Alert Banner when student already exists */}
                            {existingStudent && (
                                <div className="mt-2 p-3 rounded-sm border border-amber-300 bg-amber-50/90 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 text-xs space-y-2">
                                    <div className="flex items-start gap-2.5">
                                        <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="flex-1 space-y-1">
                                            <p className="font-semibold text-xs">
                                                Siswa &quot;{existingStudent.full_name}&quot; sudah
                                                ada di database (ID: #{existingStudent.id})
                                            </p>
                                            <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                                Data siswa ini telah dimuat otomatis agar tidak
                                                terjadi duplikasi data. Anda dapat langsung
                                                melanjutkan ke pendaftaran program siswa atau
                                                memperbarui profilnya.
                                            </p>
                                            <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                                                    onClick={() => onSuccess(existingStudent)}
                                                >
                                                    <UserCheck className="size-3" />
                                                    Lanjut ke Assign Program untuk Siswa Ini
                                                    <ArrowRight className="size-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs bg-background"
                                                    onClick={() => {
                                                        setExistingStudent(null);
                                                        form.reset(defaultValues);
                                                    }}
                                                >
                                                    Reset / Input Siswa Lain
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <Controller
                    name="school_level"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="school_level">Jenjang Pendidikan</FieldLabel>
                            <Input
                                {...field}
                                value={field.value ?? ''}
                                id="school_level"
                                type="text"
                                placeholder="Contoh: SD / SMP / SMA"
                                className="h-10"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="place_birth"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="place_birth">Tempat Lahir</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="place_birth"
                                    type="text"
                                    placeholder="Masukan Tempat Lahir"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="birth_date"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="birth_date">Tanggal Lahir</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="birth_date"
                                    type="date"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
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
                                className="min-h-10"
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="father_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="father_name">Nama Ayah</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="father_name"
                                    type="text"
                                    placeholder="Masukan Nama Ayah"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="mother_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="mother_name">Nama Ibu</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="mother_name"
                                    type="text"
                                    placeholder="Masukan Nama Ibu"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="guardian_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="guardian_name">
                                    Nama Wali / Penanggung Jawab
                                </FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="guardian_name"
                                    type="text"
                                    placeholder="Masukan Nama Wali"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="guardian_phone_number"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="guardian_phone_number">
                                    Nomor Telepon Wali
                                </FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="guardian_phone_number"
                                    type="text"
                                    placeholder="081234567890"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Controller
                        name="instagram"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="instagram">Instagram</FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="instagram"
                                    type="text"
                                    placeholder="@username"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                    <Controller
                        name="information_source"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="information_source">
                                    Sumber Informasi
                                </FieldLabel>
                                <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    id="information_source"
                                    type="text"
                                    placeholder="Instagram / Website / Teman"
                                    className="h-10"
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>
                <Controller
                    name="photos_of_children_may_be_posted"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <FieldGroup className="w-full">
                            <Field orientation="horizontal" className="items-center gap-2">
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    id="photos_of_children_may_be_posted"
                                    name="photos_of_children_may_be_posted"
                                />
                                <FieldLabel htmlFor="photos_of_children_may_be_posted">
                                    Foto anak boleh dipublikasikan
                                </FieldLabel>
                            </Field>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldGroup>
                    )}
                />
                <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <Button type="submit" className="h-10 gap-2">
                        {existingStudent ? (
                            <>
                                <UserCheck className="size-4" />
                                Simpan Perubahan & Lanjut ke Program
                            </>
                        ) : type === 'create' ? (
                            'Simpan & Lanjut ke Program'
                        ) : (
                            'Update'
                        )}
                    </Button>
                    {existingStudent && (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-10 text-xs"
                            onClick={() => {
                                setExistingStudent(null);
                                form.reset(defaultValues);
                            }}
                        >
                            Batalkan & Input Nama Lain
                        </Button>
                    )}
                </div>
            </FieldGroup>
        </form>
    );
}
