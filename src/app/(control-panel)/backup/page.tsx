import type { Metadata } from 'next';
import { BackupView } from '@/modules/backup/backup-view';

export const metadata: Metadata = {
    title: 'Backup & Restore Sistem',
    description: 'Cadangkan dan pulihkan database serta berkas folder uploads.',
};

export default function BackupPage() {
    return <BackupView />;
}
