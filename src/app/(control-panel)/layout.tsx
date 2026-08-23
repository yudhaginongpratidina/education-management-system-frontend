'use client';

// dependencies
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// ui components
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// components
import { ThemeToggle } from '@/components/theme-toggle';

// icons
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [menuTree, setMenuTree] = useState<any[]>([]);

    const getMenu = async () => {
        const menuData = localStorage.getItem('menu');
        if (menuData) {
            const rawMenu = JSON.parse(menuData);

            const tree: any[] = [];
            const menuMap: Record<number, any> = {};

            rawMenu.forEach((item: any) => {
                menuMap[item.id] = { ...item, children: [] };
            });

            rawMenu.forEach((item: any) => {
                if (item.parent_id && menuMap[item.parent_id]) {
                    menuMap[item.parent_id].children.push(menuMap[item.id]);
                } else {
                    tree.push(menuMap[item.id]);
                }
            });

            setMenuTree(tree.sort((a: any, b: any) => a.sort_order - b.sort_order));
        }
    };

    const logout = async () => {
        try {
            const response = await http.post('/auth/logout');

            localStorage.removeItem('token');
            localStorage.removeItem('role');

            toast.add({
                title: 'Success',
                type: 'success',
                description: response.data.message,
            });

            setTimeout(() => {
                router.push('/login');
            }, 1000);
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
        const menuData = localStorage.getItem('menu');
        if (menuData) {
            const rawMenu = JSON.parse(menuData);

            // Authorization check
            const isAuthorized = rawMenu.some(
                (item: any) => item.url === pathname || pathname === '/dashboard',
            );
            if (!isAuthorized && pathname !== '/unauthorized') {
                router.push('/unauthorized');
            }

            // Build tree structure
            const tree: any[] = [];
            const menuMap: Record<number, any> = {};

            rawMenu.forEach((item: any) => {
                menuMap[item.id] = { ...item, children: [] };
            });

            rawMenu.forEach((item: any) => {
                if (item.parent_id && menuMap[item.parent_id]) {
                    menuMap[item.parent_id].children.push(menuMap[item.id]);
                } else {
                    tree.push(menuMap[item.id]);
                }
            });

            setMenuTree(tree.sort((a: any, b: any) => a.sort_order - b.sort_order));
        }
    }, [pathname, router]);

    return (
        <>
            <SidebarProvider>
                <Sidebar collapsible="icon">
                    <SidebarHeader>
                        <SidebarMenu className="border-b">
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <GraduationCap className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">EMS</span>
                                        <span className="truncate text-xs">
                                            Education Management System
                                        </span>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>
                    <SidebarContent>
                        {menuTree.map((item: any) => {
                            if (item.type === 'GROUP') {
                                return (
                                    <SidebarGroup key={item.id}>
                                        <SidebarGroupLabel className="capitalize">
                                            {item.name}
                                        </SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {item.children
                                                    .sort(
                                                        (a: any, b: any) =>
                                                            a.sort_order - b.sort_order,
                                                    )
                                                    .map((child: any) => (
                                                        <SidebarMenuItem key={child.id}>
                                                            <Link href={child.url || '#'}>
                                                                <SidebarMenuButton
                                                                    tooltip={child.name}
                                                                >
                                                                    <Icon
                                                                        icon={
                                                                            child.icon ||
                                                                            'material-symbols:menu-rounded'
                                                                        }
                                                                    />
                                                                    <span className="capitalize">
                                                                        {child.name}
                                                                    </span>
                                                                </SidebarMenuButton>
                                                            </Link>
                                                        </SidebarMenuItem>
                                                    ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                );
                            }
                            if (item.type === 'ITEM') {
                                return (
                                    <SidebarGroup key={item.id}>
                                        <SidebarGroupContent>
                                            <SidebarMenu key={item.id}>
                                                <Link href={item.url || '#'}>
                                                    <SidebarMenuItem>
                                                        <SidebarMenuButton tooltip={item.name}>
                                                            <Icon
                                                                icon={
                                                                    item.icon ||
                                                                    'material-symbols:menu-rounded'
                                                                }
                                                            />
                                                            <span className="capitalize">
                                                                {item.name}
                                                            </span>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                </Link>
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                );
                            }
                            return null;
                        })}
                    </SidebarContent>
                    <SidebarFooter>
                        <div className="border-t flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-sm">
                                <AvatarImage
                                    src="/assets/img/user.jpg"
                                    alt="@shadcn"
                                    className="rounded-sm"
                                />
                                <AvatarFallback className="rounded-sm">CN</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">user</span>
                                <span className="truncate text-xs">user@gmail.com</span>
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <header className="w-full sticky top-0 px-4 flex h-14 border-b shrink-0 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex  items-center gap-2 px-4">
                            <SidebarTrigger />
                        </div>
                        <div className="flex items-center gap-2 pr-4">
                            <ThemeToggle />
                            <Button variant="outline" size="icon" onClick={() => logout()}>
                                <Icon icon="humbleicons:logout" />
                            </Button>
                        </div>
                    </header>
                    <div className="w-full flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
