'use client';

// dependencies
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
    GripVertical,
    ArrowUp,
    ArrowDown,
    Save,
    RotateCcw,
    Plus,
    Search,
    CornerDownRight,
    Pencil,
    Trash2,
    CheckCircle2,
    AlertCircle,
    SlidersHorizontal,
    FolderTree,
    Folder,
    FolderPlus,
    FolderMinus,
    LogOut,
} from 'lucide-react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { cn } from '@/lib/utils';

// ui components
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';

// modules
import MenuForm from '@/modules/menu/menu-form';

export default function Page() {
    const [menus, setMenus] = useState<any[]>([]);
    const [originalMenus, setOriginalMenus] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [openEditId, setOpenEditId] = useState<number | null>(null);

    // Drag and drop states
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [isOverExtractZone, setIsOverExtractZone] = useState<boolean>(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const getMenus = async () => {
        try {
            const response = await http.get(`/menus`);
            const data = response.data.data || [];
            // Sort by sort_order ascending initially
            data.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            setMenus(data);
            setOriginalMenus(data);
            setHasUnsavedChanges(false);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    useEffect(() => {
        getMenus();
    }, []);

    const deleteMenu = async (slug: string) => {
        try {
            const response = await http.delete(`/menus/${slug}`);
            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });
            getMenus();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setOpenEditId(null);
        getMenus();
    };

    // Available groups for dropdown
    const availableGroups = useMemo(() => {
        return menus.filter((m) => m.type === 'GROUP');
    }, [menus]);

    // Parent group names mapping
    const parentMap = useMemo(() => {
        const map = new Map<number, string>();
        for (const m of menus) {
            if (m.type === 'GROUP' || !m.parent_id) {
                map.set(m.id, m.name);
            }
        }
        return map;
    }, [menus]);

    // Dragged item helper
    const draggedItem = draggedIndex !== null ? menus[draggedIndex] : null;

    // Move an item into a group
    const moveIntoGroup = (itemId: number, targetGroupId: number) => {
        const itemIndex = menus.findIndex((m) => m.id === itemId);
        if (itemIndex === -1) return;
        const item = menus[itemIndex];
        if (item.type === 'GROUP') {
            toast.add({
                title: 'Peringatan',
                type: 'warning',
                description: 'Grup menu tidak dapat dimasukkan ke dalam grup lain.',
            });
            return;
        }

        const targetGroup = menus.find((m) => m.id === targetGroupId);
        if (!targetGroup) return;

        const updated = [...menus];
        const [movedItem] = updated.splice(itemIndex, 1);
        movedItem.parent_id = targetGroupId;

        // Place the item right after the target group or after the last child of this group
        const targetGroupIndex = updated.findIndex((m) => m.id === targetGroupId);
        let insertIndex = targetGroupIndex + 1;
        while (insertIndex < updated.length && updated[insertIndex].parent_id === targetGroupId) {
            insertIndex++;
        }

        updated.splice(insertIndex, 0, movedItem);

        const normalized = updated.map((m, idx) => ({
            ...m,
            sort_order: idx + 1,
        }));

        setMenus(normalized);
        setHasUnsavedChanges(true);
        toast.add({
            title: 'Berhasil Masuk Grup',
            type: 'success',
            description: `Menu "${item.name}" dimasukkan ke grup "${targetGroup.name}". Klik "Simpan Urutan" untuk menerapkan.`,
        });
    };

    // Remove an item from its group (make it a standalone top-level menu)
    const removeFromGroup = (itemId: number) => {
        const itemIndex = menus.findIndex((m) => m.id === itemId);
        if (itemIndex === -1) return;
        const item = menus[itemIndex];
        if (!item.parent_id) return;

        const oldParentName = parentMap.get(item.parent_id);

        const updated = [...menus];
        updated[itemIndex] = {
            ...updated[itemIndex],
            parent_id: null,
        };

        const normalized = updated.map((m, idx) => ({
            ...m,
            sort_order: idx + 1,
        }));

        setMenus(normalized);
        setHasUnsavedChanges(true);
        toast.add({
            title: 'Dikeluarkan dari Grup',
            type: 'info',
            description: `Menu "${item.name}" dikeluarkan dari grup "${oldParentName || ''}" dan kini menjadi Menu Utama.`,
        });
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
        setIsOverExtractZone(false);
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const sourceItem = menus[draggedIndex];
        const targetItem = menus[targetIndex];

        // If an ITEM is dropped directly onto a GROUP row, insert it into that group!
        if (
            sourceItem.type === 'ITEM' &&
            targetItem.type === 'GROUP' &&
            sourceItem.parent_id !== targetItem.id
        ) {
            moveIntoGroup(sourceItem.id, targetItem.id);
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const updated = [...menus];
        const [movedItem] = updated.splice(draggedIndex, 1);

        // If target is inside a group, or if source was dragged between children of a group, inherit group parent_id
        if (sourceItem.type === 'ITEM') {
            if (targetItem.parent_id) {
                movedItem.parent_id = targetItem.parent_id;
            } else if (targetItem.type === 'GROUP') {
                movedItem.parent_id = targetItem.id;
            }
        }

        updated.splice(targetIndex, 0, movedItem);

        // Normalize sort_order sequentially
        const normalized = updated.map((item, idx) => ({
            ...item,
            sort_order: idx + 1,
        }));

        setMenus(normalized);
        setDraggedIndex(null);
        setDragOverIndex(null);
        setHasUnsavedChanges(true);
    };

    // Move single step up/down
    const moveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= menus.length) return;

        const updated = [...menus];
        const [movedItem] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, movedItem);

        const normalized = updated.map((item, idx) => ({
            ...item,
            sort_order: idx + 1,
        }));

        setMenus(normalized);
        setHasUnsavedChanges(true);
    };

    // Save reordered menus & updated parent_ids to backend
    const saveOrder = async () => {
        setIsSaving(true);
        try {
            const payload = {
                orders: menus.map((m, idx) => ({
                    id: m.id,
                    sort_order: idx + 1,
                    parent_id: m.parent_id ?? null,
                })),
            };
            const response = await http.put('/menus/reorder', payload);
            toast.add({
                title: 'Berhasil Disimpan',
                type: 'success',
                description:
                    response.data.message || 'Urutan dan struktur menu berhasil diperbarui.',
            });
            setOriginalMenus(menus);
            setHasUnsavedChanges(false);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Reset order to original state
    const resetOrder = () => {
        setMenus([...originalMenus]);
        setHasUnsavedChanges(false);
        toast.add({
            title: 'Dibatalkan',
            type: 'info',
            description: 'Perubahan urutan dan grup menu dibatalkan.',
        });
    };

    // Filtered menus for search display
    const isSearching = searchQuery.trim().length > 0;
    const displayedMenus = isSearching
        ? menus.filter(
              (m) =>
                  m.name?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                  m.url?.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                  m.type?.toLowerCase().includes(searchQuery.trim().toLowerCase()),
          )
        : menus;

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="rounded-sm border border-border/80 shadow-xs">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border/60">
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <FolderTree className="size-5 text-primary" />
                            Manajemen Struktur & Urutan Menu
                        </CardTitle>
                        <CardDescription>
                            Atur urutan dan grup menu. Drag & drop menu, atau pilih grup langsung
                            untuk memasukkan/mengeluarkan item dari grup.
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {hasUnsavedChanges && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetOrder}
                                    disabled={isSaving}
                                    className="rounded-sm gap-1.5"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Batal
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={saveOrder}
                                    disabled={isSaving}
                                    className="rounded-sm gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
                                >
                                    <Save
                                        className={`size-3.5 ${isSaving ? 'animate-spin' : ''}`}
                                    />
                                    Simpan Perubahan
                                </Button>
                            </>
                        )}

                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger
                                render={
                                    <Button
                                        variant="default"
                                        size="sm"
                                        className="rounded-sm gap-1.5"
                                    >
                                        <Plus className="size-4" />
                                        Tambah Menu
                                    </Button>
                                }
                            />
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>FORM TAMBAH MENU</DialogTitle>
                                    <DialogDescription>
                                        Tambahkan item atau grup menu navigasi baru.
                                    </DialogDescription>
                                </DialogHeader>
                                <MenuForm type="create" onSuccess={handleSuccess} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                    {/* Toolbar & Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative w-full sm:w-72">
                            <Input
                                type="text"
                                placeholder="Cari nama menu / URL..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-9 pr-8 text-xs rounded-sm"
                            />
                            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        </div>

                        {hasUnsavedChanges ? (
                            <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-sm">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>Terdapat perubahan urutan / grup yang belum disimpan.</span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={saveOrder}
                                    disabled={isSaving}
                                    className="h-auto p-0 text-xs font-bold underline"
                                >
                                    Simpan Sekarang
                                </Button>
                            </div>
                        ) : (
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <SlidersHorizontal className="size-3.5" />
                                <span>
                                    Drag ke grup untuk memasukkan item, atau klik dropdown/tombol
                                    untuk ubah grup.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Interactive Dropzone: Extract from group when dragging an item that belongs to a group */}
                    {draggedItem && draggedItem.parent_id && (
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsOverExtractZone(true);
                            }}
                            onDragLeave={() => setIsOverExtractZone(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsOverExtractZone(false);
                                removeFromGroup(draggedItem.id);
                                setDraggedIndex(null);
                                setDragOverIndex(null);
                            }}
                            className={cn(
                                'border-2 border-dashed rounded-sm py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 cursor-pointer animate-in fade-in',
                                isOverExtractZone
                                    ? 'border-primary bg-primary/15 text-primary scale-[1.01] shadow-sm'
                                    : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:border-amber-500',
                            )}
                        >
                            <LogOut className="size-4 shrink-0" />
                            <span>
                                Lepas di sini untuk{' '}
                                <strong>MENGELUARKAN "{draggedItem.name}"</strong> dari grup "
                                {parentMap.get(draggedItem.parent_id)}" (Jadikan Menu Utama)
                            </span>
                        </div>
                    )}

                    {isSearching && (
                        <div className="text-xs text-muted-foreground italic bg-muted/30 px-3 py-2 rounded-sm border border-dashed border-border/70">
                            Fitur drag and drop dinonaktifkan saat mode pencarian aktif. Hapus teks
                            pencarian untuk mengatur ulang urutan seluruh menu.
                        </div>
                    )}

                    {/* Draggable Table */}
                    <div className="overflow-x-auto rounded-sm border border-border/80">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-12 text-center">Drag</TableHead>
                                    <TableHead className="w-16 text-center">Urutan</TableHead>
                                    <TableHead>Nama Menu</TableHead>
                                    <TableHead className="w-64">Grup Induk / Status Grup</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead>URL / Route</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-4">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedMenus.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="text-center text-muted-foreground py-10"
                                        >
                                            Tidak ada menu yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayedMenus.map((menu: any, index: number) => {
                                        const isDraggingThis = draggedIndex === index;
                                        const isOverThis = dragOverIndex === index;
                                        const isSubmenu =
                                            menu.parent_id !== null && menu.parent_id !== undefined;
                                        const parentName = isSubmenu
                                            ? parentMap.get(menu.parent_id)
                                            : null;
                                        const isGroup = menu.type === 'GROUP';

                                        // Dragging an item over this group row
                                        const isItemDraggedOverGroup =
                                            isOverThis &&
                                            isGroup &&
                                            draggedItem &&
                                            draggedItem.type === 'ITEM' &&
                                            draggedItem.id !== menu.id;

                                        return (
                                            <TableRow
                                                key={menu.id}
                                                draggable={!isSearching}
                                                onDragStart={(e) => handleDragStart(e, index)}
                                                onDragOver={(e) => handleDragOver(e, index)}
                                                onDragEnd={handleDragEnd}
                                                onDrop={(e) => handleDrop(e, index)}
                                                className={cn(
                                                    'group transition-colors',
                                                    isDraggingThis &&
                                                        'opacity-40 bg-primary/10 border-2 border-primary border-dashed',
                                                    isOverThis &&
                                                        !isDraggingThis &&
                                                        'border-t-2 border-primary bg-primary/5',
                                                    isItemDraggedOverGroup &&
                                                        'bg-emerald-500/15 border-2 border-emerald-500 shadow-sm',
                                                    isGroup && 'bg-muted/20 font-medium',
                                                    !isSearching &&
                                                        'hover:bg-muted/30 cursor-default',
                                                )}
                                            >
                                                {/* Drag Handle */}
                                                <TableCell className="text-center p-2">
                                                    {!isSearching ? (
                                                        <div
                                                            className="inline-flex items-center justify-center p-1.5 rounded-sm hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground/60 group-hover:text-foreground transition-colors"
                                                            title="Tahan dan geser untuk mengubah urutan atau masukkan ke grup"
                                                        >
                                                            <GripVertical className="size-4" />
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground/40 text-xs">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Sort Order Badge */}
                                                <TableCell className="text-center">
                                                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-sm bg-muted text-foreground border border-border">
                                                        #{menu.sort_order}
                                                    </span>
                                                </TableCell>

                                                {/* Nama Menu with Icon & Submenu badge */}
                                                <TableCell>
                                                    <div
                                                        className={cn(
                                                            'flex flex-col',
                                                            isSubmenu && 'pl-4',
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isSubmenu ? (
                                                                <CornerDownRight className="size-3.5 text-primary shrink-0" />
                                                            ) : isGroup ? (
                                                                <Folder className="size-4 text-amber-500 shrink-0" />
                                                            ) : null}
                                                            {menu.icon ? (
                                                                <Icon
                                                                    icon={menu.icon}
                                                                    className="size-4 text-primary shrink-0"
                                                                />
                                                            ) : !isGroup ? (
                                                                <span className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                                                            ) : null}
                                                            <span
                                                                className={cn(
                                                                    'text-sm capitalize',
                                                                    isGroup
                                                                        ? 'font-bold text-foreground tracking-tight'
                                                                        : 'font-medium text-foreground',
                                                                )}
                                                            >
                                                                {menu.name}
                                                            </span>
                                                        </div>

                                                        {/* Interactive hint when dragging item over this group */}
                                                        {isItemDraggedOverGroup && (
                                                            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-1 pl-6">
                                                                <FolderPlus className="size-3.5 animate-bounce" />
                                                                <span>
                                                                    Lepas di sini untuk memasukkan "
                                                                    {draggedItem.name}" ke grup "
                                                                    {menu.name}"
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Grup Induk / Action Masukkan / Keluarkan dari Grup */}
                                                <TableCell>
                                                    {isGroup ? (
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-sm bg-muted text-foreground/90 border border-border">
                                                            <Folder className="size-3.5 text-amber-500 shrink-0" />
                                                            Grup Navigasi
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            {/* Dropdown to assign or remove from group */}
                                                            <Select
                                                                value={
                                                                    menu.parent_id
                                                                        ? String(menu.parent_id)
                                                                        : 'none'
                                                                }
                                                                onValueChange={(val) => {
                                                                    if (val === 'none') {
                                                                        removeFromGroup(menu.id);
                                                                    } else {
                                                                        moveIntoGroup(
                                                                            menu.id,
                                                                            Number(val),
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-8 text-xs w-48 rounded-sm bg-background">
                                                                    <SelectValue placeholder="Pilih Grup" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="none">
                                                                        <span className="text-muted-foreground italic">
                                                                            — Tanpa Grup (Menu
                                                                            Utama) —
                                                                        </span>
                                                                    </SelectItem>
                                                                    {availableGroups.map((g) => (
                                                                        <SelectItem
                                                                            key={g.id}
                                                                            value={String(g.id)}
                                                                        >
                                                                            <span className="flex items-center gap-1.5">
                                                                                <Folder className="size-3 text-amber-500 shrink-0" />
                                                                                <span className="capitalize">
                                                                                    {g.name}
                                                                                </span>
                                                                            </span>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>

                                                            {/* Quick 1-click button to remove from group if currently in one */}
                                                            {isSubmenu && (
                                                                <Button
                                                                    size="icon-sm"
                                                                    variant="outline"
                                                                    className="size-8 rounded-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 shrink-0"
                                                                    onClick={() =>
                                                                        removeFromGroup(menu.id)
                                                                    }
                                                                    title={`Keluarkan "${menu.name}" dari grup "${parentName}"`}
                                                                >
                                                                    <FolderMinus className="size-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>

                                                {/* Tipe Menu */}
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            menu.type === 'GROUP'
                                                                ? 'secondary'
                                                                : 'default'
                                                        }
                                                        className="text-[11px] rounded-sm font-medium"
                                                    >
                                                        {menu.type}
                                                    </Badge>
                                                </TableCell>

                                                {/* URL */}
                                                <TableCell>
                                                    {menu.url ? (
                                                        <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-muted/50 text-muted-foreground border border-border/50">
                                                            {menu.url}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground/50 text-xs">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>

                                                {/* Status Aktif */}
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            menu.is_active ? 'success' : 'outline'
                                                        }
                                                        className="text-[11px] rounded-sm gap-1"
                                                    >
                                                        {menu.is_active ? (
                                                            <>
                                                                <CheckCircle2 className="size-3" />
                                                                Aktif
                                                            </>
                                                        ) : (
                                                            'Nonaktif'
                                                        )}
                                                    </Badge>
                                                </TableCell>

                                                {/* Action Buttons */}
                                                <TableCell className="text-right pr-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Quick Move Up */}
                                                        <Button
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            className="size-8 rounded-sm text-muted-foreground hover:text-foreground"
                                                            disabled={index === 0 || isSearching}
                                                            onClick={() => moveItem(index, 'up')}
                                                            title="Geser ke atas"
                                                        >
                                                            <ArrowUp className="size-3.5" />
                                                        </Button>

                                                        {/* Quick Move Down */}
                                                        <Button
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            className="size-8 rounded-sm text-muted-foreground hover:text-foreground"
                                                            disabled={
                                                                index ===
                                                                    displayedMenus.length - 1 ||
                                                                isSearching
                                                            }
                                                            onClick={() => moveItem(index, 'down')}
                                                            title="Geser ke bawah"
                                                        >
                                                            <ArrowDown className="size-3.5" />
                                                        </Button>

                                                        {/* Edit Modal */}
                                                        <Dialog
                                                            open={openEditId === menu.id}
                                                            onOpenChange={(open) =>
                                                                setOpenEditId(open ? menu.id : null)
                                                            }
                                                        >
                                                            <DialogTrigger
                                                                render={
                                                                    <Button
                                                                        size="icon-sm"
                                                                        variant="outline"
                                                                        className="size-8 rounded-sm"
                                                                        title="Edit Menu"
                                                                    >
                                                                        <Pencil className="size-3.5" />
                                                                    </Button>
                                                                }
                                                            />
                                                            <DialogContent className="sm:max-w-lg">
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        FORM EDIT MENU
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        Ubah detail menu navigasi{' '}
                                                                        {menu.name}.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <MenuForm
                                                                    type="update"
                                                                    slug={menu.slug}
                                                                    onSuccess={handleSuccess}
                                                                />
                                                            </DialogContent>
                                                        </Dialog>

                                                        {/* Delete Confirmation */}
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                render={
                                                                    <Button
                                                                        size="icon-sm"
                                                                        variant="outline"
                                                                        className="size-8 rounded-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        title="Hapus Menu"
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </Button>
                                                                }
                                                            />
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        KONFIRMASI HAPUS MENU
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Apakah Anda yakin ingin
                                                                        menghapus menu{' '}
                                                                        <strong>
                                                                            "{menu.name}"
                                                                        </strong>
                                                                        ? Tindakan ini tidak dapat
                                                                        dibatalkan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="rounded-sm">
                                                                        Batal
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            deleteMenu(menu.slug)
                                                                        }
                                                                        className="rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
