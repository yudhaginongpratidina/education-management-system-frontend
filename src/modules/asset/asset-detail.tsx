'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatCurrency } from '@/lib/currency';
import { formatDate, extractList } from '@/lib/ems-constants';

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
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';

export default function AssetDetail({ id }: { id: number }) {
    const [asset, setAsset] = useState<any | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isMovementOpen, setIsMovementOpen] = useState(false);

    const [movementDate, setMovementDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [toBranchId, setToBranchId] = useState<string>('');
    const [toLocation, setToLocation] = useState<string>('');
    const [toResponsibleUserId, setToResponsibleUserId] = useState<string>('');
    const [toResponsibleName, setToResponsibleName] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    const loadAsset = async () => {
        try {
            const response = await http.get(`/assets/${id}`);
            setAsset(response.data.data ?? null);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        loadAsset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        Promise.all([http.get('/branches'), http.get('/users')])
            .then(([branchesRes, usersRes]) => {
                setBranches(extractList(branchesRes.data));
                setUsers(extractList(usersRes.data));
            })
            .catch(() => undefined);
    }, []);

    const submitMovement = async () => {
        setSubmitting(true);
        try {
            const response = await http.post(`/assets/${id}/movements`, {
                movement_date: movementDate,
                to_branch_id: toBranchId ? Number(toBranchId) : null,
                to_location: toLocation || null,
                to_responsible_user_id: toResponsibleUserId ? Number(toResponsibleUserId) : null,
                to_responsible_name: toResponsibleName || null,
                notes: notes || null,
            });
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Perpindahan dicatat',
            });
            setIsMovementOpen(false);
            setToBranchId('');
            setToLocation('');
            setToResponsibleUserId('');
            setToResponsibleName('');
            setNotes('');
            loadAsset();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setSubmitting(false);
        }
    };

    if (!asset) {
        return <p className="text-muted-foreground py-6 text-center text-sm">Memuat aset...</p>;
    }

    const info: { label: string; value: React.ReactNode }[] = [
        { label: 'Kode Aset', value: asset.code ?? '-' },
        { label: 'Kategori', value: asset.category_name ?? '-' },
        { label: 'Cabang', value: asset.branch_name ?? '-' },
        { label: 'Lokasi', value: asset.location ?? '-' },
        { label: 'Nilai Aset', value: `Rp ${formatCurrency(asset.purchase_price)}` },
        { label: 'Tanggal Perolehan', value: formatDate(asset.purchase_date) },
        {
            label: 'Umur Aset',
            value: asset.age_years != null ? `${asset.age_years} tahun` : '-',
        },
        {
            label: 'Sisa Umur',
            value:
                asset.remaining_years != null
                    ? asset.is_expired
                        ? 'Habis'
                        : `${asset.remaining_years} tahun`
                    : '-',
        },
        {
            label: 'Penanggung Jawab',
            value: asset.responsible_name ?? asset.responsible_user_name ?? '-',
        },
    ];

    const branchItems = branches.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }));
    const userItems = users.map((user) => ({
        value: String(user.id),
        label: user.full_name ?? user.email,
    }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusBadge status={asset.status} />
                    <StatusBadge status={asset.condition} />
                </div>
                <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
                    <DialogTrigger
                        render={
                            <Button className="h-9">
                                <Icon icon="mdi:swap-horizontal" /> Catat Perpindahan
                            </Button>
                        }
                    />
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>CATAT PERPINDAHAN ASET</DialogTitle>
                        </DialogHeader>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="movement_date">Tanggal Pindah</FieldLabel>
                                <Input
                                    id="movement_date"
                                    type="date"
                                    className="h-10"
                                    value={movementDate}
                                    onChange={(event) => setMovementDate(event.target.value)}
                                />
                            </Field>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="to_branch">Cabang Tujuan</FieldLabel>
                                    <Select
                                        value={toBranchId || null}
                                        onValueChange={(value) => setToBranchId(value ?? '')}
                                        items={branchItems}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Pilih cabang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch) => (
                                                <SelectItem
                                                    key={branch.id}
                                                    value={String(branch.id)}
                                                >
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="to_location">Lokasi Tujuan</FieldLabel>
                                    <Input
                                        id="to_location"
                                        className="h-10"
                                        value={toLocation}
                                        onChange={(event) => setToLocation(event.target.value)}
                                        placeholder="Contoh: Ruang Kelas B"
                                    />
                                </Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field>
                                    <FieldLabel htmlFor="to_user">Pengguna Baru</FieldLabel>
                                    <Select
                                        value={toResponsibleUserId || null}
                                        onValueChange={(value) => {
                                            setToResponsibleUserId(value ?? '');
                                            const selected = users.find(
                                                (user) => String(user.id) === value,
                                            );
                                            if (selected)
                                                setToResponsibleName(selected.full_name ?? '');
                                        }}
                                        items={userItems}
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Pilih pengguna" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.full_name ?? user.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="to_name">Nama Pengguna</FieldLabel>
                                    <Input
                                        id="to_name"
                                        className="h-10"
                                        value={toResponsibleName}
                                        onChange={(event) => {
                                            setToResponsibleName(event.target.value);
                                            setToResponsibleUserId('');
                                        }}
                                        placeholder="Nama pengguna baru"
                                    />
                                </Field>
                            </div>
                            <Field>
                                <FieldLabel htmlFor="movement_notes">Catatan</FieldLabel>
                                <Textarea
                                    id="movement_notes"
                                    className="min-h-10"
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                    placeholder="Alasan perpindahan"
                                />
                            </Field>
                        </FieldGroup>
                        <DialogFooter>
                            <Button className="h-10" onClick={submitMovement} disabled={submitting}>
                                {submitting ? 'Menyimpan...' : 'Simpan Perpindahan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent>
                    <p className="font-heading mb-3 text-lg font-semibold">{asset.name}</p>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {info.map((row) => (
                            <div key={row.label} className="flex flex-col">
                                <dt className="text-muted-foreground text-xs">{row.label}</dt>
                                <dd className="font-medium">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                    {asset.notes && (
                        <p className="text-muted-foreground mt-3 border-t border-border/60 pt-3 text-sm">
                            {asset.notes}
                        </p>
                    )}
                </CardContent>
            </Card>

            <div>
                <p className="font-heading mb-2 text-sm font-semibold">Riwayat Perpindahan Aset</p>
                <div className="max-h-70 overflow-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Dari</TableHead>
                                <TableHead>Ke</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(asset.movements ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                    >
                                        Belum ada riwayat perpindahan.
                                    </TableCell>
                                </TableRow>
                            )}
                            {(asset.movements ?? []).map((movement: any) => (
                                <TableRow key={movement.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {formatDate(movement.movement_date)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{movement.from_branch_name ?? '-'}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {movement.from_location ?? '-'}
                                                {movement.from_responsible_user_name
                                                    ? ` · ${movement.from_responsible_user_name}`
                                                    : movement.from_responsible_name
                                                      ? ` · ${movement.from_responsible_name}`
                                                      : ''}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{movement.to_branch_name ?? '-'}</span>
                                            <span className="text-muted-foreground text-xs">
                                                {movement.to_location ?? '-'}
                                                {movement.to_responsible_user_name
                                                    ? ` · ${movement.to_responsible_user_name}`
                                                    : movement.to_responsible_name
                                                      ? ` · ${movement.to_responsible_name}`
                                                      : ''}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate">
                                        {movement.notes || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
