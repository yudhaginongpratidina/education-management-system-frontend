'use client';

import { useEffect, useState } from 'react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { StatsCard } from './stats-card';

const endpoints = [
    {
        key: 'totalRole',
        endpoint: 'total-role',
        title: 'Total Role',
        desc: 'Role sistem',
        sub: 'Total role yang terdaftar',
    },
    {
        key: 'totalMenu',
        endpoint: 'total-menu',
        title: 'Total Menu',
        desc: 'Menu sistem',
        sub: 'Total menu yang terdaftar',
    },
    {
        key: 'totalUser',
        endpoint: 'total-user',
        title: 'Total User',
        desc: 'User aktif',
        sub: 'Total user yang terdaftar',
    },
    {
        key: 'totalProgram',
        endpoint: 'total-program',
        title: 'Total Program',
        desc: 'Program aktif',
        sub: 'Total program yang terdaftar',
    },
    {
        key: 'totalBranch',
        endpoint: 'total-branch',
        title: 'Total Branch',
        desc: 'Cabang aktif',
        sub: 'Total cabang yang terdaftar',
    },
    {
        key: 'totalTeacher',
        endpoint: 'total-teacher',
        title: 'Total Guru',
        desc: 'Guru aktif',
        sub: 'Total guru yang terdaftar',
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

    if (loading) {
        return <div className="p-4">Loading stats...</div>;
    }

    return (
        <div className="w-full p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpoints.map((item, i) => (
                <StatsCard
                    key={i}
                    title={item.title}
                    value={statsData[item.key] || 0}
                    desc={item.desc}
                    sub={item.sub}
                />
            ))}
        </div>
    );
}
