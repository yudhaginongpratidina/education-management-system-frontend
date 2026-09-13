import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Laporan Absensi',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
