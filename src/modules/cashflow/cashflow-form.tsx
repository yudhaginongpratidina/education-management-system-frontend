'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList, toDateInput } from '@/lib/ems-constants';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';

const TYPE_OPTIONS = [
    { value: 'INCOME', label: 'Masuk' },
    { value: 'EXPENSE', label: 'Keluar' },
];

const PAYMENT_OPTIONS = [
    { value: 'CASH', label: 'Tunai' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'QRIS', label: 'QRIS' },
    { value: 'OTHER', label: 'Lainnya' },
];

export default function CashflowForm({
    type,
    item,
    onSuccess,
}: {
    type: 'create' | 'update';
    item?: any;
    onSuccess: () => void;
}) {
    const [branches, setBranches] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [transactionDate, setTransactionDate] = useState<string>(
        toDateInput(item?.transaction_date) || new Date().toISOString().slice(0, 10),
    );
    const [flowType, setFlowType] = useState<string>(item?.type ?? 'INCOME');
    const [branchId, setBranchId] = useState<string>(item?.branch_id ? String(item.branch_id) : '');
    const [category, setCategory] = useState<string>(item?.category ?? '');
    const [description, setDescription] = useState<string>(item?.description ?? '');
    const [amount, setAmount] = useState<string>(item?.amount != null ? String(item.amount) : '');
    const [paymentMethod, setPaymentMethod] = useState<string>(item?.payment_method ?? '');
    const [reference, setReference] = useState<string>(item?.reference ?? '');
    const [notes, setNotes] = useState<string>(item?.notes ?? '');

    useEffect(() => {
        http.get('/branches')
            .then((response) => setBranches(extractList(response.data)))
            .catch(() => setBranches([]));
    }, []);

    const onSubmit = async () => {
        if (!description.trim()) {
            toast.add({ title: 'Error', type: 'error', description: 'Keterangan wajib diisi' });
            return;
        }
        if (!amount || Number(amount) <= 0) {
            toast.add({
                title: 'Error',
                type: 'error',
                description: 'Nominal harus lebih dari 0',
            });
            return;
        }

        const payload = {
            transaction_date: transactionDate,
            type: flowType,
            branch_id: branchId ? Number(branchId) : null,
            category: category || null,
            description,
            amount: Number(amount),
            payment_method: paymentMethod || null,
            reference: reference || null,
            notes: notes || null,
        };

        setSubmitting(true);
        try {
            if (type === 'create') {
                const response = await http.post('/cashflow', payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Transaksi disimpan',
                });
            } else {
                const response = await http.put(`/cashflow/${item.id}`, payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Transaksi diperbarui',
                });
            }
            onSuccess();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setSubmitting(false);
        }
    };

    const branchItems = branches.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }));

    return (
        <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="transaction_date">Tanggal</FieldLabel>
                    <Input
                        id="transaction_date"
                        type="date"
                        className="h-10"
                        value={transactionDate}
                        onChange={(event) => setTransactionDate(event.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="type">Jenis</FieldLabel>
                    <Select
                        value={flowType}
                        onValueChange={(value) => setFlowType(value ?? 'INCOME')}
                        items={TYPE_OPTIONS}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            {TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor="description">Keterangan</FieldLabel>
                <Input
                    id="description"
                    className="h-10"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Contoh: Pembayaran paket Reguler - Budi"
                />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="amount">Nominal (Rp)</FieldLabel>
                    <Input
                        id="amount"
                        type="number"
                        className="h-10"
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="0"
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="category">Kategori</FieldLabel>
                    <Input
                        id="category"
                        className="h-10"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        placeholder="Pendaftaran / Gaji / Operasional"
                    />
                </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="branch_id">Cabang (opsional)</FieldLabel>
                    <Select
                        value={branchId || null}
                        onValueChange={(value) => setBranchId(value ?? '')}
                        items={branchItems}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Semua cabang" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((branch) => (
                                <SelectItem key={branch.id} value={String(branch.id)}>
                                    {branch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="payment_method">Metode Pembayaran</FieldLabel>
                    <Select
                        value={paymentMethod || null}
                        onValueChange={(value) => setPaymentMethod(value ?? '')}
                        items={PAYMENT_OPTIONS}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                        <SelectContent>
                            {PAYMENT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor="reference">Referensi (opsional)</FieldLabel>
                <Input
                    id="reference"
                    className="h-10"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="No. invoice / bukti transfer"
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                <Textarea
                    id="notes"
                    className="min-h-10"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Catatan tambahan"
                />
            </Field>
            <Button className="h-10" onClick={onSubmit} disabled={submitting}>
                {submitting ? 'Menyimpan...' : type === 'create' ? 'Simpan' : 'Update'}
            </Button>
        </FieldGroup>
    );
}
