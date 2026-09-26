'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Building2, GraduationCap, LayoutGrid, ShieldCheck, Users } from 'lucide-react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard, type StatTone } from './stats-card';

const endpoints = [
    {
        key: 'totalRole',
        endpoint: 'total-role',
        title: 'Total Role',
        desc: 'Role sistem',
        sub: 'Total role yang terdaftar',
        icon: ShieldCheck,
        tone: 'violet' as StatTone,
    },
    {
        key: 'totalMenu',
        endpoint: 'total-menu',
        title: 'Total Menu',
        desc: 'Menu sistem',
        sub: 'Total menu yang terdaftar',
        icon: LayoutGrid,
        tone: 'sky' as StatTone,
    },
    {
        key: 'totalUser',
        endpoint: 'total-user',
        title: 'Total User',
        desc: 'User aktif',
        sub: 'Total user yang terdaftar',
        icon: Users,
        tone: 'primary' as StatTone,
    },
    {
        key: 'totalProgram',
        endpoint: 'total-program',
        title: 'Total Program',
        desc: 'Program aktif',
        sub: 'Total program yang terdaftar',
        icon: BookOpen,
        tone: 'emerald' as StatTone,
    },
    {
        key: 'totalBranch',
        endpoint: 'total-branch',
        title: 'Total Cabang',
        desc: 'Cabang aktif',
        sub: 'Total cabang yang terdaftar',
        icon: Building2,
        tone: 'amber' as StatTone,
    },
    {
        key: 'totalTeacher',
        endpoint: 'total-teacher',
        title: 'Total Guru',
        desc: 'Guru aktif',
        sub: 'Total guru yang terdaftar',
        icon: GraduationCap,
        tone: 'rose' as StatTone,
    },
];

export function DashboardStats() {
    const [statsData, setStatsData] = useState<Record<string, number | string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAllStats() {
            setLoading(true);
            const newData: Record<string, number | string> = {};

            for (const item of endpoints) {
                try {
                    const response = await http.get(`/dashboard/${item.endpoint}`);
                    newData[item.key] = response.data.success ? response.data.data.total : 0;
                } catch (error) {
                    console.error(`Error fetching ${item.endpoint}:`, parseAxiosError(error));
                    newData[item.key] = 0;
                }
            }

            setStatsData(newData);
            setLoading(false);
        }

        fetchAllStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-primary-foreground shadow-brand md:p-8">
                <div className="grid-pattern absolute inset-0 opacity-15" />
                <div className="pointer-events-none absolute -top-20 -right-10 size-56 rounded-full bg-white/10 blur-2xl" />
                <div className="relative space-y-1.5">
                    <p className="text-sm text-primary-foreground/80">Dashboard</p>
                    <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                        Selamat datang di panel bimbel 👋
                    </h1>
                    <p className="max-w-2xl text-sm text-primary-foreground/85">
                        Ringkasan data operasional bimbel Anda — cabang, program, guru, dan pengguna
                        dalam satu tampilan.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading
                    ? endpoints.map((item) => (
                          <Skeleton key={item.key} className="h-40 w-full rounded-xl" />
                      ))
                    : endpoints.map((item) => (
                          <StatsCard
                              key={item.key}
                              title={item.title}
                              value={statsData[item.key] ?? 0}
                              desc={item.desc}
                              sub={item.sub}
                              icon={item.icon}
                              tone={item.tone}
                          />
                      ))}
            </div>
        </div>
    );
}
