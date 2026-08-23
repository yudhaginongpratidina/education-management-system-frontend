'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// components
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function Page() {
    const [roles, setRoles] = useState<any[]>([]);
    const [menus, setMenus] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<Record<string, string[]>>({}); // roleSlug: menuSlugs[]
    const [editingRoles, setEditingRoles] = useState<Record<string, boolean>>({});

    const fetchData = async () => {
        try {
            const [rolesRes, menusRes] = await Promise.all([
                http.get(`/roles`),
                http.get(`/menus`),
            ]);
            setRoles(rolesRes.data.data || []);
            setMenus(menusRes.data.data || []);

            // Fetch permissions for all roles
            const perms: Record<string, string[]> = {};
            for (const role of rolesRes.data.data) {
                const pRes = await http.get(`/role-menus/${role.slug}`);
                perms[role.slug] = pRes.data.data.map((m: any) => m.slug);
            }
            setPermissions(perms);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const togglePermission = (roleSlug: string, menuSlug: string) => {
        if (!editingRoles[roleSlug]) return;
        setPermissions((prev) => ({
            ...prev,
            [roleSlug]: prev[roleSlug].includes(menuSlug)
                ? prev[roleSlug].filter((s) => s !== menuSlug)
                : [...prev[roleSlug], menuSlug],
        }));
    };

    const toggleEditMode = async (roleSlug: string) => {
        if (editingRoles[roleSlug]) {
            await submitSync(roleSlug);
        }
        setEditingRoles((prev) => ({ ...prev, [roleSlug]: !prev[roleSlug] }));
    };

    const submitSync = async (roleSlug: string) => {
        try {
            const response = await http.post(`/role-menus/${roleSlug}/sync`, {
                menu_slugs: permissions[roleSlug],
            });
            toast.add({ title: 'Success', type: 'success', description: response.data.message });
            fetchData();
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    return (
        <Table className="border">
            <TableHeader>
                <TableRow>
                    <TableHead>Role</TableHead>
                    {menus.map((menu) => (
                        <TableHead key={menu.id} className="capitalize text-center">
                            {menu.name}
                        </TableHead>
                    ))}
                    <TableHead>Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {roles.map((role) => (
                    <TableRow key={role.id}>
                        <TableCell className="capitalize font-medium">{role.name}</TableCell>
                        {menus.map((menu) => (
                            <TableCell key={menu.id} className="text-center">
                                <Checkbox
                                    className={'mx-auto'}
                                    disabled={!editingRoles[role.slug]}
                                    checked={permissions[role.slug]?.includes(menu.slug) || false}
                                    onCheckedChange={() => togglePermission(role.slug, menu.slug)}
                                />
                            </TableCell>
                        ))}
                        <TableCell>
                            <Button size="icon" onClick={() => toggleEditMode(role.slug)}>
                                <Icon
                                    icon={
                                        editingRoles[role.slug]
                                            ? 'material-symbols:save'
                                            : 'material-symbols:edit'
                                    }
                                />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
