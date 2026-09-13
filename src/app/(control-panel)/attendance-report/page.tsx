'use client';

import { useState, useEffect } from 'react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Branch {
    id: number;
    name: string;
}
interface Teacher {
    id: number;
    full_name: string;
}
interface AttendanceRecord {
    id: number;
    status: string;
    attendance_date: string;
    teacher_name: string;
    branch_name: string;
}

export default function AttendanceReportPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchRes, teacherRes] = await Promise.all([
                    http.get('/branches'),
                    http.get('/teachers'),
                ]);
                setBranches(branchRes.data.data);
                setTeachers(teacherRes.data.data);
            } catch (error) {
                console.error(parseAxiosError(error));
            }
        };
        fetchData();
    }, []);

    const fetchBranchReport = async () => {
        if (!selectedBranchId) return;
        try {
            const res = await http.get(
                `/report-attendance/branch/${selectedBranchId}?month=${month}`,
            );
            setReportData(res.data.data);
        } catch (error) {
            console.error(parseAxiosError(error));
        }
    };

    const fetchTeacherReport = async () => {
        if (!selectedTeacherId) return;
        try {
            const res = await http.get(
                `/report-attendance/teacher/${selectedTeacherId}?month=${month}`,
            );
            setReportData(res.data.data);
        } catch (error) {
            console.error(parseAxiosError(error));
        }
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Laporan Kehadiran</h1>
            <Tabs defaultValue="branch">
                <TabsList>
                    <TabsTrigger value="branch">Berdasarkan Cabang</TabsTrigger>
                    <TabsTrigger value="teacher">Berdasarkan Guru</TabsTrigger>
                </TabsList>

                <TabsContent value="branch" className="space-y-4">
                    <div className="flex gap-4">
                        <Select
                            onValueChange={(value: string | null) => {
                                if (value !== null) {
                                    setSelectedBranchId(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-50">
                                <SelectValue placeholder="Pilih Cabang" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((b) => (
                                    <SelectItem key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-37.5 h-10"
                        />
                        <Button onClick={fetchBranchReport} className="h-10">
                            Cari
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="teacher" className="space-y-4">
                    <div className="flex gap-4">
                        <Select
                            onValueChange={(value: string | null) => {
                                if (value !== null) {
                                    setSelectedTeacherId(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-50">
                                <SelectValue placeholder="Pilih Guru" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-37.5 h-10"
                        />
                        <Button onClick={fetchTeacherReport} className="h-10">
                            Cari
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cabang</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reportData.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.teacher_name}</TableCell>
                            <TableCell>
                                {new Date(row.attendance_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell>{row.branch_name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
