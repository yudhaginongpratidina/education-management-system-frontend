import { Badge } from '@/components/ui/badge';

type Variant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';

// Maps API status values to a human readable label + badge variant.
const STATUS_MAP: Record<string, { label: string; variant: Variant }> = {
    // Enrollment / student program
    PENDING: { label: 'Menunggu', variant: 'warning' },
    TRIAL: { label: 'Trial', variant: 'info' },
    ACTIVE: { label: 'Aktif', variant: 'success' },
    COMPLETED: { label: 'Selesai', variant: 'info' },
    CANCELLED: { label: 'Dibatalkan', variant: 'destructive' },
    EXPIRED: { label: 'Kedaluwarsa', variant: 'destructive' },
    // Class
    INACTIVE: { label: 'Tidak Aktif', variant: 'secondary' },
    // Session
    SCHEDULED: { label: 'Terjadwal', variant: 'info' },
    ONGOING: { label: 'Berlangsung', variant: 'default' },
    RESCHEDULED: { label: 'Dijadwalkan Ulang', variant: 'warning' },
    // Attendance
    PRESENT: { label: 'Hadir', variant: 'success' },
    ABSENT: { label: 'Alfa', variant: 'destructive' },
    SICK: { label: 'Sakit', variant: 'warning' },
    PERMISSION: { label: 'Izin', variant: 'info' },
    // Teacher role
    PRIMARY: { label: 'Guru Utama', variant: 'default' },
    SUBSTITUTE: { label: 'Guru Pengganti', variant: 'secondary' },
};

export function StatusBadge({ status }: { status?: string | null }) {
    if (!status) return <span className="text-muted-foreground">-</span>;
    const meta = STATUS_MAP[status] ?? { label: status, variant: 'outline' as const };
    return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
