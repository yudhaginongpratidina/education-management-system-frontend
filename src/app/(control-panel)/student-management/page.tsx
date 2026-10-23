'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';

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
    DialogTrigger,
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
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

export default function Page() {
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);
    const [programStudent, setProgramStudent] = useState<any | null>(null);

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

    const getStudents = async () => {
        try {
            const response = await http.get('/students');
            setStudents(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    const deleteStudent = async (id: number) => {
        try {
            const response = await http.delete(`/students/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Siswa berhasil dihapus',
            });
            getStudents();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setOpenEditId(null);
        setProgramStudent(null);
        setIsAssignOpen(false);
        setAssignTargetStudent(null);
        getStudents();
    };

    // Export to Excel
    const exportStudents = async () => {
        setIsExporting(true);
        try {
            const response = await http.get('/students/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(
                new Blob([response.data], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
            );
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toISOString().slice(0, 10);
            link.download = `Data-Siswa-${dateStr}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.add({
                title: 'Export Berhasil',
                type: 'success',
                description: 'File Excel data siswa berhasil diunduh.',
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

    // Open Assign Dialog for specific student
    const handleOpenAssign = (studentItem?: any) => {
        setAssignTargetStudent(studentItem ?? null);
        setIsAssignOpen(true);
    };

    const filtered = students.filter((student) => {
        if (!search) return true;
        const keyword = search.toLowerCase();
        return [
            student.full_name,
            student.guardian_name,
            student.guardian_phone_number,
            student.branch_name,
            student.program_name,
            student.level_name,
        ]
            .filter(Boolean)
            .some((value: string) => value.toLowerCase().includes(keyword));
    });

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Cari siswa, wali, telepon, cabang, program..."
                        className="h-10 w-80"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Template Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 text-muted-foreground hover:text-foreground"
                        onClick={downloadTemplate}
                        title="Download Template Format Excel"
                    >
                        <Icon icon="mdi:file-download-outline" className="text-lg mr-1 text-emerald-600" />
                        Template Excel
                    </Button>

                    {/* Export Button */}
                    <Button
                        variant="outline"
                        className="h-10 gap-1.5"
                        onClick={exportStudents}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Icon icon="mdi:loading" className="animate-spin text-lg" />
                        ) : (
                            <Icon icon="mdi:microsoft-excel" className="text-lg text-emerald-600" />
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
                        className="h-10 gap-1.5"
                        onClick={() => importInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Icon icon="mdi:loading" className="animate-spin text-lg" />
                        ) : (
                            <Icon icon="mdi:file-upload" className="text-lg text-blue-600" />
                        )}
                        Import Excel
                    </Button>

                    {/* Assign Program Button */}
                    <Button
                        variant="outline"
                        className="h-10 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                        onClick={() => handleOpenAssign()}
                    >
                        <Icon icon="mdi:account-arrow-right" className="text-lg" />
                        Assign Program & Cabang
                    </Button>

                    {/* Add Student Button */}
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger
                            render={
                                <Button className="h-10 gap-1.5">
                                    <Icon icon="mdi:account-plus" className="text-lg" /> Tambah Siswa
                                </Button>
                            }
                        />
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>TAMBAH SISWA</DialogTitle>
                                <DialogDescription>Masukan data siswa baru.</DialogDescription>
                            </DialogHeader>
                            <StudentForm type="create" onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Students Table */}
            <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[180px]">Nama Siswa</TableHead>
                            <TableHead className="w-24">Jenjang</TableHead>
                            <TableHead className="min-w-[200px]">Cabang & Program</TableHead>
                            <TableHead className="min-w-[160px]">Wali & Kontak</TableHead>
                            <TableHead className="w-28">Instagram</TableHead>
                            <TableHead className="w-32">Sumber Info</TableHead>
                            <TableHead className="w-40 text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    Belum ada data siswa.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((student) => {
                            const hasProgram = Boolean(student.branch_name || student.program_name);

                            return (
                                <TableRow key={student.id}>
                                    <TableCell className="font-semibold text-foreground">
                                        <div>{student.full_name}</div>
                                        {student.place_birth && (
                                            <div className="text-xs text-muted-foreground font-normal">
                                                {student.place_birth}
                                                {student.birth_date
                                                    ? `, ${String(student.birth_date).slice(0, 10)}`
                                                    : ''}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{student.school_level ?? '-'}</TableCell>
                                    <TableCell>
                                        {hasProgram ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Badge variant="outline" className="text-xs font-normal">
                                                        <Icon icon="mdi:office-building" className="mr-0.5 text-xs text-muted-foreground" />
                                                        {student.branch_name || 'Cabang -'}
                                                    </Badge>
                                                    {student.program_status && (
                                                        <Badge
                                                            variant={
                                                                student.program_status === 'ACTIVE'
                                                                    ? 'success'
                                                                    : student.program_status === 'TRIAL'
                                                                      ? 'info'
                                                                      : 'secondary'
                                                            }
                                                            className="text-[10px] px-1.5 py-0"
                                                        >
                                                            {student.program_status}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs font-medium text-primary flex items-center gap-1">
                                                    <Icon icon="mdi:book-open-variant" className="text-xs" />
                                                    {student.program_name || 'Program'}
                                                    {student.level_name ? ` • ${student.level_name}` : ''}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                Belum di-assign
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs font-medium">
                                            {student.guardian_name ?? '-'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {student.guardian_phone_number ?? '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs">{student.instagram ?? '-'}</TableCell>
                                    <TableCell className="text-xs">{student.information_source ?? '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1.5">
                                            {/* Quick Action: Assign Program & Branch */}
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 text-primary hover:bg-primary/10 hover:border-primary/40"
                                                title="Assign ke Cabang, Pelajaran & Level"
                                                onClick={() => handleOpenAssign(student)}
                                            >
                                                <Icon icon="mdi:account-arrow-right" className="text-base" />
                                            </Button>

                                            {/* Edit Student Dialog */}
                                            <Dialog
                                                open={openEditId === student.id}
                                                onOpenChange={(open) =>
                                                    setOpenEditId(open ? student.id : null)
                                                }
                                            >
                                                <DialogTrigger
                                                    render={
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8"
                                                            title="Edit Siswa"
                                                        >
                                                            <Icon icon="mingcute:edit-line" className="text-base" />
                                                        </Button>
                                                    }
                                                />
                                                <DialogContent className="sm:max-w-lg">
                                                    <DialogHeader>
                                                        <DialogTitle>EDIT SISWA</DialogTitle>
                                                        <DialogDescription>
                                                            Perbarui data siswa.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <StudentForm
                                                        type="update"
                                                        student={student}
                                                        studentId={student.id}
                                                        onSuccess={handleSuccess}
                                                    />
                                                </DialogContent>
                                            </Dialog>

                                            {/* Manage Enrolled Programs List */}
                                            <Dialog
                                                open={programStudent?.id === student.id}
                                                onOpenChange={(open) =>
                                                    setProgramStudent(open ? student : null)
                                                }
                                            >
                                                <DialogTrigger
                                                    render={
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 text-muted-foreground"
                                                            title="Kelola Semua Program Siswa"
                                                        >
                                                            <Icon icon="mdi:book-education" className="text-base" />
                                                        </Button>
                                                    }
                                                />
                                                <DialogContent className="sm:max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>PROGRAM SISWA</DialogTitle>
                                                        <DialogDescription>
                                                            Kelola seluruh riwayat program yang diikuti{' '}
                                                            {student.full_name}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <StudentProgramsList studentId={student.id} />
                                                </DialogContent>
                                            </Dialog>

                                            {/* Delete Student Dialog */}
                                            <AlertDialog>
                                                <AlertDialogTrigger
                                                    render={
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                            title="Hapus Siswa"
                                                        >
                                                            <Icon icon="mdi:trash" className="text-base" />
                                                        </Button>
                                                    }
                                                />
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            KONFIRMASI HAPUS
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Yakin ingin menghapus data siswa{' '}
                                                            <strong>{student.full_name}</strong>?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteStudent(student.id)}
                                                        >
                                                            Ya, Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Excel Import Preview Dialog */}
            <StudentImportPreviewDialog
                isOpen={isPreviewOpen}
                onOpenChange={setIsPreviewOpen}
                previewData={previewData}
                fileName={importFileName}
                onSuccess={handleSuccess}
                onDownloadTemplate={downloadTemplate}
            />

            {/* Assign Student Program & Branch Dialog */}
            <StudentAssignDialog
                isOpen={isAssignOpen}
                onOpenChange={setIsAssignOpen}
                student={assignTargetStudent}
                allStudents={students}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
