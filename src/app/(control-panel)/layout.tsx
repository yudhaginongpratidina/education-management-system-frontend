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
    useSidebar,
} from '@/components/ui/sidebar';
import { toast } from '@/components/ui/toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// components
import { ThemeToggle } from '@/components/theme-toggle';

// icons
import { GraduationCap, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MenuItem = {
    id: number;
    name: string;
    url?: string | null;
    icon?: string | null;
    type: 'GROUP' | 'ITEM';
    sort_order?: number;
    parent_id?: number | null;
    children: MenuItem[];
};

function isActivePath(pathname: string, url?: string | null) {
    if (!url) return false;
    if (url === '/dashboard') return pathname === url;
    return pathname === url || pathname.startsWith(`${url}/`);
}

function Brand() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="EMS — Bimbel Management">
                    <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground shadow-brand">
                        <GraduationCap className="size-5" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-heading text-sm font-semibold">EMS</span>
                        <span className="truncate text-xs text-muted-foreground">
                            Bimbel Management
                        </span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function SidebarMenuLink({ href, children }: { href: string; children: React.ReactNode }) {
    const { isMobile, setOpenMobile } = useSidebar();

    return (
        <Link
            href={href}
            onClick={() => {
                if (isMobile) setOpenMobile(false);
            }}
        >
            {children}
        </Link>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [menuTree, setMenuTree] = useState<MenuItem[]>([]);

    const buildTree = (rawMenu: any[]): MenuItem[] => {
        const tree: MenuItem[] = [];
        const menuMap: Record<number, MenuItem> = {};

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

        return tree.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    };

    const logout = async () => {
        try {
            const response = await http.post('/auth/logout');

            localStorage.removeItem('token');
            localStorage.removeItem('role');

            toast.add({
                title: 'Berhasil keluar',
                type: 'success',
                description: response.data.message,
            });

            setTimeout(() => {
                router.push('/login');
            }, 800);
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

            // Halaman yang selalu boleh diakses tanpa entri menu (mis. saat pengembangan UI).
            const alwaysAllowed = [
                '/dashboard',
                '/landing-page',
                '/my-sessions',
                '/cashflow',
                '/reports',
                '/asset-management',
                '/guide',
            ];

            // Authorization check
            const isAuthorized =
                alwaysAllowed.includes(pathname) ||
                rawMenu.some((item: any) => item.url === pathname);
            if (!isAuthorized && pathname !== '/unauthorized') {
                router.push('/unauthorized');
            }

            setMenuTree(buildTree(rawMenu));
        }
    }, [pathname, router]);

    const flatMenus = menuTree.flatMap((item) => [item, ...(item.children ?? [])]);
    const currentMenu =
        flatMenus
            .filter((item) => item.url && isActivePath(pathname, item.url))
            .sort((a, b) => (b.url?.length ?? 0) - (a.url?.length ?? 0))[0] ?? null;

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" className="border-r border-sidebar-border">
                <SidebarHeader className="pb-2">
                    <Brand />
                </SidebarHeader>
                <SidebarContent className="gap-1 px-1">
                    {menuTree.map((item) => {
                        if (item.type === 'GROUP') {
                            return (
                                <SidebarGroup key={item.id} className="py-0.5">
                                    <SidebarGroupLabel className="h-7 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
                                        {item.name}
                                    </SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu className="gap-1">
                                            {[...item.children]
                                                .sort(
                                                    (a, b) =>
                                                        (a.sort_order ?? 0) - (b.sort_order ?? 0),
                                                )
                                                .map((child) => (
                                                    <SidebarMenuItem key={child.id}>
                                                        <SidebarMenuLink href={child.url || '#'}>
                                                            <SidebarMenuButton
                                                                tooltip={child.name}
                                                                isActive={isActivePath(
                                                                    pathname,
                                                                    child.url,
                                                                )}
                                                            >
                                                                <Icon
                                                                    icon={
                                                                        child.icon ||
                                                                        'material-symbols:menu-rounded'
                                                                    }
                                                                />
                                                                <span className="capitalize group-data-[collapsible=icon]:hidden">
                                                                    {child.name}
                                                                </span>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuLink>
                                                    </SidebarMenuItem>
                                                ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            );
                        }
                        if (item.type === 'ITEM') {
                            return (
                                <SidebarGroup key={item.id} className="py-0.5">
                                    <SidebarGroupContent>
                                        <SidebarMenu className="gap-1">
                                            <SidebarMenuItem>
                                                <SidebarMenuLink href={item.url || '#'}>
                                                    <SidebarMenuButton
                                                        tooltip={item.name}
                                                        isActive={isActivePath(pathname, item.url)}
                                                    >
                                                        <Icon
                                                            icon={
                                                                item.icon ||
                                                                'material-symbols:menu-rounded'
                                                            }
                                                        />
                                                        <span className="capitalize group-data-[collapsible=icon]:hidden">
                                                            {item.name}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </SidebarMenuLink>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            );
                        }
                        return null;
                    })}
                </SidebarContent>
                <SidebarFooter>
                    <div className="flex items-center gap-3 rounded-xl px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                        <Avatar className="h-9 w-9 rounded-lg">
                            <AvatarImage src="/assets/img/user.jpg" alt="User" />
                            <AvatarFallback className="rounded-lg bg-brand-gradient text-primary-foreground text-xs font-semibold">
                                U
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                            <span className="truncate text-sm font-medium">Pengguna</span>
                            <span className="truncate text-xs text-muted-foreground">
                                user@gmail.com
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden"
                            onClick={() => logout()}
                            aria-label="Keluar"
                        >
                            <LogOut />
                        </Button>
                    </div>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="glass sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-5 w-px bg-border" />
                        <div className="leading-tight">
                            <p className="font-heading text-sm font-semibold">
                                {currentMenu?.name ?? 'Dashboard'}
                            </p>
                            <p className="hidden text-xs text-muted-foreground sm:block">
                                Selamat datang kembali di panel bimbel
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative hidden md:block">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Cari..."
                                className="h-9 w-56 rounded-lg border border-input bg-card/70 pr-3 pl-9 text-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            nativeButton={false}
                            render={<Link href="/guide" />}
                            aria-label="Panduan pengguna"
                            title="Panduan pengguna"
                        >
                            <Icon icon="mdi:book-open-page-variant-outline" />
                        </Button>
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => logout()}
                            aria-label="Keluar"
                        >
                            <Icon icon="humbleicons:logout" />
                        </Button>
                    </div>
                </header>
                <div className="flex w-full flex-1 flex-col">
                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
