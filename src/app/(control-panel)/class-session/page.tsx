'use client';

// dependencies
import { useEffect, useState } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';

// components
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

// module components
import ClassSessionManagement from '@/modules/class/class-session-management';

export default function Page() {
    const [branches, setBranches] = useState<any[]>([]);
    const [branchId, setBranchId] = useState<string>('all');

    const getBranches = async () => {
        try {
            const response = await http.get('/branches');
            setBranches(extractList(response.data));
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Error', type: 'error', description: message });
        }
    };

    useEffect(() => {
        getBranches();
    }, []);

    const branchItems = [
        { value: 'all', label: 'Semua Cabang' },
        ...branches.map((branch) => ({ value: String(branch.id), label: branch.name })),
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold">Sesi Pembelajaran</h1>
                    <p className="text-muted-foreground text-sm">
                        Kelola sesi, peserta, dan kehadiran siswa.
                    </p>
                </div>
                <Select
                    value={branchId}
                    onValueChange={(value) => setBranchId(value ?? 'all')}
                    items={branchItems}
                >
                    <SelectTrigger className="h-10 w-48">
                        <SelectValue placeholder="Semua Cabang" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Cabang</SelectItem>
                        {branches.map((branch) => (
                            <SelectItem key={branch.id} value={String(branch.id)}>
                                {branch.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ClassSessionManagement branchId={branchId !== 'all' ? Number(branchId) : undefined} />
        </div>
    );
}
