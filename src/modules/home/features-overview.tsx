import { Icon } from '@iconify/react';

const features = [
    {
        icon: 'mdi:teacher',
        title: 'Pengajar Berpengalaman',
        desc: 'Dibimbing tutor pilihan yang sabar dan menguasai materi.',
    },
    {
        icon: 'mdi:account-group',
        title: 'Kelas Kecil',
        desc: 'Maksimal 8 siswa per kelas agar lebih fokus dan terarah.',
    },
    {
        icon: 'mdi:clock-outline',
        title: 'Jadwal Fleksibel',
        desc: 'Pilih jadwal sesuai kesibukan sekolah dan kegiatanmu.',
    },
    {
        icon: 'mdi:chart-line',
        title: 'Laporan Progres',
        desc: 'Pantau perkembangan belajar melalui laporan berkala.',
    },
];

export default function FeaturesOverview() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group hover:border-primary/30 rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="bg-brand-gradient-soft text-primary mb-5 flex size-12 items-center justify-center rounded-2xl">
                                <Icon icon={feature.icon} className="text-2xl" />
                            </div>
                            <h3 className="font-heading mb-2 text-lg font-semibold">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
