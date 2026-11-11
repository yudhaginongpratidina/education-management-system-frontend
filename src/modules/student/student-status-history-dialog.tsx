'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatDate, extractList } from '@/lib/ems-constants';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';

interface StudentStatusHistoryDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    student: any | null;
    onStatusUpdated: () => void;
}

export interface StatusHistoryItem {
    id: number;
    student_id: number;
    student_program_id?: number | null;
    status:
        | 'ACTIVE'
        | 'ON_LEAVE'
        | 'INACTIVE'
        | 'PENDING'
        | 'TRIAL'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'EXPIRED';
    start_date: string;
    end_date?: string | null;
    reason?: string | null;
    change_type: 'MANUAL' | 'AUTOMATIC';
    notes?: string | null;
    created_at: string;
    branch_name?: string;
    program_name?: string;
    level_name?: string;
}

export default function StudentStatusHistoryDialog({
    isOpen,
    onOpenChange,
    student,
    onStatusUpdated,
}: StudentStatusHistoryDialogProps) {
    const [history, setHistory] = useState<StatusHistoryItem[]>([]);
    const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showChangeForm, setShowChangeForm] = useState(false);

    // Form states
    const [newStatus, setNewStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState('');
    const [lastActiveDate, setLastActiveDate] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [changeType, setChangeType] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const exportThisStudentExcel = async () => {
        if (!student?.id) return;
        setIsExporting(true);
        try {
            const dateStr = new Date().toISOString().slice(0, 10);
            const cleanName = (student.full_name || 'Siswa').trim().replace(/[^a-zA-Z0-9]/g, '_');
            let filename = `Data-Siswa-${cleanName}-${dateStr}.xlsx`;

            const response = await http.get(`/students/export?student_id=${student.id}`, {
                responseType: 'blob',
            });

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

            toast.add({
                title: 'Export Berhasil',
                type: 'success',
                description: `File Excel siswa ${student.full_name} berhasil diunduh.`,
            });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Export', type: 'error', description: message });
        } finally {
            setIsExporting(false);
        }
    };

    const loadHistory = async () => {
        if (!student?.id) return;
        setLoading(true);
        try {
            const response = await http.get(`/students/${student.id}/status-history`);
            if (response.data?.success) {
                setHistory(response.data.data || []);
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal memuat riwayat', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    const loadEnrolledPrograms = async () => {
        if (!student?.id) return;
        try {
            const res = await http.get(`/student-programs?student_id=${student.id}`);
            setEnrolledPrograms(extractList(res.data));
        } catch {
            setEnrolledPrograms([]);
        }
    };

    useEffect(() => {
        if (isOpen && student?.id) {
            loadHistory();
            loadEnrolledPrograms();
            setShowChangeForm(false);
            // Default form state based on current student status
            const curr = student.program_status || 'ACTIVE';
            if (curr === 'ACTIVE') {
                setNewStatus('ON_LEAVE');
            } else if (curr === 'ON_LEAVE') {
                setNewStatus('ACTIVE');
            } else {
                setNewStatus('ACTIVE');
            }
            setStartDate(new Date().toISOString().slice(0, 10));
            setEndDate('');
            setLastActiveDate(
                student.last_active_at ? String(student.last_active_at).slice(0, 10) : '',
            );
            setReason('');
            setNotes('');
            setChangeType('MANUAL');
        }
    }, [isOpen, student]);

    const handleStatusSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student?.id) return;

        setIsSubmitting(true);
        try {
            await http.post(`/students/${student.id}/status-history`, {
                status: newStatus,
                start_date: startDate,
                end_date: newStatus === 'ON_LEAVE' ? endDate || null : null,
                last_active_at: lastActiveDate || null,
                reason:
                    reason ||
                    (newStatus === 'ACTIVE'
                        ? 'Aktif Belajar'
                        : newStatus === 'ON_LEAVE'
                          ? 'Pengajuan Cuti'
                          : 'Non Aktif'),
                change_type: changeType,
                notes: notes || null,
            });

            toast.add({
                title: 'Status Berhasil Diperbarui',
                type: 'success',
                description: `Status siswa dan seluruh program pembelajaran (${enrolledPrograms.length > 0 ? `${enrolledPrograms.length} program` : 'semua program'}) berhasil diperbarui menjadi ${newStatus === 'ACTIVE' ? 'Aktif' : newStatus === 'ON_LEAVE' ? 'Cuti' : 'Non Aktif'}.`,
            });

            setShowChangeForm(false);
            loadHistory();
            loadEnrolledPrograms();
            onStatusUpdated();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menyimpan Status', type: 'error', description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteHistory = async (historyId: number) => {
        if (!student?.id) return;
        if (!confirm('Hapus baris catatan riwayat status ini?')) return;

        try {
            await http.delete(`/students/${student.id}/status-history/${historyId}`);
            toast.add({
                title: 'Riwayat Dihapus',
                type: 'info',
                description: 'Catatan status telah dihapus.',
            });
            loadHistory();
            onStatusUpdated();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menghapus', type: 'error', description: message });
        }
    };

    const currentStatus = student?.program_status || 'Belum di-assign';
    const isCurrentActive = currentStatus === 'ACTIVE';
    const isCurrentLeave = currentStatus === 'ON_LEAVE';
    const isCurrentInactive = currentStatus === 'INACTIVE';

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full min-w-4xl max-h-[90vh] flex flex-col p-6">
                <DialogHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                <Icon
                                    icon="mdi:account-clock-outline"
                                    className="text-primary text-2xl"
                                />
                                Riwayat Status & Keaktifan Siswa
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-1">
                                Pantau kronologi pendaftaran, masa cuti, aktivasi kembali, dan
                                riwayat non-aktif siswa.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">
                    {/* Student Info Card */}
                    <div className="rounded-sm border bg-muted/20 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <span className="text-xs text-muted-foreground block">
                                    Nama Siswa:
                                </span>
                                <h3 className="text-base font-bold text-foreground">
                                    {student?.full_name}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {student?.branch_name
                                        ? `Cabang: ${student.branch_name}`
                                        : 'Belum ada cabang'}
                                    {student?.program_name
                                        ? ` • Pelajaran: ${student.program_name}`
                                        : ''}
                                </span>
                            </div>

                            <div className="text-right">
                                <span className="text-xs text-muted-foreground block mb-1">
                                    Status Saat Ini:
                                </span>
                                {isCurrentActive && (
                                    <Badge
                                        variant="success"
                                        className="text-xs font-semibold px-2.5 py-0.5"
                                    >
                                        ● Aktif Belajar
                                    </Badge>
                                )}
                                {isCurrentLeave && (
                                    <Badge
                                        variant="warning"
                                        className="text-xs font-semibold px-2.5 py-0.5"
                                    >
                                        ⏸️ Sedang Cuti
                                    </Badge>
                                )}
                                {isCurrentInactive && (
                                    <Badge
                                        variant="destructive"
                                        className="text-xs font-semibold px-2.5 py-0.5"
                                    >
                                        ⏹️ Non Aktif
                                    </Badge>
                                )}
                                {!isCurrentActive && !isCurrentLeave && !isCurrentInactive && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-semibold px-2.5 py-0.5"
                                    >
                                        {currentStatus}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Dates snapshot */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border/50 text-xs">
                            <div>
                                <span className="text-muted-foreground block text-[11px]">
                                    Tanggal Mulai Belajar:
                                </span>
                                <span className="font-semibold text-foreground">
                                    {student?.started_at ? formatDate(student.started_at) : '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[11px]">
                                    Tanggal Terakhir Aktif:
                                </span>
                                <span className="font-semibold text-foreground">
                                    {student?.last_active_at
                                        ? formatDate(student.last_active_at)
                                        : '-'}
                                </span>
                            </div>
                            {isCurrentLeave && (
                                <div>
                                    <span className="text-warning block text-[11px] font-semibold">
                                        Cuti Sampai Dengan:
                                    </span>
                                    <span className="font-bold text-warning">
                                        {student?.leave_until
                                            ? formatDate(student.leave_until)
                                            : 'Tidak ditentukan'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Enrolled Programs List */}
                        {enrolledPrograms.length > 0 && (
                            <div className="pt-2 border-t border-border/50 space-y-1.5">
                                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                                    <Icon
                                        icon="mdi:book-multiple-outline"
                                        className="text-primary text-xs"
                                    />
                                    Program Pembelajaran yang Diikuti ({enrolledPrograms.length}):
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {enrolledPrograms.map((prog) => (
                                        <div
                                            key={prog.id}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-sm border bg-background text-xs shadow-xs"
                                        >
                                            <span className="font-semibold text-foreground">
                                                {prog.package_name ||
                                                    prog.program_package?.name ||
                                                    'Program'}
                                            </span>
                                            {(prog.level_name || prog.program_level?.name) && (
                                                <span className="text-muted-foreground text-[11px]">
                                                    • {prog.level_name || prog.program_level?.name}
                                                </span>
                                            )}
                                            <Badge
                                                variant={
                                                    prog.status === 'ACTIVE'
                                                        ? 'success'
                                                        : prog.status === 'ON_LEAVE'
                                                          ? 'warning'
                                                          : prog.status === 'INACTIVE'
                                                            ? 'destructive'
                                                            : prog.status === 'TRIAL'
                                                              ? 'info'
                                                              : 'outline'
                                                }
                                                className="text-[9px] px-1 py-0 ml-0.5"
                                            >
                                                {prog.status === 'ACTIVE'
                                                    ? 'Aktif'
                                                    : prog.status === 'ON_LEAVE'
                                                      ? 'Cuti'
                                                      : prog.status === 'INACTIVE'
                                                        ? 'Non Aktif'
                                                        : prog.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attendance integration notice */}
                        <div className="flex items-center gap-2 rounded-sm bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-muted-foreground">
                            <Icon
                                icon="mdi:calendar-check-outline"
                                className="size-4 text-primary shrink-0"
                            />
                            <span>
                                <strong className="text-foreground">Integrasi Presensi:</strong>{' '}
                                Kehadiran siswa pada sesi belajar akan otomatis memperbarui Tanggal
                                Terakhir Aktif, serta mengaktifkan kembali status seluruh program
                                siswa jika sedang Cuti atau Non Aktif.
                            </span>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <Icon
                                icon="mdi:timeline-clock-outline"
                                className="text-primary text-base"
                            />
                            Linimasa Riwayat Status ({history.length})
                        </h4>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs h-8 border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                                onClick={exportThisStudentExcel}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <Icon icon="mdi:loading" className="text-sm animate-spin" />
                                ) : (
                                    <Icon
                                        icon="mdi:microsoft-excel"
                                        className="text-sm text-emerald-600"
                                    />
                                )}
                                Export Excel Siswa
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant={showChangeForm ? 'secondary' : 'default'}
                                className="gap-1.5 text-xs h-8"
                                onClick={() => setShowChangeForm(!showChangeForm)}
                            >
                                <Icon
                                    icon={showChangeForm ? 'mdi:close' : 'mdi:account-edit-outline'}
                                    className="text-sm"
                                />
                                {showChangeForm ? 'Tutup Form' : 'Ubah Status Siswa'}
                            </Button>
                        </div>
                    </div>

                    {/* Change Status Form (Collapsible) */}
                    {showChangeForm && (
                        <form
                            onSubmit={handleStatusSubmit}
                            className="rounded-sm border-2 border-primary/30 bg-primary/5 p-4 space-y-4 animate-in fade-in-50 duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-primary flex items-center gap-1">
                                    <Icon icon="mdi:pencil" /> Form Perubahan Status Siswa
                                </span>
                                <div className="flex items-center gap-1 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => setChangeType('MANUAL')}
                                        className={`px-2 py-0.5 rounded-sm border ${
                                            changeType === 'MANUAL'
                                                ? 'bg-primary text-primary-foreground font-bold'
                                                : 'bg-background text-muted-foreground'
                                        }`}
                                    >
                                        Manual (Admin)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setChangeType('AUTOMATIC')}
                                        className={`px-2 py-0.5 rounded-sm border ${
                                            changeType === 'AUTOMATIC'
                                                ? 'bg-primary text-primary-foreground font-bold'
                                                : 'bg-background text-muted-foreground'
                                        }`}
                                    >
                                        Otomatis
                                    </button>
                                </div>
                            </div>

                            {/* Multi-program sync alert note */}
                            <div className="flex items-center gap-2 rounded-sm bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">
                                <Icon
                                    icon="mdi:sync"
                                    className="size-4 shrink-0 text-blue-600 dark:text-blue-400"
                                />
                                <span>
                                    <strong>Sinkronisasi ke Seluruh Program:</strong> Mengubah
                                    status ini akan otomatis memperbarui status pada seluruh program
                                    pembelajaran{' '}
                                    {enrolledPrograms.length > 0
                                        ? `(${enrolledPrograms.length} program)`
                                        : ''}{' '}
                                    yang diikuti siswa ini.
                                </span>
                            </div>

                            {/* Status Choice */}
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setNewStatus('ACTIVE')}
                                    className={`p-2.5 rounded-sm border text-center transition-all ${
                                        newStatus === 'ACTIVE'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                                            : 'border-border/60 bg-background hover:border-emerald-400'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:check-circle"
                                        className="text-lg mx-auto mb-1 text-emerald-600"
                                    />
                                    <span className="text-xs block">Aktif Belajar</span>
                                    <span className="text-[10px] text-muted-foreground font-normal block">
                                        Kembali aktif mengikuti kelas
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewStatus('ON_LEAVE');
                                        if (!endDate) {
                                            const d = new Date();
                                            d.setMonth(d.getMonth() + 1);
                                            setEndDate(d.toISOString().slice(0, 10));
                                        }
                                        if (!lastActiveDate) {
                                            setLastActiveDate(
                                                new Date().toISOString().slice(0, 10),
                                            );
                                        }
                                    }}
                                    className={`p-2.5 rounded-sm border text-center transition-all ${
                                        newStatus === 'ON_LEAVE'
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/20'
                                            : 'border-border/60 bg-background hover:border-amber-400'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:pause-circle"
                                        className="text-lg mx-auto mb-1 text-amber-600"
                                    />
                                    <span className="text-xs block">Ajukan Cuti</span>
                                    <span className="text-[10px] text-muted-foreground font-normal block">
                                        Izin sementara periode tertentu
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewStatus('INACTIVE');
                                        if (!lastActiveDate) {
                                            setLastActiveDate(
                                                new Date().toISOString().slice(0, 10),
                                            );
                                        }
                                    }}
                                    className={`p-2.5 rounded-sm border text-center transition-all ${
                                        newStatus === 'INACTIVE'
                                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold ring-2 ring-rose-500/20'
                                            : 'border-border/60 bg-background hover:border-rose-400'
                                    }`}
                                >
                                    <Icon
                                        icon="mdi:stop-circle"
                                        className="text-lg mx-auto mb-1 text-rose-600"
                                    />
                                    <span className="text-xs block">Non Aktif</span>
                                    <span className="text-[10px] text-muted-foreground font-normal block">
                                        Berhenti / sudah lulus
                                    </span>
                                </button>
                            </div>

                            {/* Date inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                <Field>
                                    <FieldLabel>
                                        Tanggal Mulai{' '}
                                        {newStatus === 'ACTIVE'
                                            ? 'Aktif'
                                            : newStatus === 'ON_LEAVE'
                                              ? 'Cuti'
                                              : 'Non Aktif'}{' '}
                                        *
                                    </FieldLabel>
                                    <Input
                                        type="date"
                                        className="h-9"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </Field>

                                {newStatus === 'ON_LEAVE' && (
                                    <Field>
                                        <FieldLabel className="text-amber-600 font-semibold">
                                            Cuti Sampai Kapan (Tanggal Selesai) *
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            className="h-9 border-amber-400 bg-amber-50/50"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                        />
                                    </Field>
                                )}

                                <Field>
                                    <FieldLabel>
                                        Tanggal Terakhir Aktif
                                        <span className="text-muted-foreground font-normal ml-1">
                                            {newStatus === 'ACTIVE'
                                                ? '(Opsional)'
                                                : '(Terakhir masuk)'}
                                        </span>
                                    </FieldLabel>
                                    <Input
                                        type="date"
                                        className="h-9"
                                        value={lastActiveDate}
                                        onChange={(e) => setLastActiveDate(e.target.value)}
                                    />
                                </Field>

                                <Field
                                    className={
                                        newStatus === 'ON_LEAVE'
                                            ? 'sm:col-span-2 lg:col-span-3'
                                            : 'sm:col-span-2 lg:col-span-1'
                                    }
                                >
                                    <FieldLabel>Alasan Perubahan Status</FieldLabel>
                                    <Input
                                        placeholder={
                                            newStatus === 'ACTIVE'
                                                ? 'Contoh: Selesai masa cuti, siap belajar kembali'
                                                : newStatus === 'ON_LEAVE'
                                                  ? 'Contoh: Sakit tipus, Ujian sekolah keluar kota'
                                                  : 'Contoh: Pindah domisili, Lulus, Mengundurkan diri'
                                        }
                                        className="h-9"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    />
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel>Catatan Tambahan (Opsional)</FieldLabel>
                                <Textarea
                                    rows={2}
                                    placeholder="Catatan dari wali murid atau kesepakatan bimbingan..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="text-xs"
                                />
                            </Field>

                            <div className="flex justify-end gap-2 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowChangeForm(false)}
                                    disabled={isSubmitting}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={isSubmitting}
                                    className="gap-1.5"
                                >
                                    {isSubmitting ? (
                                        <Icon
                                            icon="line-md:loading-loop"
                                            className="text-base animate-spin"
                                        />
                                    ) : (
                                        <Icon icon="mdi:check" className="text-base" />
                                    )}
                                    Simpan Perubahan Status
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Timeline List */}
                    {loading ? (
                        <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                            <Icon
                                icon="line-md:loading-loop"
                                className="text-lg text-primary animate-spin"
                            />
                            Memuat riwayat status...
                        </div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground border rounded-sm">
                            Belum ada riwayat tercatat untuk siswa ini.
                        </div>
                    ) : (
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                            {history.map((item, idx) => {
                                const isActive = item.status === 'ACTIVE';
                                const isLeave = item.status === 'ON_LEAVE';
                                const isInactive = item.status === 'INACTIVE';
                                const isTrial = item.status === 'TRIAL';

                                return (
                                    <div key={item.id} className="relative group">
                                        {/* Dot on line */}
                                        <span
                                            className={`absolute -left-6 top-1.5 size-4 rounded-full border-2 bg-background flex items-center justify-center ${
                                                isActive
                                                    ? 'border-emerald-500 text-emerald-500'
                                                    : isLeave
                                                      ? 'border-amber-500 text-amber-500'
                                                      : isInactive
                                                        ? 'border-rose-500 text-rose-500'
                                                        : 'border-blue-500 text-blue-500'
                                            }`}
                                        >
                                            <span
                                                className={`size-1.5 rounded-full ${
                                                    isActive
                                                        ? 'bg-emerald-500'
                                                        : isLeave
                                                          ? 'bg-amber-500'
                                                          : isInactive
                                                            ? 'bg-rose-500'
                                                            : 'bg-blue-500'
                                                }`}
                                            />
                                        </span>

                                        {/* Card content */}
                                        <div className="rounded-sm border bg-card p-3.5 space-y-2 hover:border-primary/40 transition-colors">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {isActive && (
                                                        <Badge
                                                            variant="success"
                                                            className="text-[11px] px-2 py-0.5 font-bold"
                                                        >
                                                            ● Aktif Belajar
                                                        </Badge>
                                                    )}
                                                    {isLeave && (
                                                        <Badge
                                                            variant="warning"
                                                            className="text-[11px] px-2 py-0.5 font-bold"
                                                        >
                                                            ⏸️ Cuti
                                                        </Badge>
                                                    )}
                                                    {isInactive && (
                                                        <Badge
                                                            variant="destructive"
                                                            className="text-[11px] px-2 py-0.5 font-bold"
                                                        >
                                                            ⏹️ Non Aktif
                                                        </Badge>
                                                    )}
                                                    {isTrial && (
                                                        <Badge
                                                            variant="info"
                                                            className="text-[11px] px-2 py-0.5 font-bold"
                                                        >
                                                            🔍 Trial
                                                        </Badge>
                                                    )}
                                                    {!isActive &&
                                                        !isLeave &&
                                                        !isInactive &&
                                                        !isTrial && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[11px] px-2 py-0.5"
                                                            >
                                                                {item.status}
                                                            </Badge>
                                                        )}

                                                    <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded-xs border">
                                                        {item.change_type === 'AUTOMATIC'
                                                            ? '⚡ Otomatis'
                                                            : '👤 Manual'}
                                                    </span>

                                                    {idx === 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] border-primary/40 text-primary"
                                                        >
                                                            Status Terakhir
                                                        </Badge>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteHistory(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-0.5"
                                                    title="Hapus entri riwayat ini"
                                                >
                                                    <Icon
                                                        icon="mdi:trash-can-outline"
                                                        className="text-sm"
                                                    />
                                                </button>
                                            </div>

                                            {/* Date details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                                                        <span>
                                                            Tanggal: {formatDate(item.start_date)}
                                                        </span>
                                                        {item.end_date && (
                                                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                                                                → Sampai:{' '}
                                                                {formatDate(item.end_date)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {item.reason && (
                                                        <div className="text-muted-foreground text-xs">
                                                            Alasan:{' '}
                                                            <strong className="text-foreground">
                                                                {item.reason}
                                                            </strong>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1.5">
                                                    {item.program_name && (
                                                        <div className="text-[11px] font-medium text-primary flex items-center gap-1">
                                                            <Icon
                                                                icon="mdi:book-open-variant"
                                                                className="text-xs"
                                                            />
                                                            <span>
                                                                Program: {item.program_name}{' '}
                                                                {item.level_name
                                                                    ? `• ${item.level_name}`
                                                                    : ''}{' '}
                                                                {item.branch_name
                                                                    ? `(${item.branch_name})`
                                                                    : ''}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {item.notes && (
                                                        <div className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded-sm border border-border/40">
                                                            "{item.notes}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
