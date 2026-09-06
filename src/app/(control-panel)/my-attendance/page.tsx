'use client';

import { useState, useEffect } from 'react';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/toast';

export default function Page() {
    const [myRecords, setMyRecords] = useState<any[]>([]);

    const getRecords = async () => {
        try {
            const user_id = localStorage.getItem('user_id');
            const teacher_id = user_id ? parseInt(user_id) : 3;
            const response = await http.get(`/teacher-attendances?teacher_id=${teacher_id}`);
            setMyRecords(response.data.data || []);
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
        getRecords();
    }, []);

    const calculateDuration = (checkIn: string | null, checkOut: string | null) => {
        if (!checkIn || !checkOut) return '-';
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours} jam ${minutes} menit`;
    };

    return (
        <Table className="border">
            <TableHeader>
                <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status Approve</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {myRecords.map((data: any) => (
                    <TableRow key={data.id}>
                        <TableCell>
                            {new Date(data.attendance_date).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>{data.branch_name}</TableCell>
                        <TableCell>
                            {data.check_in_at
                                ? new Date(data.check_in_at).toLocaleTimeString('id-ID')
                                : '-'}
                        </TableCell>
                        <TableCell>
                            {data.check_out_at
                                ? new Date(data.check_out_at).toLocaleTimeString('id-ID')
                                : '-'}
                        </TableCell>
                        <TableCell>
                            {calculateDuration(data.check_in_at, data.check_out_at)}
                        </TableCell>
                        <TableCell>
                            {data.is_approved ? 'Disetujui' : 'Belum/Tidak Disetujui'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
