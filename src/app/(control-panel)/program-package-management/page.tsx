'use client';

import { useState, useEffect } from 'react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
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
                                <TableHead>Harga Jual</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {packages.map((p) => (
                                <TableRow key={p.slug}>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.selling_price}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => {
                                                setEditingPackage(p);
                                                setIsDialogOpen(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => onDelete(p.slug)}
                                        >
                                            Hapus
                                        </Button>
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
