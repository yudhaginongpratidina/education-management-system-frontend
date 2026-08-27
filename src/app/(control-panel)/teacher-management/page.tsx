'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// ui components
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Button } from '@/components/ui/button';

// module components
import TeacherForm from '@/modules/teacher/teacher-form';
import TeacherProgramForm from '@/modules/teacher/teacher-program-form';

export default function Page() {
    const [teachers, setTeachers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [selectedProgramName, setSelectedProgramName] = useState<string>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);

    const getTeachers = async () => {
        try {
            let url = '/teachers';
            if (selectedProgramName !== 'all') {
                // Find program ID by name to call the API
                const selectedProgram = programs.find((p: any) => p.name === selectedProgramName);
                if (selectedProgram) {
                    const programId = (selectedProgram as any).id;
                    const res = await http.get(`/teacher-programs?program_id=${programId}`);
                    const teacherIds = res.data.data.map((item: any) => item.teacher_id);
                    const allTeachersRes = await http.get('/teachers');
                    const allTeachers = allTeachersRes.data.data || [];
                    setTeachers(allTeachers.filter((t: any) => teacherIds.includes(t.id)));
                    return;
                }
            }
            const response = await http.get(url);
            setTeachers(response.data.data || []);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const getPrograms = async () => {
        try {
            const response = await http.get('/programs');
            setPrograms(response.data.data || []);
        } catch (error) {
            console.error('Error fetching programs', error);
        }
    };

    const deleteTeacher = async (slug: string) => {
        try {
            const response = await http.delete(`/teachers/${slug}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            getTeachers();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setOpenEditId(null);
        getTeachers();
    };

    useEffect(() => {
        getTeachers();
        getPrograms();
    }, [selectedProgramName]);

    return (
        <>
            <div className="w-full justify-between flex items-center mb-4">
                <div className="flex gap-2">
                    <Select
                        onValueChange={(value) => setSelectedProgramName(value ?? 'all')}
                        defaultValue="all"
                    >
                        <SelectTrigger className="w-45">
                            <SelectValue placeholder="Pilih Program" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Program</SelectItem>
                            {programs.map((p: any) => (
                                <SelectItem key={p.id} value={p.name}>
                                    <span className="uppercase">{p.name}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger
                        render={
                            <Button variant="default" className="h-10">
                                Tambah Guru
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>FORM TAMBAH GURU</DialogTitle>
                            <DialogDescription>Ini adalah form tambah guru</DialogDescription>
                        </DialogHeader>
                        <TeacherForm type="create" onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
            <Table className="border">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Pendidikan Terakhir</TableHead>
                        <TableHead>Nomor Telepon</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(teachers) &&
                        teachers.map((teacher: any) => (
                            <TableRow key={teacher.id}>
                                <TableCell className="font-medium capitalize">
                                    {teacher.full_name}
                                </TableCell>
                                <TableCell className="font-medium capitalize">
                                    {teacher.last_education}
                                </TableCell>
                                <TableCell className="font-medium capitalize">
                                    {teacher.phone_number}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={openEditId === teacher.id}
                                        onOpenChange={(open) =>
                                            setOpenEditId(open ? teacher.id : null)
                                        }
                                    >
                                        <DialogTrigger
                                            render={
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-10"
                                                >
                                                    <Icon icon="mingcute:edit-line" />
                                                </Button>
                                            }
                                        />
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>FORM EDIT GURU</DialogTitle>
                                                <DialogDescription>
                                                    Ini adalah form edit guru
                                                </DialogDescription>
                                            </DialogHeader>
                                            <TeacherForm
                                                type="update"
                                                slug={teacher.slug}
                                                onSuccess={handleSuccess}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog>
                                        <DialogTrigger
                                            render={
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-10"
                                                >
                                                    <Icon icon="healthicons:i-training-class-outline-24px" />
                                                </Button>
                                            }
                                        />
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>PROGRAM YANG DIAMPU</DialogTitle>
                                                <DialogDescription>
                                                    Ini adalah form edit program guru
                                                </DialogDescription>
                                            </DialogHeader>
                                            <TeacherProgramForm teacherId={teacher.id} />
                                        </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger
                                            render={
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-10"
                                                >
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
                                                    Yakin ingin melanjutkan proses ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteTeacher(teacher.slug)}
                                                >
                                                    Ya
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
                <TableFooter></TableFooter>
            </Table>
        </>
    );
}
