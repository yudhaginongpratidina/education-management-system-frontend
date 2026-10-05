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

// module components
import StudentForm from '@/modules/student/student-form';
import StudentProgramsList from '@/modules/student/student-programs-list';

export default function Page() {
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);
    const [programStudent, setProgramStudent] = useState<any | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

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
        getStudents();
    };

    const exportStudents = async () => {
        try {
            const response = await http.get('/students/export', { responseType: 'blob' });
            const contentType = String(response.headers['content-type'] ?? '');
            const extension = contentType.includes('csv')
                ? 'csv'
                : contentType.includes('json')
                  ? 'json'
                  : 'xlsx';
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `students-export.${extension}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.add({ title: 'Success', type: 'success', description: 'Export berhasil' });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const importStudents = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const payload = JSON.parse(text);
            const records = Array.isArray(payload) ? payload : payload.data;
            if (!Array.isArray(records)) {
                toast.add({
                    title: 'Error',
                    type: 'error',
                    description: 'Format file tidak valid. Gunakan array JSON.',
                });
                return;
            }
            const response = await http.post('/students/import', records);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Import berhasil',
            });
            getStudents();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            event.target.value = '';
        }
    };

    const filtered = students.filter((student) => {
        if (!search) return true;
        const keyword = search.toLowerCase();
        return [student.full_name, student.guardian_name, student.guardian_phone_number]
            .filter(Boolean)
            .some((value: string) => value.toLowerCase().includes(keyword));
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Cari nama siswa / wali / telepon..."
                    className="h-10 w-72"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="h-10" onClick={exportStudents}>
                        <Icon icon="mdi:download" /> Export
                    </Button>
                    <label>
                        <input
                            ref={importInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={importStudents}
                        />
                    </label>
                    <Button
                        variant="outline"
                        className="h-10"
                        onClick={() => importInputRef.current?.click()}
                    >
                        <Icon icon="mdi:upload" /> Import
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger
                            render={
                                <Button className="h-10">
                                    <Icon icon="mdi:account-plus" /> Tambah Siswa
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

            <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Jenjang</TableHead>
                            <TableHead>Wali</TableHead>
                            <TableHead>Telepon</TableHead>
                            <TableHead>Instagram</TableHead>
                            <TableHead>Sumber Info</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada data siswa.
                                </TableCell>
                            </TableRow>
                        )}
                        {filtered.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.full_name}</TableCell>
                                <TableCell>{student.school_level ?? '-'}</TableCell>
                                <TableCell>{student.guardian_name ?? '-'}</TableCell>
                                <TableCell>{student.guardian_phone_number ?? '-'}</TableCell>
                                <TableCell>{student.instagram ?? '-'}</TableCell>
                                <TableCell>{student.information_source ?? '-'}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Dialog
                                            open={openEditId === student.id}
                                            onOpenChange={(open) =>
                                                setOpenEditId(open ? student.id : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mingcute:edit-line" />
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

                                        <Dialog
                                            open={programStudent?.id === student.id}
                                            onOpenChange={(open) =>
                                                setProgramStudent(open ? student : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:book-education" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>PROGRAM SISWA</DialogTitle>
                                                    <DialogDescription>
                                                        Kelola program yang diikuti{' '}
                                                        {student.full_name}.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <StudentProgramsList studentId={student.id} />
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:trash" />
                                                    </Button>
                                                }
                                            />
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        KONFIRMASI HAPUS
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Yakin ingin menghapus siswa ini?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteStudent(student.id)}
                                                    >
                                                        Ya
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
