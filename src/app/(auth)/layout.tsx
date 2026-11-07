// icons
import { GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { AppLogo } from '@/components/app-logo';

const highlights = [
    {
        icon: Users,
        title: 'Kelola semua cabang',
        desc: 'Data siswa, guru, kelas, dan program terpusat.',
    },
    {
        icon: Sparkles,
        title: 'Pantau kehadiran & progres',
        desc: 'Absensi, sesi kelas, dan laporan dalam satu klik.',
    },
    {
        icon: ShieldCheck,
        title: 'Aman & terpercaya',
        desc: 'Hak akses berjenjang untuk setiap peran pengguna.',
    },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-brand-gradient relative hidden overflow-hidden p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
                <div className="grid-pattern absolute inset-0 opacity-20" />
                <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-black/10 blur-3xl" />

                <div className="relative">
                    <AppLogo size="lg" textClassName="text-primary-foreground" />
                </div>

                <div className="relative max-w-md space-y-6">
                    <h1 className="font-heading text-4xl leading-tight font-bold tracking-tight">
                        Kelola bimbel Anda lebih rapi dan modern.
                    </h1>
                    <p className="text-primary-foreground/85">
                        Satu platform untuk mengatur cabang, program, kelas, guru, siswa, hingga
                        kehadiran harian.
                    </p>
                    <ul className="space-y-4">
                        {highlights.map((item) => (
                            <li key={item.title} className="flex items-start gap-3">
                                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-white/15 backdrop-blur">
                                    <item.icon className="size-4.5" />
                                </div>
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    <p className="text-sm text-primary-foreground/75">
                                        {item.desc}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-sm text-primary-foreground/70">
                    © {new Date().getFullYear()} EMS — Education Management System
                </p>
            </div>

            <div className="gradient-mesh flex flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <div className="flex items-center gap-2 self-center lg:hidden">
                        <AppLogo size="md" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
