import { Icon } from '@iconify/react';

const milestones = [
    { year: '2013', text: 'Dibuka di Jakarta dengan satu ruang kelas dan 12 siswa pertama.' },
    {
        year: '2017',
        text: 'Cabang Bandung dibuka, modul belajar mulai disusun sendiri sesuai kurikulum sekolah.',
    },
    { year: '2021', text: 'Mengembangkan kelas online agar siswa tetap belajar saat pandemi.' },
    {
        year: '2025',
        text: 'Tumbuh menjadi 4 cabang, 24 pengajar, dan lebih dari 1.200 siswa aktif.',
    },
];

const points = [
    'Kurikulum selaras dengan materi sekolah',
    'Setiap tutor menangani maksimal 3 kelas agar fokus',
    'Laporan progres terbuka untuk orang tua',
];

export default function About() {
    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="relative">
                        <img
                            src="/assets/img/about.jpg"
                            alt="Suasana belajar"
                            className="w-full rounded-3xl object-cover shadow-soft"
                        />
                        <div className="bg-brand-gradient absolute -right-4 -bottom-6 hidden rounded-2xl p-6 text-primary-foreground shadow-brand md:block">
                            <p className="font-heading text-3xl font-bold">12</p>
                            <p className="text-sm text-primary-foreground/85">
                                tahun menemani belajar
                            </p>
                        </div>
                    </div>
                    <div>
                        <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                            Tentang Kami
                        </span>
                        <h3 className="font-heading mb-5 text-3xl font-bold tracking-tight md:text-4xl">
                            Berawal dari satu ruang kelas pada 2013
                        </h3>
                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            Saat itu hanya ada satu ruang kelas, satu papan tulis, dan dua belas
                            anak yang datang sepulang sekolah. Yang kami pegang sejak awal
                            sederhana: pahami dulu di mana anak kesulitan, baru ajar. Prinsip itu
                            yang membuat kami bertahan sampai sekarang.
                        </p>
                        <ul className="space-y-4">
                            {points.map((item) => (
                                <li key={item} className="flex items-start gap-3">
                                    <span className="bg-success/12 text-success mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                                        <Icon icon="mdi:check-bold" className="text-xs" />
                                    </span>
                                    <span className="font-medium">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <ol className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {milestones.map((milestone) => (
                        <li
                            key={milestone.year}
                            className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
                        >
                            <p className="font-heading text-primary text-2xl font-bold">
                                {milestone.year}
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                {milestone.text}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
