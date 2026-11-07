'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface BackupStatus {
    database: {
        databaseName: string;
        totalTables: number;
        totalRows: number;
        sizeBytes: number;
        sizeFormatted: string;
    };
    uploads: {
        totalFiles: number;
        sizeBytes: number;
        sizeFormatted: string;
    };
    timestamp: string;
}

export function BackupView() {
    const [status, setStatus] = useState<BackupStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

    // Database state
    const [isExportingDb, setIsExportingDb] = useState<boolean>(false);
    const [selectedSqlFile, setSelectedSqlFile] = useState<File | null>(null);
    const [isImportingDb, setIsImportingDb] = useState<boolean>(false);
    const [isDbConfirmOpen, setIsDbConfirmOpen] = useState<boolean>(false);
    const sqlInputRef = useRef<HTMLInputElement | null>(null);

    // Uploads state
    const [isExportingUploads, setIsExportingUploads] = useState<boolean>(false);
    const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
    const [isImportingUploads, setIsImportingUploads] = useState<boolean>(false);
    const [isUploadsConfirmOpen, setIsUploadsConfirmOpen] = useState<boolean>(false);
    const zipInputRef = useRef<HTMLInputElement | null>(null);

    const fetchStatus = async () => {
        setIsLoadingStatus(true);
        try {
            const res = await http.get('/backup/status');
            if (res.data?.success) {
                setStatus(res.data.data);
            }
        } catch (err) {
            const error = parseAxiosError(err);
            toast.add({
                title: 'Gagal Memuat Status',
                type: 'error',
                description: error.message,
            });
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    // -------------------------------------------------------------
    // EXPORT DATABASE
    // -------------------------------------------------------------
    const handleExportDatabase = async () => {
        setIsExportingDb(true);
        try {
            const response = await http.get('/backup/database', {
                responseType: 'blob',
                timeout: 300000,
            });

            const blob = new Blob([response.data], { type: 'application/sql' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            link.setAttribute('download', `ems-database-backup-${dateStr}.sql`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.add({
                title: 'Backup Berhasil',
                type: 'success',
                description: 'File SQL backup database berhasil diunduh.',
            });
        } catch (err) {
            const error = parseAxiosError(err);
            toast.add({
                title: 'Export Gagal',
                type: 'error',
                description: error.message,
            });
        } finally {
            setIsExportingDb(false);
        }
    };

    // -------------------------------------------------------------
    // IMPORT DATABASE
    // -------------------------------------------------------------
    const handleImportDatabase = async () => {
        if (!selectedSqlFile) return;

        setIsDbConfirmOpen(false);
        setIsImportingDb(true);

        const formData = new FormData();
        formData.append('file', selectedSqlFile);

        try {
            const res = await http.post('/backup/database/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000,
            });

            toast.add({
                title: 'Import Database Sukses',
                type: 'success',
                description:
                    res.data?.message || 'Database dan relasi constraint berhasil dipulihkan.',
            });

            setSelectedSqlFile(null);
            if (sqlInputRef.current) sqlInputRef.current.value = '';
            await fetchStatus();
        } catch (err) {
            const error = parseAxiosError(err);
            toast.add({
                title: 'Import Database Gagal',
                type: 'error',
                description: error.message,
            });
        } finally {
            setIsImportingDb(false);
        }
    };

    // -------------------------------------------------------------
    // EXPORT UPLOADS
    // -------------------------------------------------------------
    const handleExportUploads = async () => {
        setIsExportingUploads(true);
        try {
            const response = await http.get('/backup/uploads', {
                responseType: 'blob',
                timeout: 300000,
            });

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            link.setAttribute('download', `ems-uploads-backup-${dateStr}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.add({
                title: 'Backup Uploads Berhasil',
                type: 'success',
                description: 'Arsip ZIP folder uploads berhasil diunduh.',
            });
        } catch (err) {
            const error = parseAxiosError(err);
            toast.add({
                title: 'Export Uploads Gagal',
                type: 'error',
                description: error.message,
            });
        } finally {
            setIsExportingUploads(false);
        }
    };

    // -------------------------------------------------------------
    // IMPORT UPLOADS
    // -------------------------------------------------------------
    const handleImportUploads = async () => {
        if (!selectedZipFile) return;

        setIsUploadsConfirmOpen(false);
        setIsImportingUploads(true);

        const formData = new FormData();
        formData.append('file', selectedZipFile);

        try {
            const res = await http.post('/backup/uploads/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 300000,
            });

            toast.add({
                title: 'Import Uploads Sukses',
                type: 'success',
                description:
                    res.data?.message ||
                    `Berhasil memulihkan ${res.data?.count ?? 0} berkas uploads.`,
            });

            setSelectedZipFile(null);
            if (zipInputRef.current) zipInputRef.current.value = '';
            await fetchStatus();
        } catch (err) {
            const error = parseAxiosError(err);
            toast.add({
                title: 'Import Uploads Gagal',
                type: 'error',
                description: error.message,
            });
        } finally {
            setIsImportingUploads(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon icon="material-symbols:backup-outline" className="size-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Backup & Restore Sistem
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Kelola pencadangan dan pemulihan database MariaDB (skema, data & constraint)
                        serta berkas di folder uploads.
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStatus}
                    disabled={isLoadingStatus}
                    className="gap-2 shrink-0 self-start sm:self-center"
                >
                    <Icon
                        icon="material-symbols:sync"
                        className={`size-4 ${isLoadingStatus ? 'animate-spin' : ''}`}
                    />
                    Segarkan Status
                </Button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Database Info Card */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon
                                    icon="material-symbols:database-outline"
                                    className="size-5 text-blue-500"
                                />
                                <CardTitle className="text-base font-semibold">
                                    Database MariaDB
                                </CardTitle>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            >
                                <span className="size-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
                                Terhubung
                            </Badge>
                        </div>
                        <CardDescription className="text-xs">
                            Katalog tabel, relasi constraint foreign key, dan data aplikasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-3 gap-3 bg-muted/40 rounded-lg p-3 text-center border border-border/40">
                            <div>
                                <span className="text-xs text-muted-foreground block">
                                    Basis Data
                                </span>
                                <span
                                    className="font-semibold text-sm truncate block"
                                    title={status?.database.databaseName || '-'}
                                >
                                    {status?.database.databaseName || 'db_ems'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">
                                    Jumlah Tabel
                                </span>
                                <span className="font-semibold text-sm">
                                    {isLoadingStatus
                                        ? '...'
                                        : `${status?.database.totalTables ?? 0} tabel`}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">
                                    Ukuran Data
                                </span>
                                <span className="font-semibold text-sm">
                                    {isLoadingStatus
                                        ? '...'
                                        : status?.database.sizeFormatted || '0 MB'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Uploads Info Card */}
                <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Icon
                                    icon="material-symbols:folder-zip-outline"
                                    className="size-5 text-amber-500"
                                />
                                <CardTitle className="text-base font-semibold">
                                    Folder Uploads
                                </CardTitle>
                            </div>
                            <Badge
                                variant="outline"
                                className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            >
                                Folder Aktif
                            </Badge>
                        </div>
                        <CardDescription className="text-xs">
                            Foto bukti check-in/out guru, dokumen, avatar, dan berkas konten
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="grid grid-cols-3 gap-3 bg-muted/40 rounded-lg p-3 text-center border border-border/40">
                            <div>
                                <span className="text-xs text-muted-foreground block">Lokasi</span>
                                <span className="font-mono text-xs block font-medium">
                                    uploads/
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">
                                    Total File
                                </span>
                                <span className="font-semibold text-sm">
                                    {isLoadingStatus
                                        ? '...'
                                        : `${status?.uploads.totalFiles ?? 0} berkas`}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">
                                    Kapasitas
                                </span>
                                <span className="font-semibold text-sm">
                                    {isLoadingStatus
                                        ? '...'
                                        : status?.uploads.sizeFormatted || '0 MB'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs Section */}
            <Tabs defaultValue="database" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto sm:mx-0">
                    <TabsTrigger value="database" className="gap-2">
                        <Icon icon="material-symbols:database-outline" className="size-4" />
                        Backup Database
                    </TabsTrigger>
                    <TabsTrigger value="uploads" className="gap-2">
                        <Icon icon="material-symbols:folder-zip-outline" className="size-4" />
                        Backup Uploads
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: DATABASE BACKUP & IMPORT */}
                <TabsContent value="database" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Export Database Card */}
                        <Card className="flex flex-col justify-between border-border/70 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
                                        <Icon icon="material-symbols:download" className="size-5" />
                                    </div>
                                    <CardTitle className="text-base">
                                        Cadangkan Database (.sql)
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs leading-relaxed">
                                    Ekspor seluruh struktur skema, relasi kunci asing (Foreign Key
                                    Constraints), indeks, auto-increment, trigger, dan seluruh baris
                                    data ke dalam berkas SQL lengkap.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 p-3 text-xs space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold">
                                        <Icon
                                            icon="material-symbols:verified-outline"
                                            className="size-4 shrink-0"
                                        />
                                        Integritas Relasi Dijamin
                                    </div>
                                    <p className="text-muted-foreground leading-normal">
                                        Dump menyertakan penonaktifan pengecekan foreign key
                                        sementara saat diimpor ulang, sehingga tabel bertingkat
                                        dapat dipulihkan secara mulus tanpa konflik konstrain.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    onClick={handleExportDatabase}
                                    disabled={isExportingDb}
                                    className="w-full gap-2"
                                >
                                    {isExportingDb ? (
                                        <>
                                            <Icon
                                                icon="eos-icons:loading"
                                                className="size-4 animate-spin"
                                            />
                                            Membuat Dump Database...
                                        </>
                                    ) : (
                                        <>
                                            <Icon
                                                icon="material-symbols:download"
                                                className="size-4"
                                            />
                                            Download Backup Database (.sql)
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Import Database Card */}
                        <Card className="flex flex-col justify-between border-border/70 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
                                        <Icon icon="material-symbols:upload" className="size-5" />
                                    </div>
                                    <CardTitle className="text-base">
                                        Pulihkan / Import Database (.sql)
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs leading-relaxed">
                                    Unggah file cadangan SQL untuk merestorasi seluruh data dan
                                    relasi ke dalam sistem database MariaDB.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* File Picker Area */}
                                <input
                                    type="file"
                                    ref={sqlInputRef}
                                    accept=".sql"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (!file.name.endsWith('.sql')) {
                                                toast.add({
                                                    title: 'Format Tidak Valid',
                                                    type: 'error',
                                                    description:
                                                        'Harap pilih file dengan ekstensi .sql',
                                                });
                                                return;
                                            }
                                            setSelectedSqlFile(file);
                                        }
                                    }}
                                />

                                <div
                                    onClick={() => sqlInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                                        selectedSqlFile
                                            ? 'border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/20'
                                            : 'border-border/80 hover:border-border hover:bg-muted/30'
                                    }`}
                                >
                                    {selectedSqlFile ? (
                                        <div className="flex items-center justify-between gap-3 text-left">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                                    <Icon
                                                        icon="material-symbols:description-outline"
                                                        className="size-6 shrink-0"
                                                    />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-semibold truncate">
                                                        {selectedSqlFile.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(selectedSqlFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSqlFile(null);
                                                    if (sqlInputRef.current)
                                                        sqlInputRef.current.value = '';
                                                }}
                                                className="text-muted-foreground hover:text-destructive shrink-0 size-8 p-0"
                                            >
                                                <Icon
                                                    icon="material-symbols:close"
                                                    className="size-4"
                                                />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 py-1">
                                            <Icon
                                                icon="material-symbols:upload-file-outline"
                                                className="size-8 text-muted-foreground/70"
                                            />
                                            <p className="text-xs font-medium">
                                                Klik untuk memilih file backup (.sql)
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Maksimal ukuran file 500 MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 p-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold mb-1">
                                        <Icon
                                            icon="material-symbols:warning-outline"
                                            className="size-4 shrink-0"
                                        />
                                        Peringatan Penting
                                    </div>
                                    <p className="text-muted-foreground leading-normal">
                                        Mengimpor database akan menimpa/memperbarui data yang ada
                                        saat ini. Pastikan Anda telah membuat backup terbaru sebelum
                                        melakukan impor.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsDbConfirmOpen(true)}
                                    disabled={!selectedSqlFile || isImportingDb}
                                    className="w-full gap-2"
                                >
                                    {isImportingDb ? (
                                        <>
                                            <Icon
                                                icon="eos-icons:loading"
                                                className="size-4 animate-spin"
                                            />
                                            Sedang Memulihkan Database...
                                        </>
                                    ) : (
                                        <>
                                            <Icon
                                                icon="material-symbols:upload"
                                                className="size-4"
                                            />
                                            Mulai Pulihkan Database
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 2: UPLOADS BACKUP & IMPORT */}
                <TabsContent value="uploads" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Export Uploads Card */}
                        <Card className="flex flex-col justify-between border-border/70 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
                                        <Icon
                                            icon="material-symbols:folder-zip-outline"
                                            className="size-5"
                                        />
                                    </div>
                                    <CardTitle className="text-base">
                                        Cadangkan Folder Uploads (.zip)
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs leading-relaxed">
                                    Kompres dan unduh seluruh berkas di direktori{' '}
                                    <span className="font-mono">uploads/</span> ke dalam satu arsip
                                    ZIP praktis.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="rounded-md bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 p-3 text-xs space-y-1.5">
                                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                                        <Icon
                                            icon="material-symbols:check-circle-outline"
                                            className="size-4 shrink-0"
                                        />
                                        Berkas Asli 100% Aman
                                    </div>
                                    <p className="text-muted-foreground leading-normal">
                                        Proses backup hanya membaca dan mengemas berkas ke dalam
                                        arsip zip. Semua foto bukti absen, avatar, dan berkas
                                        pengguna tetap utuh tanpa risiko terhapus.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    onClick={handleExportUploads}
                                    disabled={isExportingUploads}
                                    className="w-full gap-2"
                                >
                                    {isExportingUploads ? (
                                        <>
                                            <Icon
                                                icon="eos-icons:loading"
                                                className="size-4 animate-spin"
                                            />
                                            Mengompres Folder Uploads...
                                        </>
                                    ) : (
                                        <>
                                            <Icon
                                                icon="material-symbols:download"
                                                className="size-4"
                                            />
                                            Download Backup Uploads (.zip)
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Import Uploads Card */}
                        <Card className="flex flex-col justify-between border-border/70 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600">
                                        <Icon
                                            icon="material-symbols:unarchive-outline"
                                            className="size-5"
                                        />
                                    </div>
                                    <CardTitle className="text-base">
                                        Pulihkan / Import Uploads (.zip)
                                    </CardTitle>
                                </div>
                                <CardDescription className="text-xs leading-relaxed">
                                    Unggah arsip ZIP untuk memulihkan atau mengekstrak berkas
                                    kembali ke direktori <span className="font-mono">uploads/</span>
                                    .
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* File Picker Area */}
                                <input
                                    type="file"
                                    ref={zipInputRef}
                                    accept=".zip"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (!file.name.endsWith('.zip')) {
                                                toast.add({
                                                    title: 'Format Tidak Valid',
                                                    type: 'error',
                                                    description:
                                                        'Harap pilih file dengan ekstensi .zip',
                                                });
                                                return;
                                            }
                                            setSelectedZipFile(file);
                                        }
                                    }}
                                />

                                <div
                                    onClick={() => zipInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                                        selectedZipFile
                                            ? 'border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/20'
                                            : 'border-border/80 hover:border-border hover:bg-muted/30'
                                    }`}
                                >
                                    {selectedZipFile ? (
                                        <div className="flex items-center justify-between gap-3 text-left">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 rounded bg-blue-500/10 text-blue-600">
                                                    <Icon
                                                        icon="material-symbols:folder-zip-outline"
                                                        className="size-6 shrink-0"
                                                    />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-semibold truncate">
                                                        {selectedZipFile.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(selectedZipFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedZipFile(null);
                                                    if (zipInputRef.current)
                                                        zipInputRef.current.value = '';
                                                }}
                                                className="text-muted-foreground hover:text-destructive shrink-0 size-8 p-0"
                                            >
                                                <Icon
                                                    icon="material-symbols:close"
                                                    className="size-4"
                                                />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 py-1">
                                            <Icon
                                                icon="material-symbols:upload-file-outline"
                                                className="size-8 text-muted-foreground/70"
                                            />
                                            <p className="text-xs font-medium">
                                                Klik untuk memilih file arsip (.zip)
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                Maksimal ukuran file 500 MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-md bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 p-3 text-xs">
                                    <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold mb-1">
                                        <Icon
                                            icon="material-symbols:info-outline"
                                            className="size-4 shrink-0"
                                        />
                                        Informasi Ekstraksi
                                    </div>
                                    <p className="text-muted-foreground leading-normal">
                                        Berkas yang diekstrak akan otomatis menggantikan berkas
                                        dengan nama yang sama di folder uploads, dan berkas baru
                                        akan langsung ditambahkan.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsUploadsConfirmOpen(true)}
                                    disabled={!selectedZipFile || isImportingUploads}
                                    className="w-full gap-2"
                                >
                                    {isImportingUploads ? (
                                        <>
                                            <Icon
                                                icon="eos-icons:loading"
                                                className="size-4 animate-spin"
                                            />
                                            Mengekstrak Berkas Uploads...
                                        </>
                                    ) : (
                                        <>
                                            <Icon
                                                icon="material-symbols:unarchive-outline"
                                                className="size-4"
                                            />
                                            Mulai Pulihkan Uploads
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* CONFIRMATION DIALOG: IMPORT DATABASE */}
            <Dialog open={isDbConfirmOpen} onOpenChange={setIsDbConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <Icon
                                icon="material-symbols:warning-rounded"
                                className="size-6 text-destructive"
                            />
                            <DialogTitle>Konfirmasi Pemulihan Database</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs leading-relaxed pt-2">
                            Tindakan ini akan mengimpor data dari file{' '}
                            <span className="font-semibold text-foreground">
                                {selectedSqlFile?.name}
                            </span>{' '}
                            dan menimpa atau memperbarui tabel database saat ini.
                            <br />
                            <br />
                            Pastikan Anda yakin dan telah memiliki backup database terbaru sebelum
                            melanjutkan proses ini.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDbConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleImportDatabase}
                            className="gap-1.5"
                        >
                            <Icon icon="material-symbols:check" className="size-4" />
                            Ya, Pulihkan Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONFIRMATION DIALOG: IMPORT UPLOADS */}
            <Dialog open={isUploadsConfirmOpen} onOpenChange={setIsUploadsConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <Icon
                                icon="material-symbols:warning-rounded"
                                className="size-6 text-destructive"
                            />
                            <DialogTitle>Konfirmasi Pemulihan Berkas Uploads</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs leading-relaxed pt-2">
                            Arsip ZIP{' '}
                            <span className="font-semibold text-foreground">
                                {selectedZipFile?.name}
                            </span>{' '}
                            akan diekstrak ke dalam folder{' '}
                            <span className="font-mono">uploads/</span>. Berkas yang sudah ada
                            dengan nama yang sama akan ditimpa.
                            <br />
                            <br />
                            Apakah Anda ingin melanjutkan?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsUploadsConfirmOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleImportUploads}
                            className="gap-1.5"
                        >
                            <Icon icon="material-symbols:check" className="size-4" />
                            Ya, Ekstrak Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
