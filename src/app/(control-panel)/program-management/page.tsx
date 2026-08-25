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
import ProgramForm from '@/modules/program/program-form';
import ProgramLevelManagement from '@/modules/program/program-level-management';

export default function Page() {
    const [programs, setPrograms] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);

    const getPrograms = async () => {
        try {
            const response = await http.get(`/programs`);
            setPrograms(response.data.data || []);
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

    const deleteProgram = async (slug: string) => {
        try {
            const response = await http.delete(`/programs/${slug}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            getPrograms();
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
        getPrograms();
    };

    useEffect(() => {
        getPrograms();
    }, []);

    return (
        <>
            <div className="w-full justify-between flex items-center">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger
                        render={
                            <Button variant="default" className="h-10">
                                Tambah Program
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>FORM TAMBAH PROGRAM</DialogTitle>
                            <DialogDescription>Ini adalah form tambah program</DialogDescription>
                        </DialogHeader>
                        <ProgramForm type="create" onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
            <Table className="border">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Syarat</TableHead>
                        <TableHead>Harga per Sesi</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(programs) &&
                        programs.map((program: any) => (
                            <TableRow key={program.id}>
                                <TableCell className="font-medium capitalize">
                                    {program.name}
                                </TableCell>
                                <TableCell>{program.requirements}</TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        maximumFractionDigits: 0,
                                    }).format(program.price_per_session)}
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={openEditId === program.id}
                                        onOpenChange={(open) =>
                                            setOpenEditId(open ? program.id : null)
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
                                                <DialogTitle>FORM EDIT PROGRAM</DialogTitle>
                                                <DialogDescription>
                                                    Ini adalah form edit program
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ProgramForm
                                                type="update"
                                                slug={program.slug}
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
                                                    <Icon icon="carbon:skill-level-advanced" />
                                                </Button>
                                            }
                                        />
                                        <DialogContent className="min-w-md">
                                            <DialogHeader>
                                                <DialogTitle>LEVEL</DialogTitle>
                                                <DialogDescription>
                                                    Ini adalah daftar level
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ProgramLevelManagement program_slug={program.slug} />
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
                                                    onClick={() => deleteProgram(program.slug)}
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
