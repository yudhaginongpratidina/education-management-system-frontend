'use client';

// dependencies
import { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export interface PreviewRow {
    row_number: number;
    full_name: string;
    school_level?: string;
    place_birth?: string;
    birth_date?: string;
    address?: string;
    father_name?: string;
    mother_name?: string;
    guardian_name?: string;
    guardian_phone_number?: string;
    instagram?: string;
    information_source?: string;
    photos_of_children_may_be_posted: boolean;
    status: 'VALID' | 'INVALID' | 'DUPLICATE_NAME';
    errors: string[];
}

export interface PreviewResponse {
    success: boolean;
    total_rows: number;
    valid_rows: number;
    invalid_rows: number;
    data: PreviewRow[];
}

interface StudentImportPreviewDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    previewData: PreviewResponse | null;
    fileName?: string;
    onSuccess: () => void;
    onDownloadTemplate: () => void;
}

export default function StudentImportPreviewDialog({
    isOpen,
    onOpenChange,
    previewData,
    fileName,
    onSuccess,
    onDownloadTemplate,
}: StudentImportPreviewDialogProps) {
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default select all valid rows whenever previewData changes
    useEffect(() => {
        if (previewData && previewData.data) {
            const validIdxs = previewData.data
                .map((row, index) => (row.status === 'VALID' ? index : -1))
                .filter((idx) => idx !== -1);
            setSelectedIndexes(validIdxs);
        } else {
            setSelectedIndexes([]);
        }
    }, [previewData]);

    const rows = previewData?.data || [];
    const validCount = previewData?.valid_rows ?? 0;
    const invalidCount = previewData?.invalid_rows ?? 0;

    const toggleSelectRow = (index: number) => {
        setSelectedIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
        );
    };

    const toggleSelectAll = () => {
        if (selectedIndexes.length === rows.length) {
            setSelectedIndexes([]);
        } else {
            setSelectedIndexes(rows.map((_, i) => i));
        }
    };

    const handleConfirmImport = async () => {
        if (selectedIndexes.length === 0) {
            toast.add({
                title: 'Perhatian',
                type: 'error',
                description: 'Pilih minimal satu data siswa untuk diimpor.',
            });
            return;
        }

        const selectedRows = selectedIndexes.map((idx) => rows[idx]).filter(Boolean);

        setIsSubmitting(true);
        try {
            const payload = selectedRows.map((r) => ({
                full_name: r.full_name,
                school_level: r.school_level,
                place_birth: r.place_birth,
                birth_date: r.birth_date,
                address: r.address,
                father_name: r.father_name,
                mother_name: r.mother_name,
                guardian_name: r.guardian_name,
                guardian_phone_number: r.guardian_phone_number,
                instagram: r.instagram,
                information_source: r.information_source,
                photos_of_children_may_be_posted: r.photos_of_children_may_be_posted,
            }));

            const response = await http.post('/students/import', payload);
            toast.add({
                title: 'Import Berhasil',
                type: 'success',
                description:
                    response.data.message ??
                    `Berhasil mengimpor ${payload.length} data siswa ke database.`,
            });
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Gagal Import',
                type: 'error',
                description: message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <Icon icon="mdi:file-excel" className="text-emerald-600 text-2xl" />
                        Preview Import Data Siswa
                    </DialogTitle>
                    <DialogDescription>
                        {fileName ? (
                            <span>
                                File: <strong className="text-foreground">{fileName}</strong>.
                            </span>
                        ) : null}{' '}
                        Tinjau data di bawah ini sebelum mengonfirmasi penyimpanan ke sistem.
                    </DialogDescription>
                </DialogHeader>

                {/* Summary badges */}
                <div className="grid grid-cols-3 gap-3 my-2">
                    <div className="flex items-center justify-between rounded-sm border bg-muted/40 p-3">
                        <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground font-medium">Total Data</p>
                            <p className="text-xl font-bold">{previewData?.total_rows ?? 0}</p>
                        </div>
                        <Icon
                            icon="mdi:format-list-numbered"
                            className="text-2xl text-muted-foreground"
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-3 dark:bg-emerald-950/20">
                        <div className="space-y-0.5">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                Siap Diimpor
                            </p>
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                {validCount}
                            </p>
                        </div>
                        <Icon icon="mdi:check-circle" className="text-2xl text-emerald-600" />
                    </div>

                    <div className="flex items-center justify-between rounded-sm border border-amber-500/20 bg-amber-500/5 p-3 dark:bg-amber-950/20">
                        <div className="space-y-0.5">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Bermasalah / Duplikat
                            </p>
                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                {invalidCount}
                            </p>
                        </div>
                        <Icon icon="mdi:alert-circle" className="text-2xl text-amber-600" />
                    </div>
                </div>

                {/* Table container with scroll */}
                <div className="flex-1 overflow-auto rounded-sm border min-h-[260px] max-h-[380px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background z-10 shadow-xs">
                            <TableRow>
                                <TableHead className="w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={
                                            rows.length > 0 &&
                                            selectedIndexes.length === rows.length
                                        }
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded-sm border-gray-300 cursor-pointer"
                                        title="Pilih Semua"
                                    />
                                </TableHead>
                                <TableHead className="w-16">Baris</TableHead>
                                <TableHead className="w-32">Status</TableHead>
                                <TableHead className="min-w-[180px]">Nama Lengkap</TableHead>
                                <TableHead className="w-24">Jenjang</TableHead>
                                <TableHead className="min-w-[150px]">TTL</TableHead>
                                <TableHead className="min-w-[160px]">Wali & Kontak</TableHead>
                                <TableHead className="min-w-[160px]">Alamat</TableHead>
                                <TableHead className="w-24">Izin Foto</TableHead>
                                <TableHead className="min-w-[180px]">Keterangan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={10}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        Tidak ada data yang terbaca dari file Excel.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row, idx) => {
                                    const isSelected = selectedIndexes.includes(idx);
                                    const isValid = row.status === 'VALID';
                                    const isDuplicate = row.status === 'DUPLICATE_NAME';

                                    return (
                                        <TableRow
                                            key={idx}
                                            className={
                                                !isValid
                                                    ? 'bg-amber-500/5 dark:bg-amber-950/10'
                                                    : undefined
                                            }
                                        >
                                            <TableCell className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectRow(idx)}
                                                    className="h-4 w-4 rounded-sm border-gray-300 cursor-pointer"
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                #{row.row_number}
                                            </TableCell>
                                            <TableCell>
                                                {isValid ? (
                                                    <Badge variant="success" className="gap-1">
                                                        <Icon icon="mdi:check" /> Valid
                                                    </Badge>
                                                ) : isDuplicate ? (
                                                    <Badge variant="warning" className="gap-1">
                                                        <Icon icon="mdi:alert" /> Duplikat
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <Icon icon="mdi:close" /> Error
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {row.full_name || (
                                                    <span className="text-destructive">
                                                        (Kosong)
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{row.school_level || '-'}</TableCell>
                                            <TableCell className="text-xs">
                                                {row.place_birth || '-'}
                                                {row.birth_date ? `, ${row.birth_date}` : ''}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <div className="font-medium">
                                                    {row.guardian_name || '-'}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {row.guardian_phone_number || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="text-xs max-w-[200px] truncate"
                                                title={row.address}
                                            >
                                                {row.address || '-'}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {row.photos_of_children_may_be_posted ? (
                                                    <span className="text-emerald-600 font-medium text-xs">
                                                        Ya
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">
                                                        Tidak
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {row.errors.length > 0 ? (
                                                    <ul className="text-amber-600 dark:text-amber-400 list-disc list-inside space-y-0.5">
                                                        {row.errors.map((err, eIdx) => (
                                                            <li key={eIdx}>{err}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <span className="text-emerald-600 text-xs">
                                                        Siap disimpan
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DialogFooter className="mt-4 flex sm:justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onDownloadTemplate}
                            className="text-muted-foreground hover:text-foreground text-xs"
                        >
                            <Icon icon="mdi:file-download-outline" className="mr-1 text-base" />
                            Download Format Template
                        </Button>
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
                            type="button"
                            onClick={handleConfirmImport}
                            disabled={selectedIndexes.length === 0 || isSubmitting}
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Icon icon="mdi:loading" className="animate-spin" />{' '}
                                    Mengimpor...
                                </>
                            ) : (
                                <>
                                    <Icon icon="mdi:check-all" />
                                    Konfirmasi Import ({selectedIndexes.length} Siswa)
                                </>
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
