'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';

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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';

export default function AssetCategoryManagement({ onChanged }: { onChanged?: () => void }) {
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);

    const getCategories = async () => {
        try {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const response = await http.get(`/asset-categories${query}`);
            setCategories(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const deleteCategory = async (id: number) => {
        try {
            const response = await http.delete(`/asset-categories/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Kategori dihapus',
            });
            getCategories();
            onChanged?.();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditItem(null);
        getCategories();
        onChanged?.();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Input
                    className="h-10 w-64"
                    placeholder="Cari kategori..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger
                        render={
                            <Button className="h-10">
                                <Icon icon="mdi:plus" /> Tambah Kategori
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>TAMBAH KATEGORI ASET</DialogTitle>
                            <DialogDescription>
                                Kategori menentukan prefix kode aset otomatis.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm onSuccess={handleSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Kategori</TableHead>
                            <TableHead>Prefix Kode</TableHead>
                            <TableHead>Jumlah Aset</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada kategori aset.
                                </TableCell>
                            </TableRow>
                        )}
                        {categories.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.name}</span>
                                        {item.description && (
                                            <span className="text-muted-foreground text-xs">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.code_prefix ? (
                                        <Badge variant="outline">{item.code_prefix}</Badge>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                                <TableCell className="tabular-nums">
                                    {item.asset_count ?? 0}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.is_active ? 'success' : 'secondary'}>
                                        {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Dialog
                                            open={editItem?.id === item.id}
                                            onOpenChange={(open) => setEditItem(open ? item : null)}
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mingcute:edit-line" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>EDIT KATEGORI</DialogTitle>
                                                </DialogHeader>
                                                <CategoryForm
                                                    item={item}
                                                    onSuccess={handleSuccess}
                                                />
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
                                                        HAPUS KATEGORI
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Yakin ingin menghapus kategori ini? Kategori
                                                        yang masih dipakai aset tidak dapat dihapus.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteCategory(item.id)}
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

function CategoryForm({ item, onSuccess }: { item?: any; onSuccess: () => void }) {
    const [name, setName] = useState(item?.name ?? '');
    const [codePrefix, setCodePrefix] = useState(item?.code_prefix ?? '');
    const [description, setDescription] = useState(item?.description ?? '');
    const [isActive, setIsActive] = useState<boolean>(item?.is_active ?? true);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async () => {
        if (!name.trim()) {
            toast.add({ title: 'Error', type: 'error', description: 'Nama kategori wajib diisi' });
            return;
        }
        const payload = {
            name,
            code_prefix: codePrefix || null,
            description: description || null,
            is_active: isActive,
        };
        setSubmitting(true);
        try {
            if (item) {
                await http.put(`/asset-categories/${item.id}`, payload);
            } else {
                await http.post('/asset-categories', payload);
            }
            toast.add({ title: 'Success', type: 'success', description: 'Kategori disimpan' });
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="category_name">Nama Kategori</FieldLabel>
                <Input
                    id="category_name"
                    className="h-10"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Elektronik"
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="code_prefix">Prefix Kode Aset</FieldLabel>
                <Input
                    id="code_prefix"
                    className="h-10"
                    value={codePrefix}
                    onChange={(event) => setCodePrefix(event.target.value.toUpperCase())}
                    placeholder="Contoh: ELK (kode: ELK-00001)"
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="category_description">Deskripsi</FieldLabel>
                <Textarea
                    id="category_description"
                    className="min-h-10"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Deskripsi kategori"
                />
            </Field>
            <Field orientation="horizontal">
                <input
                    id="is_active"
                    type="checkbox"
                    className="size-4"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                />
                <FieldLabel htmlFor="is_active" className="font-normal">
                    Kategori aktif
                </FieldLabel>
            </Field>
            <Button className="h-10" onClick={onSubmit} disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
        </FieldGroup>
    );
}
