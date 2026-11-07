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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import {
    CalendarCheck,
    Camera,
    CameraOff,
    CheckCircle2,
    Clock,
    ExternalLink,
    Maximize2,
    RefreshCw,
    MapPin,
    Calendar as CalendarIcon,
} from 'lucide-react';

function resolveAttendancePhotoUrl(photo?: string | null): string | null {
    if (
        !photo ||
        typeof photo !== 'string' ||
        photo.trim() === '' ||
        photo === '-' ||
        photo === 'null'
    ) {
        return null;
    }
    const trimmed = photo.trim();
    if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
    ) {
        return trimmed;
    }
    if (trimmed.startsWith('/storage/')) {
        return trimmed;
    }
    if (trimmed.startsWith('storage/')) {
        return `/${trimmed}`;
    }
    if (trimmed.startsWith('/uploads/')) {
        return trimmed;
    }
    const cleanSlug = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    return `/storage/${cleanSlug}`;
}

const STATUS_CONFIG: Record<
    string,
    {
        label: string;
        variant:
            'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline';
    }
> = {
    PRESENT: { label: 'Hadir', variant: 'success' },
    ABSENT: { label: 'Alfa', variant: 'destructive' },
    SICK: { label: 'Sakit', variant: 'warning' },
    LEAVE: { label: 'Izin', variant: 'info' },
    REMOTE: { label: 'Remote', variant: 'default' },
    OFFICIAL_DUTY: { label: 'Dinas Luar', variant: 'secondary' },
    HOLIDAY: { label: 'Libur', variant: 'outline' },
    LATE: { label: 'Terlambat', variant: 'warning' },
};

function AttendancePhotoThumbnail({
    photo,
    type,
    date,
    time,
    branchName,
}: {
    photo?: string | null;
    type: 'check_in' | 'check_out';
    date: string;
    time?: string | null;
    branchName?: string;
}) {
    const label = type === 'check_in' ? 'Check-in' : 'Check-out';
    const photoUrl = resolveAttendancePhotoUrl(photo);

    if (!photoUrl) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 py-1 px-2 rounded-sm bg-muted/30 border border-dashed border-border/60 w-fit">
                <CameraOff className="size-3.5 opacity-60 shrink-0" />
                <span className="text-[11px] font-normal">Tidak ada</span>
            </div>
        );
    }

    const formattedDate = date
        ? new Date(date).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '-';

    const formattedTime = time
        ? new Date(time).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <Dialog>
            <DialogTrigger
                render={
                    <button
                        type="button"
                        className="group relative flex items-center justify-center size-12 overflow-hidden rounded-sm border border-border/80 bg-muted/40 shadow-xs hover:border-primary/70 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all shrink-0 cursor-pointer"
                        title={`Lihat foto ${label}`}
                    >
                        <img
                            src={photoUrl}
                            alt={`Foto ${label}`}
                            className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
                            onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.fallback) {
                                    target.dataset.fallback = 'true';
                                    target.src = `http://localhost:4000${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
                                }
                            }}
                        />
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                            <Maximize2 className="size-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                        </span>
                    </button>
                }
            />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="size-5 text-primary" />
                        Foto Bukti {label}
                    </DialogTitle>
                    <DialogDescription>
                        Cabang {branchName || '-'} • {formattedDate}{' '}
                        {formattedTime ? `pukul ${formattedTime} WIB` : ''}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative mt-2 overflow-hidden rounded-sm border border-border/80 bg-muted/20 flex items-center justify-center min-h-[260px] max-h-[65vh]">
                    <img
                        src={photoUrl}
                        alt={`Foto Bukti ${label}`}
                        className="max-h-[60vh] w-auto max-w-full rounded-sm object-contain"
                        onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.dataset.fallback) {
                                target.dataset.fallback = 'true';
                                target.src = `http://localhost:4000${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
                            }
                        }}
                    />
                </div>

                <DialogFooter className="mt-2 flex flex-row items-center justify-between sm:justify-between w-full">
                    <a
                        href={photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                        <ExternalLink className="size-3.5" />
                        Buka Foto Asli
                    </a>
                    <DialogClose
                        render={
                            <Button variant="outline" size="sm">
                                Tutup
                            </Button>
                        }
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function Page() {
    const [myRecords, setMyRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const getRecords = async () => {
        setLoading(true);
        try {
            const current = await http.get(`/auth/me`);
            const data = current.data.data;
            if (!data?.slug) {
                setMyRecords([]);
                return;
            }

            const teacher = await http.get(`/teachers?slug=${data.slug}`);
            const teacherData = teacher.data.data?.[0];
            if (!teacherData?.id) {
                setMyRecords([]);
                return;
            }

            try {
                const response = await http.get(
                    `/teacher-attendances?teacher_id=${teacherData.id}`,
                );
                const list = Array.isArray(response.data?.data) ? response.data.data : [];
                // Sort descending (newest attendance date first)
                list.sort(
                    (a: any, b: any) =>
                        new Date(b.attendance_date).getTime() -
                        new Date(a.attendance_date).getTime(),
                );
                setMyRecords(list);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setMyRecords([]);
                } else {
                    throw err;
                }
            }
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({
                title: 'Error',
                type: 'error',
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRecords();
    }, []);

    const calculateDuration = (checkIn: string | null, checkOut: string | null) => {
        if (!checkIn || !checkOut) return '-';
        const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
        if (diff <= 0) return '-';
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours} jam ${minutes} mnt`;
    };

    return (
        <div className="container mx-auto space-y-6">
            <Card className="rounded-sm border border-border/80 shadow-xs">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <CalendarCheck className="size-5 text-primary" />
                            Riwayat Presensi Saya
                        </CardTitle>
                        <CardDescription>
                            Daftar catatan kehadiran harian, waktu check-in & check-out, serta foto
                            bukti presensi Anda.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={getRecords}
                        disabled={loading}
                        className="rounded-sm gap-2 shrink-0 self-start sm:self-auto"
                    >
                        <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Segarkan
                    </Button>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="font-semibold">Cabang</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold text-center">
                                        Foto Check-in
                                    </TableHead>
                                    <TableHead className="font-semibold">Jam Masuk</TableHead>
                                    <TableHead className="font-semibold text-center">
                                        Foto Check-out
                                    </TableHead>
                                    <TableHead className="font-semibold">Jam Pulang</TableHead>
                                    <TableHead className="font-semibold">Durasi</TableHead>
                                    <TableHead className="font-semibold">Persetujuan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <RefreshCw className="size-6 animate-spin text-primary" />
                                                <p className="text-sm">
                                                    Memuat riwayat presensi...
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : myRecords.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <CalendarCheck className="size-8 opacity-40" />
                                                <p className="text-sm font-medium">
                                                    Belum ada riwayat presensi yang tercatat.
                                                </p>
                                                <p className="text-xs opacity-75">
                                                    Lakukan absensi masuk dan pulang melalui menu
                                                    Absensi Guru.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    myRecords.map((data: any) => {
                                        const statusMeta = STATUS_CONFIG[data.status] || {
                                            label: data.status,
                                            variant: 'outline' as const,
                                        };

                                        return (
                                            <TableRow key={data.id} className="hover:bg-muted/20">
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>
                                                            {new Date(
                                                                data.attendance_date,
                                                            ).toLocaleDateString('id-ID', {
                                                                weekday: 'short',
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                                        <span>{data.branch_name || '-'}</span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <Badge
                                                        variant={statusMeta.variant}
                                                        className="rounded-sm"
                                                    >
                                                        {statusMeta.label}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <AttendancePhotoThumbnail
                                                            photo={data.check_in_photo}
                                                            type="check_in"
                                                            date={data.attendance_date}
                                                            time={data.check_in_at}
                                                            branchName={data.branch_name}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    {data.check_in_at ? (
                                                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                            {new Date(
                                                                data.check_in_at,
                                                            ).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <AttendancePhotoThumbnail
                                                            photo={data.check_out_photo}
                                                            type="check_out"
                                                            date={data.attendance_date}
                                                            time={data.check_out_at}
                                                            branchName={data.branch_name}
                                                        />
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    {data.check_out_at ? (
                                                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-sm bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                                            {new Date(
                                                                data.check_out_at,
                                                            ).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap font-medium text-xs">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Clock className="size-3 shrink-0" />
                                                        <span>
                                                            {calculateDuration(
                                                                data.check_in_at,
                                                                data.check_out_at,
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="whitespace-nowrap">
                                                    {data.is_approved ? (
                                                        <Badge
                                                            variant="success"
                                                            className="gap-1 rounded-sm"
                                                        >
                                                            <CheckCircle2 className="size-3" />
                                                            Disetujui
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="warning"
                                                            className="gap-1 rounded-sm"
                                                        >
                                                            <Clock className="size-3" />
                                                            Menunggu
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
