'use client';
import { Icon } from '@iconify/react';
const actions = [
    {
        icon: 'boxicons:pencil-square',
        title: 'Edit Data',
        description:
            'Ubah informasi guru seperti nama, alamat, nomor telepon, pendidikan, dan foto.',
        className: 'text-primary bg-primary/10',
    },
    {
        icon: 'akar-icons:calendar',
        title: 'Ketersediaan Guru',
        description: 'Atur hari dan waktu ketika guru tersedia untuk mengajar.',
        className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
    },
    {
        icon: 'healthicons:i-training-class-24px',
        title: 'Program yang Diampu',
        description: 'Kelola program belajar yang dapat diampu oleh guru ini.',
        className: 'text-info bg-info/10',
    },
    {
        icon: 'mdi:map-marker',
        title: 'Penempatan',
        description: 'Kelola lokasi tempat guru ini bekerja.',
        className: 'text-warning bg-warning/15',
    },
    {
        icon: 'at-icons:trash-can',
        title: 'Hapus Guru',
        description: 'Hapus data guru ini secara permanen dari sistem.',
        className: 'text-destructive bg-destructive/10',
        destructive: true,
    },
];
export default function TeacherInfo() {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {' '}
                {actions.map((action) => (
                    <button
                        key={action.title}
                        type="button"
                        className={[
                            'group flex w-full items-start gap-4 rounded-sm border border-gray-200',
                            'bg-white p-4 text-left transition-all duration-200',
                            'hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm',
                            'focus:outline-none focus:ring-2 focus:ring-gray-900/10',
                            action.destructive ? 'hover:border-red-200 hover:bg-red-50/30' : '',
                        ].join(' ')}
                    >
                        {' '}
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm ${action.className}`}
                        >
                            {' '}
                            <Icon icon={action.icon} className="text-xl" />{' '}
                        </div>{' '}
                        <div className="min-w-0 flex-1">
                            {' '}
                            <div className="flex items-center justify-between gap-3">
                                {' '}
                                <h3
                                    className={`text-sm font-semibold ${action.destructive ? 'text-red-600' : 'text-gray-900'}`}
                                >
                                    {' '}
                                    {action.title}{' '}
                                </h3>{' '}
                            </div>{' '}
                            <p className="mt-1.5 text-xs leading-5 text-gray-500">
                                {' '}
                                {action.description}{' '}
                            </p>{' '}
                        </div>{' '}
                    </button>
                ))}{' '}
            </div>{' '}
        </div>
    );
}
