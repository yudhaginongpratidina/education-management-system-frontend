import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Landing Page CMS',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
