'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import {
    DAY_OF_WEEK_OPTIONS,
    formatDate,
    formatTime,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { StatusBadge } from '@/components/status-badge';

const today = () => new Date().toISOString().slice(0, 10);

function dayLabel(dayOfWeek: number | string) {
    const option = DAY_OF_WEEK_OPTIONS.find((item) => item.value === String(dayOfWeek));
    return option?.label ?? `Hari ${dayOfWeek}`;
}

export default function ClassScheduleManagement({ classId }: { classId: number }) {
    const [schedules, setSchedules] = useState<any[]>([]);
    const [dayOfWeek, setDayOfWeek] = useState<string>('1');
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('09:00');
    const [effectiveFrom, setEffectiveFrom] = useState<string>(today());
    const [effectiveUntil, setEffectiveUntil] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);

    const [editItem, setEditItem] = useState<any | null>(null);
    const [editDay, setEditDay] = useState<string>('1');
    const [editStart, setEditStart] = useState<string>('');
    const [editEnd, setEditEnd] = useState<string>('');
    const [editFrom, setEditFrom] = useState<string>('');
    const [editUntil, setEditUntil] = useState<string>('');
    const [editActive, setEditActive] = useState<boolean>(true);

    const getSchedules = async () => {
        try {
            const response = await http.get(`/classes/${classId}/schedules`);
            setSchedules(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getSchedules();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId]);

    const createSchedule = async () => {
        try {
            const response = await http.post(`/classes/${classId}/schedules`, {
                day_of_week: Number(dayOfWeek),
                start_time: startTime,
                end_time: endTime,
                effective_from: effectiveFrom,
                effective_until: effectiveUntil || null,
                is_active: isActive,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Jadwal berhasil ditambahkan',
            });
            getSchedules();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const updateSchedule = async () => {
        if (!editItem) return;
        try {
            const response = await http.patch(`/classes/${classId}/schedules/${editItem.id}`, {
                day_of_week: Number(editDay),
                start_time: editStart,
                end_time: editEnd,
                effective_from: editFrom || undefined,
                effective_until: editUntil || null,
                is_active: editActive,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Jadwal diperbarui',
            });
            setEditItem(null);
            getSchedules();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const deleteSchedule = async (id: number) => {
        try {
            const response = await http.delete(`/classes/${classId}/schedules/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Jadwal dihapus',
            });
            getSchedules();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    return (
        <div className="space-y-4">
            <div className="rounded-md border p-3">
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="day_of_week">Hari</FieldLabel>
                            <Select
                                value={dayOfWeek}
                                onValueChange={(value) => setDayOfWeek(value ?? '1')}
                                items={DAY_OF_WEEK_OPTIONS}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Pilih hari" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAY_OF_WEEK_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="start_time">Jam Mulai</FieldLabel>
                            <Input
                                id="start_time"
                                type="time"
                                className="h-10"
                                value={startTime}
                                onChange={(event) => setStartTime(event.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="end_time">Jam Selesai</FieldLabel>
                            <Input
                                id="end_time"
                                type="time"
                                className="h-10"
                                value={endTime}
                                onChange={(event) => setEndTime(event.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="effective_from">Berlaku Dari</FieldLabel>
                            <Input
                                id="effective_from"
                                type="date"
                                className="h-10"
                                value={effectiveFrom}
                                onChange={(event) => setEffectiveFrom(event.target.value)}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="effective_until">Berlaku Sampai</FieldLabel>
                            <Input
                                id="effective_until"
                                type="date"
                                className="h-10"
                                value={effectiveUntil}
                                onChange={(event) => setEffectiveUntil(event.target.value)}
                            />
                        </Field>
                        <Field orientation="horizontal" className="items-center gap-2 md:mt-6">
                            <Checkbox
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={(checked) => setIsActive(!!checked)}
                            />
                            <FieldLabel htmlFor="is_active">Aktif</FieldLabel>
                        </Field>
                    </div>
                    <Button className="h-10 w-fit" onClick={createSchedule}>
                        <Icon icon="mdi:calendar-plus" /> Tambah Jadwal
                    </Button>
                </FieldGroup>
            </div>

            <div className="max-h-100 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hari</TableHead>
                            <TableHead>Jam</TableHead>
                            <TableHead>Berlaku</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center text-muted-foreground"
                                >
                                    Belum ada jadwal rutin.
                                </TableCell>
                            </TableRow>
                        )}
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                    {dayLabel(schedule.day_of_week)}
                                </TableCell>
                                <TableCell>
                                    {formatTime(schedule.start_time)} -{' '}
                                    {formatTime(schedule.end_time)}
                                </TableCell>
                                <TableCell>
                                    {formatDate(schedule.effective_from)} -{' '}
                                    {formatDate(schedule.effective_until)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge
                                        status={schedule.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    />
                                </TableCell>
                                <TableCell className="flex gap-2">
                                    <Dialog
                                        open={editItem?.id === schedule.id}
                                        onOpenChange={(open) => {
                                            if (open) {
                                                setEditItem(schedule);
                                                setEditDay(String(schedule.day_of_week));
                                                setEditStart(formatTime(schedule.start_time));
                                                setEditEnd(formatTime(schedule.end_time));
                                                setEditFrom(toDateInput(schedule.effective_from));
                                                setEditUntil(toDateInput(schedule.effective_until));
                                                setEditActive(Boolean(schedule.is_active));
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
                                                <DialogTitle>EDIT JADWAL</DialogTitle>
                                            </DialogHeader>
                                            <FieldGroup>
                                                <Field>
                                                    <FieldLabel htmlFor="edit_day">Hari</FieldLabel>
                                                    <Select
                                                        value={editDay}
                                                        onValueChange={(value) =>
                                                            setEditDay(value ?? '1')
                                                        }
                                                        items={DAY_OF_WEEK_OPTIONS}
                                                    >
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DAY_OF_WEEK_OPTIONS.map((option) => (
                                                                <SelectItem
                                                                    key={option.value}
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Field>
                                                        <FieldLabel htmlFor="edit_start">
                                                            Jam Mulai
                                                        </FieldLabel>
                                                        <Input
                                                            id="edit_start"
                                                            type="time"
                                                            className="h-10"
                                                            value={editStart}
                                                            onChange={(event) =>
                                                                setEditStart(event.target.value)
                                                            }
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="edit_end">
                                                            Jam Selesai
                                                        </FieldLabel>
                                                        <Input
                                                            id="edit_end"
                                                            type="time"
                                                            className="h-10"
                                                            value={editEnd}
                                                            onChange={(event) =>
                                                                setEditEnd(event.target.value)
                                                            }
                                                        />
                                                    </Field>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <Field>
                                                        <FieldLabel htmlFor="edit_from">
                                                            Berlaku Dari
                                                        </FieldLabel>
                                                        <Input
                                                            id="edit_from"
                                                            type="date"
                                                            className="h-10"
                                                            value={editFrom}
                                                            onChange={(event) =>
                                                                setEditFrom(event.target.value)
                                                            }
                                                        />
                                                    </Field>
                                                    <Field>
                                                        <FieldLabel htmlFor="edit_until">
                                                            Berlaku Sampai
                                                        </FieldLabel>
                                                        <Input
                                                            id="edit_until"
                                                            type="date"
                                                            className="h-10"
                                                            value={editUntil}
                                                            onChange={(event) =>
                                                                setEditUntil(event.target.value)
                                                            }
                                                        />
                                                    </Field>
                                                </div>
                                                <Field
                                                    orientation="horizontal"
                                                    className="items-center gap-2"
                                                >
                                                    <Checkbox
                                                        id="edit_active"
                                                        checked={editActive}
                                                        onCheckedChange={(checked) =>
                                                            setEditActive(!!checked)
                                                        }
                                                    />
                                                    <FieldLabel htmlFor="edit_active">
                                                        Aktif
                                                    </FieldLabel>
                                                </Field>
                                            </FieldGroup>
                                            <DialogFooter>
                                                <Button className="h-10" onClick={updateSchedule}>
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
                                                <AlertDialogTitle>HAPUS JADWAL</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Yakin ingin menghapus jadwal ini?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteSchedule(schedule.id)}
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
