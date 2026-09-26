import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';

const articles = [
    {
        category: 'Tips Belajar',
        title: '5 kebiasaan kecil yang membuat belajar di rumah lebih efektif',
        excerpt:
            'Mulai dari menyiapkan meja belajar sampai teknik jeda 25 menit. Kebiasaan sederhana ini lebih berpengaruh daripada belajar semalaman.',
        date: '12 Feb 2026',
        read: '6 menit',
        img: '/assets/img/course-1.jpg',
    },
    {
        category: 'Untuk Orang Tua',
        title: 'Mendampingi anak belajar tanpa membuatnya merasa ditekan',
        excerpt:
            'Peran orang tua bukan sekadar menagih nilai. Berikut cara memberi dukungan yang membuat anak lebih percaya diri.',
        date: '28 Jan 2026',
        read: '5 menit',
        img: '/assets/img/about.jpg',
    },
    {
        category: 'UTBK & Ujian',
        title: 'Strategi mengerjakan soal UTBK agar tidak kehabisan waktu',
        excerpt:
            'Urutan pengerjaan, cara menandai soal sulit, dan manajemen menit per subtes yang sering dipakai alumni kami.',
        date: '9 Jan 2026',
        read: '7 menit',
        img: '/assets/img/course-3.jpg',
    },
];

export default function BlogTips() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
                    <div className="max-w-xl">
                        <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                            Bacaan
                        </span>
                        <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                            Tips belajar & kabar terbaru
                        </h2>
                    </div>
                    <Link
                        href="/about"
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                    >
                        Lihat semua artikel
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {articles.map((article) => (
                        <article
                            key={article.title}
                            className="group hover:border-primary/30 flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={article.img}
                                    alt=""
                                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="bg-brand-gradient absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground">
                                    {article.category}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="font-heading mb-2 text-lg leading-snug font-semibold">
                                    {article.title}
                                </h3>
                                <p className="mb-5 flex-1 text-sm leading-relaxed text-muted-foreground">
                                    {article.excerpt}
                                </p>
                                <div className="flex items-center gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <CalendarDays className="size-3.5" />
                                        {article.date}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="size-3.5" />
                                        {article.read}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
