'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

// modules components
import ProgramPackageForm from '@/modules/program/program-package-form';

export default function Page() {
    const [programs, setPrograms] = useState<any[]>([]);
    const [selectedProgram, setSelectedProgram] = useState<string>('');
    const [packages, setPackages] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (selectedProgram) fetchPackages();
        else setPackages([]);
    }, [selectedProgram]);

    const fetchPrograms = async () => {
        try {
            const res = await http.get('/programs');
            setPrograms(res.data.data);
        } catch (e) {
            toast.add({ title: 'Error', type: 'error', description: parseAxiosError(e).message });
        }
    };

    const fetchPackages = async () => {
        try {
            const res = await http.get(`/program-packages/${selectedProgram}`);
            setPackages(res.data.data);
        } catch (e) {
            toast.add({ title: 'Error', type: 'error', description: parseAxiosError(e).message });
        }
    };

    const onDelete = async (slug: string) => {
        try {
            await http.delete(`/program-packages/${selectedProgram}/${slug}`);
            toast.add({ title: 'Success', type: 'success', description: 'Package deleted' });
            fetchPackages();
        } catch (e) {
            toast.add({ title: 'Error', type: 'error', description: parseAxiosError(e).message });
        }
    };

    return (
        <div className="space-y-6">
            <Select
                value={selectedProgram}
                onValueChange={(value) => setSelectedProgram(value ?? '')}
            >
                <SelectTrigger>
                    <SelectValue className="capitalize" placeholder="Pilih Program" />
                </SelectTrigger>
                <SelectContent>
                    {programs.map((p) => (
                        <SelectItem key={p.slug} value={p.slug} className="capitalize">
                            {p.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedProgram && (
                <>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger
                            render={
                                <Button
                                    className="h-10"
                                    onClick={() => {
                                        setEditingPackage(null);
                                    }}
                                >
                                    Tambah Paket
                                </Button>
                            }
                        />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPackage ? 'Edit' : 'Tambah'} Paket
                                </DialogTitle>
                            </DialogHeader>
                            <ProgramPackageForm
                                type={editingPackage ? 'update' : 'create'}
                                slug={editingPackage ? editingPackage.slug : selectedProgram}
                                initialData={editingPackage}
                                onSuccess={() => {
                                    setIsDialogOpen(false);
                                    fetchPackages();
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Intensitas</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.map((p) => (
                                <TableRow key={p.slug}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>
                                        {p.duration_months}{' '}
                                        {p.session_period === 'MONTH' ? 'Bulan' : 'Minggu'}
                                    </TableCell>
                                    <TableCell>{p.sessions_per_period}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {Number(p.selling_price) !== 0 ? (
                                                <>
                                                    <del className="text-muted-foreground text-xs">
                                                        {p.normal_price}
                                                    </del>
                                                    <span className="font-bold">
                                                        {p.selling_price}
                                                    </span>
                                                </>
                                            ) : (
                                                <span>{p.normal_price}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            onClick={() => {
                                                setEditingPackage(p);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            <Icon icon="mingcute:edit-line" />
                                        </Button>
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
                                                        Yakin ingin melanjutkan proses ini?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => onDelete(p.slug)}
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
                    </Table>
                </>
            )}
        </div>
    );
}
