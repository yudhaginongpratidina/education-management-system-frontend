// dependencies
import Link from 'next/link';
import { Icon } from '@iconify/react';

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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// components
import { ThemeToggle } from '@/components/theme-toggle';

// icons
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: React.ReactNode }) {
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
                        {/* ================================================== */}
                        {/* DASHBOARD */}
                        {/* ================================================== */}
                        <SidebarGroup>
                            <SidebarGroupContent className="flex flex-col gap-2">
                                <SidebarMenu>
                                    <Link href="/dashboard">
                                        <SidebarMenuItem className="flex items-center gap-2">
                                            <SidebarMenuButton tooltip="Dashboard">
                                                <Icon icon="material-symbols-light:dashboard" />
                                                <span>Dashboard</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Link>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* ================================================== */}
                        {/* ACCESS CONTROL */}
                        {/* ================================================== */}
                        <SidebarGroup>
                            <SidebarGroupLabel>Kontrol Akses</SidebarGroupLabel>
                            <SidebarGroupContent className="flex flex-col gap-2">
                                <SidebarMenu>
                                    <Link href="/access-control/role">
                                        <SidebarMenuItem className="flex items-center gap-2">
                                            <SidebarMenuButton tooltip="Role">
                                                <Icon icon="material-symbols:key" />
                                                <span>Role</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Link>
                                </SidebarMenu>
                                <SidebarMenu>
                                    <Link href="/access-control/menu">
                                        <SidebarMenuItem className="flex items-center gap-2">
                                            <SidebarMenuButton tooltip="Menu">
                                                <Icon icon="material-symbols:menu-rounded" />
                                                <span>Menu</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Link>
                                </SidebarMenu>
                                <SidebarMenu>
                                    <Link href="/access-control/role-menu">
                                        <SidebarMenuItem className="flex items-center gap-2">
                                            <SidebarMenuButton tooltip="Role Menu">
                                                <Icon icon="hugeicons:access" />
                                                <span>Role Menu</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Link>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {/* ================================================== */}
                        {/* SECURITY */}
                        {/* ================================================== */}
                        <SidebarGroup>
                            <SidebarGroupLabel>Akun</SidebarGroupLabel>
                            <SidebarGroupContent className="flex flex-col gap-2">
                                <SidebarMenu>
                                    <Link href="/profile">
                                        <SidebarMenuItem className="flex items-center gap-2">
                                            <SidebarMenuButton tooltip="Profile">
                                                <Icon icon="tabler:user-filled" />
                                                <span>Profile</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Link>
                                </SidebarMenu>
                                <SidebarMenu>
                                    <Link href="/security">
                                        <SidebarMenuItem className="flex items-center gap-2">
                                            <SidebarMenuButton tooltip="Security">
                                                <Icon icon="mdi:password" />
                                                <span>Security</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </Link>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
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
                    <header className="w-full px-4 flex h-14 border-b shrink-0 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex  items-center gap-2 px-4">
                            <SidebarTrigger />
                        </div>
                        <div className="flex items-center gap-2 pr-4">
                            <ThemeToggle />
                            <Button variant="outline" size="icon">
                                <Icon icon="humbleicons:logout" />
                            </Button>
                        </div>
                    </header>
                    <div className="w-full flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </>
    );
}
