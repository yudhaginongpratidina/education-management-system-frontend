'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatCurrency } from '@/lib/currency';
import { formatDate, extractList, STUDENT_PROGRAM_STATUS_OPTIONS } from '@/lib/ems-constants';

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
import { StatusBadge } from '@/components/status-badge';

// module components
import StudentProgramForm from '@/modules/student/student-program-form';
import StudentProgramSummary from '@/modules/student/student-program-summary';
import { intensityLabel } from '@/lib/enrollment';

export default function StudentProgramsList({ studentId }: { studentId: number }) {
    const [items, setItems] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);
    const [openSummaryId, setOpenSummaryId] = useState<number | null>(null);

    const getItems = async () => {
        try {
            const params = new URLSearchParams({ student_id: String(studentId) });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            const response = await http.get(`/student-programs?${params.toString()}`);
            setItems(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId, statusFilter]);

    const deleteItem = async (id: number) => {
        try {
            const response = await http.delete(`/student-programs/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Program siswa berhasil dihapus',
            });
            getItems();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setOpenEditId(null);
        getItems();
    };

    const statusFilterItems = [
        { value: 'all', label: 'Semua Status' },
        ...STUDENT_PROGRAM_STATUS_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
        })),
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground">Daftar program yang diikuti siswa.</p>
                <div className="flex items-center gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value ?? 'all')}
                        items={statusFilterItems}
                    >
                        <SelectTrigger className="h-10 w-44">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {STUDENT_PROGRAM_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger
                            render={
                                <Button className="h-10">
                                    <Icon icon="mdi:plus" /> Tambah Program
                                </Button>
                            }
                        />
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>ASSIGN PROGRAM KE SISWA</DialogTitle>
                                <DialogDescription>
                                    Pilih cabang, program, paket, dan level untuk siswa ini.
                                </DialogDescription>
                            </DialogHeader>
                            <StudentProgramForm
                                type="create"
                                studentId={studentId}
                                onSuccess={handleSuccess}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="max-h-100 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Paket</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Cabang</TableHead>
                            <TableHead>Periode</TableHead>
                            <TableHead>Intensitas</TableHead>
                            <TableHead>Sesi</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={9}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada program yang di-assign.
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.package_name ?? '-'}
                                </TableCell>
                                <TableCell>{item.level_name ?? '-'}</TableCell>
                                <TableCell>{item.branch_name ?? '-'}</TableCell>
                                <TableCell>
                                    {formatDate(item.started_at)} - {formatDate(item.ended_at)}
                                </TableCell>
                                <TableCell>
                                    {intensityLabel(item.sessions_per_period, item.session_period)}
                                </TableCell>
                                <TableCell>
                                    {item.total_sessions != null ? `${item.total_sessions}` : '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        {Number(item.selling_price) > 0 && (
                                            <del className="text-muted-foreground text-xs">
                                                {formatCurrency(item.normal_price)}
                                            </del>
                                        )}
                                        <span className="font-medium">
                                            {formatCurrency(
                                                Number(item.selling_price) > 0
                                                    ? item.selling_price
                                                    : item.normal_price,
                                            )}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={item.status} />
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={openSummaryId === item.id}
                                        onOpenChange={(open) =>
                                            setOpenSummaryId(open ? item.id : null)
                                        }
                                    >
                                        <DialogTrigger
                                            render={
                                                <Button size="icon" variant="outline">
                                                    <Icon icon="mdi:chart-box-outline" />
                                                </Button>
                                            }
                                        />
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>RINGKASAN PAKET</DialogTitle>
                                                <DialogDescription>
                                                    Pemakaian sesi dan ketentuan paket siswa.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <StudentProgramSummary id={item.id} />
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog
                                        open={openEditId === item.id}
                                        onOpenChange={(open) =>
                                            setOpenEditId(open ? item.id : null)
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
                                                <DialogTitle>EDIT PROGRAM SISWA</DialogTitle>
                                                <DialogDescription>
                                                    Perbarui data program siswa.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <StudentProgramForm
                                                type="update"
                                                studentId={studentId}
                                                id={item.id}
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
                                                    KONFIRMASI HAPUS
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Yakin ingin menghapus program ini dari siswa?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteItem(item.id)}
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
            </div>
        </div>
    );
}
