import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { StatsCard } from './stats-card';

const API_URL = 'http://localhost:4000/dashboard';
const TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwic2lkIjoiMjI5ZGM0NTMtNDRlOC00OWM1LTg3MTYtMDAwMDI0YTRiYzE5IiwiaXNzIjoieW91ci1hcHAtbmFtZSIsImF1ZCI6InlvdXItYXBwLXVzZXJzIiwicm9sZSI6InN1cGVyLWFkbWluIiwiaWF0IjoxNzg5MzEyMTY4LCJleHAiOjE3ODkzMTkzNjh9.4j39ugnl2gOwJqUiIr1QtiUliE4d28Ut53EOWFQkPhc';

async function fetchData(endpoint: string) {
    try {
        const response = await http.get(`${API_URL}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        return response.data.success ? response.data.data.total : 0;
    } catch (error) {
        console.error(parseAxiosError(error));
        return 0;
    }
}

export async function DashboardStats() {
    const [totalRole, totalMenu, totalUser, totalProgram, totalBranch, totalTeacher] =
        await Promise.all([
            fetchData('total-role'),
            fetchData('total-menu'),
            fetchData('total-user'),
            fetchData('total-program'),
            fetchData('total-branch'),
            fetchData('total-teacher'),
        ]);

    const stats = [
        {
            title: 'Total Role',
            value: totalRole,
            desc: 'Role sistem',
            sub: 'Total role yang terdaftar',
        },
        {
            title: 'Total Menu',
            value: totalMenu,
            desc: 'Menu sistem',
            sub: 'Total menu yang terdaftar',
        },
        {
            title: 'Total User',
            value: totalUser,
            desc: 'User aktif',
            sub: 'Total user yang terdaftar',
        },
        {
            title: 'Total Program',
            value: totalProgram,
            desc: 'Program aktif',
            sub: 'Total program yang terdaftar',
        },
        {
            title: 'Total Branch',
            value: totalBranch,
            desc: 'Cabang aktif',
            sub: 'Total cabang yang terdaftar',
        },
        {
            title: 'Total Guru',
            value: totalTeacher,
            desc: 'Guru aktif',
            sub: 'Total guru yang terdaftar',
        },
    ];

    return (
        <div className="w-full p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
                <StatsCard key={i} {...stat} />
            ))}
        </div>
    );
}
