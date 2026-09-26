import { Icon } from '@iconify/react';

const courses = [
    {
        title: 'Matematika Dasar & Olimpiade',
        level: 'SD – SMP',
        price: 'Rp 350.000',
        duration: '90 menit/sesi',
        frequency: '2x per minggu',
        img: '/assets/img/course-1.jpg',
        topics: ['Bilangan & operasi', 'Aljabar dasar', 'Geometri', 'Soal cerita'],
    },
    {
        title: 'Bahasa Inggris Aktif',
        level: 'SMP – SMA',
        price: 'Rp 400.000',
        duration: '90 menit/sesi',
        frequency: '2x per minggu',
        img: '/assets/img/course-2.jpg',
        topics: ['Speaking & pronunciation', 'Grammar', 'Reading', 'TOEFL dasar'],
    },
    {
        title: 'IPA Terpadu & Sains',
        level: 'SD – SMP',
        price: 'Rp 375.000',
        duration: '90 menit/sesi',
        frequency: '2x per minggu',
        img: '/assets/img/course-3.jpg',
        topics: ['Fisika dasar', 'Biologi', 'Kimia dasar', 'Praktik sederhana'],
    },
    {
        title: 'Intensif UTBK',
        level: 'SMA Kelas 12 & Alumni',
        price: 'Rp 550.000',
        duration: '180 menit/sesi',
        frequency: '1x per minggu',
        img: '/assets/img/hero-bg.jpg',
        topics: ['Penalaran umum', 'TPS kuantitatif', 'Literasi', 'Try out berkala'],
    },
    {
        title: 'Bahasa Indonesia & Menulis',
        level: 'SD – SMA',
        price: 'Rp 330.000',
        duration: '90 menit/sesi',
        frequency: '2x per minggu',
        img: '/assets/img/course-details.jpg',
        topics: ['Membaca pemahaman', 'Menulis karangan', 'Tata bahasa', 'Karya ilmiah'],
    },
    {
        title: 'Calistung (Baca Tulis Hitung)',
        level: 'TK – SD awal',
        price: 'Rp 300.000',
        duration: '60 menit/sesi',
        frequency: '2x per minggu',
        img: '/assets/img/about-2.jpg',
        topics: ['Mengenal huruf', 'Menulis permulaan', 'Berhitung', 'Permainan edukatif'],
    },
];

export default function CoursesList() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Program Belajar
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Enam program untuk semua jenjang
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Setiap program punya target, durasi, dan fokus materi yang berbeda. Pilih
                        sesuai kebutuhan anak.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <div
                            key={course.title}
                            className="group hover:border-primary/30 flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={course.img}
                                    alt=""
                                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="bg-brand-gradient absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
                                    {course.level}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="font-heading mb-3 text-lg font-semibold">
                                    {course.title}
                                </h3>
                                <ul className="mb-5 grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted-foreground">
                                    {course.topics.map((topic) => (
                                        <li key={topic} className="flex items-start gap-1.5">
                                            <Icon
                                                icon="mdi:check-circle-outline"
                                                className="text-primary mt-0.5 shrink-0"
                                            />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                                    <div className="text-xs text-muted-foreground">
                                        <p>{course.duration}</p>
                                        <p>{course.frequency}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">mulai</p>
                                        <p className="text-primary font-heading font-bold">
                                            {course.price}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Harga sudah termasuk modul belajar. Biaya pendaftaran Rp 50.000 (sekali bayar).
                </p>
            </div>
        </section>
    );
}
