'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatCurrency } from '@/lib/currency';
import { ASSET_CONDITION_OPTIONS, ASSET_STATUS_OPTIONS, extractList } from '@/lib/ems-constants';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { toast } from '@/components/ui/toast';

// module components
import AssetForm from '@/modules/asset/asset-form';
import AssetDetail from '@/modules/asset/asset-detail';
import AssetCategoryManagement from '@/modules/asset/asset-category-management';

export default function AssetDashboard() {
    const [assets, setAssets] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [conditionFilter, setConditionFilter] = useState('all');
    const [page, setPage] = useState(1);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);
    const [detailItem, setDetailItem] = useState<any | null>(null);

    const buildParams = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (categoryFilter !== 'all') params.set('category_id', categoryFilter);
        if (branchFilter !== 'all') params.set('branch_id', branchFilter);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (conditionFilter !== 'all') params.set('condition', conditionFilter);
        return params;
    };

    const getAssets = async () => {
        setLoading(true);
        try {
            const params = buildParams();
            params.set('page', String(page));
            params.set('limit', '50');
            const response = await http.get(`/assets?${params.toString()}`);
            setAssets(extractList(response.data));
            setSummary(response.data.summary ?? null);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    const getReferences = async () => {
        try {
            const [categoriesRes, branchesRes] = await Promise.all([
                http.get('/asset-categories'),
                http.get('/branches'),
            ]);
            setCategories(extractList(categoriesRes.data));
            setBranches(extractList(branchesRes.data));
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        getAssets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, categoryFilter, branchFilter, statusFilter, conditionFilter, page]);

    useEffect(() => {
        getReferences();
    }, []);

    const deleteAsset = async (id: number) => {
        try {
            const response = await http.delete(`/assets/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Aset dihapus',
            });
            getAssets();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditItem(null);
        getAssets();
    };

    const status = summary?.by_status ?? {};
    const summaryCards = [
        { label: 'Total Aset', value: summary?.total ?? 0, sub: `${status.IN_USE ?? 0} digunakan` },
        {
            label: 'Nilai Total',
            value: `Rp ${formatCurrency(summary?.total_value ?? 0)}`,
            sub: 'Akumulasi nilai aset',
        },
        { label: 'Perlu Perawatan', value: status.MAINTENANCE ?? 0, sub: 'Status perawatan' },
        {
            label: 'Umur Habis',
            value: summary?.expired ?? 0,
            sub: `${summary?.near_end ?? 0} mendekati habis`,
        },
    ];

    const categoryItems = [
        { value: 'all', label: 'Semua Kategori' },
        ...categories.map((category) => ({ value: String(category.id), label: category.name })),
    ];
    const branchItems = [
        { value: 'all', label: 'Semua Cabang' },
        ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
    ];
    const statusItems = [
        { value: 'all', label: 'Semua Status' },
        ...ASSET_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
    ];
    const conditionItems = [
        { value: 'all', label: 'Semua Kondisi' },
        ...ASSET_CONDITION_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
        })),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight">
                        Asset Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Kelola aset, kategori, nilai, umur, kondisi, lokasi, dan riwayat
                        perpindahan.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="aset">
                <TabsList>
                    <TabsTrigger value="aset">Data Aset</TabsTrigger>
                    <TabsTrigger value="kategori">Kategori</TabsTrigger>
                </TabsList>

                <TabsContent value="aset" className="space-y-4">
                    {/* SUMMARY */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {summaryCards.map((card) => (
                            <Card key={card.label} size="sm">
                                <CardContent>
                                    <p className="text-muted-foreground text-xs">{card.label}</p>
                                    <p className="font-heading text-xl font-bold">{card.value}</p>
                                    <p className="text-muted-foreground text-xs">{card.sub}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* FILTERS */}
                    <div className="flex flex-wrap items-end gap-2">
                        <Input
                            className="h-10 w-56"
                            placeholder="Cari nama / kode / lokasi..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                        />
                        <Select
                            value={categoryFilter}
                            onValueChange={(value) => {
                                setCategoryFilter(value ?? 'all');
                                setPage(1);
                            }}
                            items={categoryItems}
                        >
                            <SelectTrigger className="h-10 w-44">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoryItems.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={branchFilter}
                            onValueChange={(value) => {
                                setBranchFilter(value ?? 'all');
                                setPage(1);
                            }}
                            items={branchItems}
                        >
                            <SelectTrigger className="h-10 w-44">
                                <SelectValue placeholder="Semua Cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                {branchItems.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={statusFilter}
                            onValueChange={(value) => {
                                setStatusFilter(value ?? 'all');
                                setPage(1);
                            }}
                            items={statusItems}
                        >
                            <SelectTrigger className="h-10 w-40">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusItems.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={conditionFilter}
                            onValueChange={(value) => {
                                setConditionFilter(value ?? 'all');
                                setPage(1);
                            }}
                            items={conditionItems}
                        >
                            <SelectTrigger className="h-10 w-40">
                                <SelectValue placeholder="Semua Kondisi" />
                            </SelectTrigger>
                            <SelectContent>
                                {conditionItems.map((option) => (
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
                                            <Icon icon="mdi:plus" /> Tambah Aset
                                        </Button>
                                    }
                                />
                                <DialogContent className="sm:max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>TAMBAH ASET</DialogTitle>
                                        <DialogDescription>
                                            Kode aset dibuat otomatis berdasarkan prefix kategori.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <AssetForm type="create" onSuccess={handleSuccess} />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="overflow-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama Aset</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead className="text-right">Nilai</TableHead>
                                    <TableHead className="text-right">Umur</TableHead>
                                    <TableHead className="text-right">Sisa</TableHead>
                                    <TableHead>Kondisi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>PJ / Pengguna</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!loading && assets.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={11}
                                            className="text-center text-muted-foreground"
                                        >
                                            Tidak ada aset pada filter ini.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {assets.map((asset) => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-mono text-xs">
                                            {asset.code ?? '-'}
                                        </TableCell>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell>{asset.category_name ?? '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{asset.location ?? '-'}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {asset.branch_name ?? ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            Rp {formatCurrency(asset.purchase_price)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {asset.age_years != null
                                                ? `${asset.age_years} th`
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {asset.remaining_years != null
                                                ? asset.is_expired
                                                    ? 'Habis'
                                                    : `${asset.remaining_years} th`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={asset.condition} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={asset.status} />
                                        </TableCell>
                                        <TableCell>
                                            {asset.responsible_name ??
                                                asset.responsible_user_name ??
                                                '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Dialog
                                                    open={detailItem?.id === asset.id}
                                                    onOpenChange={(open) =>
                                                        setDetailItem(open ? asset : null)
                                                    }
                                                >
                                                    <DialogTrigger
                                                        render={
                                                            <Button size="icon" variant="outline">
                                                                <Icon icon="mdi:eye-outline" />
                                                            </Button>
                                                        }
                                                    />
                                                    <DialogContent className="sm:max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>DETAIL ASET</DialogTitle>
                                                        </DialogHeader>
                                                        <AssetDetail id={asset.id} />
                                                    </DialogContent>
                                                </Dialog>
                                                <Dialog
                                                    open={editItem?.id === asset.id}
                                                    onOpenChange={(open) =>
                                                        setEditItem(open ? asset : null)
                                                    }
                                                >
                                                    <DialogTrigger
                                                        render={
                                                            <Button size="icon" variant="outline">
                                                                <Icon icon="mingcute:edit-line" />
                                                            </Button>
                                                        }
                                                    />
                                                    <DialogContent className="sm:max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>EDIT ASET</DialogTitle>
                                                        </DialogHeader>
                                                        <AssetForm
                                                            type="update"
                                                            item={asset}
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
                                                                HAPUS ASET
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Yakin ingin menghapus aset ini?
                                                                Riwayat perpindahan juga akan
                                                                terhapus.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Batal
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    deleteAsset(asset.id)
                                                                }
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

                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-sm">Halaman {page}</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="h-9"
                                disabled={page <= 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                className="h-9"
                                disabled={assets.length < 50}
                                onClick={() => setPage((prev) => prev + 1)}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="kategori">
                    <AssetCategoryManagement onChanged={getReferences} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
