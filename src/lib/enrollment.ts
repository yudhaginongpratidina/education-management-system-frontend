// Mirrors the backend enrollment rules so the form can preview the package-driven period.

export type SessionPeriod = 'WEEK' | 'MONTH' | 'DURATION';

export function addMonths(date: string, months: number): string {
    const [year, month, day] = date.split('-').map(Number);
    const base = new Date(Date.UTC(year, month - 1, day));
    const targetIndex = base.getUTCMonth() + Math.max(0, months);
    const targetYear = base.getUTCFullYear() + Math.floor(targetIndex / 12);
    const targetMonth = ((targetIndex % 12) + 12) % 12;
    const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
    return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay)))
        .toISOString()
        .slice(0, 10);
}

export function computeEndedAt(startedAt: string, totalMonths: number): string {
    const end = new Date(`${addMonths(startedAt, totalMonths)}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() - 1);
    return end.toISOString().slice(0, 10);
}

export function computeTotalSessions(
    durationMonths: number,
    sessionsPerPeriod: number,
    sessionPeriod: SessionPeriod | null | undefined,
): number {
    const months = Math.max(0, Number(durationMonths) || 0);
    const perPeriod = Math.max(0, Number(sessionsPerPeriod) || 0);
    if (months <= 0 || perPeriod <= 0) return 0;

    switch (sessionPeriod) {
        case 'MONTH':
            return months * perPeriod;
        case 'DURATION':
            return perPeriod;
        case 'WEEK':
        default: {
            const weeks = Math.max(1, Math.round((months * 30.4375) / 7));
            return weeks * perPeriod;
        }
    }
}

export function intensityLabel(
    sessionsPerPeriod?: number | null,
    sessionPeriod?: SessionPeriod | null,
): string {
    if (!sessionsPerPeriod) return '-';
    switch (sessionPeriod) {
        case 'MONTH':
            return `${sessionsPerPeriod}x per bulan`;
        case 'DURATION':
            return `${sessionsPerPeriod} sesi total`;
        case 'WEEK':
        default:
            return `${sessionsPerPeriod}x per minggu`;
    }
}

export function sessionPeriodLabel(sessionPeriod?: SessionPeriod | null): string {
    switch (sessionPeriod) {
        case 'WEEK':
            return 'Mingguan';
        case 'MONTH':
            return 'Bulanan';
        case 'DURATION':
            return 'Total durasi';
        default:
            return '-';
    }
}
