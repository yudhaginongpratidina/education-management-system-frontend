'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatDate, toDateInput, extractList } from '@/lib/ems-constants';

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
    DialogFooter,
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { StatusBadge } from '@/components/status-badge';

const today = () => new Date().toISOString().slice(0, 10);

export default function ClassStudentManagement({
    classId,
    branchId,
}: {
    classId: number;
    branchId?: number;
}) {
    const [members, setMembers] = useState<any[]>([]);
    const [studentPrograms, setStudentPrograms] = useState<any[]>([]);
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [joinedAt, setJoinedAt] = useState<string>(today());
    const [editItem, setEditItem] = useState<any | null>(null);
    const [editJoinedAt, setEditJoinedAt] = useState<string>('');
    const [editLeftAt, setEditLeftAt] = useState<string>('');

    const getMembers = async () => {
        try {
            const response = await http.get(`/classes/${classId}/students`);
            setMembers(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getStudentPrograms = async () => {
        try {
            const url = branchId ? `/student-programs?branch_id=${branchId}` : '/student-programs';
            const response = await http.get(url);
            setStudentPrograms(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getMembers();
        getStudentPrograms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, branchId]);

    const activeProgramIds = members
        .filter((member) => !member.left_at)
        .map((member) => member.student_program_id);

    const availablePrograms = studentPrograms.filter(
        (program) => !activeProgramIds.includes(program.id),
    );

    const addMember = async () => {
        if (!selectedProgramId) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Pilih siswa terlebih dahulu',
            });
            return;
        }
        try {
            const response = await http.post(`/classes/${classId}/students`, {
                student_program_id: Number(selectedProgramId),
                joined_at: joinedAt || undefined,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Siswa berhasil ditambahkan ke kelas',
            });
            setSelectedProgramId('');
            setJoinedAt(today());
            getMembers();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const updateMember = async () => {
        if (!editItem) return;
        try {
            const response = await http.patch(
                `/classes/${classId}/students/${editItem.student_program_id}`,
                {
                    joined_at: editJoinedAt || undefined,
                    left_at: editLeftAt || null,
                },
            );
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Data keanggotaan diperbarui',
            });
            setEditItem(null);
            getMembers();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const removeMember = async (studentProgramId: number) => {
        try {
            const response = await http.delete(`/classes/${classId}/students/${studentProgramId}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Siswa dikeluarkan dari kelas',
            });
            getMembers();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const studentProgramItems = availablePrograms.map((program) => ({
        value: String(program.id),
        label: `${program.student_full_name} - ${program.package_name ?? '-'}`,
    }));

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-3">
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="student_program_id">Siswa</FieldLabel>
                            <Select
                                value={selectedProgramId || null}
                                onValueChange={(value) => setSelectedProgramId(value ?? '')}
                                items={studentProgramItems}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih siswa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePrograms.map((program) => (
                                        <SelectItem key={program.id} value={String(program.id)}>
                                            {program.student_full_name} -{' '}
                                            {program.package_name ?? '-'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="joined_at">Tanggal Bergabung</FieldLabel>
                            <Input
                                id="joined_at"
                                type="date"
                                className="h-10"
                                value={joinedAt}
                                onChange={(event) => setJoinedAt(event.target.value)}
                            />
                        </Field>
                    </div>
                    <Button className="h-10 w-fit" onClick={addMember}>
                        <Icon icon="mdi:account-plus" /> Tambah Siswa ke Kelas
                    </Button>
                </FieldGroup>
            </div>

            <div className="max-h-100 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Siswa</TableHead>
                            <TableHead>Paket / Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Bergabung</TableHead>
                            <TableHead>Keluar</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada siswa di kelas ini.
                                </TableCell>
                            </TableRow>
                        )}
                        {members.map((member) => (
                            <TableRow key={member.student_program_id}>
                                <TableCell className="font-medium">{member.student_name}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{member.package_name ?? '-'}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {member.level_name ?? '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={
                                            member.left_at ? 'INACTIVE' : member.enrollment_status
                                        }
                                    />
                                </TableCell>
                                <TableCell>{formatDate(member.joined_at)}</TableCell>
                                <TableCell>{formatDate(member.left_at)}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={
                                            editItem?.student_program_id ===
                                            member.student_program_id
                                        }
                                        onOpenChange={(open) => {
                                            if (open) {
                                                setEditItem(member);
                                                setEditJoinedAt(toDateInput(member.joined_at));
                                                setEditLeftAt(toDateInput(member.left_at));
                                            } else {
                                                setEditItem(null);
                                            }
                                        }}
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
                                                <DialogTitle>EDIT KEANGGOTAAN</DialogTitle>
                                            </DialogHeader>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="edit_joined_at">
                                                        Tanggal Bergabung
                                                    </FieldLabel>
                                                    <Input
                                                        id="edit_joined_at"
                                                        type="date"
                                                        className="h-10"
                                                        value={editJoinedAt}
                                                        onChange={(event) =>
                                                            setEditJoinedAt(event.target.value)
                                                        }
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="edit_left_at">
                                                        Tanggal Keluar
                                                    </FieldLabel>
                                                    <Input
                                                        id="edit_left_at"
                                                        type="date"
                                                        className="h-10"
                                                        value={editLeftAt}
                                                        onChange={(event) =>
                                                            setEditLeftAt(event.target.value)
                                                        }
                                                    />
                                                </Field>
                                            </FieldGroup>
                                            <DialogFooter>
                                                <Button className="h-10" onClick={updateMember}>
                                                    Update
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger
                                            render={
                                                <Button size="icon" variant="outline">
                                                    <Icon icon="mdi:account-remove" />
                                                </Button>
                                            }
                                        />
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>KELUARKAN SISWA</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Yakin ingin mengeluarkan siswa dari kelas ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        removeMember(member.student_program_id)
                                                    }
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
