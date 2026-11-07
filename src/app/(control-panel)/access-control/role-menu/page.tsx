'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from '@iconify/react';
import {
    Shield,
    ShieldCheck,
    Save,
    RotateCcw,
    Search,
    Copy,
    Check,
    CheckSquare,
    Square,
    Folder,
    FileText,
    Layers,
    Table2,
    Users,
    CheckCircle2,
    AlertCircle,
    SlidersHorizontal,
    RefreshCw,
} from 'lucide-react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// ui components
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface Menu {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    type: 'ITEM' | 'GROUP';
    icon: string | null;
    url: string | null;
    description: string | null;
    sort_order: number;
    is_active: number;
}

export default function Page() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [permissions, setPermissions] = useState<Record<string, string[]>>({});
    const [initialPermissions, setInitialPermissions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [savingRoles, setSavingRoles] = useState<Record<string, boolean>>({});

    const [activeRoleSlug, setActiveRoleSlug] = useState<string>('');
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [roleSearchTerm, setRoleSearchTerm] = useState('');
    const [matrixSearchTerm, setMatrixSearchTerm] = useState('');

    const [copyFromRoleSlug, setCopyFromRoleSlug] = useState<string>('');
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

    // Fetch initial data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [rolesRes, menusRes] = await Promise.all([
                http.get('/roles'),
                http.get('/menus'),
            ]);

            const fetchedRoles: Role[] = rolesRes.data.data || [];
            const fetchedMenus: Menu[] = (menusRes.data.data || []).sort(
                (a: Menu, b: Menu) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
            );

            setRoles(fetchedRoles);
            setMenus(fetchedMenus);

            setActiveRoleSlug(
                (prev) => prev || (fetchedRoles.length > 0 ? fetchedRoles[0].slug : ''),
            );

            // Fetch permissions for each role
            const perms: Record<string, string[]> = {};
            for (const role of fetchedRoles) {
                const pRes = await http.get(`/role-menus/${role.slug}`);
                perms[role.slug] = (pRes.data.data || []).map((m: { slug: string }) => m.slug);
            }
            setPermissions(perms);
            setInitialPermissions(JSON.parse(JSON.stringify(perms)));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Memuat Data', type: 'error', description: message });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, [fetchData]);

    // Active role object
    const activeRole = useMemo(() => {
        return roles.find((r) => r.slug === activeRoleSlug) || roles[0] || null;
    }, [roles, activeRoleSlug]);

    // Check if role has unsaved changes
    const hasRoleChanges = (roleSlug: string) => {
        const init = initialPermissions[roleSlug] || [];
        const curr = permissions[roleSlug] || [];
        if (init.length !== curr.length) return true;
        const initSet = new Set(init);
        return curr.some((s) => !initSet.has(s));
    };

    // Filtered roles in left panel
    const filteredRoles = useMemo(() => {
        if (!roleSearchTerm.trim()) return roles;
        const q = roleSearchTerm.toLowerCase();
        return roles.filter(
            (r) => r.name.toLowerCase().includes(q) || r.slug.toLowerCase().includes(q),
        );
    }, [roles, roleSearchTerm]);

    // Menus organized into Groups and Standalone Items
    const organizedMenus = useMemo(() => {
        const groups = menus.filter((m) => m.type === 'GROUP');
        const standaloneItems = menus.filter(
            (m) => m.type === 'ITEM' && (m.parent_id === null || m.parent_id === undefined),
        );

        const groupMap = groups.map((g) => ({
            group: g,
            children: menus.filter((m) => m.parent_id === g.id),
        }));

        return {
            groups: groupMap,
            standalone: standaloneItems,
        };
    }, [menus]);

    // Filtered organized menus based on search input
    const filteredOrganizedMenus = useMemo(() => {
        if (!menuSearchTerm.trim()) return organizedMenus;
        const q = menuSearchTerm.toLowerCase();

        const filteredGroups = organizedMenus.groups
            .map(({ group, children }) => {
                const groupMatches =
                    group.name.toLowerCase().includes(q) || group.slug.toLowerCase().includes(q);
                const matchingChildren = children.filter(
                    (c) =>
                        c.name.toLowerCase().includes(q) ||
                        c.slug.toLowerCase().includes(q) ||
                        (c.url && c.url.toLowerCase().includes(q)),
                );

                if (groupMatches || matchingChildren.length > 0) {
                    return {
                        group,
                        children: groupMatches ? children : matchingChildren,
                    };
                }
                return null;
            })
            .filter(Boolean) as { group: Menu; children: Menu[] }[];

        const filteredStandalone = organizedMenus.standalone.filter(
            (m) =>
                m.name.toLowerCase().includes(q) ||
                m.slug.toLowerCase().includes(q) ||
                (m.url && m.url.toLowerCase().includes(q)),
        );

        return {
            groups: filteredGroups,
            standalone: filteredStandalone,
        };
    }, [organizedMenus, menuSearchTerm]);

    // Toggle a single menu for a given role
    const toggleMenu = (roleSlug: string, targetMenu: Menu) => {
        setPermissions((prev) => {
            const currentList = prev[roleSlug] || [];
            const isCurrentlyChecked = currentList.includes(targetMenu.slug);

            if (isCurrentlyChecked) {
                // Deselect target menu
                let nextList = currentList.filter((s) => s !== targetMenu.slug);

                // If target is GROUP, also deselect all child items
                if (targetMenu.type === 'GROUP') {
                    const childSlugs = menus
                        .filter((m) => m.parent_id === targetMenu.id)
                        .map((m) => m.slug);
                    nextList = nextList.filter((s) => !childSlugs.includes(s));
                } else if (targetMenu.parent_id) {
                    // If target is a child, and no siblings remain checked, also deselect parent group
                    const siblingChildren = menus.filter(
                        (m) => m.parent_id === targetMenu.parent_id && m.slug !== targetMenu.slug,
                    );
                    const hasOtherCheckedSiblings = siblingChildren.some((m) =>
                        nextList.includes(m.slug),
                    );
                    if (!hasOtherCheckedSiblings) {
                        const parentGroup = menus.find((m) => m.id === targetMenu.parent_id);
                        if (parentGroup) {
                            nextList = nextList.filter((s) => s !== parentGroup.slug);
                        }
                    }
                }
                return { ...prev, [roleSlug]: nextList };
            } else {
                // Select target menu
                let nextList = [...currentList, targetMenu.slug];

                // If target is a child, automatically ensure parent group is selected
                if (targetMenu.parent_id) {
                    const parentGroup = menus.find((m) => m.id === targetMenu.parent_id);
                    if (parentGroup && !nextList.includes(parentGroup.slug)) {
                        nextList.push(parentGroup.slug);
                    }
                } else if (targetMenu.type === 'GROUP') {
                    // If target is a group, also select all child items
                    const childSlugs = menus
                        .filter((m) => m.parent_id === targetMenu.id)
                        .map((m) => m.slug);
                    nextList = Array.from(new Set([...nextList, ...childSlugs]));
                }
                return { ...prev, [roleSlug]: nextList };
            }
        });
    };

    // Toggle all items in a group
    const toggleGroup = (roleSlug: string, groupMenu: Menu) => {
        const childMenus = menus.filter((m) => m.parent_id === groupMenu.id);
        const groupAndChildSlugs = [groupMenu.slug, ...childMenus.map((c) => c.slug)];
        const currentPerms = permissions[roleSlug] || [];

        const allSelected = groupAndChildSlugs.every((slug) => currentPerms.includes(slug));

        setPermissions((prev) => {
            const currentList = prev[roleSlug] || [];
            if (allSelected) {
                // Deselect group and its children
                return {
                    ...prev,
                    [roleSlug]: currentList.filter((s) => !groupAndChildSlugs.includes(s)),
                };
            } else {
                // Select group and all its children
                return {
                    ...prev,
                    [roleSlug]: Array.from(new Set([...currentList, ...groupAndChildSlugs])),
                };
            }
        });
    };

    // Select all menus for active role
    const handleSelectAll = (roleSlug: string) => {
        const allSlugs = menus.map((m) => m.slug);
        setPermissions((prev) => ({
            ...prev,
            [roleSlug]: allSlugs,
        }));
    };

    // Deselect all menus for active role
    const handleDeselectAll = (roleSlug: string) => {
        setPermissions((prev) => ({
            ...prev,
            [roleSlug]: [],
        }));
    };

    // Reset permissions to initial database state for active role
    const handleResetRole = (roleSlug: string) => {
        setPermissions((prev) => ({
            ...prev,
            [roleSlug]: [...(initialPermissions[roleSlug] || [])],
        }));
        toast.add({
            title: 'Perubahan Dibatalkan',
            type: 'info',
            description: `Hak akses untuk role ${roleSlug} dikembalikan ke pengaturan awal.`,
        });
    };

    // Copy permissions from another role
    const handleCopyPermissions = () => {
        if (!copyFromRoleSlug || !activeRoleSlug) return;
        const sourcePerms = permissions[copyFromRoleSlug] || [];
        setPermissions((prev) => ({
            ...prev,
            [activeRoleSlug]: [...sourcePerms],
        }));
        setIsCopyDialogOpen(false);
        const sourceRoleName =
            roles.find((r) => r.slug === copyFromRoleSlug)?.name || copyFromRoleSlug;
        toast.add({
            title: 'Hak Akses Disalin',
            type: 'success',
            description: `Menyalin ${sourcePerms.length} menu dari role "${sourceRoleName}". Jangan lupa simpan perubahan.`,
        });
    };

    // Save permissions for a specific role
    const saveRolePermissions = async (roleSlug: string) => {
        try {
            setSavingRoles((prev) => ({ ...prev, [roleSlug]: true }));
            const response = await http.post(`/role-menus/${roleSlug}/sync`, {
                menu_slugs: permissions[roleSlug] || [],
            });
            toast.add({
                title: 'Berhasil Disimpan',
                type: 'success',
                description:
                    response.data?.message ||
                    `Hak akses menu untuk role ${roleSlug} berhasil disinkronkan`,
            });
            setInitialPermissions((prev) => ({
                ...prev,
                [roleSlug]: [...(permissions[roleSlug] || [])],
            }));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal Menyimpan', type: 'error', description: message });
        } finally {
            setSavingRoles((prev) => ({ ...prev, [roleSlug]: false }));
        }
    };

    // Safe Menu Icon renderer
    const renderMenuIcon = (icon?: string | null, isGroup?: boolean) => {
        if (icon && icon.trim() !== '') {
            try {
                return <Icon icon={icon} className="size-4 shrink-0 text-primary" />;
            } catch {
                // fallback
            }
        }
        if (isGroup) {
            return <Folder className="size-4 shrink-0 text-amber-500" />;
        }
        return <FileText className="size-4 shrink-0 text-muted-foreground" />;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <RefreshCw className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                    Memuat data hak akses role & menu...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Page */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center p-2 rounded-sm bg-primary/10 text-primary">
                            <ShieldCheck className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                Hak Akses Menu (Role Menu)
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Konfigurasi dan kelola menu navigasi apa saja yang dapat diakses
                                oleh setiap role pengguna.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 gap-1.5 text-xs">
                        <Users className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{roles.length}</span> Peran
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 gap-1.5 text-xs">
                        <Layers className="size-3.5 text-primary" />
                        <span className="font-semibold text-foreground">{menus.length}</span> Menu
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchData}
                        className="h-8 gap-1 text-xs"
                    >
                        <RefreshCw className="size-3.5" />
                        Segarkan
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs: Per Role vs Matrix Overview */}
            <Tabs defaultValue="role" className="w-full space-y-5">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="role" className="gap-2 text-xs font-semibold px-4 py-1.5">
                        <SlidersHorizontal className="size-3.5" />
                        Manajemen Per Role
                    </TabsTrigger>
                    <TabsTrigger value="matrix" className="gap-2 text-xs font-semibold px-4 py-1.5">
                        <Table2 className="size-3.5" />
                        Matriks Perbandingan Semua Role
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: MANAJEMEN PER ROLE */}
                <TabsContent value="role" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* LEFT COLUMN: Role Selector */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
                            <Card className="rounded-sm border-border/70 shadow-sm">
                                <CardHeader className="pb-3 border-b bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Shield className="size-4 text-primary" />
                                            Daftar Role Pengguna
                                        </CardTitle>
                                        <Badge variant="secondary" className="text-[10px]">
                                            {roles.length} Role
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-xs">
                                        Pilih role untuk mengatur menu
                                    </CardDescription>

                                    {/* Role Search */}
                                    {roles.length > 3 && (
                                        <div className="relative mt-2">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Cari role..."
                                                value={roleSearchTerm}
                                                onChange={(e) => setRoleSearchTerm(e.target.value)}
                                                className="h-8 pl-8 text-xs bg-background"
                                            />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="p-2 space-y-1.5">
                                    {filteredRoles.map((role) => {
                                        const isSelected = activeRoleSlug === role.slug;
                                        const rolePerms = permissions[role.slug] || [];
                                        const isModified = hasRoleChanges(role.slug);
                                        const percentage =
                                            menus.length > 0
                                                ? Math.round(
                                                      (rolePerms.length / menus.length) * 100,
                                                  )
                                                : 0;

                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setActiveRoleSlug(role.slug)}
                                                className={`w-full text-left p-3 rounded-sm transition-all border ${
                                                    isSelected
                                                        ? 'bg-primary/10 border-primary shadow-xs'
                                                        : 'border-transparent hover:bg-muted/50 hover:border-border/60'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={`p-1.5 rounded-sm ${
                                                                isSelected
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted text-muted-foreground'
                                                            }`}
                                                        >
                                                            <Shield className="size-3.5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm capitalize text-foreground flex items-center gap-1.5">
                                                                {role.name}
                                                                {isModified && (
                                                                    <span
                                                                        className="size-2 rounded-full bg-amber-500 shrink-0"
                                                                        title="Ada perubahan belum disimpan"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground font-mono">
                                                                {role.slug}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Badge
                                                        variant={
                                                            isSelected ? 'default' : 'secondary'
                                                        }
                                                        className="text-[10px] font-mono shrink-0"
                                                    >
                                                        {rolePerms.length}/{menus.length}
                                                    </Badge>
                                                </div>

                                                {/* Mini Progress Bar */}
                                                <div className="mt-2.5 w-full bg-muted/60 h-1.5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-300 ${
                                                            isSelected
                                                                ? 'bg-primary'
                                                                : 'bg-muted-foreground/40'
                                                        }`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                                    <span>{percentage}% menu aktif</span>
                                                    {isModified && (
                                                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                                                            Belum disimpan
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {filteredRoles.length === 0 && (
                                        <div className="py-6 text-center text-xs text-muted-foreground">
                                            Role tidak ditemukan
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: Active Role Permission Editor */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
                            {activeRole ? (
                                <Card className="rounded-sm border-border/70 shadow-sm overflow-hidden">
                                    {/* Role Action Bar Header */}
                                    <div className="p-4 bg-muted/20 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-bold capitalize text-foreground">
                                                    {activeRole.name}
                                                </h2>
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-[11px]"
                                                >
                                                    {activeRole.slug}
                                                </Badge>
                                                {hasRoleChanges(activeRole.slug) ? (
                                                    <Badge
                                                        variant="warning"
                                                        className="gap-1 text-[11px]"
                                                    >
                                                        <AlertCircle className="size-3" />
                                                        Perubahan Belum Disimpan
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="success"
                                                        className="gap-1 text-[11px]"
                                                    >
                                                        <CheckCircle2 className="size-3" />
                                                        Tersimpan
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {activeRole.description &&
                                                activeRole.description !== '-'
                                                    ? activeRole.description
                                                    : 'Atur centang menu di bawah untuk memberikan atau mencabut akses navigasi.'}
                                            </p>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Copy Permissions Dialog */}
                                            <Dialog
                                                open={isCopyDialogOpen}
                                                onOpenChange={setIsCopyDialogOpen}
                                            >
                                                <DialogTrigger
                                                    render={
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 text-xs"
                                                        >
                                                            <Copy className="size-3.5" />
                                                            Salin dari Role Lain
                                                        </Button>
                                                    }
                                                />
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                                            <Copy className="size-4 text-primary" />
                                                            Salin Hak Akses Menu
                                                        </DialogTitle>
                                                        <DialogDescription className="text-xs">
                                                            Pilih role sumber untuk menduplikasi
                                                            seluruh hak akses menunya ke role{' '}
                                                            <strong className="capitalize text-foreground font-semibold">
                                                                {activeRole.name}
                                                            </strong>
                                                            .
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-3 py-2">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-foreground">
                                                                Role Sumber:
                                                            </label>
                                                            <select
                                                                value={copyFromRoleSlug}
                                                                onChange={(e) =>
                                                                    setCopyFromRoleSlug(
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                className="w-full h-9 rounded-sm border border-input bg-card px-3 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                            >
                                                                <option value="">
                                                                    -- Pilih Role Sumber --
                                                                </option>
                                                                {roles
                                                                    .filter(
                                                                        (r) =>
                                                                            r.slug !==
                                                                            activeRole.slug,
                                                                    )
                                                                    .map((r) => (
                                                                        <option
                                                                            key={r.id}
                                                                            value={r.slug}
                                                                        >
                                                                            {r.name} (
                                                                            {permissions[r.slug]
                                                                                ?.length || 0}{' '}
                                                                            menu)
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                        {copyFromRoleSlug && (
                                                            <div className="p-3 bg-muted/40 rounded-sm border text-xs text-muted-foreground">
                                                                Menyalin hak akses dari{' '}
                                                                <span className="font-semibold text-foreground">
                                                                    {
                                                                        roles.find(
                                                                            (r) =>
                                                                                r.slug ===
                                                                                copyFromRoleSlug,
                                                                        )?.name
                                                                    }
                                                                </span>{' '}
                                                                akan menggantikan daftar menu aktif
                                                                saat ini untuk role{' '}
                                                                <span className="font-semibold text-foreground">
                                                                    {activeRole.name}
                                                                </span>
                                                                .
                                                            </div>
                                                        )}
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setIsCopyDialogOpen(false)
                                                            }
                                                        >
                                                            Batal
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            disabled={!copyFromRoleSlug}
                                                            onClick={handleCopyPermissions}
                                                            className="gap-1.5"
                                                        >
                                                            <Check className="size-3.5" />
                                                            Terapkan Salin
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            {/* Reset Button */}
                                            {hasRoleChanges(activeRole.slug) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleResetRole(activeRole.slug)}
                                                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    <RotateCcw className="size-3.5" />
                                                    Reset
                                                </Button>
                                            )}

                                            {/* Save Button */}
                                            <Button
                                                size="sm"
                                                disabled={
                                                    !hasRoleChanges(activeRole.slug) ||
                                                    savingRoles[activeRole.slug]
                                                }
                                                onClick={() => saveRolePermissions(activeRole.slug)}
                                                className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
                                            >
                                                {savingRoles[activeRole.slug] ? (
                                                    <RefreshCw className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Save className="size-3.5" />
                                                )}
                                                Simpan Hak Akses
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Toolbar: Search & Bulk Toggles */}
                                    <div className="p-4 border-b bg-background/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                            <Input
                                                placeholder="Cari nama menu, slug, atau URL..."
                                                value={menuSearchTerm}
                                                onChange={(e) => setMenuSearchTerm(e.target.value)}
                                                className="h-8 pl-8 text-xs bg-background"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSelectAll(activeRole.slug)}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <CheckSquare className="size-3.5 text-primary" />
                                                Pilih Semua
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeselectAll(activeRole.slug)}
                                                className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                <Square className="size-3.5" />
                                                Batalkan Semua
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Menu Items Container */}
                                    <div className="p-4 space-y-6">
                                        {/* GROUPS ACCORDION / SECTIONS */}
                                        {filteredOrganizedMenus.groups.map(
                                            ({ group, children }) => {
                                                const rolePerms =
                                                    permissions[activeRole.slug] || [];
                                                const childSlugs = children.map((c) => c.slug);
                                                const allSlugsInGroup = [group.slug, ...childSlugs];

                                                const checkedCount = allSlugsInGroup.filter((s) =>
                                                    rolePerms.includes(s),
                                                ).length;
                                                const isAllChecked =
                                                    allSlugsInGroup.length > 0 &&
                                                    checkedCount === allSlugsInGroup.length;
                                                const isPartiallyChecked =
                                                    checkedCount > 0 && !isAllChecked;

                                                return (
                                                    <div
                                                        key={group.id}
                                                        className="rounded-sm border border-border/80 overflow-hidden bg-card/60 transition-colors"
                                                    >
                                                        {/* Group Header */}
                                                        <div className="p-3 bg-muted/40 border-b flex flex-wrap items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2.5">
                                                                <Checkbox
                                                                    checked={isAllChecked}
                                                                    indeterminate={
                                                                        isPartiallyChecked
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        toggleGroup(
                                                                            activeRole.slug,
                                                                            group,
                                                                        )
                                                                    }
                                                                />
                                                                <div className="flex items-center gap-1.5">
                                                                    {renderMenuIcon(
                                                                        group.icon,
                                                                        true,
                                                                    )}
                                                                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                                                                        {group.name}
                                                                    </span>
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-[10px] font-mono py-0 px-1.5"
                                                                    >
                                                                        GROUP
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant={
                                                                        checkedCount > 0
                                                                            ? 'default'
                                                                            : 'outline'
                                                                    }
                                                                    className="text-[11px] font-mono"
                                                                >
                                                                    {checkedCount} /{' '}
                                                                    {allSlugsInGroup.length} Aktif
                                                                </Badge>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        toggleGroup(
                                                                            activeRole.slug,
                                                                            group,
                                                                        )
                                                                    }
                                                                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                                                                >
                                                                    {isAllChecked
                                                                        ? 'Batalkan Grup'
                                                                        : 'Pilih Semua di Grup'}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Child Items Grid */}
                                                        {children.length > 0 ? (
                                                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-background/50">
                                                                {children.map((child) => {
                                                                    const isChecked =
                                                                        rolePerms.includes(
                                                                            child.slug,
                                                                        );
                                                                    return (
                                                                        <div
                                                                            key={child.id}
                                                                            onClick={() =>
                                                                                toggleMenu(
                                                                                    activeRole.slug,
                                                                                    child,
                                                                                )
                                                                            }
                                                                            className={`flex items-start gap-3 p-2.5 rounded-sm border cursor-pointer select-none transition-all ${
                                                                                isChecked
                                                                                    ? 'bg-primary/5 border-primary/40 shadow-xs'
                                                                                    : 'bg-card border-border/60 hover:bg-muted/40 hover:border-border'
                                                                            }`}
                                                                        >
                                                                            <Checkbox
                                                                                checked={isChecked}
                                                                                onCheckedChange={() =>
                                                                                    toggleMenu(
                                                                                        activeRole.slug,
                                                                                        child,
                                                                                    )
                                                                                }
                                                                                className="mt-0.5"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                                    {renderMenuIcon(
                                                                                        child.icon,
                                                                                        false,
                                                                                    )}
                                                                                    <span
                                                                                        className={`font-semibold text-xs truncate ${
                                                                                            isChecked
                                                                                                ? 'text-primary'
                                                                                                : 'text-foreground'
                                                                                        }`}
                                                                                    >
                                                                                        {child.name}
                                                                                    </span>
                                                                                </div>
                                                                                {child.url && (
                                                                                    <div className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                                                                                        {child.url}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 text-xs text-muted-foreground italic bg-background/50">
                                                                Belum ada menu anak di dalam grup
                                                                ini.
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            },
                                        )}

                                        {/* STANDALONE MENUS (NO PARENT GROUP) */}
                                        {filteredOrganizedMenus.standalone.length > 0 && (
                                            <div className="rounded-sm border border-border/80 overflow-hidden bg-card/60">
                                                <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Layers className="size-4 text-primary" />
                                                        <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                                                            Menu Utama Mandiri (Tanpa Grup)
                                                        </span>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] font-mono"
                                                    >
                                                        {
                                                            filteredOrganizedMenus.standalone.filter(
                                                                (m) =>
                                                                    (
                                                                        permissions[
                                                                            activeRole.slug
                                                                        ] || []
                                                                    ).includes(m.slug),
                                                            ).length
                                                        }{' '}
                                                        / {filteredOrganizedMenus.standalone.length}{' '}
                                                        Aktif
                                                    </Badge>
                                                </div>

                                                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-background/50">
                                                    {filteredOrganizedMenus.standalone.map(
                                                        (item) => {
                                                            const isChecked = (
                                                                permissions[activeRole.slug] || []
                                                            ).includes(item.slug);

                                                            return (
                                                                <div
                                                                    key={item.id}
                                                                    onClick={() =>
                                                                        toggleMenu(
                                                                            activeRole.slug,
                                                                            item,
                                                                        )
                                                                    }
                                                                    className={`flex items-start gap-3 p-2.5 rounded-sm border cursor-pointer select-none transition-all ${
                                                                        isChecked
                                                                            ? 'bg-primary/5 border-primary/40 shadow-xs'
                                                                            : 'bg-card border-border/60 hover:bg-muted/40 hover:border-border'
                                                                    }`}
                                                                >
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={() =>
                                                                            toggleMenu(
                                                                                activeRole.slug,
                                                                                item,
                                                                            )
                                                                        }
                                                                        className="mt-0.5"
                                                                    />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            {renderMenuIcon(
                                                                                item.icon,
                                                                                false,
                                                                            )}
                                                                            <span
                                                                                className={`font-semibold text-xs truncate ${
                                                                                    isChecked
                                                                                        ? 'text-primary'
                                                                                        : 'text-foreground'
                                                                                }`}
                                                                            >
                                                                                {item.name}
                                                                            </span>
                                                                            <Badge
                                                                                variant="outline"
                                                                                className="text-[9px] font-mono py-0 px-1"
                                                                            >
                                                                                ITEM
                                                                            </Badge>
                                                                        </div>
                                                                        {item.url && (
                                                                            <div className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                                                                                {item.url}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Empty state when search yields no result */}
                                        {filteredOrganizedMenus.groups.length === 0 &&
                                            filteredOrganizedMenus.standalone.length === 0 && (
                                                <div className="py-12 text-center space-y-2">
                                                    <Search className="size-8 mx-auto text-muted-foreground/60" />
                                                    <p className="text-sm font-semibold text-foreground">
                                                        Tidak Ada Menu Ditemukan
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Tidak ada menu yang sesuai dengan pencarian
                                                        &quot;
                                                        {menuSearchTerm}&quot;
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setMenuSearchTerm('')}
                                                        className="mt-2 text-xs"
                                                    >
                                                        Bersihkan Pencarian
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                </Card>
                            ) : null}
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: MATRIKS PERBANDINGAN SEMUA ROLE */}
                <TabsContent value="matrix" className="space-y-4">
                    <Card className="rounded-sm border-border/70 shadow-sm overflow-hidden">
                        <CardHeader className="pb-3 border-b bg-muted/20">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base font-bold flex items-center gap-2">
                                        <Table2 className="size-4 text-primary" />
                                        Matriks Hak Akses Antar Role
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Lihat dan bandingkan hak akses seluruh role pengguna dalam
                                        satu tabel komprehensif. Anda juga dapat langsung
                                        mengaktifkan/menonaktifkan menu di sini.
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                        <Input
                                            placeholder="Filter menu dalam tabel..."
                                            value={matrixSearchTerm}
                                            onChange={(e) => setMatrixSearchTerm(e.target.value)}
                                            className="h-8 pl-8 text-xs bg-background"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <div className="overflow-x-auto">
                            <Table className="border-collapse text-xs">
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="w-[320px] font-bold text-foreground">
                                            Menu / Route
                                        </TableHead>
                                        <TableHead className="w-[100px] text-center font-bold text-foreground">
                                            Tipe
                                        </TableHead>
                                        {roles.map((role) => (
                                            <TableHead
                                                key={role.id}
                                                className="text-center font-bold text-foreground min-w-[140px]"
                                            >
                                                <div className="flex flex-col items-center gap-1 py-1">
                                                    <span className="capitalize">{role.name}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] font-mono py-0 px-1.5"
                                                        >
                                                            {permissions[role.slug]?.length || 0}/
                                                            {menus.length}
                                                        </Badge>
                                                        {hasRoleChanges(role.slug) && (
                                                            <Button
                                                                size="sm"
                                                                disabled={savingRoles[role.slug]}
                                                                onClick={() =>
                                                                    saveRolePermissions(role.slug)
                                                                }
                                                                className="h-6 px-1.5 text-[10px] gap-1"
                                                                title="Simpan perubahan role ini"
                                                            >
                                                                {savingRoles[role.slug] ? (
                                                                    <RefreshCw className="size-2.5 animate-spin" />
                                                                ) : (
                                                                    <Save className="size-2.5" />
                                                                )}
                                                                Simpan
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menus
                                        .filter((m) => {
                                            if (!matrixSearchTerm.trim()) return true;
                                            const q = matrixSearchTerm.toLowerCase();
                                            return (
                                                m.name.toLowerCase().includes(q) ||
                                                m.slug.toLowerCase().includes(q) ||
                                                (m.url && m.url.toLowerCase().includes(q))
                                            );
                                        })
                                        .map((menu) => {
                                            const isGroup = menu.type === 'GROUP';
                                            const isChild =
                                                menu.parent_id !== null &&
                                                menu.parent_id !== undefined;
                                            const parentGroup = isChild
                                                ? menus.find((m) => m.id === menu.parent_id)
                                                : null;

                                            return (
                                                <TableRow
                                                    key={menu.id}
                                                    className={
                                                        isGroup
                                                            ? 'bg-muted/20 font-semibold hover:bg-muted/30'
                                                            : 'hover:bg-muted/10'
                                                    }
                                                >
                                                    <TableCell className="py-2.5">
                                                        <div
                                                            className={`flex items-center gap-2 ${
                                                                isChild ? 'pl-6' : ''
                                                            }`}
                                                        >
                                                            {renderMenuIcon(menu.icon, isGroup)}
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-foreground truncate">
                                                                    {menu.name}
                                                                </div>
                                                                {menu.url && (
                                                                    <div className="text-[10px] font-mono text-muted-foreground truncate">
                                                                        {menu.url}
                                                                    </div>
                                                                )}
                                                                {isChild && parentGroup && (
                                                                    <div className="text-[9px] text-muted-foreground/80">
                                                                        Grup: {parentGroup.name}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center py-2.5">
                                                        <Badge
                                                            variant={
                                                                isGroup ? 'secondary' : 'outline'
                                                            }
                                                            className="text-[10px] font-mono py-0 px-1.5"
                                                        >
                                                            {menu.type}
                                                        </Badge>
                                                    </TableCell>
                                                    {roles.map((role) => {
                                                        const isChecked = (
                                                            permissions[role.slug] || []
                                                        ).includes(menu.slug);
                                                        return (
                                                            <TableCell
                                                                key={role.id}
                                                                className="text-center py-2.5"
                                                            >
                                                                <Checkbox
                                                                    className="mx-auto"
                                                                    checked={isChecked}
                                                                    onCheckedChange={() =>
                                                                        toggleMenu(role.slug, menu)
                                                                    }
                                                                />
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
