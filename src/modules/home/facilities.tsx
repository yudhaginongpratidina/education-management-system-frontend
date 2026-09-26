import { Icon } from '@iconify/react';

const facilities = [
    {
        icon: 'mdi:air-conditioner',
        title: 'Ruang kelas ber-AC',
        desc: 'Kapasitas 8–10 kursi, pencahayaan cukup, dan sirkulasi udara yang nyaman.',
    },
    {
        icon: 'mdi:book-open-page-variant-outline',
        title: 'Modul cetak & e-modul',
        desc: 'Ringkasan materi dan latihan soal, bisa diakses lewat ponsel setelah sesi selesai.',
    },
    {
        icon: 'mdi:cctv',
        title: 'CCTV & ruang tunggu',
        desc: 'Orang tua bisa menunggu di ruang tunggu yang nyaman sambil memantau aktivitas kelas.',
    },
    {
        icon: 'mdi:library-shelves',
        title: 'Perpustakaan mini',
        desc: 'Kumpulan buku latihan, ensiklopedia, dan komik edukasi untuk mengisi waktu sebelum kelas.',
    },
    {
        icon: 'mdi:wifi',
        title: 'Wi-Fi & ruang diskusi',
        desc: 'Area belajar kelompok untuk mengerjakan tugas proyek atau diskusi soal bersama tutor.',
    },
    {
        icon: 'mdi:food-apple-outline',
        title: 'Kantin sehat',
        desc: 'Menyediakan air minum dan makanan ringan dengan harga terjangkau bagi siswa.',
    },
];

export default function Facilities() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Fasilitas
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Belajar nyaman, orang tua tenang
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Kami memperhatikan hal-hal kecil yang membuat siswa betah dan fokus selama
                        sesi belajar.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {facilities.map((item) => (
                        <div
                            key={item.title}
                            className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-colors hover:border-primary/30"
                        >
                            <div className="bg-brand-gradient-soft text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl">
                                <Icon icon={item.icon} className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-heading mb-1 font-semibold">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
