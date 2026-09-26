'use client';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const faqs = [
    {
        question: 'Apakah ada kelas percobaan gratis?',
        answer: 'Ada. Setiap calon siswa mendapat satu sesi percobaan gratis setelah mengikuti tes diagnostik. Tidak ada kewajiban melanjutkan jika dirasa belum cocok.',
    },
    {
        question: 'Bagaimana cara memantau perkembangan anak?',
        answer: 'Laporan progres dikirim setiap empat sesi melalui WhatsApp, berisi catatan tutor, hasil kuis, dan rekomendasi belajar di rumah. Orang tua juga bisa menjadwalkan konsultasi langsung dengan tutor.',
    },
    {
        question: 'Berapa jumlah siswa dalam satu kelas?',
        answer: 'Kelas reguler maksimal 8 siswa, kelas intensif maksimal 6 siswa, dan kelas privat 1 siswa dengan 1 tutor. Kami sengaja membatasi jumlah agar setiap anak tetap terpantau.',
    },
    {
        question: 'Kalau berhalangan, apakah jadwal bisa diganti?',
        answer: 'Bisa. Beri tahu admin minimal satu hari sebelumnya, lalu sesi dapat dipindahkan ke kelas lain yang setara selama kuota masih tersedia.',
    },
    {
        question: 'Apakah tersedia kelas online?',
        answer: 'Tersedia, terutama untuk program privat. Beberapa kelas reguler juga membuka opsi online bila siswa berhalangan hadir ke cabang.',
    },
    {
        question: 'Bagaimana sistem pembayarannya?',
        answer: 'Pembayaran dilakukan bulanan di awal periode melalui transfer atau tunai di cabang. Jika ingin berhenti, cukup konfirmasi sebelum periode berikutnya dimulai tanpa biaya tambahan.',
    },
    {
        question: 'Apakah ada biaya pendaftaran?',
        answer: 'Ada, sebesar Rp 50.000 sekali bayar. Biaya ini sudah termasuk modul belajar pertama dan kartu progres siswa.',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto max-w-3xl px-4">
                <div className="mb-12 text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        FAQ
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Pertanyaan yang sering diajukan
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Belum menemukan jawabannya? Hubungi kami, biasanya kami balas dalam satu
                        hari kerja.
                    </p>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, index) => {
                        const open = openIndex === index;
                        return (
                            <div
                                key={faq.question}
                                className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
                            >
                                <button
                                    className="hover:bg-accent/50 font-heading flex w-full items-center justify-between gap-4 p-5 text-left font-semibold transition-colors"
                                    onClick={() => setOpenIndex(open ? null : index)}
                                >
                                    {faq.question}
                                    <span className="bg-brand-gradient-soft text-primary flex size-7 shrink-0 items-center justify-center rounded-full">
                                        {open ? (
                                            <Minus className="size-4" />
                                        ) : (
                                            <Plus className="size-4" />
                                        )}
                                    </span>
                                </button>
                                {open && (
                                    <div className="animate-fade-in px-5 pb-5 leading-relaxed text-muted-foreground">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
