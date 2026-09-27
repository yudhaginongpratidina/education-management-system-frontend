'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import {
    CLASS_TEACHER_ROLE_OPTIONS,
    formatDate,
    toDateInput,
    extractList,
} from '@/lib/ems-constants';

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

export default function ClassTeacherManagement({ classId }: { classId: number }) {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<string>('PRIMARY');
    const [startedAt, setStartedAt] = useState<string>(today());
    const [editItem, setEditItem] = useState<any | null>(null);
    const [editRole, setEditRole] = useState<string>('PRIMARY');
    const [editStartedAt, setEditStartedAt] = useState<string>('');
    const [editEndedAt, setEditEndedAt] = useState<string>('');

    const getAssignments = async () => {
        try {
            const response = await http.get(`/classes/${classId}/teachers`);
            setAssignments(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getTeachers = async () => {
        try {
            const response = await http.get('/teachers');
            setTeachers(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getAssignments();
        getTeachers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]);

    const assignTeacher = async () => {
        if (!selectedTeacherId) {
            toast.add({ title: 'Error', type: 'error', description: 'Pilih guru terlebih dahulu' });
            return;
        }
        try {
            const response = await http.post(`/classes/${classId}/teachers`, {
                teacher_id: Number(selectedTeacherId),
                role: selectedRole,
                started_at: startedAt,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Guru berhasil ditugaskan',
            });
            setSelectedTeacherId('');
            setSelectedRole('PRIMARY');
            setStartedAt(today());
            getAssignments();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const updateAssignment = async () => {
        if (!editItem) return;
        try {
            const response = await http.patch(`/classes/${classId}/teachers/${editItem.id}`, {
                role: editRole,
                started_at: editStartedAt || undefined,
                ended_at: editEndedAt || null,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Penugasan guru diperbarui',
            });
            setEditItem(null);
            getAssignments();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const removeAssignment = async (id: number) => {
        try {
            const response = await http.delete(`/classes/${classId}/teachers/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Penugasan guru dihapus',
            });
            getAssignments();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const teacherItems = teachers.map((teacher) => ({
        value: String(teacher.id),
        label: teacher.full_name,
    }));

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-3">
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="teacher_id">Guru</FieldLabel>
                            <Select
                                value={selectedTeacherId || null}
                                onValueChange={(value) => setSelectedTeacherId(value ?? '')}
                                items={teacherItems}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih guru" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                                            {teacher.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="role">Peran</FieldLabel>
                            <Select
                                value={selectedRole}
                                onValueChange={(value) => setSelectedRole(value ?? 'PRIMARY')}
                                items={CLASS_TEACHER_ROLE_OPTIONS}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih peran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLASS_TEACHER_ROLE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="started_at">Mulai Bertugas</FieldLabel>
                            <Input
                                id="started_at"
                                type="date"
                                className="h-10"
                                value={startedAt}
                                onChange={(event) => setStartedAt(event.target.value)}
                            />
                        </Field>
                    </div>
                    <Button className="h-10 w-fit" onClick={assignTeacher}>
                        <Icon icon="mdi:account-tie-plus" /> Tugaskan Guru
                    </Button>
                </FieldGroup>
            </div>

            <div className="max-h-100 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Guru</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead>Mulai</TableHead>
                            <TableHead>Selesai</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada guru yang ditugaskan.
                                </TableCell>
                            </TableRow>
                        )}
                        {assignments.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.teacher_name}</TableCell>
                                <TableCell>
                                    <StatusBadge status={item.role} />
                                </TableCell>
                                <TableCell>{formatDate(item.started_at)}</TableCell>
                                <TableCell>{formatDate(item.ended_at)}</TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={editItem?.id === item.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                setEditItem(item);
                                                setEditRole(item.role ?? 'PRIMARY');
                                                setEditStartedAt(toDateInput(item.started_at));
                                                setEditEndedAt(toDateInput(item.ended_at));
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
                                                <DialogTitle>EDIT PENUGASAN GURU</DialogTitle>
                                            </DialogHeader>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="edit_role">
                                                        Peran
                                                    </FieldLabel>
                                                    <Select
                                                        value={editRole}
                                                        onValueChange={(value) =>
                                                            setEditRole(value ?? 'PRIMARY')
                                                        }
                                                        items={CLASS_TEACHER_ROLE_OPTIONS}
                                                    >
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CLASS_TEACHER_ROLE_OPTIONS.map(
                                                                (option) => (
                                                                    <SelectItem
                                                                        key={option.value}
                                                                        value={option.value}
                                                                    >
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="edit_started_at">
                                                        Mulai Bertugas
                                                    </FieldLabel>
                                                    <Input
                                                        id="edit_started_at"
                                                        type="date"
                                                        className="h-10"
                                                        value={editStartedAt}
                                                        onChange={(event) =>
                                                            setEditStartedAt(event.target.value)
                                                        }
                                                    />
                                                </Field>
                                                <Field>
                                                    <FieldLabel htmlFor="edit_ended_at">
                                                        Selesai Bertugas
                                                    </FieldLabel>
                                                    <Input
                                                        id="edit_ended_at"
                                                        type="date"
                                                        className="h-10"
                                                        value={editEndedAt}
                                                        onChange={(event) =>
                                                            setEditEndedAt(event.target.value)
                                                        }
                                                    />
                                                </Field>
                                            </FieldGroup>
                                            <DialogFooter>
                                                <Button className="h-10" onClick={updateAssignment}>
                                                    Update
                                                </Button>
                                            </DialogFooter>
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
                                                <AlertDialogTitle>HAPUS PENUGASAN</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Yakin ingin menghapus penugasan guru ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => removeAssignment(item.id)}
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
