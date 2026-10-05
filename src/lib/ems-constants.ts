// Shared option lists and helpers for the Education Management System features.

export const STUDENT_PROGRAM_STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'TRIAL', label: 'Trial' },
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
    { value: 'EXPIRED', label: 'Kedaluwarsa' },
] as const;

export const CLASS_STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'INACTIVE', label: 'Tidak Aktif' },
] as const;

export const CLASS_TEACHER_ROLE_OPTIONS = [
    { value: 'PRIMARY', label: 'Guru Utama' },
    { value: 'SUBSTITUTE', label: 'Guru Pengganti' },
] as const;

export const SESSION_STATUS_OPTIONS = [
    { value: 'SCHEDULED', label: 'Terjadwal' },
    { value: 'ONGOING', label: 'Berlangsung' },
    { value: 'COMPLETED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' },
    { value: 'RESCHEDULED', label: 'Dijadwalkan Ulang' },
] as const;

export const ATTENDANCE_STATUS_OPTIONS = [
    { value: 'PRESENT', label: 'Hadir' },
    { value: 'ABSENT', label: 'Alfa' },
    { value: 'SICK', label: 'Sakit' },
    { value: 'PERMISSION', label: 'Izin' },
    { value: 'RESCHEDULED', label: 'Dijadwalkan Ulang' },
] as const;

export const DAY_OF_WEEK_OPTIONS = [
    { value: '1', label: 'Senin' },
    { value: '2', label: 'Selasa' },
    { value: '3', label: 'Rabu' },
    { value: '4', label: 'Kamis' },
    { value: '5', label: 'Jumat' },
    { value: '6', label: 'Sabtu' },
    { value: '7', label: 'Minggu' },
] as const;

export const SCHOOL_LEVEL_OPTIONS = ['TK', 'SD', 'SMP', 'SMA', 'SMK', 'Mahasiswa', 'Umum'] as const;

// Stored as plain text in `teachers.position`, so value === label.
export const TEACHER_POSITION_OPTIONS = [
    { value: 'Calon Guru', label: 'Calon Guru' },
    { value: 'Guru Utama', label: 'Guru Utama' },
    { value: 'Guru Bantu (Partime)', label: 'Guru Bantu (Partime)' },
    { value: 'Kepala Sekolah', label: 'Kepala Sekolah' },
] as const;

export const PROGRAM_STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'INACTIVE', label: 'Tidak Aktif' },
] as const;

export const SESSION_PERIOD_OPTIONS = [
    { value: 'WEEK', label: 'Minggu' },
    { value: 'MONTH', label: 'Bulan' },
] as const;

export const MENU_TYPE_OPTIONS = [
    { value: 'GROUP', label: 'Group' },
    { value: 'ITEM', label: 'Item' },
] as const;

export const MENU_ACTIVE_OPTIONS = [
    { value: 'true', label: 'Aktif' },
    { value: 'false', label: 'Tidak Aktif' },
] as const;

export const ATTENDANCE_PERMISSION_OPTIONS = [
    { value: 'sick', label: 'Sakit' },
    { value: 'leave', label: 'Izin' },
] as const;

export const ASSET_CONDITION_OPTIONS = [
    { value: 'GOOD', label: 'Baik' },
    { value: 'FAIR', label: 'Cukup' },
    { value: 'DAMAGED', label: 'Rusak Ringan' },
    { value: 'BROKEN', label: 'Rusak Berat' },
] as const;

export const ASSET_STATUS_OPTIONS = [
    { value: 'ACTIVE', label: 'Aktif' },
    { value: 'IN_USE', label: 'Digunakan' },
    { value: 'MAINTENANCE', label: 'Perawatan' },
    { value: 'RETIRED', label: 'Tidak Dipakai' },
    { value: 'LOST', label: 'Hilang' },
    { value: 'DISPOSED', label: 'Dilepas' },
] as const;

type Option = { value: string; label: string };

export function optionLabel(
    options: readonly Option[],
    value?: string | null,
    fallback = '-',
): string {
    if (!value) return fallback;
    return options.find((option) => option.value === value)?.label ?? value;
}

// Normalizes API list responses that may be a plain array or a paginated object.
export function extractList(payload: any): any[] {
    const data = payload?.data ?? payload;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

export function formatDate(value?: string | null): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

// Local calendar helpers — avoid the UTC off-by-one that `toISOString()` causes
// for timezones ahead of UTC (e.g. WIB +07), which made date filters exclude
// "today" data.
export function todayLocal(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate(),
    ).padStart(2, '0')}`;
}

export function monthStartLocal(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function formatTime(value?: string | null): string {
    if (!value) return '-';
    return String(value).slice(0, 5);
}

export function toDateInput(value?: string | null): string {
    if (!value) return '';
    return String(value).slice(0, 10);
}
