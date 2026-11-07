import type { Metadata } from 'next';
import { ThemeSettingsView } from '@/modules/theme-settings/theme-settings-view';

export const metadata: Metadata = {
    title: 'Kustomisasi Tema & Tampilan',
    description: 'Atur warna, kelengkungan sudut (radius), dan gaya antarmuka aplikasi secara fleksibel.',
};

export default function ThemeSettingsPage() {
    return <ThemeSettingsView />;
}
