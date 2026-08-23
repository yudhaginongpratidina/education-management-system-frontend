import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Role Menu',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
