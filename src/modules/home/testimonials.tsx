import { Icon } from '@iconify/react';

const testimonials = [
    {
        name: 'Ibu Sari',
        role: 'Orang tua siswa SMP',
        img: 'testimonials-1.jpg',
        result: 'Matematika 68 → 84',
        text: 'Awalnya saya ragu karena anak saya sudah les di tempat lain tapi tidak ada perkembangan. Setelah tiga bulan di sini, nilai matematikanya naik dan dia jadi mau mengerjakan soal sendiri.',
    },
    {
        name: 'Bima',
        role: 'Siswa SMA kelas 12',
        img: 'testimonials-2.jpg',
        result: 'Try out UTBK 512 → 578',
        text: 'Dulu saya selalu kehabisan waktu di bagian kuantitatif. Tutor mengajari urutan pengerjaan dan cara menandai soal sulit, jadi saat try out terakhir waktu saya cukup.',
    },
    {
        name: 'Ibu Dewi',
        role: 'Orang tua siswa SD',
        img: 'testimonials-3.jpg',
        result: 'Naik peringkat 12 → 5',
        text: 'Anak saya tadinya takut pelajaran hitung-hitungan. Sekarang malah minta ditemani belajar karena katanya soalnya jadi mudah dimengerti.',
    },
    {
        name: 'Pak Hendra',
        role: 'Orang tua siswa SMP',
        img: 'testimonials-4.jpg',
        result: 'Kehadiran 100%',
        text: 'Yang paling membantu adalah laporan tiap empat sesi. Kami jadi tahu bagian mana yang masih lemah, bukan cuma menerima nilai akhir.',
    },
    {
        name: 'Nadia',
        role: 'Siswa SMP kelas 9',
        img: 'testimonials-5.jpg',
        result: 'Nilai IPA 70 → 88',
        text: 'Tutornya sabar dan mau menjelaskan ulang kalau saya belum paham. Suasana kelasnya juga santai jadi saya tidak malu bertanya.',
    },
    {
        name: 'Ibu Ratna',
        role: 'Orang tua alumni',
        img: 'testimonials-1.jpg',
        result: 'Diterima di SMAN favorit',
        text: 'Anak saya diterima lewat jalur prestasi. Terima kasih untuk bimbingan selama persiapan ujian, terutama latihan soal dan pembahasannya.',
    },
];

export default function Testimonials() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Testimoni
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Cerita dari siswa dan orang tua
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Beberapa catatan yang kami terima, ditulis apa adanya tanpa diedit.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((t) => (
                        <figure
                            key={`${t.name}-${t.result}`}
                            className="hover:border-primary/30 flex flex-col rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-warning flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Icon key={i} icon="mdi:star" />
                                    ))}
                                </div>
                                <span className="bg-success/12 text-success rounded-full px-2.5 py-1 text-xs font-medium">
                                    {t.result}
                                </span>
                            </div>
                            <blockquote className="flex-1 leading-relaxed text-muted-foreground">
                                &ldquo;{t.text}&rdquo;
                            </blockquote>
                            <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                                <img
                                    src={`/assets/img/testimonials/${t.img}`}
                                    alt={t.name}
                                    className="size-11 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-heading font-semibold">{t.name}</p>
                                    <p className="text-sm text-muted-foreground">{t.role}</p>
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
