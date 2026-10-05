'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import {
    ASSET_CONDITION_OPTIONS,
    ASSET_STATUS_OPTIONS,
    extractList,
    toDateInput,
} from '@/lib/ems-constants';

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

export default function AssetForm({
    type,
    item,
    onSuccess,
}: {
    type: 'create' | 'update';
    item?: any;
    onSuccess: () => void;
}) {
    const [categories, setCategories] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const [name, setName] = useState<string>(item?.name ?? '');
    const [categoryId, setCategoryId] = useState<string>(
        item?.category_id ? String(item.category_id) : '',
    );
    const [branchId, setBranchId] = useState<string>(item?.branch_id ? String(item.branch_id) : '');
    const [location, setLocation] = useState<string>(item?.location ?? '');
    const [purchaseDate, setPurchaseDate] = useState<string>(toDateInput(item?.purchase_date));
    const [purchasePrice, setPurchasePrice] = useState<string>(
        item?.purchase_price != null ? String(item.purchase_price) : '',
    );
    const [usefulLife, setUsefulLife] = useState<string>(
        item?.useful_life_years != null ? String(item.useful_life_years) : '',
    );
    const [condition, setCondition] = useState<string>(item?.condition ?? 'GOOD');
    const [status, setStatus] = useState<string>(item?.status ?? 'ACTIVE');
    const [responsibleUserId, setResponsibleUserId] = useState<string>(
        item?.responsible_user_id ? String(item.responsible_user_id) : '',
    );
    const [responsibleName, setResponsibleName] = useState<string>(item?.responsible_name ?? '');
    const [notes, setNotes] = useState<string>(item?.notes ?? '');

    useEffect(() => {
        const load = async () => {
            try {
                const [categoriesRes, branchesRes, usersRes] = await Promise.all([
                    http.get('/asset-categories'),
                    http.get('/branches'),
                    http.get('/users'),
                ]);
                setCategories(extractList(categoriesRes.data));
                setBranches(extractList(branchesRes.data));
                setUsers(extractList(usersRes.data));
            } catch (error) {
                const { message } = parseAxiosError(error);
                toast.add({ title: 'Error', type: 'error', description: message });
            }
        };
        load();
    }, []);

    const onSubmit = async () => {
        if (!name.trim()) {
            toast.add({ title: 'Error', type: 'error', description: 'Nama aset wajib diisi' });
            return;
        }
        if (!categoryId) {
            toast.add({ title: 'Error', type: 'error', description: 'Kategori wajib dipilih' });
            return;
        }

        const payload = {
            name,
            category_id: Number(categoryId),
            branch_id: branchId ? Number(branchId) : null,
            location: location || null,
            purchase_date: purchaseDate || null,
            purchase_price: purchasePrice ? Number(purchasePrice) : 0,
            useful_life_years: usefulLife ? Number(usefulLife) : null,
            condition,
            status,
            responsible_user_id: responsibleUserId ? Number(responsibleUserId) : null,
            responsible_name: responsibleName || null,
            notes: notes || null,
        };

        setSubmitting(true);
        try {
            if (type === 'create') {
                const response = await http.post('/assets', payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Aset dibuat',
                });
            } else {
                const response = await http.put(`/assets/${item.id}`, payload);
                toast.add({
                    title: 'Success',
                    type: 'success',
                    description: response.data.message ?? 'Aset diperbarui',
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

    const categoryItems = categories.map((category) => ({
        value: String(category.id),
        label: `${category.name}${category.code_prefix ? ` (${category.code_prefix})` : ''}`,
    }));
    const branchItems = branches.map((branch) => ({
        value: String(branch.id),
        label: branch.name,
    }));
    const userItems = users.map((user) => ({
        value: String(user.id),
        label: user.full_name ?? user.email,
    }));

    return (
        <FieldGroup>
            <Field>
                <FieldLabel htmlFor="name">Nama Aset</FieldLabel>
                <Input
                    id="name"
                    className="h-10"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Contoh: Proyektor Epson"
                />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="category_id">Kategori</FieldLabel>
                    <Select
                        value={categoryId || null}
                        onValueChange={(value) => setCategoryId(value ?? '')}
                        items={categoryItems}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                    {category.code_prefix ? ` (${category.code_prefix})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="branch_id">Cabang (opsional)</FieldLabel>
                    <Select
                        value={branchId || null}
                        onValueChange={(value) => setBranchId(value ?? '')}
                        items={branchItems}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue placeholder="Pilih cabang" />
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
            </div>
            <Field>
                <FieldLabel htmlFor="location">Lokasi / Ruangan</FieldLabel>
                <Input
                    id="location"
                    className="h-10"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Contoh: Ruang Kelas A"
                />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="purchase_date">Tanggal Perolehan</FieldLabel>
                    <Input
                        id="purchase_date"
                        type="date"
                        className="h-10"
                        value={purchaseDate}
                        onChange={(event) => setPurchaseDate(event.target.value)}
                    />
                </Field>
                <Field>
                    <FieldLabel htmlFor="purchase_price">Nilai Aset (Rp)</FieldLabel>
                    <Input
                        id="purchase_price"
                        type="number"
                        className="h-10"
                        value={purchasePrice}
                        onChange={(event) => setPurchasePrice(event.target.value)}
                        placeholder="0"
                    />
                </Field>
            </div>
            <Field>
                <FieldLabel htmlFor="useful_life_years">Estimasi Umur Maksimal (tahun)</FieldLabel>
                <Input
                    id="useful_life_years"
                    type="number"
                    className="h-10"
                    value={usefulLife}
                    onChange={(event) => setUsefulLife(event.target.value)}
                    placeholder="Contoh: 5"
                />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="condition">Kondisi</FieldLabel>
                    <Select
                        value={condition}
                        onValueChange={(value) => setCondition(value ?? 'GOOD')}
                        items={ASSET_CONDITION_OPTIONS}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ASSET_CONDITION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
                <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                        value={status}
                        onValueChange={(value) => setStatus(value ?? 'ACTIVE')}
                        items={ASSET_STATUS_OPTIONS}
                    >
                        <SelectTrigger className="h-10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ASSET_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="responsible_user_id">Penanggung Jawab (akun)</FieldLabel>
                    <Select
                        value={responsibleUserId || null}
                        onValueChange={(value) => {
                            setResponsibleUserId(value ?? '');
                            const selected = users.find((user) => String(user.id) === value);
                            if (selected) setResponsibleName(selected.full_name ?? '');
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
                    <FieldLabel htmlFor="responsible_name">Nama Penanggung Jawab</FieldLabel>
                    <Input
                        id="responsible_name"
                        className="h-10"
                        value={responsibleName}
                        onChange={(event) => {
                            setResponsibleName(event.target.value);
                            setResponsibleUserId('');
                        }}
                        placeholder="Nama pengguna aset"
                    />
                </Field>
            </div>
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
                {submitting ? 'Menyimpan...' : type === 'create' ? 'Simpan Aset' : 'Update Aset'}
            </Button>
        </FieldGroup>
    );
}
