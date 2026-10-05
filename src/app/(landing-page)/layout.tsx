import { Metadata } from 'next';
import { LandingContentProvider } from '@/modules/home/landing-content';

export const metadata: Metadata = {
    title: 'Home',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <LandingContentProvider>{children}</LandingContentProvider>;
}
