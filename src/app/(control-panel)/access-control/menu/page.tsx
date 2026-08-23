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

// modules
import MenuForm from '@/modules/menu/menu-form';

export default function Page() {
    const [menus, setMenus] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);

    const getMenus = async () => {
        try {
            const response = await http.get(`/menus`);
            setMenus(response.data.data || []);
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

    const deleteMenu = async (slug: string) => {
        try {
            const response = await http.delete(`/menus/${slug}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            getMenus();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const updateSortOrder = async (menu: any, direction: 'up' | 'down') => {
        try {
            const newSortOrder = direction === 'up' ? menu.sort_order - 1 : menu.sort_order + 1;
            await http.patch(`/menus/${menu.slug}`, {
                parent_id: menu.parent_id || undefined,
                name: menu.name,
                type: menu.type,
                description: menu.description,
                sort_order: newSortOrder,
            });
            getMenus();
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
        getMenus();
    };

    useEffect(() => {
        getMenus();
    }, []);

    return (
        <>
            <div className="w-full justify-between flex items-center">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger
                        render={
                            <Button variant="default" className="h-10">
                                Tambah Menu
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>FORM TAMBAH MENU</DialogTitle>
                            <DialogDescription>Ini adalah form tambah menu</DialogDescription>
                        </DialogHeader>
                        <MenuForm type="create" onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>
            <Table className="border">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-center">Urutan</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.isArray(menus) &&
                        menus.map((menu: any) => (
                            <TableRow key={menu.id}>
                                <TableCell className="font-medium capitalize">
                                    {menu.name}
                                </TableCell>
                                <TableCell>{menu.type}</TableCell>
                                <TableCell className="text-center">{menu.sort_order}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={openEditId === menu.id}
                                        onOpenChange={(open) =>
                                            setOpenEditId(open ? menu.id : null)
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
                                            <MenuForm
                                                type="update"
                                                slug={menu.slug}
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
                                                    onClick={() => deleteMenu(menu.slug)}
                                                >
                                                    Ya
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => updateSortOrder(menu, 'up')}
                                    >
                                        <Icon icon="mdi:arrow-up-thin" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => updateSortOrder(menu, 'down')}
                                    >
                                        <Icon icon="mdi:arrow-down" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
                <TableFooter></TableFooter>
            </Table>
        </>
    );
}
