'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { ArrowDownCircle, ArrowUpCircle, Wallet } from 'lucide-react';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { formatCurrency } from '@/lib/currency';
import { extractList, formatDate, todayLocal, monthStartLocal } from '@/lib/ems-constants';
import { cn } from '@/lib/utils';

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

// module components
import CashflowForm from '@/modules/cashflow/cashflow-form';

const TYPE_OPTIONS = [
    { value: 'all', label: 'Semua Jenis' },
    { value: 'INCOME', label: 'Masuk' },
    { value: 'EXPENSE', label: 'Keluar' },
];

export default function CashflowDashboard() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [dateFrom, setDateFrom] = useState<string>(monthStartLocal());
    const [dateTo, setDateTo] = useState<string>(todayLocal());
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [branchFilter, setBranchFilter] = useState<string>('all');
    const [search, setSearch] = useState<string>('');
    const [page, setPage] = useState<number>(1);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);

    const buildParams = () => {
        const params = new URLSearchParams();
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (branchFilter !== 'all') params.set('branch_id', branchFilter);
        if (search) params.set('search', search);
        return params;
    };

    const getSummary = async () => {
        try {
            const response = await http.get(`/cashflow/summary?${buildParams().toString()}`);
            setSummary(response.data.data ?? null);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const getTransactions = async () => {
        setLoading(true);
        try {
            const params = buildParams();
            params.set('page', String(page));
            params.set('limit', '50');
            const response = await http.get(`/cashflow?${params.toString()}`);
            setTransactions(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSummary();
        getTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFrom, dateTo, typeFilter, branchFilter, search, page]);

    useEffect(() => {
        http.get('/branches')
            .then((response) => setBranches(extractList(response.data)))
            .catch(() => setBranches([]));
    }, []);

    const deleteTransaction = async (id: number) => {
        try {
            const response = await http.delete(`/cashflow/${id}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message ?? 'Transaksi dihapus',
            });
            getSummary();
            getTransactions();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const exportExcel = async () => {
        try {
            const response = await http.get(`/cashflow/export?${buildParams().toString()}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan-cashflow-${dateFrom}-${dateTo}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditItem(null);
        getSummary();
        getTransactions();
    };

    const totals = summary?.totals ?? {};
    const series: any[] = summary?.series ?? [];
    const maxSeries = Math.max(1, ...series.map((item) => Math.max(item.income, item.expense)));

    const branchItems = [
        { value: 'all', label: 'Semua Cabang' },
        ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight">
                        Cashflow / Keuangan
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Catat arus kas masuk dan keluar, pantau sisa saldo dan grafik bulanan.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10" onClick={exportExcel}>
                        <Icon icon="mdi:file-excel" /> Export Excel
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger
                            render={
                                <Button className="h-10">
                                    <Icon icon="mdi:plus" /> Tambah Transaksi
                                </Button>
                            }
                        />
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>TAMBAH TRANSAKSI</DialogTitle>
                                <DialogDescription>
                                    Catat transaksi keuangan masuk atau keluar.
                                </DialogDescription>
                            </DialogHeader>
                            <CashflowForm type="create" onSuccess={handleSuccess} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card size="sm">
                    <CardContent className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-success/12 text-success">
                            <ArrowUpCircle className="size-6" />
                        </span>
                        <div>
                            <p className="text-muted-foreground text-xs">Total Masuk</p>
                            <p className="font-heading text-xl font-bold text-success">
                                Rp {formatCurrency(totals.income ?? 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card size="sm">
                    <CardContent className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
                            <ArrowDownCircle className="size-6" />
                        </span>
                        <div>
                            <p className="text-muted-foreground text-xs">Total Keluar</p>
                            <p className="font-heading text-xl font-bold text-destructive">
                                Rp {formatCurrency(totals.expense ?? 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card size="sm">
                    <CardContent className="flex items-center gap-3">
                        <span className="bg-brand-gradient-soft text-primary flex size-11 items-center justify-center rounded-xl">
                            <Wallet className="size-6" />
                        </span>
                        <div>
                            <p className="text-muted-foreground text-xs">Sisa / Saldo</p>
                            <p
                                className={cn(
                                    'font-heading text-xl font-bold',
                                    Number(totals.balance ?? 0) >= 0
                                        ? 'text-primary'
                                        : 'text-destructive',
                                )}
                            >
                                Rp {formatCurrency(totals.balance ?? 0)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CHART */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Icon icon="mdi:chart-bar" className="text-primary text-lg" />
                        Grafik 12 Bulan
                    </CardTitle>
                    <CardDescription>
                        Perbandingan arus kas masuk dan keluar per bulan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {series.every((item) => item.income === 0 && item.expense === 0) ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                            Belum ada transaksi untuk ditampilkan pada grafik.
                        </p>
                    ) : (
                        <div className="flex items-stretch gap-2">
                            {series.map((item) => (
                                <div
                                    key={item.month}
                                    className="flex flex-1 flex-col items-center justify-end gap-1.5"
                                >
                                    <div
                                        className="flex w-full items-end justify-center gap-1"
                                        style={{ height: 170 }}
                                    >
                                        <div
                                            className="w-1/2 rounded-t bg-success/80"
                                            style={{
                                                height: `${Math.max(
                                                    (item.income / maxSeries) * 170,
                                                    item.income > 0 ? 4 : 2,
                                                )}px`,
                                            }}
                                            title={`Masuk ${item.label}: Rp ${formatCurrency(item.income)}`}
                                        />
                                        <div
                                            className="w-1/2 rounded-t bg-destructive/80"
                                            style={{
                                                height: `${Math.max(
                                                    (item.expense / maxSeries) * 170,
                                                    item.expense > 0 ? 4 : 2,
                                                )}px`,
                                            }}
                                            title={`Keluar ${item.label}: Rp ${formatCurrency(item.expense)}`}
                                        />
                                    </div>
                                    <span className="text-muted-foreground text-[0.625rem] whitespace-nowrap">
                                        {item.label.split(' ')[0]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="bg-success/80 size-2.5 rounded" /> Masuk
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="bg-destructive/80 size-2.5 rounded" /> Keluar
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* FILTERS */}
            <div className="flex flex-wrap items-end gap-2">
                <Input
                    type="date"
                    className="h-10 w-40"
                    value={dateFrom}
                    onChange={(event) => {
                        setDateFrom(event.target.value);
                        setPage(1);
                    }}
                />
                <Input
                    type="date"
                    className="h-10 w-40"
                    value={dateTo}
                    onChange={(event) => {
                        setDateTo(event.target.value);
                        setPage(1);
                    }}
                />
                <Select
                    value={typeFilter}
                    onValueChange={(value) => {
                        setTypeFilter(value ?? 'all');
                        setPage(1);
                    }}
                    items={TYPE_OPTIONS}
                >
                    <SelectTrigger className="h-10 w-40">
                        <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
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
                    <SelectTrigger className="h-10 w-48">
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
                <Input
                    className="h-10 w-56"
                    placeholder="Cari keterangan..."
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                />
            </div>

            {/* TABLE */}
            <div className="overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Cabang</TableHead>
                            <TableHead className="text-right">Masuk</TableHead>
                            <TableHead className="text-right">Keluar</TableHead>
                            <TableHead className="text-right">Sisa</TableHead>
                            <TableHead>Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!loading && transactions.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-muted-foreground text-center"
                                >
                                    Belum ada transaksi pada periode ini.
                                </TableCell>
                            </TableRow>
                        )}
                        {transactions.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="whitespace-nowrap">
                                    {formatDate(item.transaction_date)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{item.description}</span>
                                        {item.payment_method && (
                                            <span className="text-muted-foreground text-xs">
                                                {item.payment_method}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.category ? (
                                        <Badge variant="secondary">{item.category}</Badge>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>
                                <TableCell>{item.branch_name ?? '-'}</TableCell>
                                <TableCell className="text-right font-medium text-success tabular-nums">
                                    {item.type === 'INCOME'
                                        ? `Rp ${formatCurrency(item.amount)}`
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right font-medium text-destructive tabular-nums">
                                    {item.type === 'EXPENSE'
                                        ? `Rp ${formatCurrency(item.amount)}`
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                    Rp {formatCurrency(item.running_balance)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Dialog
                                            open={editItem?.id === item.id}
                                            onOpenChange={(open) => setEditItem(open ? item : null)}
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
                                                    <DialogTitle>EDIT TRANSAKSI</DialogTitle>
                                                </DialogHeader>
                                                <CashflowForm
                                                    type="update"
                                                    item={item}
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
                                                        HAPUS TRANSAKSI
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Yakin ingin menghapus transaksi ini?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => deleteTransaction(item.id)}
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
                <p className="text-muted-foreground text-sm">
                    Halaman {page} · {totals.transactions ?? 0} transaksi
                </p>
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
                        disabled={transactions.length < 50}
                        onClick={() => setPage((prev) => prev + 1)}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
