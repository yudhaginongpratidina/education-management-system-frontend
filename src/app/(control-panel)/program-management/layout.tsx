import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Program',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
