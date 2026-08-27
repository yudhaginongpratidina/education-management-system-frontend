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

export default function Page() {
    const [teachers, setTeachers] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);

    const getTeachers = async () => {
        try {
            const response = await http.get(`/teachers`);
            setTeachers(response.data.data || []);
            // console.log(response.data);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
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
    }, []);

    return (
        <>
            <div className="w-full justify-between flex items-center">
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
