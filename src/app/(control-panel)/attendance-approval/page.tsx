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

export default function Page() {
    const [myBranch, setMyBranch] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    const getMyBranchData = async () => {
        try {
            const current = await http.get(`/auth/me`);
            const data = current.data.data;
            const teacher = await http.get(`/teachers?slug=${data.slug}`);
            const teacher_id = teacher.data.data[0].id;
            const branch = await http.get(`/teacher-branches/${teacher_id}`);

            setMyBranch(branch.data.data);
            if (branch.data.data.length > 0) {
                setSelectedBranchId(branch.data.data[0].branch_id.toString());
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    useEffect(() => {
        getMyBranchData();
    }, []);

    const [approvals, setApprovals] = useState<any[]>([]);

    const getApprovals = async (branchId: string) => {
        try {
            const res = await http.get(`/attendance-approvals?branch_id=${branchId}`);
            setApprovals(res.data.data);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    useEffect(() => {
        if (selectedBranchId) {
            getApprovals(selectedBranchId);
        }
    }, [selectedBranchId]);

    const handleApprove = async (id: number) => {
        try {
            await http.put(`/attendance-approvals/${id}`, {
                is_approved: true,
                notes: null,
            });
            toast.add({
                title: 'Sukses',
                type: 'success',
                description: 'Absensi berhasil disetujui',
            });
            if (selectedBranchId) {
                getApprovals(selectedBranchId);
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    return (
        <div className="space-y-4">
            <Select value={selectedBranchId || ''} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-70">
                    <SelectValue placeholder="Pilih Cabang">
                        {selectedBranchId
                            ? myBranch.find(
                                  (branch) => branch.branch_id.toString() === selectedBranchId,
                              )?.branch_name
                            : 'Pilih Cabang'}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {myBranch.map((branch) => (
                        <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                            {branch.branch_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Guru</TableHead>
                        <TableHead>Jenis Ijin</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {approvals.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>{item.teacher_name}</TableCell>
                            <TableCell>{item.status === 'LEAVE' ? 'Izin' : 'Sakit'}</TableCell>
                            <TableCell>
                                {new Date(item.attendance_date).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>{item.notes || '-'}</TableCell>
                            <TableCell>
                                {item.is_approved ? 'Disetujui' : 'Menunggu Persetujuan'}
                            </TableCell>
                            <TableCell>
                                {!item.is_approved && (
                                    <AlertDialog>
                                        <AlertDialogTrigger
                                            render={
                                                <Button variant="default" size="sm">
                                                    Setujui
                                                </Button>
                                            }
                                        />
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Konfirmasi Persetujuan
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Apakah Anda yakin ingin menyetujui absensi ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleApprove(item.id)}
                                                >
                                                    Ya, Setujui
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
