'use client';

// dependencies
import { useEffect, useState, useMemo } from 'react';
import { Icon } from '@iconify/react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';
import { formatCurrency } from '@/lib/currency';

// components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Field, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';

interface StudentAssignDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    student?: any | null; // Pre-selected student (if opened from table row)
    allStudents?: any[]; // Full list of students (for dropdown / multi-select)
    onSuccess: () => void;
}

const statusOptions = [
    { value: 'ACTIVE', label: 'ACTIVE (Aktif Belajar)' },
    { value: 'TRIAL', label: 'TRIAL (Uji Coba)' },
    { value: 'PENDING', label: 'PENDING (Menunggu)' },
];

export default function StudentAssignDialog({
    isOpen,
    onOpenChange,
    student,
    allStudents = [],
    onSuccess,
}: StudentAssignDialogProps) {
    // Multi student selection state
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [studentSearch, setStudentSearch] = useState<string>('');

    // Target assignment settings
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedProgramSlug, setSelectedProgramSlug] = useState<string>('');
    const [selectedLevelId, setSelectedLevelId] = useState<string>('');
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');
    const [status, setStatus] = useState<string>('ACTIVE');
    const [startedAt, setStartedAt] = useState<string>(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState<string>('');

    // Metadata state
    const [branches, setBranches] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [packages, setPackages] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

    const [loadingMetadata, setLoadingMetadata] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialise selected student(s) when dialog opens or student prop changes
    useEffect(() => {
        if (!isOpen) return;

        if (student?.id) {
            setSelectedStudentIds([student.id]);
        } else {
            setSelectedStudentIds([]);
        }
        setStudentSearch('');
    }, [student, isOpen]);

    // Fetch Branches & Programs when dialog opens
    useEffect(() => {
        if (!isOpen) return;

        const loadInitialData = async () => {
            setLoadingMetadata(true);
            try {
                const [branchesRes, programsRes] = await Promise.all([
                    http.get('/branches'),
                    http.get('/programs'),
                ]);
                const branchList = extractList(branchesRes.data);
                const programList = extractList(programsRes.data);
                setBranches(branchList);
                setPrograms(programList);

                // Auto-select first branch if none selected
                if (branchList.length > 0 && !selectedBranchId) {
                    setSelectedBranchId(String(branchList[0].id));
                }

                // Auto-select first program if none selected
                if (programList.length > 0 && !selectedProgramSlug) {
                    setSelectedProgramSlug(programList[0].slug);
                }
            } catch (error) {
                const { message } = parseAxiosError(error);
                toast.add({ title: 'Gagal memuat data', type: 'error', description: message });
            } finally {
                setLoadingMetadata(false);
            }
        };

        loadInitialData();
    }, [isOpen]);

    // Fetch Levels and Packages whenever Program changes
    useEffect(() => {
        if (!selectedProgramSlug) {
            setLevels([]);
            setPackages([]);
            setSelectedLevelId('');
            setSelectedPackageId('');
            setSelectedPackage(null);
            return;
        }

        const loadProgramDetails = async () => {
            try {
                const [levelsRes, packagesRes] = await Promise.all([
                    http.get(`/program-levels/${selectedProgramSlug}`),
                    http.get(`/program-packages/${selectedProgramSlug}`),
                ]);

                const levelList = extractList(levelsRes.data);
                const packageList = extractList(packagesRes.data);

                setLevels(levelList);
                setPackages(packageList);

                // Auto select first level
                if (levelList.length > 0) {
                    setSelectedLevelId(String(levelList[0].id));
                } else {
                    setSelectedLevelId('');
                }

                // Auto select first package
                if (packageList.length > 0) {
                    setSelectedPackageId(String(packageList[0].id));
                    setSelectedPackage(packageList[0]);
                } else {
                    setSelectedPackageId('');
                    setSelectedPackage(null);
                }
            } catch (error) {
                console.error('Error fetching levels and packages', error);
            }
        };

        loadProgramDetails();
    }, [selectedProgramSlug]);

    // Update package info when package selection changes
    const handlePackageChange = (pkgId: string) => {
        setSelectedPackageId(pkgId);
        const found = packages.find((p) => String(p.id) === pkgId);
        setSelectedPackage(found ?? null);
    };

    // Filter students based on search input
    const filteredStudents = useMemo(() => {
        if (!studentSearch) return allStudents;
        const kw = studentSearch.toLowerCase();
        return allStudents.filter(
            (s) =>
                s.full_name?.toLowerCase().includes(kw) ||
                s.school_level?.toLowerCase().includes(kw) ||
                s.guardian_name?.toLowerCase().includes(kw) ||
                s.guardian_phone_number?.toLowerCase().includes(kw),
        );
    }, [allStudents, studentSearch]);

    // Toggle single student selection
    const toggleStudentSelection = (id: number) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    // Select all filtered students
    const handleSelectAllFiltered = () => {
        const filteredIds = filteredStudents.map((s) => s.id);
        const allIncluded = filteredIds.every((id) => selectedStudentIds.includes(id));
        if (allIncluded) {
            // Deselect filtered
            setSelectedStudentIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
        } else {
            // Add all filtered
            setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    // Selected students objects for summary
    const selectedStudentsList = useMemo(() => {
        return allStudents.filter((s) => selectedStudentIds.includes(s.id));
    }, [allStudents, selectedStudentIds]);

    // Options formatted for Select components (with label as name so ID is never shown)
    const branchItems = useMemo(
        () =>
            branches.map((b) => ({
                value: String(b.id),
                label: b.address ? `${b.name} — ${b.address}` : b.name,
            })),
        [branches],
    );

    const programItems = useMemo(
        () =>
            programs.map((p) => ({
                value: p.slug,
                label: p.name,
            })),
        [programs],
    );

    const levelItems = useMemo(
        () =>
            levels.map((lvl) => ({
                value: String(lvl.id),
                label: `${lvl.name} (Tingkat ${lvl.level})`,
            })),
        [levels],
    );

    const packageItems = useMemo(
        () =>
            packages.map((pkg) => ({
                value: String(pkg.id),
                label: `${pkg.name} — ${formatCurrency(pkg.selling_price)} (${pkg.duration_months} bln)`,
            })),
        [packages],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedStudentIds.length === 0) {
            toast.add({
                title: 'Perhatian',
                type: 'error',
                description: 'Pilih minimal satu siswa untuk di-assign.',
            });
            return;
        }

        if (!selectedBranchId) {
            toast.add({
                title: 'Perhatian',
                type: 'error',
                description: 'Pilih cabang terlebih dahulu.',
            });
            return;
        }

        if (!selectedProgramSlug) {
            toast.add({
                title: 'Perhatian',
                type: 'error',
                description: 'Pilih pelajaran/program terlebih dahulu.',
            });
            return;
        }

        if (!selectedLevelId) {
            toast.add({
                title: 'Perhatian',
                type: 'error',
                description: 'Pilih level program terlebih dahulu.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                student_ids: selectedStudentIds,
                branch_id: Number(selectedBranchId),
                program_slug: selectedProgramSlug,
                program_level_id: Number(selectedLevelId),
                program_package_id: selectedPackageId ? Number(selectedPackageId) : undefined,
                status,
                started_at: startedAt,
                notes: notes || undefined,
            };

            const response = await http.post('/students/assign', payload);
            toast.add({
                title: 'Berhasil',
                type: 'success',
                description:
                    response.data.message ??
                    `Berhasil menugaskan ${selectedStudentIds.length} siswa ke cabang dan program.`,
            });
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Assign', type: 'error', description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentBranch = branches.find((b) => String(b.id) === selectedBranchId);
    const currentProgram = programs.find((p) => p.slug === selectedProgramSlug);
    const currentLevel = levels.find((l) => String(l.id) === selectedLevelId);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-5xl w-full max-h-[92vh] flex flex-col p-6 sm:p-8">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Icon icon="mdi:account-multiple-plus" className="text-primary text-2xl" />
                        Assign Siswa ke Cabang & Pelajaran
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Tugaskan satu atau banyak siswa sekaligus ke cabang belajar, program
                        pelajaran, level, dan paket pembelajaran.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col min-h-0 space-y-5 overflow-hidden"
                >
                    {/* Main content grid: Left side (Students) & Right side (Branch & Program Details) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-y-auto pr-1">
                        {/* LEFT COLUMN: Student Multi-Select (col-span-5) */}
                        <div className="lg:col-span-5 flex flex-col rounded-sm border bg-muted/20 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <span className="text-sm font-bold text-foreground">
                                        Pilih Siswa
                                    </span>
                                    <p className="text-[11px] text-muted-foreground">
                                        Centang siswa yang ingin ditugaskan
                                    </p>
                                </div>
                                <Badge
                                    variant={selectedStudentIds.length > 0 ? 'default' : 'outline'}
                                    className="text-xs px-2.5 py-1"
                                >
                                    {selectedStudentIds.length} Siswa Terpilih
                                </Badge>
                            </div>

                            {/* Search bar */}
                            <div className="relative">
                                <Icon
                                    icon="mdi:magnify"
                                    className="absolute left-3 top-2.5 text-muted-foreground text-base"
                                />
                                <Input
                                    placeholder="Cari nama siswa, jenjang, atau wali..."
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    className="pl-9 h-9 text-xs bg-background"
                                />
                            </div>

                            {/* Toolbar quick select */}
                            <div className="flex items-center justify-between text-xs px-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-primary px-2"
                                    onClick={handleSelectAllFiltered}
                                >
                                    {filteredStudents.length > 0 &&
                                    filteredStudents.every((s) => selectedStudentIds.includes(s.id))
                                        ? 'Batal Pilih Semua'
                                        : 'Pilih Semua Hasil'}
                                </Button>
                                {selectedStudentIds.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-destructive px-2"
                                        onClick={() => setSelectedStudentIds([])}
                                    >
                                        Hapus Semua Pilihan
                                    </Button>
                                )}
                            </div>

                            {/* Students list */}
                            <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto divide-y rounded-sm border bg-background">
                                {filteredStudents.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-muted-foreground">
                                        Tidak ada siswa yang sesuai pencarian.
                                    </div>
                                ) : (
                                    filteredStudents.map((s) => {
                                        const isSelected = selectedStudentIds.includes(s.id);
                                        return (
                                            <div
                                                key={s.id}
                                                onClick={() => toggleStudentSelection(s.id)}
                                                className={`flex items-start gap-3 p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50 ${
                                                    isSelected ? 'bg-primary/5 font-medium' : ''
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="h-4 w-4 rounded-sm border-gray-300 text-primary cursor-pointer mt-0.5 shrink-0"
                                                />
                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-semibold text-foreground text-sm">
                                                            {s.full_name}
                                                        </span>
                                                        {s.school_level && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] px-1.5 py-0"
                                                            >
                                                                {s.school_level}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        Wali: {s.guardian_name || '-'} (
                                                        {s.guardian_phone_number || '-'})
                                                    </div>
                                                    {s.branch_name && (
                                                        <div className="text-[11px] text-primary/80">
                                                            Cabang: {s.branch_name}
                                                            {s.program_name
                                                                ? ` • ${s.program_name}`
                                                                : ''}
                                                        </div>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <Icon
                                                        icon="mdi:check-circle"
                                                        className="text-primary text-base shrink-0 mt-0.5"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Selected students chip preview */}
                            {selectedStudentsList.length > 0 && (
                                <div className="space-y-1 pt-1">
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                        Daftar Nama Terpilih ({selectedStudentsList.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1.5 rounded-sm border bg-background/50">
                                        {selectedStudentsList.map((s) => (
                                            <span
                                                key={s.id}
                                                className="inline-flex items-center gap-1 rounded-sm bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary font-medium"
                                            >
                                                <span>{s.full_name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStudentSelection(s.id)}
                                                    className="hover:text-destructive text-primary/70 cursor-pointer"
                                                    title="Hapus dari daftar"
                                                >
                                                    <Icon icon="mdi:close" className="text-xs" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Branch, Program, Level, Package (col-span-7) */}
                        <div className="lg:col-span-7 flex flex-col space-y-4">
                            <div className="rounded-sm border p-4 space-y-4 bg-card shadow-xs">
                                <div className="border-b pb-2">
                                    <h4 className="text-sm font-bold text-foreground">
                                        Pilihan Cabang & Kurikulum Belajar
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        Pilih cabang dan pelajaran yang akan diikuti oleh siswa
                                        terpilih.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Branch Selector */}
                                    <Field>
                                        <FieldLabel>Cabang Belajar *</FieldLabel>
                                        <Select
                                            value={selectedBranchId || null}
                                            onValueChange={(val) => setSelectedBranchId(val ?? '')}
                                            items={branchItems}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="Pilih Cabang..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branchItems.map((b) => (
                                                    <SelectItem key={b.value} value={b.value}>
                                                        {b.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Program (Pelajaran) Selector */}
                                    <Field>
                                        <FieldLabel>Pelajaran / Program *</FieldLabel>
                                        <Select
                                            value={selectedProgramSlug || null}
                                            onValueChange={(val) =>
                                                setSelectedProgramSlug(val ?? '')
                                            }
                                            items={programItems}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue placeholder="Pilih Pelajaran..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programItems.map((p) => (
                                                    <SelectItem key={p.value} value={p.value}>
                                                        {p.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Level Selector */}
                                    <Field>
                                        <FieldLabel>Level Pelajaran *</FieldLabel>
                                        <Select
                                            value={selectedLevelId || null}
                                            onValueChange={(val) => setSelectedLevelId(val ?? '')}
                                            items={levelItems}
                                            disabled={levels.length === 0}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue
                                                    placeholder={
                                                        levels.length === 0
                                                            ? 'Pilih Pelajaran dahulu'
                                                            : 'Pilih Level...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {levelItems.map((lvl) => (
                                                    <SelectItem key={lvl.value} value={lvl.value}>
                                                        {lvl.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Package Selector */}
                                    <Field>
                                        <FieldLabel>Paket Pembelajaran *</FieldLabel>
                                        <Select
                                            value={selectedPackageId || null}
                                            onValueChange={(val) => handlePackageChange(val ?? '')}
                                            items={packageItems}
                                            disabled={packages.length === 0}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue
                                                    placeholder={
                                                        packages.length === 0
                                                            ? 'Pilih Pelajaran dahulu'
                                                            : 'Pilih Paket...'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {packageItems.map((pkg) => (
                                                    <SelectItem key={pkg.value} value={pkg.value}>
                                                        {pkg.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Status */}
                                    <Field>
                                        <FieldLabel>Status Pendaftaran</FieldLabel>
                                        <Select
                                            value={status}
                                            onValueChange={(val) => setStatus(val ?? 'ACTIVE')}
                                            items={statusOptions}
                                        >
                                            <SelectTrigger className="h-10 w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    {/* Start Date */}
                                    <Field>
                                        <FieldLabel>Tanggal Mulai Belajar</FieldLabel>
                                        <Input
                                            type="date"
                                            className="h-10"
                                            value={startedAt}
                                            onChange={(e) => setStartedAt(e.target.value)}
                                        />
                                    </Field>
                                </div>

                                {/* Package snapshot card */}
                                {selectedPackage && (
                                    <div className="rounded-sm border border-primary/25 bg-primary/5 p-3.5 text-xs space-y-1.5">
                                        <div className="font-semibold text-primary flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <Icon
                                                    icon="mdi:tag-outline"
                                                    className="text-base"
                                                />
                                                Paket: <strong>{selectedPackage.name}</strong>
                                            </span>
                                            <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded-sm">
                                                {formatCurrency(selectedPackage.selling_price)}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-muted-foreground border-t border-primary/10">
                                            <div>
                                                <span>Durasi:</span>{' '}
                                                <strong className="text-foreground">
                                                    {selectedPackage.duration_months} Bulan
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Pertemuan:</span>{' '}
                                                <strong className="text-foreground">
                                                    {selectedPackage.sessions_per_period}x /{' '}
                                                    {selectedPackage.session_period}
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Harga Asli:</span>{' '}
                                                <strong className="text-foreground">
                                                    {formatCurrency(selectedPackage.normal_price)}
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Harga Jual:</span>{' '}
                                                <strong className="text-primary font-bold">
                                                    {formatCurrency(selectedPackage.selling_price)}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <Field>
                                    <FieldLabel>Catatan Tambahan (Opsional)</FieldLabel>
                                    <Textarea
                                        placeholder="Catatan kelas, batch, atau instruksi pengajar..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={2}
                                    />
                                </Field>
                            </div>

                            {/* Summary bar */}
                            <div className="rounded-sm border bg-muted/40 p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground font-medium">
                                        Ringkasan Penugasan:
                                    </span>
                                    <div className="font-semibold text-foreground flex items-center gap-2 flex-wrap">
                                        <span className="text-primary font-bold">
                                            {selectedStudentIds.length} Siswa Terpilih
                                        </span>
                                        <span>•</span>
                                        <span>Cabang: {currentBranch?.name || '-'}</span>
                                        <span>•</span>
                                        <span>
                                            Pelajaran: {currentProgram?.name || '-'}
                                            {currentLevel ? ` (${currentLevel.name})` : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2 border-t flex sm:justify-between items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                            {selectedStudentIds.length > 0 ? (
                                <span>
                                    Akan menugaskan{' '}
                                    <strong className="text-foreground">
                                        {selectedStudentIds.length} siswa
                                    </strong>{' '}
                                    sekaligus.
                                </span>
                            ) : (
                                <span>Pilih minimal satu siswa di sisi kiri.</span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    loadingMetadata ||
                                    selectedStudentIds.length === 0 ||
                                    !selectedBranchId ||
                                    !selectedLevelId
                                }
                                className="gap-2 px-5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon icon="mdi:loading" className="animate-spin" />{' '}
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:check-all" />
                                        Tugaskan ({selectedStudentIds.length} Siswa)
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
