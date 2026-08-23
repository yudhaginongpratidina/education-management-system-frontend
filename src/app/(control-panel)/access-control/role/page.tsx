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
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
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
import RoleForm from '@/modules/role/role-form';

export default function Page() {
    const [roles, setRoles] = useState([]);
    const [offset, setOffset] = useState(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);
    const limit = 5;

    const getRoles = async (currentOffset = 0) => {
        try {
            const response = await http.get(`/roles`, {
                params: {
                    limit,
                    offset: currentOffset,
                },
                headers: {
                    Accept: 'application/json',
                },
            });
            setRoles(response.data.data || []);
            setOffset(currentOffset);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const deleteRole = async (slug: string) => {
        try {
            const response = await http.delete(`/roles/${slug}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            getRoles(offset);
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
        getRoles(offset);
    };

    useEffect(() => {
        getRoles();
    }, []);

    const handlePageChange = (newOffset: number) => {
        getRoles(newOffset);
    };

    return (
        <>
            <div className="w-full justify-between flex items-center">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger
                        render={
                            <Button variant="default" className="h-10">
                                Tambah Role
                            </Button>
                        }
                    />
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>FORM TAMBAH ROLE</DialogTitle>
                            <DialogDescription>Ini adalah form tambah role</DialogDescription>
                        </DialogHeader>
                        <RoleForm type="create" onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
            <Table className="border">
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(roles) &&
                        roles.map((role: any) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium capitalize">{role.name}</TableCell>
                                <TableCell>{role.description}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={openEditId === role.id}
                                        onOpenChange={(open) =>
                                            setOpenEditId(open ? role.id : null)
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
                                                <DialogTitle>FORM EDIT ROLE</DialogTitle>
                                                <DialogDescription>
                                                    Ini adalah form edit role
                                                </DialogDescription>
                                            </DialogHeader>
                                            <RoleForm
                                                type="update"
                                                slug={role.slug}
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
                                                    onClick={() => deleteRole(role.slug)}
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
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (offset >= limit) handlePageChange(offset - limit);
                            }}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                if (roles.length === limit) handlePageChange(offset + limit);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </>
    );
}
