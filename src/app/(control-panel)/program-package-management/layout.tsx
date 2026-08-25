import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Paket Program',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
