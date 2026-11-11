'use client';

// dependencies
import { Icon } from '@iconify/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList, formatDate } from '@/lib/ems-constants';

// components
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// module components
import StudentForm from '@/modules/student/student-form';
import StudentProgramsList from '@/modules/student/student-programs-list';
import StudentImportPreviewDialog, {
    type PreviewResponse,
} from '@/modules/student/student-import-preview-dialog';
import StudentAssignDialog from '@/modules/student/student-assign-dialog';
import StudentStatusHistoryDialog from '@/modules/student/student-status-history-dialog';

// Avatar styling helpers
const AVATAR_PALETTES = [
    'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-900',
];

function getAvatarColor(name: string): string {
    if (!name) return AVATAR_PALETTES[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_PALETTES.length;
    return AVATAR_PALETTES[index];
}

function getInitials(name: string): string {
    if (!name) return 'S';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatWaLink(phone?: string | null): string | null {
    if (!phone || phone.trim() === '-' || phone.trim() === '') return null;
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1);
    }
    if (clean.length < 8) return null;
    return `https://wa.me/${clean}`;
}

export default function StudentManagementPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [branchFilter, setBranchFilter] = useState<string>('ALL');
    const [levelFilter, setLevelFilter] = useState<string>('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    // Modal / Dialog states (Centralized to avoid thousands of DOM dialogs)
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editStudent, setEditStudent] = useState<any | null>(null);
    const [programStudent, setProgramStudent] = useState<any | null>(null);
    const [historyStudent, setHistoryStudent] = useState<any | null>(null);
    const [deleteTargetStudent, setDeleteTargetStudent] = useState<any | null>(null);
    const [quickViewStudent, setQuickViewStudent] = useState<any | null>(null);

    // Assign dialog states
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignTargetStudent, setAssignTargetStudent] = useState<any | null>(null);

    // Excel import preview states
    const importInputRef = useRef<HTMLInputElement>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
    const [importFileName, setImportFileName] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Export Excel Modal states
    const [branches, setBranches] = useState<any[]>([]);
    const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
    const [exportScope, setExportScope] = useState<'ALL' | 'BRANCH' | 'STUDENT'>('ALL');
    const [selectedExportBranchId, setSelectedExportBranchId] = useState<string>('');
    const [selectedExportStudentId, setSelectedExportStudentId] = useState<string>('');

    const getStudents = async () => {
        setIsLoading(true);
        try {
            const response = await http.get('/students');
            setStudents(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Data', type: 'error', description: message });
        } finally {
            setIsLoading(false);
        }
    };

    const getBranches = async () => {
        try {
            const response = await http.get('/branches');
            setBranches(extractList(response.data));
        } catch {
            // fallback if branches endpoint error
        }
    };

    useEffect(() => {
        getStudents();
        getBranches();
    }, []);

    const deleteStudent = async (id: number) => {
        try {
            const response = await http.delete(`/students/${id}`);
            toast.add({
                title: 'Berhasil Dihapus',
                type: 'success',
                description: response.data.message ?? 'Data siswa berhasil dihapus.',
            });
            setDeleteTargetStudent(null);
            getStudents();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menghapus', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditStudent(null);
        setProgramStudent(null);
        setIsAssignOpen(false);
        setAssignTargetStudent(null);
        setHistoryStudent(null);
        setQuickViewStudent(null);
        getStudents();
    };

    // Export to Excel with custom scope (all, branch, or single student)
    const handleExport = async (options?: {
        studentId?: number;
        branchId?: number;
        studentName?: string;
        branchName?: string;
    }) => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            const dateStr = new Date().toISOString().slice(0, 10);
            let fallbackFilename = `Data-Siswa-Semua-Cabang-${dateStr}.xlsx`;

            if (options?.studentId) {
                params.set('student_id', String(options.studentId));
                if (options.studentName) {
                    const clean = options.studentName.trim().replace(/[^a-zA-Z0-9]/g, '_');
                    fallbackFilename = `Data-Siswa-${clean}-${dateStr}.xlsx`;
                }
            } else if (options?.branchId) {
                params.set('branch_id', String(options.branchId));
                if (options.branchName) {
                    const clean = options.branchName.trim().replace(/[^a-zA-Z0-9]/g, '_');
                    fallbackFilename = `Data-Siswa-Cabang-${clean}-${dateStr}.xlsx`;
                }
            } else if (exportScope === 'STUDENT' && selectedExportStudentId) {
                params.set('student_id', selectedExportStudentId);
                const st = students.find((s) => String(s.id) === selectedExportStudentId);
                if (st) {
                    const clean = st.full_name.trim().replace(/[^a-zA-Z0-9]/g, '_');
                    fallbackFilename = `Data-Siswa-${clean}-${dateStr}.xlsx`;
                }
            } else if (exportScope === 'BRANCH' && selectedExportBranchId) {
                params.set('branch_id', selectedExportBranchId);
                const br = branches.find((b) => String(b.id) === selectedExportBranchId);
                if (br) {
                    const clean = br.name.trim().replace(/[^a-zA-Z0-9]/g, '_');
                    fallbackFilename = `Data-Siswa-Cabang-${clean}-${dateStr}.xlsx`;
                }
            }

            const url = params.toString()
                ? `/students/export?${params.toString()}`
                : '/students/export';
            const response = await http.get(url, { responseType: 'blob' });

            let filename = fallbackFilename;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }

            const blobUrl = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
            );
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            setIsExportDialogOpen(false);
            toast.add({
                title: 'Export Berhasil',
                type: 'success',
                description: `File Excel "${filename}" berhasil diunduh.`,
            });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Export', type: 'error', description: message });
        } finally {
            setIsExporting(false);
        }
    };

    // Download Template Excel
    const downloadTemplate = async () => {
        try {
            const response = await http.get('/students/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
            );
            const link = document.createElement('a');
            link.href = url;
            link.download = `Template-Import-Siswa.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.add({
                title: 'Template Diunduh',
                type: 'success',
                description: 'Format template Excel siap digunakan untuk import data siswa.',
            });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Unduh Template', type: 'error', description: message });
        }
    };

    // Handle Excel File Selection for Preview
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setImportFileName(file.name);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await http.post('/students/import/preview', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setPreviewData(response.data);
            setIsPreviewOpen(true);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Gagal Membaca Excel',
                type: 'error',
                description: message,
            });
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleOpenAssign = (studentItem?: any) => {
        setAssignTargetStudent(studentItem ?? null);
        setIsAssignOpen(true);
    };

    // Unique filter options extracted from dataset
    const availableBranches = useMemo(() => {
        const set = new Set<string>();
        students.forEach((s) => {
            if (s.branch_name) set.add(s.branch_name);
        });
        return Array.from(set).sort();
    }, [students]);

    const availableLevels = useMemo(() => {
        const set = new Set<string>();
        students.forEach((s) => {
            if (s.school_level) set.add(s.school_level);
        });
        return Array.from(set).sort();
    }, [students]);

    // Metrics calculations
    const metrics = useMemo(() => {
        const total = students.length;
        const active = students.filter((s) => s.program_status === 'ACTIVE').length;
        const leave = students.filter((s) => s.program_status === 'ON_LEAVE').length;
        const unassigned = students.filter((s) => !s.branch_name && !s.program_name).length;
        const inactive = students.filter((s) => s.program_status === 'INACTIVE').length;
        return { total, active, leave, unassigned, inactive };
    }, [students]);

    // Filtering logic
    const filtered = useMemo(() => {
        return students.filter((student) => {
            // Text search
            if (search) {
                const keyword = search.toLowerCase();
                const matched = [
                    student.full_name,
                    student.guardian_name,
                    student.guardian_phone_number,
                    student.branch_name,
                    student.program_name,
                    student.level_name,
                    student.school_level,
                    student.place_birth,
                    student.instagram,
                ]
                    .filter(Boolean)
                    .some((value: string) => String(value).toLowerCase().includes(keyword));
                if (!matched) return false;
            }

            // Status filter
            if (statusFilter !== 'ALL') {
                if (statusFilter === 'UNASSIGNED') {
                    if (student.branch_name || student.program_name) return false;
                } else if (student.program_status !== statusFilter) {
                    return false;
                }
            }

            // Branch filter
            if (branchFilter !== 'ALL') {
                if (student.branch_name !== branchFilter) return false;
            }

            // School level filter
            if (levelFilter !== 'ALL') {
                if (student.school_level !== levelFilter) return false;
            }

            return true;
        });
    }, [students, search, statusFilter, branchFilter, levelFilter]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, branchFilter, levelFilter, pageSize]);

    // Pagination slice
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    const paginatedStudents = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    const isFiltered =
        Boolean(search) ||
        statusFilter !== 'ALL' ||
        branchFilter !== 'ALL' ||
        levelFilter !== 'ALL';

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('ALL');
        setBranchFilter('ALL');
        setLevelFilter('ALL');
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Icon icon="mdi:account-school" className="text-primary size-7" />
                        Manajemen Siswa
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Kelola data induk siswa, penugasan cabang, status keaktifan, dan program
                        belajar bimbingan.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Template Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs text-muted-foreground hover:text-foreground"
                        onClick={downloadTemplate}
                        title="Download Template Format Excel"
                    >
                        <Icon
                            icon="mdi:file-download-outline"
                            className="text-base mr-1 text-emerald-600"
                        />
                        Template Excel
                    </Button>

                    {/* Export Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        onClick={() => setIsExportDialogOpen(true)}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Icon icon="mdi:loading" className="animate-spin text-base" />
                        ) : (
                            <Icon
                                icon="mdi:microsoft-excel"
                                className="text-base text-emerald-600"
                            />
                        )}
                        Export Excel
                    </Button>

                    {/* Hidden Input for Import Excel */}
                    <input
                        ref={importInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {/* Import Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5"
                        onClick={() => importInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Icon icon="mdi:loading" className="animate-spin text-base" />
                        ) : (
                            <Icon icon="mdi:file-upload" className="text-base text-blue-600" />
                        )}
                        Import Excel
                    </Button>

                    {/* Assign Program Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                        onClick={() => handleOpenAssign()}
                    >
                        <Icon icon="mdi:account-arrow-right" className="text-base" />
                        Assign Program & Cabang
                    </Button>

                    {/* Add Student Button */}
                    <Button
                        size="sm"
                        className="h-9 text-xs gap-1.5 shadow-sm"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Icon icon="mdi:account-plus" className="text-base" /> Tambah Siswa
                    </Button>
                </div>
            </div>

            {/* Interactive Stat / Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Total Siswa */}
                <Card
                    onClick={() => setStatusFilter('ALL')}
                    className={`cursor-pointer transition-all hover:border-primary/50 py-3 px-4 rounded-sm border ${
                        statusFilter === 'ALL'
                            ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                            : 'bg-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Total Siswa
                        </span>
                        <span className="size-7 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                            <Icon icon="mdi:account-group" className="size-4" />
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-foreground">{metrics.total}</div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Semua data siswa terdaftar
                    </p>
                </Card>

                {/* Siswa Aktif */}
                <Card
                    onClick={() => setStatusFilter('ACTIVE')}
                    className={`cursor-pointer transition-all hover:border-emerald-500/50 py-3 px-4 rounded-sm border ${
                        statusFilter === 'ACTIVE'
                            ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-500/5'
                            : 'bg-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Siswa Aktif
                        </span>
                        <span className="size-7 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Icon icon="mdi:check-circle" className="size-4" />
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {metrics.active}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Sedang aktif mengikuti sesi
                    </p>
                </Card>

                {/* Siswa Cuti */}
                <Card
                    onClick={() => setStatusFilter('ON_LEAVE')}
                    className={`cursor-pointer transition-all hover:border-amber-500/50 py-3 px-4 rounded-sm border ${
                        statusFilter === 'ON_LEAVE'
                            ? 'border-amber-500 ring-1 ring-amber-500/20 bg-amber-500/5'
                            : 'bg-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                            Siswa Cuti
                        </span>
                        <span className="size-7 rounded-sm bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Icon icon="mdi:pause-circle" className="size-4" />
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {metrics.leave}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Sedang dalam periode cuti
                    </p>
                </Card>

                {/* Belum Di-assign */}
                <Card
                    onClick={() => setStatusFilter('UNASSIGNED')}
                    className={`cursor-pointer transition-all hover:border-border py-3 px-4 rounded-sm border ${
                        statusFilter === 'UNASSIGNED'
                            ? 'border-muted-foreground ring-1 ring-muted/40 bg-muted/30'
                            : 'bg-card'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            Belum Assign
                        </span>
                        <span className="size-7 rounded-sm bg-muted flex items-center justify-center text-muted-foreground">
                            <Icon icon="mdi:account-question" className="size-4" />
                        </span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-foreground">
                        {metrics.unassigned}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Perlu didaftarkan ke cabang/program
                    </p>
                </Card>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-3 rounded-sm border bg-card p-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Icon
                            icon="mdi:magnify"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg"
                        />
                        <Input
                            placeholder="Cari nama, wali, kontak, cabang, program..."
                            className="h-9.5 pl-9 text-xs"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                                title="Hapus pencarian"
                            >
                                <Icon icon="mdi:close-circle" className="size-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                                Status:
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-sm border border-input bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                            >
                                <option value="ALL">Semua Status</option>
                                <option value="ACTIVE">● Aktif</option>
                                <option value="ON_LEAVE">⏸ Cuti</option>
                                <option value="INACTIVE">⏹ Non Aktif</option>
                                <option value="UNASSIGNED">Belum Assign</option>
                            </select>
                        </div>

                        {/* Branch Filter */}
                        {availableBranches.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                                    Cabang:
                                </span>
                                <select
                                    value={branchFilter}
                                    onChange={(e) => setBranchFilter(e.target.value)}
                                    className="h-9 rounded-sm border border-input bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                                >
                                    <option value="ALL">Semua Cabang</option>
                                    {availableBranches.map((br) => (
                                        <option key={br} value={br}>
                                            {br}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Level Filter */}
                        {availableLevels.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
                                    Jenjang:
                                </span>
                                <select
                                    value={levelFilter}
                                    onChange={(e) => setLevelFilter(e.target.value)}
                                    className="h-9 rounded-sm border border-input bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                                >
                                    <option value="ALL">Semua Jenjang</option>
                                    {availableLevels.map((lvl) => (
                                        <option key={lvl} value={lvl}>
                                            {lvl}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Reset Filter Button */}
                        {isFiltered && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={resetFilters}
                                className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1 px-2.5"
                            >
                                <Icon icon="mdi:filter-remove" className="size-3.5" />
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter info indicator */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <div>
                        Menampilkan{' '}
                        <strong className="text-foreground font-semibold">{filtered.length}</strong>{' '}
                        dari {students.length} siswa
                        {isFiltered && (
                            <span className="ml-1.5 text-primary">
                                (Filter aktif:{' '}
                                {[
                                    search && `Cari "${search}"`,
                                    statusFilter !== 'ALL' && `Status ${statusFilter}`,
                                    branchFilter !== 'ALL' && `Cabang ${branchFilter}`,
                                    levelFilter !== 'ALL' && `Jenjang ${levelFilter}`,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                                )
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span>Baris:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="rounded border border-input bg-card px-1.5 py-0.5 text-[11px]"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Students Table with Improved Responsive Layout */}
            <div className="overflow-hidden rounded-sm border border-border/80 bg-card shadow-xs">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 border-b">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="min-w-[220px] py-3 text-xs font-bold text-foreground">
                                    Siswa & Biodata
                                </TableHead>
                                <TableHead className="w-24 text-center text-xs font-bold text-foreground">
                                    Jenjang
                                </TableHead>
                                <TableHead className="min-w-[260px] py-3 text-xs font-bold text-foreground">
                                    Cabang, Program & Status
                                </TableHead>
                                <TableHead className="min-w-[190px] py-3 text-xs font-bold text-foreground">
                                    Wali & Kontak
                                </TableHead>
                                <TableHead className="min-w-[160px] py-3 text-xs font-bold text-foreground">
                                    Sosial & Info
                                </TableHead>
                                <TableHead className="w-36 text-center text-xs font-bold text-foreground">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-12 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Icon
                                                icon="mdi:loading"
                                                className="size-6 animate-spin text-primary"
                                            />
                                            <span className="text-xs">Memuat data siswa...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-12 text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                            <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60">
                                                <Icon
                                                    icon="mdi:account-search"
                                                    className="size-6"
                                                />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground">
                                                Tidak Ada Data Siswa
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                                {isFiltered
                                                    ? 'Tidak ada siswa yang sesuai dengan filter pencarian Anda.'
                                                    : 'Belum ada data siswa terdaftar di sistem.'}
                                            </p>
                                            {isFiltered ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                    className="text-xs mt-1"
                                                >
                                                    Reset Filter
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => setIsCreateOpen(true)}
                                                    className="text-xs mt-1 gap-1.5"
                                                >
                                                    <Icon
                                                        icon="mdi:account-plus"
                                                        className="size-4"
                                                    />
                                                    Tambah Siswa Pertama
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student) => {
                                    const hasProgram = Boolean(
                                        student.branch_name || student.program_name,
                                    );
                                    const waLink = formatWaLink(student.guardian_phone_number);

                                    return (
                                        <TableRow
                                            key={student.id}
                                            className="transition-colors hover:bg-muted/40 group"
                                        >
                                            {/* Column 1: Student Identity & Avatar */}
                                            <TableCell className="py-3">
                                                <div className="flex items-start gap-2.5">
                                                    {/* Avatar Icon */}
                                                    <div
                                                        className={`size-9 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold shadow-2xs ${getAvatarColor(
                                                            student.full_name,
                                                        )}`}
                                                    >
                                                        {getInitials(student.full_name)}
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setQuickViewStudent(student)
                                                                }
                                                                className="text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors text-left"
                                                                title="Klik untuk melihat detail lengkap siswa"
                                                            >
                                                                {student.full_name}
                                                            </button>
                                                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                                                                #{student.id}
                                                            </span>
                                                        </div>

                                                        {/* Place & Birth date */}
                                                        {student.place_birth ||
                                                        student.birth_date ? (
                                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                <Icon
                                                                    icon="mdi:calendar-account"
                                                                    className="size-3.5 shrink-0 opacity-70"
                                                                />
                                                                <span>
                                                                    {student.place_birth || ''}
                                                                    {student.place_birth &&
                                                                    student.birth_date
                                                                        ? ', '
                                                                        : ''}
                                                                    {student.birth_date
                                                                        ? formatDate(
                                                                              student.birth_date,
                                                                          )
                                                                        : ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-[11px] text-muted-foreground/60 italic">
                                                                Data lahir belum diisi
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Column 2: School Level */}
                                            <TableCell className="text-center py-3">
                                                {student.school_level ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs font-semibold px-2 py-0.5"
                                                    >
                                                        {student.school_level}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/60">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Column 3: Branch, Program & Status (Redesigned & Organized) */}
                                            <TableCell className="py-3">
                                                {hasProgram ? (
                                                    <div className="space-y-1.5">
                                                        {/* Top Row: Branch & Status Badges */}
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs font-medium bg-background gap-1 py-0.5"
                                                            >
                                                                <Icon
                                                                    icon="mdi:office-building"
                                                                    className="text-xs text-primary"
                                                                />
                                                                {student.branch_name || 'Cabang'}
                                                            </Badge>

                                                            {student.program_status && (
                                                                <Badge
                                                                    variant={
                                                                        student.program_status ===
                                                                        'ACTIVE'
                                                                            ? 'success'
                                                                            : student.program_status ===
                                                                                'ON_LEAVE'
                                                                              ? 'warning'
                                                                              : student.program_status ===
                                                                                  'INACTIVE'
                                                                                ? 'destructive'
                                                                                : student.program_status ===
                                                                                    'TRIAL'
                                                                                  ? 'info'
                                                                                  : 'secondary'
                                                                    }
                                                                    className="text-[10px] px-1.5 py-0.5 font-bold"
                                                                >
                                                                    {student.program_status ===
                                                                    'ACTIVE'
                                                                        ? '● Aktif'
                                                                        : student.program_status ===
                                                                            'ON_LEAVE'
                                                                          ? '⏸ Cuti'
                                                                          : student.program_status ===
                                                                              'INACTIVE'
                                                                            ? '⏹ Non Aktif'
                                                                            : student.program_status ===
                                                                                'TRIAL'
                                                                              ? 'Trial'
                                                                              : student.program_status}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* Middle Row: Program Name & Level */}
                                                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                                                            <div className="font-semibold text-primary flex items-center gap-1">
                                                                <Icon
                                                                    icon="mdi:book-open-variant"
                                                                    className="text-xs text-primary"
                                                                />
                                                                <span>
                                                                    {student.program_name ||
                                                                        'Program'}
                                                                </span>
                                                                {student.level_name && (
                                                                    <span className="text-muted-foreground font-normal">
                                                                        • {student.level_name}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {Number(student.total_programs) > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setProgramStudent(student)
                                                                    }
                                                                    className="text-[10px] font-semibold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                                                                    title="Klik untuk melihat seluruh program yang diambil siswa"
                                                                >
                                                                    +
                                                                    {Number(
                                                                        student.total_programs,
                                                                    ) - 1}{' '}
                                                                    Program Lain
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Bottom Row: Metadata (Dates & Leave notice) */}
                                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap pt-0.5">
                                                            {student.started_at && (
                                                                <span>
                                                                    Mulai:{' '}
                                                                    <strong>
                                                                        {formatDate(
                                                                            student.started_at,
                                                                        )}
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {student.program_status ===
                                                                'ON_LEAVE' &&
                                                                student.leave_until && (
                                                                    <span className="text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded">
                                                                        Cuti s.d.{' '}
                                                                        {formatDate(
                                                                            student.leave_until,
                                                                        )}
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground italic bg-muted/50 px-2 py-1 rounded border border-dashed border-border">
                                                            Belum di-assign
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleOpenAssign(student)
                                                            }
                                                            className="h-6 text-[10px] px-2 text-primary border-primary/40"
                                                        >
                                                            Assign Sekarang
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Column 4: Guardian & Contact */}
                                            <TableCell className="py-3">
                                                <div className="space-y-1">
                                                    <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                        <Icon
                                                            icon="mdi:account-heart"
                                                            className="size-3.5 text-muted-foreground"
                                                        />
                                                        <span>
                                                            {student.guardian_name &&
                                                            student.guardian_name !== '-'
                                                                ? student.guardian_name
                                                                : 'Wali Belum Diisi'}
                                                        </span>
                                                    </div>

                                                    {student.guardian_phone_number &&
                                                    student.guardian_phone_number !== '-' ? (
                                                        waLink ? (
                                                            <a
                                                                href={waLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                                                                title="Hubungi wali melalui WhatsApp"
                                                            >
                                                                <Icon
                                                                    icon="mdi:whatsapp"
                                                                    className="size-3.5 text-emerald-600 dark:text-emerald-400"
                                                                />
                                                                <span>
                                                                    {student.guardian_phone_number}
                                                                </span>
                                                            </a>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                                <Icon
                                                                    icon="mdi:phone"
                                                                    className="size-3.5"
                                                                />
                                                                <span>
                                                                    {student.guardian_phone_number}
                                                                </span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <span className="text-[11px] text-muted-foreground/60">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Column 5: Social & Information Source */}
                                            <TableCell className="py-3">
                                                <div className="space-y-1 text-xs">
                                                    {student.instagram &&
                                                    student.instagram !== '-' ? (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Icon
                                                                icon="mdi:instagram"
                                                                className="size-3.5 text-pink-600"
                                                            />
                                                            <span className="font-mono text-[11px]">
                                                                {student.instagram.startsWith('@')
                                                                    ? student.instagram
                                                                    : `@${student.instagram}`}
                                                            </span>
                                                        </div>
                                                    ) : null}

                                                    {student.information_source &&
                                                    student.information_source !== '-' ? (
                                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                            <Icon
                                                                icon="mdi:bullhorn-outline"
                                                                className="size-3 text-muted-foreground/70"
                                                            />
                                                            <span className="bg-muted px-1.5 py-0.2 rounded font-medium">
                                                                {student.information_source}
                                                            </span>
                                                        </div>
                                                    ) : null}

                                                    {(!student.instagram ||
                                                        student.instagram === '-') &&
                                                        (!student.information_source ||
                                                            student.information_source === '-') && (
                                                            <span className="text-muted-foreground/60 text-xs">
                                                                -
                                                            </span>
                                                        )}
                                                </div>
                                            </TableCell>

                                            {/* Column 6: Structured Action Buttons */}
                                            <TableCell className="py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Quick View Details Button */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        title="Lihat Detail Lengkap Siswa"
                                                        onClick={() => setQuickViewStudent(student)}
                                                    >
                                                        <Icon
                                                            icon="mdi:eye-outline"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Assign Program & Branch */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-primary hover:bg-primary/10"
                                                        title="Assign ke Cabang, Pelajaran & Level"
                                                        onClick={() => handleOpenAssign(student)}
                                                    >
                                                        <Icon
                                                            icon="mdi:account-arrow-right"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Status History & Switcher */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-amber-600 hover:bg-amber-500/10"
                                                        title="Riwayat Status & Keaktifan Siswa"
                                                        onClick={() => setHistoryStudent(student)}
                                                    >
                                                        <Icon
                                                            icon="mdi:account-clock-outline"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Export Excel per Student */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-emerald-600 hover:bg-emerald-500/10"
                                                        title="Export Excel Lengkap Siswa Ini (Data, Program, & Riwayat Keaktifan)"
                                                        disabled={isExporting}
                                                        onClick={() =>
                                                            handleExport({
                                                                studentId: student.id,
                                                                studentName: student.full_name,
                                                            })
                                                        }
                                                    >
                                                        <Icon
                                                            icon="mdi:file-excel-box-outline"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Manage Enrolled Programs */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        title="Kelola Semua Program yang Diambil"
                                                        onClick={() => setProgramStudent(student)}
                                                    >
                                                        <Icon
                                                            icon="mdi:book-education"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Edit Student */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-blue-600 hover:bg-blue-500/10"
                                                        title="Edit Data Siswa"
                                                        onClick={() => setEditStudent(student)}
                                                    >
                                                        <Icon
                                                            icon="mingcute:edit-line"
                                                            className="size-4"
                                                        />
                                                    </Button>

                                                    {/* Delete Student */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="size-8 text-destructive hover:bg-destructive/10"
                                                        title="Hapus Siswa"
                                                        onClick={() =>
                                                            setDeleteTargetStudent(student)
                                                        }
                                                    >
                                                        <Icon
                                                            icon="mdi:trash-can-outline"
                                                            className="size-4"
                                                        />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Table Footer / Pagination */}
                {filtered.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-muted/20 border-t border-border/80 text-xs text-muted-foreground">
                        <div>
                            Menampilkan{' '}
                            <strong>
                                {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}
                            </strong>{' '}
                            – <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong>{' '}
                            dari <strong>{filtered.length}</strong> siswa
                        </div>

                        <div className="flex items-center gap-1 self-end sm:self-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="h-8 text-xs px-2.5"
                            >
                                Sebelumnya
                            </Button>

                            <div className="px-2 text-xs font-semibold text-foreground">
                                Halaman {currentPage} dari {totalPages}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="h-8 text-xs px-2.5"
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* QUICK VIEW MODAL (Detail Lengkap Siswa) */}
            <Dialog
                open={Boolean(quickViewStudent)}
                onOpenChange={(open) => !open && setQuickViewStudent(null)}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between gap-2">
                            <span>DETAIL PROFIL SISWA</span>
                            <Badge variant="outline" className="font-mono text-xs">
                                #{quickViewStudent?.id}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription>
                            Informasi lengkap data diri, status akademik, dan kontak orang tua/wali.
                        </DialogDescription>
                    </DialogHeader>

                    {quickViewStudent && (
                        <div className="space-y-4 pt-2">
                            {/* Header Card */}
                            <div className="p-4 rounded-sm border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`size-12 rounded-full border flex items-center justify-center text-sm font-bold shadow-2xs ${getAvatarColor(
                                            quickViewStudent.full_name,
                                        )}`}
                                    >
                                        {getInitials(quickViewStudent.full_name)}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">
                                            {quickViewStudent.full_name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {quickViewStudent.school_level || 'Jenjang -'}
                                            </Badge>
                                            <span>•</span>
                                            <span>
                                                {quickViewStudent.place_birth || ''}
                                                {quickViewStudent.birth_date
                                                    ? `, ${formatDate(quickViewStudent.birth_date)}`
                                                    : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs h-8"
                                        onClick={() => {
                                            const s = quickViewStudent;
                                            setQuickViewStudent(null);
                                            setEditStudent(s);
                                        }}
                                    >
                                        <Icon icon="mingcute:edit-line" className="size-3.5 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="text-xs h-8"
                                        onClick={() => {
                                            const s = quickViewStudent;
                                            setQuickViewStudent(null);
                                            handleOpenAssign(s);
                                        }}
                                    >
                                        <Icon
                                            icon="mdi:account-arrow-right"
                                            className="size-3.5 mr-1"
                                        />
                                        Assign
                                    </Button>
                                </div>
                            </div>

                            {/* Two Column Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {/* Academic & Enrollment Card */}
                                <div className="p-3.5 rounded-sm border space-y-2.5 bg-card">
                                    <h4 className="font-bold text-foreground flex items-center gap-1.5 pb-1 border-b">
                                        <Icon icon="mdi:school" className="text-primary size-4" />
                                        Status Akademik & Penugasan
                                    </h4>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Cabang Belajar:
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {quickViewStudent.branch_name || 'Belum Ditugaskan'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Program Utama:
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {quickViewStudent.program_name || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Tingkat / Level:
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {quickViewStudent.level_name || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Paket Belajar:
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {quickViewStudent.package_name || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5 items-center">
                                            <span className="text-muted-foreground">
                                                Status Keaktifan:
                                            </span>
                                            <Badge
                                                variant={
                                                    quickViewStudent.program_status === 'ACTIVE'
                                                        ? 'success'
                                                        : quickViewStudent.program_status ===
                                                            'ON_LEAVE'
                                                          ? 'warning'
                                                          : 'secondary'
                                                }
                                                className="text-[10px]"
                                            >
                                                {quickViewStudent.program_status ||
                                                    'Belum Ada Status'}
                                            </Badge>
                                        </div>

                                        {quickViewStudent.started_at && (
                                            <div className="flex justify-between py-0.5">
                                                <span className="text-muted-foreground">
                                                    Mulai Belajar:
                                                </span>
                                                <span className="font-medium text-foreground">
                                                    {formatDate(quickViewStudent.started_at)}
                                                </span>
                                            </div>
                                        )}

                                        {quickViewStudent.leave_until && (
                                            <div className="flex justify-between py-0.5 text-amber-600 dark:text-amber-400">
                                                <span>Cuti Sampai:</span>
                                                <span className="font-semibold">
                                                    {formatDate(quickViewStudent.leave_until)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between py-0.5 pt-1 border-t border-border/50 items-center">
                                            <span className="text-muted-foreground">
                                                Total Program Diambil:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const s = quickViewStudent;
                                                    setQuickViewStudent(null);
                                                    setProgramStudent(s);
                                                }}
                                                className="text-primary font-semibold hover:underline"
                                            >
                                                {quickViewStudent.total_programs || 1} Program
                                                (Kelola)
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal & Guardian Contact Card */}
                                <div className="p-3.5 rounded-sm border space-y-2.5 bg-card">
                                    <h4 className="font-bold text-foreground flex items-center gap-1.5 pb-1 border-b">
                                        <Icon
                                            icon="mdi:card-account-details"
                                            className="text-primary size-4"
                                        />
                                        Kontak Orang Tua & Wali
                                    </h4>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Nama Wali:
                                            </span>
                                            <span className="font-semibold text-foreground">
                                                {quickViewStudent.guardian_name || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5 items-center">
                                            <span className="text-muted-foreground">
                                                Nomor Telepon/WA:
                                            </span>
                                            {formatWaLink(
                                                quickViewStudent.guardian_phone_number,
                                            ) ? (
                                                <a
                                                    href={formatWaLink(
                                                        quickViewStudent.guardian_phone_number,
                                                    )!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                                                >
                                                    <Icon
                                                        icon="mdi:whatsapp"
                                                        className="size-3.5"
                                                    />
                                                    {quickViewStudent.guardian_phone_number}
                                                </a>
                                            ) : (
                                                <span className="font-medium text-foreground">
                                                    {quickViewStudent.guardian_phone_number || '-'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Nama Ayah:
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {quickViewStudent.father_name || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">Nama Ibu:</span>
                                            <span className="font-medium text-foreground">
                                                {quickViewStudent.mother_name || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Instagram:
                                            </span>
                                            <span className="font-mono text-muted-foreground">
                                                {quickViewStudent.instagram || '-'}
                                            </span>
                                        </div>

                                        <div className="flex justify-between py-0.5">
                                            <span className="text-muted-foreground">
                                                Sumber Info:
                                            </span>
                                            <span className="font-medium text-foreground">
                                                {quickViewStudent.information_source || '-'}
                                            </span>
                                        </div>

                                        <div className="py-0.5 pt-1 border-t border-border/50">
                                            <span className="text-muted-foreground block mb-0.5">
                                                Alamat:
                                            </span>
                                            <p className="text-foreground leading-relaxed">
                                                {quickViewStudent.address ||
                                                    'Alamat belum dilengkapi.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* CREATE STUDENT DIALOG */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>TAMBAH SISWA BARU</DialogTitle>
                        <DialogDescription>
                            Masukkan identitas siswa, jenjang sekolah, dan kontak orang tua/wali.
                        </DialogDescription>
                    </DialogHeader>
                    <StudentForm type="create" onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>

            {/* EDIT STUDENT DIALOG (Centralized instance) */}
            <Dialog
                open={Boolean(editStudent)}
                onOpenChange={(open) => !open && setEditStudent(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>EDIT DATA SISWA</DialogTitle>
                        <DialogDescription>
                            Perbarui identitas, jenjang, atau kontak orang tua siswa{' '}
                            {editStudent?.full_name}.
                        </DialogDescription>
                    </DialogHeader>
                    {editStudent && (
                        <StudentForm
                            type="update"
                            student={editStudent}
                            studentId={editStudent.id}
                            onSuccess={handleSuccess}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* MANAGE STUDENT ENROLLED PROGRAMS DIALOG */}
            <Dialog
                open={Boolean(programStudent)}
                onOpenChange={(open) => !open && setProgramStudent(null)}
            >
                <DialogContent className="sm:max-w-4xl lg:max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>PROGRAM & KELAS SISWA</DialogTitle>
                        <DialogDescription>
                            Kelola seluruh riwayat program yang diambil oleh{' '}
                            {programStudent?.full_name}.
                        </DialogDescription>
                    </DialogHeader>
                    {programStudent && (
                        <StudentProgramsList
                            studentId={programStudent.id}
                            student={programStudent}
                            onChanged={getStudents}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* DELETE STUDENT CONFIRMATION DIALOG */}
            <AlertDialog
                open={Boolean(deleteTargetStudent)}
                onOpenChange={(open) => !open && setDeleteTargetStudent(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>KONFIRMASI HAPUS SISWA</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus data siswa{' '}
                            <strong>{deleteTargetStudent?.full_name}</strong>? Tindakan ini tidak
                            dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTargetStudent(null)}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                deleteTargetStudent && deleteStudent(deleteTargetStudent.id)
                            }
                            className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                            Ya, Hapus Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* EXCEL IMPORT PREVIEW DIALOG */}
            <StudentImportPreviewDialog
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                previewData={previewData}
                fileName={importFileName}
                onSuccess={handleSuccess}
                onDownloadTemplate={downloadTemplate}
            />

            {/* ASSIGN STUDENT PROGRAM & BRANCH DIALOG */}
            <StudentAssignDialog
                isOpen={isAssignOpen}
                onOpenChange={setIsAssignOpen}
                student={assignTargetStudent}
                allStudents={students}
                onSuccess={handleSuccess}
            />

            {/* STUDENT STATUS HISTORY & SWITCHER DIALOG */}
            <StudentStatusHistoryDialog
                isOpen={Boolean(historyStudent)}
                onOpenChange={(open) => !open && setHistoryStudent(null)}
                student={historyStudent}
                onStatusUpdated={getStudents}
            />

            {/* COMPREHENSIVE EXCEL EXPORT DIALOG */}
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Icon icon="mdi:microsoft-excel" className="size-5 text-emerald-600" />
                            EXPORT DATA SISWA KE EXCEL
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Pilih cakupan data yang ingin diexport. File Excel yang dihasilkan akan
                            berisi 3 lembar kerja (Data Siswa, Program yang Diikuti, dan Riwayat
                            Status Keaktifan lengkap).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Scope Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground">
                                Pilih Cakupan Export:
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setExportScope('ALL')}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded-sm border text-xs text-center transition-all ${
                                        exportScope === 'ALL'
                                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                                            : 'border-border hover:bg-muted/50 text-muted-foreground'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:earth"
                                        className="size-5 mb-1 text-emerald-600"
                                    />
                                    <span>Semua Data</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">
                                        Seluruh Cabang
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setExportScope('BRANCH')}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded-sm border text-xs text-center transition-all ${
                                        exportScope === 'BRANCH'
                                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                                            : 'border-border hover:bg-muted/50 text-muted-foreground'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:office-building"
                                        className="size-5 mb-1 text-emerald-600"
                                    />
                                    <span>Per Cabang</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">
                                        Pilih Cabang
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setExportScope('STUDENT')}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded-sm border text-xs text-center transition-all ${
                                        exportScope === 'STUDENT'
                                            ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                                            : 'border-border hover:bg-muted/50 text-muted-foreground'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:account"
                                        className="size-5 mb-1 text-emerald-600"
                                    />
                                    <span>Per Siswa</span>
                                    <span className="text-[10px] font-normal text-muted-foreground">
                                        Pilih 1 Siswa
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Branch Selector if exportScope === 'BRANCH' */}
                        {exportScope === 'BRANCH' && (
                            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                                <label className="text-xs font-semibold text-foreground">
                                    Pilih Cabang:
                                </label>
                                <select
                                    value={selectedExportBranchId}
                                    onChange={(e) => setSelectedExportBranchId(e.target.value)}
                                    className="w-full h-9 rounded-sm border border-input bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                                >
                                    <option value="">-- Pilih Cabang --</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Student Selector if exportScope === 'STUDENT' */}
                        {exportScope === 'STUDENT' && (
                            <div className="space-y-1.5 animate-in fade-in-50 duration-200">
                                <label className="text-xs font-semibold text-foreground">
                                    Pilih Siswa:
                                </label>
                                <select
                                    value={selectedExportStudentId}
                                    onChange={(e) => setSelectedExportStudentId(e.target.value)}
                                    className="w-full h-9 rounded-sm border border-input bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                                >
                                    <option value="">-- Pilih Siswa --</option>
                                    {students.map((st) => (
                                        <option key={st.id} value={String(st.id)}>
                                            {st.full_name}{' '}
                                            {st.branch_name ? `(${st.branch_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Information box */}
                        <div className="p-3 rounded-sm bg-muted/40 border border-border/70 text-xs space-y-1 text-muted-foreground">
                            <div className="font-semibold text-foreground flex items-center gap-1.5 mb-1 text-[11px]">
                                <Icon
                                    icon="mdi:information-outline"
                                    className="size-4 text-emerald-600"
                                />
                                Lembar Kerja yang Dibuat di File Excel:
                            </div>
                            <p className="text-[11px] leading-relaxed">
                                📊 <strong>Data Siswa:</strong> Profil biodata siswa lengkap &
                                program terdaftar.
                                <br />
                                📚 <strong>Program Siswa:</strong> Rincian paket program, level,
                                durasi, total sesi & harga.
                                <br />
                                ⏱️ <strong>Riwayat Keaktifan:</strong> Catatan tanggal, alasan, dan
                                riwayat status keaktifan (Aktif, Cuti, Non Aktif).
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8.5 text-xs"
                            onClick={() => setIsExportDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="h-8.5 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                            disabled={
                                isExporting ||
                                (exportScope === 'BRANCH' && !selectedExportBranchId) ||
                                (exportScope === 'STUDENT' && !selectedExportStudentId)
                            }
                            onClick={() => handleExport()}
                        >
                            {isExporting ? (
                                <Icon icon="mdi:loading" className="size-3.5 animate-spin" />
                            ) : (
                                <Icon icon="mdi:file-download-outline" className="size-3.5" />
                            )}
                            Unduh File Excel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
