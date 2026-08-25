'use client';

// dependencies
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

// utils
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';

// ui components
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export default function Page() {
    const [programs, setPrograms] = useState([]);

    const getPrograms = async () => {
        try {
            const response = await http.get(`/programs`);
            setPrograms(response.data.data || []);
            // console.log(response.data);
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        }
    };

    return (
        <>
        </>
    )
}