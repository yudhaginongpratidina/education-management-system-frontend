import { Icon } from '@iconify/react';

const steps = [
    {
        no: '01',
        icon: 'mdi:clipboard-pulse-outline',
        title: 'Tes diagnostik',
        duration: '45 menit',
        desc: 'Siswa mengerjakan tes singkat untuk memetakan kemampuan awal dan bagian materi yang perlu diperkuat.',
    },
    {
        no: '02',
        icon: 'mdi:map-outline',
        title: 'Rencana belajar personal',
        duration: '1–2 hari',
        desc: 'Tutor menyusun target dan urutan materi sesuai hasil tes, lalu mendiskusikannya dengan orang tua.',
    },
    {
        no: '03',
        icon: 'mdi:account-group-outline',
        title: 'Kelas kecil & aktif',
        duration: '2–3 sesi/minggu',
        desc: 'Maksimal 8 siswa per kelas. Sekitar 70% waktu dipakai untuk latihan soal dan pembahasan langsung.',
    },
    {
        no: '04',
        icon: 'mdi:chart-timeline-variant',
        title: 'Evaluasi & laporan',
        duration: 'Tiap 4 sesi',
        desc: 'Kuis mingguan dan laporan progres dikirim ke orang tua agar perkembangan belajar terpantau jelas.',
    },
];

export default function LearningMethod() {
    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Cara Kami Mengajar
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Empat langkah yang terukur
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Bukan sekadar masuk kelas lalu pulang. Ada proses yang jelas dari awal
                        sampai laporan belajar.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step) => (
                        <div
                            key={step.no}
                            className="relative rounded-2xl border border-border/60 bg-card p-6 shadow-card"
                        >
                            <span className="font-heading absolute top-5 right-5 text-3xl font-bold text-muted-foreground/25">
                                {step.no}
                            </span>
                            <div className="bg-brand-gradient-soft text-primary mb-5 flex size-12 items-center justify-center rounded-2xl">
                                <Icon icon={step.icon} className="text-2xl" />
                            </div>
                            <h3 className="font-heading mb-1 text-lg font-semibold">
                                {step.title}
                            </h3>
                            <p className="text-primary mb-3 text-xs font-semibold tracking-wide uppercase">
                                {step.duration}
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
