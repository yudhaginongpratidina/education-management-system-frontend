import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Manajemen Siswa',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
