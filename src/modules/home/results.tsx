import { Icon } from '@iconify/react';

const stats = [
    { value: '87%', label: 'siswa naik ≥ 1,5 poin', note: 'dalam 3 bulan' },
    { value: '120+', label: 'alumni lolos sekolah / PTN favorit', note: 'tahun 2025' },
    { value: '96%', label: 'rata-rata kehadiran siswa', note: 'semester ganjil' },
    { value: '4,9', label: 'dari 5 kepuasan orang tua', note: '1.240 ulasan' },
];

const subjects = [
    { name: 'Matematika', value: 18 },
    { name: 'IPA / Sains', value: 15 },
    { name: 'Bahasa Inggris', value: 14 },
    { name: 'Bahasa Indonesia', value: 11 },
];

export default function Results() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                        <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                            Hasil Belajar
                        </span>
                        <h2 className="font-heading mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                            Progres yang bisa diukur, bukan sekadar janji
                        </h2>
                        <p className="mb-8 leading-relaxed text-muted-foreground">
                            Setiap siswa punya catatan nilai awal dan evaluasi berkala. Angka di
                            bawah ini berasal dari rekap internal evaluasi semester ganjil
                            2025/2026.
                        </p>

                        <div className="grid grid-cols-2 gap-5">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-2xl border border-border/60 bg-card p-5 shadow-card"
                                >
                                    <p className="font-heading text-primary text-3xl font-bold">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-sm font-medium">{stat.label}</p>
                                    <p className="text-xs text-muted-foreground">{stat.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-card md:p-8">
                        <h3 className="font-heading mb-1 text-lg font-semibold">
                            Rata-rata kenaikan nilai
                        </h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Selisih nilai evaluasi awal dan evaluasi ke-3.
                        </p>
                        <div className="space-y-5">
                            {subjects.map((subject) => (
                                <div key={subject.name}>
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span className="font-medium">{subject.name}</span>
                                        <span className="text-primary font-semibold">
                                            +{subject.value}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="bg-brand-gradient h-full rounded-full"
                                            style={{ width: `${subject.value * 4}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-brand-gradient-soft mt-6 flex items-start gap-3 rounded-2xl p-4">
                            <Icon
                                icon="mdi:lightbulb-on-outline"
                                className="text-primary mt-0.5 text-xl"
                            />
                            <p className="text-sm text-muted-foreground">
                                Siswa yang mengikuti minimal 80% sesi menunjukkan kenaikan paling
                                konsisten. Karena itu kehadiran menjadi salah satu hal yang kami
                                pantau.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
