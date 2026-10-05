'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { CLASS_STATUS_OPTIONS, extractList } from '@/lib/ems-constants';

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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';

// module components
import ClassForm from '@/modules/class/class-form';
import ClassStudentManagement from '@/modules/class/class-student-management';
import ClassTeacherManagement from '@/modules/class/class-teacher-management';
import ClassScheduleManagement from '@/modules/class/class-schedule-management';
import ClassSessionManagement from '@/modules/class/class-session-management';

export default function Page() {
    const [classes, setClasses] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [filterBranch, setFilterBranch] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editClass, setEditClass] = useState<any | null>(null);
    const [studentsClass, setStudentsClass] = useState<any | null>(null);
    const [teachersClass, setTeachersClass] = useState<any | null>(null);
    const [schedulesClass, setSchedulesClass] = useState<any | null>(null);
    const [sessionsClass, setSessionsClass] = useState<any | null>(null);

    const getClasses = async () => {
        try {
            const params = new URLSearchParams();
            if (filterBranch !== 'all') params.set('branch_id', filterBranch);
            if (filterStatus !== 'all') params.set('status', filterStatus);
            if (search) params.set('search', search);
            const query = params.toString();
            const response = await http.get(query ? `/classes?${query}` : '/classes');
            setClasses(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getBranches = async () => {
        try {
            const response = await http.get('/branches');
            setBranches(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getClasses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterBranch, filterStatus, search]);

    useEffect(() => {
        getBranches();
    }, []);

    const branchName = (branchId: number) =>
        branches.find((branch) => branch.id === branchId)?.name ?? '-';

    const deleteClass = async (id: number) => {
        try {
            const response = await http.delete(`/classes/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Kelas berhasil dihapus',
            });
            getClasses();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditClass(null);
        getClasses();
    };

    const branchItems = [
        { value: 'all', label: 'Semua Cabang' },
        ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
    ];
    const statusFilterItems = [
        { value: 'all', label: 'Semua Status' },
        ...CLASS_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Cari nama / kode kelas..."
                    className="h-10 w-60"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <Select
                    value={filterBranch}
                    onValueChange={(value) => setFilterBranch(value ?? 'all')}
                    items={branchItems}
                >
                    <SelectTrigger className="h-10 w-48">
                        <SelectValue placeholder="Semua Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Cabang</SelectItem>
                        {branches.map((branch) => (
                            <SelectItem key={branch.id} value={String(branch.id)}>
                                {branch.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value ?? 'all')}
                    items={statusFilterItems}
                >
                    <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {CLASS_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="ml-auto">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger
                            render={
                                <Button className="h-10">
                                    <Icon icon="mdi:plus" /> Tambah Kelas
                                </Button>
                            }
                        />
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>TAMBAH KELAS</DialogTitle>
                                <DialogDescription>Buat kelas baru.</DialogDescription>
                            </DialogHeader>
                            <ClassForm type="create" onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode</TableHead>
                            <TableHead>Nama Kelas</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Cabang</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Deskripsi</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada kelas.
                                </TableCell>
                            </TableRow>
                        )}
                        {classes.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-mono text-xs">{item.code}</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{item.program_name ?? '-'}</span>
                                        {item.program_level_name && (
                                            <span className="text-muted-foreground text-xs">
                                                {item.program_level_name}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{branchName(item.branch_id)}</TableCell>
                                <TableCell>
                                    <StatusBadge status={item.status} />
                                </TableCell>
                                <TableCell className="max-w-60 truncate">
                                    {item.description ?? '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                        <Dialog
                                            open={editClass?.id === item.id}
                                            onOpenChange={(open) =>
                                                setEditClass(open ? item : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mingcute:edit-line" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>EDIT KELAS</DialogTitle>
                                                </DialogHeader>
                                                <ClassForm
                                                    type="update"
                                                    classData={item}
                                                    onSuccess={handleSuccess}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={studentsClass?.id === item.id}
                                            onOpenChange={(open) =>
                                                setStudentsClass(open ? item : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:account-group" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>SISWA KELAS</DialogTitle>
                                                    <DialogDescription>
                                                        Kelola siswa pada kelas {item.name}.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ClassStudentManagement
                                                    classId={item.id}
                                                    branchId={item.branch_id}
                                                />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={teachersClass?.id === item.id}
                                            onOpenChange={(open) =>
                                                setTeachersClass(open ? item : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:account-tie" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>GURU KELAS</DialogTitle>
                                                    <DialogDescription>
                                                        Kelola penugasan guru pada kelas {item.name}
                                                        .
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ClassTeacherManagement classId={item.id} />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={schedulesClass?.id === item.id}
                                            onOpenChange={(open) =>
                                                setSchedulesClass(open ? item : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:calendar-week" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-3xl">
                                                <DialogHeader>
                                                    <DialogTitle>JADWAL KELAS</DialogTitle>
                                                    <DialogDescription>
                                                        Kelola jadwal rutin kelas {item.name}.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ClassScheduleManagement classId={item.id} />
                                            </DialogContent>
                                        </Dialog>

                                        <Dialog
                                            open={sessionsClass?.id === item.id}
                                            onOpenChange={(open) =>
                                                setSessionsClass(open ? item : null)
                                            }
                                        >
                                            <DialogTrigger
                                                render={
                                                    <Button size="icon" variant="outline">
                                                        <Icon icon="mdi:calendar-clock" />
                                                    </Button>
                                                }
                                            />
                                            <DialogContent className="sm:max-w-4xl">
                                                <DialogHeader>
                                                    <DialogTitle>SESI KELAS</DialogTitle>
                                                    <DialogDescription>
                                                        Kelola sesi pembelajaran kelas {item.name}.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ClassSessionManagement
                                                    classId={item.id}
                                                    branchId={item.branch_id}
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
                                                        Yakin ingin menghapus kelas ini?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteClass(item.id)}
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
