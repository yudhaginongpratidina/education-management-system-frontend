import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sesi Kelas',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
