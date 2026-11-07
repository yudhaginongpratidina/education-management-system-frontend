'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { Icon } from '@iconify/react';
import {
    Calendar as CalendarIcon,
    Clock,
    Plus,
    Search,
    Edit2,
    Trash2,
    RotateCcw,
    ShieldAlert,
    CheckCircle2,
    UserCheck,
    Filter,
} from 'lucide-react';

interface Teacher {
    id: number;
    full_name: string;
    slug: string;
    position?: string;
    phone_number?: string;
}

interface Branch {
    id: number;
    name: string;
    slug: string;
    address?: string;
}

interface AttendanceRecord {
    id: number;
    teacher_id: number;
    teacher_name?: string;
    teacher_slug?: string;
    branch_id: number;
    branch_name?: string;
    branch_slug?: string;
    status:
        'PRESENT' | 'ABSENT' | 'SICK' | 'LEAVE' | 'REMOTE' | 'OFFICIAL_DUTY' | 'HOLIDAY' | 'LATE';
    attendance_date: string;
    check_in_at?: string | null;
    check_in_photo?: string | null;
    check_out_at?: string | null;
    check_out_photo?: string | null;
    notes?: string | null;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; color: string; icon: string; badgeVariant?: string }
> = {
    PRESENT: {
        label: 'Hadir',
        color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        icon: 'mdi:check-circle-outline',
    },
    LATE: {
        label: 'Terlambat',
        color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        icon: 'mdi:clock-alert-outline',
    },
    SICK: {
        label: 'Sakit',
        color: 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30',
        icon: 'mdi:hospital-box-outline',
    },
    LEAVE: {
        label: 'Izin',
        color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
        icon: 'mdi:file-document-edit-outline',
    },
    REMOTE: {
        label: 'Remote (WFH)',
        color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
        icon: 'mdi:home-laptop',
    },
    OFFICIAL_DUTY: {
        label: 'Dinas Luar',
        color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
        icon: 'mdi:briefcase-outline',
    },
    HOLIDAY: {
        label: 'Libur',
        color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
        icon: 'mdi:calendar-star',
    },
    ABSENT: {
        label: 'Alpa / Tanpa Ket.',
        color: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
        icon: 'mdi:close-circle-outline',
    },
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const formatTimeFromIso = (isoStr?: string | null) => {
    if (!isoStr) return '-';
    try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) {
            // might be format "YYYY-MM-DD HH:MM:SS"
            const parts = isoStr.split(' ');
            return parts[1] ? parts[1].slice(0, 5) : isoStr;
        }
        return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return '-';
    }
};

export default function ManualAttendancePage() {
    const router = useRouter();

    // Authorization state
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    // Data lists
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete confirm dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form inputs
    const [formTeacherId, setFormTeacherId] = useState<string>('');
    const [formBranchId, setFormBranchId] = useState<string>('');
    const [formDate, setFormDate] = useState<string>(getTodayString());
    const [formStatus, setFormStatus] = useState<string>('PRESENT');
    const [formCheckInTime, setFormCheckInTime] = useState<string>('08:00');
    const [formCheckOutTime, setFormCheckOutTime] = useState<string>('17:00');
    const [formNotes, setFormNotes] = useState<string>('');
    const [formIsApproved, setFormIsApproved] = useState<boolean>(true);

    // Verify Superadmin Role on Client
    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'super-admin' || role === 'super admin') {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
            toast.add({
                title: 'Akses Dibatasi',
                type: 'error',
                description: 'Halaman ini hanya dapat diakses oleh Super Admin.',
            });
            setTimeout(() => {
                router.push('/dashboard');
            }, 1200);
        }
    }, [router]);

    // Fetch Teachers & Branches
    const fetchMasterData = useCallback(async () => {
        try {
            const [tRes, bRes] = await Promise.all([http.get('/teachers'), http.get('/branches')]);
            if (tRes.data?.data) setTeachers(tRes.data.data);
            if (bRes.data?.data) setBranches(bRes.data.data);
        } catch (err) {
            console.error('Failed to load master data:', err);
        }
    }, []);

    // Fetch Attendances
    const fetchAttendances = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: Record<string, any> = {};
            if (selectedDate) params.date = selectedDate;
            if (selectedBranch && selectedBranch !== 'all') params.branch_id = selectedBranch;
            if (selectedTeacher && selectedTeacher !== 'all') params.teacher_id = selectedTeacher;
            if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

            const res = await http.get('/manual-attendance', { params });
            if (res.data?.success && Array.isArray(res.data.data)) {
                setAttendances(res.data.data);
            } else {
                setAttendances([]);
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            console.error('Failed to fetch attendances:', message);
            setAttendances([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate, selectedBranch, selectedTeacher, selectedStatus]);

    useEffect(() => {
        if (isAuthorized) {
            fetchMasterData();
            fetchAttendances();
        }
    }, [isAuthorized, fetchMasterData, fetchAttendances]);

    // Open Create Dialog
    const handleOpenCreate = () => {
        setDialogMode('create');
        setEditingRecordId(null);
        setFormTeacherId(teachers[0]?.id ? String(teachers[0].id) : '');
        setFormBranchId(branches[0]?.id ? String(branches[0].id) : '');
        setFormDate(selectedDate || getTodayString());
        setFormStatus('PRESENT');
        setFormCheckInTime('08:00');
        setFormCheckOutTime('17:00');
        setFormNotes('');
        setFormIsApproved(true);
        setIsDialogOpen(true);
    };

    // Open Edit Dialog
    const handleOpenEdit = (rec: AttendanceRecord) => {
        setDialogMode('edit');
        setEditingRecordId(rec.id);
        setFormTeacherId(String(rec.teacher_id));
        setFormBranchId(String(rec.branch_id));
        setFormDate(rec.attendance_date.split('T')[0]);
        setFormStatus(rec.status);
        setFormCheckInTime(rec.check_in_at ? formatTimeFromIso(rec.check_in_at) : '');
        setFormCheckOutTime(rec.check_out_at ? formatTimeFromIso(rec.check_out_at) : '');
        setFormNotes(rec.notes || '');
        setFormIsApproved(rec.is_approved);
        setIsDialogOpen(true);
    };

    // Submit Form (Create / Edit)
    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formTeacherId || !formBranchId || !formDate || !formStatus) {
            toast.add({
                title: 'Data Belum Lengkap',
                type: 'error',
                description: 'Silakan pilih guru, cabang, tanggal, dan status kehadiran.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            // Build ISO timestamps for check-in / check-out
            let checkInIso: string | null = null;
            if (formCheckInTime && formCheckInTime.trim() !== '') {
                checkInIso = `${formDate}T${formCheckInTime}:00Z`;
            }

            let checkOutIso: string | null = null;
            if (formCheckOutTime && formCheckOutTime.trim() !== '') {
                checkOutIso = `${formDate}T${formCheckOutTime}:00Z`;
            }

            const payload = {
                teacher_id: Number(formTeacherId),
                branch_id: Number(formBranchId),
                attendance_date: formDate,
                status: formStatus,
                check_in_at: checkInIso,
                check_out_at: checkOutIso,
                notes: formNotes || null,
                is_approved: formIsApproved,
            };

            if (dialogMode === 'create') {
                await http.post('/manual-attendance', payload);
                toast.add({
                    title: 'Presensi Berhasil Dicatat',
                    type: 'success',
                    description: 'Data presensi manual telah berhasil disimpan ke database.',
                });
            } else if (editingRecordId) {
                await http.put(`/manual-attendance/${editingRecordId}`, payload);
                toast.add({
                    title: 'Presensi Berhasil Diperbarui',
                    type: 'success',
                    description: 'Perubahan presensi telah tersimpan.',
                });
            }

            setIsDialogOpen(false);
            fetchAttendances();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Gagal Menyimpan Presensi',
                type: 'error',
                description: message || 'Terjadi kesalahan sistem.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirm Delete
    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        setIsDeleting(true);
        try {
            await http.delete(`/manual-attendance/${recordToDelete.id}`);
            toast.add({
                title: 'Presensi Dihapus',
                type: 'success',
                description: 'Catatan presensi telah berhasil dihapus.',
            });
            setIsDeleteDialogOpen(false);
            setRecordToDelete(null);
            fetchAttendances();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Gagal Menghapus Presensi',
                type: 'error',
                description: message,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter search text
    const filteredRecords = useMemo(() => {
        if (!searchQuery.trim()) return attendances;
        const q = searchQuery.toLowerCase();
        return attendances.filter(
            (r) =>
                r.teacher_name?.toLowerCase().includes(q) ||
                r.branch_name?.toLowerCase().includes(q) ||
                r.notes?.toLowerCase().includes(q),
        );
    }, [attendances, searchQuery]);

    // Metric counts
    const metrics = useMemo(() => {
        const total = filteredRecords.length;
        const present = filteredRecords.filter((r) => r.status === 'PRESENT').length;
        const late = filteredRecords.filter((r) => r.status === 'LATE').length;
        const sickOrLeave = filteredRecords.filter(
            (r) =>
                r.status === 'SICK' ||
                r.status === 'LEAVE' ||
                r.status === 'OFFICIAL_DUTY' ||
                r.status === 'REMOTE',
        ).length;
        const absent = filteredRecords.filter((r) => r.status === 'ABSENT').length;
        return { total, present, late, sickOrLeave, absent };
    }, [filteredRecords]);

    // Unauthorized screen guard
    if (isAuthorized === false) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
                    <ShieldAlert className="size-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Akses Dibatasi</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Halaman Presensi Manual hanya diizinkan untuk akun dengan hak akses{' '}
                    <span className="font-semibold text-foreground">Super Admin</span>.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="text-[0.6875rem] font-semibold text-primary border-primary/30 bg-primary/5 uppercase tracking-wider"
                        >
                            Super Admin Only
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading mt-1">
                        Presensi Manual Guru & Staf
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Pencatatan, koreksi, dan pengesahan kehadiran staf pengajar tanpa batasan
                        geolokasi GPS atau swafoto.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchAttendances}
                        disabled={isLoading}
                        className="gap-1.5 text-xs"
                    >
                        <RotateCcw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        Segarkan
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleOpenCreate}
                        className="gap-1.5 text-xs bg-brand-gradient text-primary-foreground shadow-sm"
                    >
                        <Plus className="size-3.5" />
                        Catat Absen Manual
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Card className="rounded-sm border-border/70 p-3.5 flex items-center justify-between">
                    <div>
                        <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Total Presensi
                        </span>
                        <span className="text-xl font-bold text-foreground mt-0.5 block font-heading">
                            {metrics.total}
                        </span>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
                        <UserCheck className="size-4" />
                    </div>
                </Card>

                <Card className="rounded-sm border-border/70 p-3.5 flex items-center justify-between">
                    <div>
                        <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Hadir (Tepat)
                        </span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-heading">
                            {metrics.present}
                        </span>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="size-4" />
                    </div>
                </Card>

                <Card className="rounded-sm border-border/70 p-3.5 flex items-center justify-between">
                    <div>
                        <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Terlambat
                        </span>
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block font-heading">
                            {metrics.late}
                        </span>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-sm bg-amber-500/10 text-amber-600">
                        <Clock className="size-4" />
                    </div>
                </Card>

                <Card className="rounded-sm border-border/70 p-3.5 flex items-center justify-between">
                    <div>
                        <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Izin / Sakit / Dinas
                        </span>
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block font-heading">
                            {metrics.sickOrLeave}
                        </span>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-sm bg-blue-500/10 text-blue-600">
                        <Icon icon="mdi:calendar-account" className="size-4" />
                    </div>
                </Card>

                <Card className="rounded-sm border-border/70 p-3.5 flex items-center justify-between">
                    <div>
                        <span className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Alpa / Tanpa Ket.
                        </span>
                        <span className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 block font-heading">
                            {metrics.absent}
                        </span>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-sm bg-rose-500/10 text-rose-600">
                        <Icon icon="mdi:close-circle" className="size-4" />
                    </div>
                </Card>
            </div>

            {/* Filter Card */}
            <Card className="rounded-sm border-border/70">
                <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-primary" />
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Filter Data Presensi
                            </CardTitle>
                        </div>
                        {(selectedBranch !== 'all' ||
                            selectedTeacher !== 'all' ||
                            selectedStatus !== 'all' ||
                            searchQuery !== '') && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedBranch('all');
                                    setSelectedTeacher('all');
                                    setSelectedStatus('all');
                                    setSearchQuery('');
                                    setSelectedDate(getTodayString());
                                }}
                                className="h-6 text-[0.6875rem] text-muted-foreground hover:text-foreground"
                            >
                                Reset Filter
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
                        {/* Date Filter */}
                        <div className="space-y-1">
                            <label className="text-[0.6875rem] font-semibold text-muted-foreground">
                                Tanggal Presensi:
                            </label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="h-8 text-xs rounded-sm"
                            />
                        </div>

                        {/* Branch Filter */}
                        <div className="space-y-1">
                            <label className="text-[0.6875rem] font-semibold text-muted-foreground">
                                Cabang Bimbel:
                            </label>
                            <Select
                                value={selectedBranch}
                                onValueChange={(val) => setSelectedBranch(val || 'all')}
                            >
                                <SelectTrigger className="h-8 text-xs rounded-sm">
                                    <SelectValue placeholder="Semua Cabang">
                                        {selectedBranch === 'all'
                                            ? 'Semua Cabang'
                                            : branches.find((b) => String(b.id) === selectedBranch)
                                                  ?.name || 'Semua Cabang'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Cabang</SelectItem>
                                    {branches.map((b) => (
                                        <SelectItem key={b.id} value={String(b.id)}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Teacher Filter */}
                        <div className="space-y-1">
                            <label className="text-[0.6875rem] font-semibold text-muted-foreground">
                                Nama Guru:
                            </label>
                            <Select
                                value={selectedTeacher}
                                onValueChange={(val) => setSelectedTeacher(val || 'all')}
                            >
                                <SelectTrigger className="h-8 text-xs rounded-sm">
                                    <SelectValue placeholder="Semua Guru">
                                        {selectedTeacher === 'all'
                                            ? 'Semua Guru'
                                            : teachers.find((t) => String(t.id) === selectedTeacher)
                                                  ?.full_name || 'Semua Guru'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Guru</SelectItem>
                                    {teachers.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.full_name} {t.position ? `(${t.position})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-1">
                            <label className="text-[0.6875rem] font-semibold text-muted-foreground">
                                Status Kehadiran:
                            </label>
                            <Select
                                value={selectedStatus}
                                onValueChange={(val) => setSelectedStatus(val || 'all')}
                            >
                                <SelectTrigger className="h-8 text-xs rounded-sm">
                                    <SelectValue placeholder="Semua Status">
                                        {selectedStatus === 'all'
                                            ? 'Semua Status'
                                            : STATUS_CONFIG[selectedStatus]?.label ||
                                              'Semua Status'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                        <SelectItem key={key} value={key}>
                                            {cfg.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search keyword */}
                        <div className="space-y-1">
                            <label className="text-[0.6875rem] font-semibold text-muted-foreground">
                                Cari Guru / Catatan:
                            </label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-3 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Ketik kata kunci..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 pl-8 text-xs rounded-sm"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table Card */}
            <Card className="rounded-sm border-border/70 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="w-[120px] text-xs">Tanggal</TableHead>
                                <TableHead className="text-xs">Guru & Jabatan</TableHead>
                                <TableHead className="text-xs">Cabang</TableHead>
                                <TableHead className="text-xs">Jam Masuk - Pulang</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Keterangan / Catatan</TableHead>
                                <TableHead className="text-xs">Persetujuan</TableHead>
                                <TableHead className="w-[90px] text-right text-xs">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-36 text-center text-xs text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Icon
                                                icon="line-md:loading-loop"
                                                className="size-6 animate-spin text-primary"
                                            />
                                            <span>Memuat data presensi...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-36 text-center text-xs text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                            <CalendarIcon className="size-7 text-muted-foreground/60" />
                                            <span className="font-semibold text-foreground">
                                                Tidak Ada Catatan Presensi
                                            </span>
                                            <span className="text-[0.6875rem]">
                                                Belum ada data presensi untuk filter tanggal atau
                                                cabang yang dipilih.
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleOpenCreate}
                                                className="mt-2 text-xs"
                                            >
                                                <Plus className="size-3 mr-1" />
                                                Catat Presensi Sekarang
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRecords.map((rec) => {
                                    const statusCfg = STATUS_CONFIG[rec.status] || {
                                        label: rec.status,
                                        color: 'bg-muted text-foreground',
                                        icon: 'mdi:circle-outline',
                                    };

                                    return (
                                        <TableRow
                                            key={rec.id}
                                            className="text-xs hover:bg-muted/30"
                                        >
                                            {/* Date */}
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {rec.attendance_date
                                                    ? rec.attendance_date.split('T')[0]
                                                    : '-'}
                                            </TableCell>

                                            {/* Teacher */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">
                                                        {rec.teacher_name ||
                                                            `Guru #${rec.teacher_id}`}
                                                    </span>
                                                    {rec.teacher_slug && (
                                                        <span className="text-[0.6875rem] text-muted-foreground font-mono">
                                                            @{rec.teacher_slug}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Branch */}
                                            <TableCell className="whitespace-nowrap">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[0.6875rem] font-normal"
                                                >
                                                    {rec.branch_name || `Cabang #${rec.branch_id}`}
                                                </Badge>
                                            </TableCell>

                                            {/* Time in & out */}
                                            <TableCell className="whitespace-nowrap font-mono text-[0.6875rem]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                        {formatTimeFromIso(rec.check_in_at)}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        s/d
                                                    </span>
                                                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                        {formatTimeFromIso(rec.check_out_at)}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Status Badge */}
                                            <TableCell className="whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[0.6875rem] font-semibold rounded-sm border ${statusCfg.color}`}
                                                >
                                                    <Icon
                                                        icon={statusCfg.icon}
                                                        className="size-3.5"
                                                    />
                                                    {statusCfg.label}
                                                </span>
                                            </TableCell>

                                            {/* Notes */}
                                            <TableCell className="max-w-xs">
                                                <span
                                                    className="block truncate text-[0.6875rem] text-muted-foreground"
                                                    title={rec.notes || ''}
                                                >
                                                    {rec.notes || '-'}
                                                </span>
                                            </TableCell>

                                            {/* Approval */}
                                            <TableCell className="whitespace-nowrap">
                                                {rec.is_approved ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[0.625rem] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1"
                                                    >
                                                        <CheckCircle2 className="size-2.5" />
                                                        Disetujui
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[0.625rem] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1"
                                                    >
                                                        <Clock className="size-2.5" />
                                                        Menunggu
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Action Buttons */}
                                            <TableCell className="text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(rec)}
                                                        className="size-7 p-0 text-muted-foreground hover:text-foreground"
                                                        title="Koreksi Presensi"
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setRecordToDelete(rec);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                        className="size-7 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                                        title="Hapus Presensi"
                                                    >
                                                        <Trash2 className="size-3.5" />
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
            </Card>

            {/* Create / Edit Modal Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg rounded-sm">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold font-heading">
                            {dialogMode === 'create'
                                ? 'Catat Presensi Manual Baru'
                                : 'Koreksi Data Presensi'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Sebagai Super Admin, Anda memiliki wewenang penuh mencatat atau mengubah
                            absensi staf & guru.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
                        {/* Teacher & Branch selection */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Pilih Guru / Staf <span className="text-destructive">*</span>
                                </label>
                                <Select
                                    value={formTeacherId}
                                    onValueChange={(val) => setFormTeacherId(val || '')}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-sm">
                                        <SelectValue placeholder="Pilih guru...">
                                            {teachers.find((t) => String(t.id) === formTeacherId)
                                                ? `${teachers.find((t) => String(t.id) === formTeacherId)?.full_name}${
                                                      teachers.find(
                                                          (t) => String(t.id) === formTeacherId,
                                                      )?.position
                                                          ? ` — ${teachers.find((t) => String(t.id) === formTeacherId)?.position}`
                                                          : ''
                                                  }`
                                                : 'Pilih guru...'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.full_name} {t.position ? `— ${t.position}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Cabang Bimbel <span className="text-destructive">*</span>
                                </label>
                                <Select
                                    value={formBranchId}
                                    onValueChange={(val) => setFormBranchId(val || '')}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-sm">
                                        <SelectValue placeholder="Pilih cabang...">
                                            {branches.find((b) => String(b.id) === formBranchId)
                                                ?.name || 'Pilih cabang...'}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.id} value={String(b.id)}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Date & Status */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Tanggal Presensi <span className="text-destructive">*</span>
                                </label>
                                <Input
                                    type="date"
                                    required
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="h-9 text-xs rounded-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Status Kehadiran <span className="text-destructive">*</span>
                                </label>
                                <Select
                                    value={formStatus}
                                    onValueChange={(val) => setFormStatus(val || 'PRESENT')}
                                >
                                    <SelectTrigger className="h-9 text-xs rounded-sm">
                                        <SelectValue placeholder="Pilih status...">
                                            {STATUS_CONFIG[formStatus] ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Icon
                                                        icon={STATUS_CONFIG[formStatus].icon}
                                                        className="size-3.5"
                                                    />
                                                    <span>{STATUS_CONFIG[formStatus].label}</span>
                                                </div>
                                            ) : (
                                                'Pilih status...'
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                            <SelectItem key={key} value={key}>
                                                <div className="flex items-center gap-1.5">
                                                    <Icon icon={cfg.icon} className="size-3.5" />
                                                    <span>{cfg.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Times */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Jam Masuk (Check-in)
                                </label>
                                <Input
                                    type="time"
                                    value={formCheckInTime}
                                    onChange={(e) => setFormCheckInTime(e.target.value)}
                                    className="h-9 text-xs rounded-sm font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-foreground">
                                    Jam Pulang (Check-out)
                                </label>
                                <Input
                                    type="time"
                                    value={formCheckOutTime}
                                    onChange={(e) => setFormCheckOutTime(e.target.value)}
                                    className="h-9 text-xs rounded-sm font-mono"
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-foreground">
                                Catatan / Alasan Manual
                            </label>
                            <Textarea
                                rows={2}
                                placeholder="Contoh: Terkendala sinyal saat absen di kelas / Izin dinas luar sekolah..."
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                className="text-xs rounded-sm resize-none"
                            />
                        </div>

                        {/* Approval Toggle */}
                        <div className="flex items-center gap-2 p-3 border rounded-sm bg-muted/20">
                            <input
                                id="approve_checkbox"
                                type="checkbox"
                                checked={formIsApproved}
                                onChange={(e) => setFormIsApproved(e.target.checked)}
                                className="size-4 rounded-sm border-primary text-primary focus:ring-primary cursor-pointer"
                            />
                            <label
                                htmlFor="approve_checkbox"
                                className="text-xs font-medium cursor-pointer"
                            >
                                Sahkan otomatis status kehadiran ini (Approved by Super Admin)
                            </label>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isSubmitting}
                                className="text-xs rounded-sm"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                                className="text-xs rounded-sm bg-primary text-primary-foreground gap-1.5"
                            >
                                {isSubmitting && (
                                    <Icon
                                        icon="line-md:loading-loop"
                                        className="size-3.5 animate-spin"
                                    />
                                )}
                                {dialogMode === 'create' ? 'Simpan Presensi' : 'Perbarui Presensi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-sm max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-bold font-heading">
                            Hapus Catatan Presensi?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            Apakah Anda yakin ingin menghapus data presensi guru{' '}
                            <span className="font-semibold text-foreground">
                                {recordToDelete?.teacher_name}
                            </span>{' '}
                            pada tanggal{' '}
                            <span className="font-semibold text-foreground">
                                {recordToDelete?.attendance_date
                                    ? recordToDelete.attendance_date.split('T')[0]
                                    : ''}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel disabled={isDeleting} className="text-xs rounded-sm">
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="text-xs rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
