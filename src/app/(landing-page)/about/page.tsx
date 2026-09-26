import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import Testimonials from '@/modules/home/testimonials';
import FAQ from '@/modules/home/faq';
import Counts from '@/modules/home/counts';
import LearningMethod from '@/modules/home/learning-method';
import Facilities from '@/modules/home/facilities';
import { Icon } from '@iconify/react';

const values = [
    'Kurikulum selaras dengan materi sekolah',
    'Pengajar berpengalaman dan bersertifikat',
    'Laporan progres untuk orang tua',
];

export default function AboutPage() {
    return (
        <main>
            <Header />

            {/* Page Title */}
            <div className="bg-brand-gradient relative overflow-hidden py-24 text-primary-foreground">
                <div className="grid-pattern absolute inset-0 opacity-15" />
                <div className="container relative mx-auto px-4 text-center">
                    <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
                        Tentang Misi Kami
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/85">
                        Membantu setiap siswa menemukan cara belajar terbaiknya melalui bimbingan
                        yang personal, terstruktur, dan menyenangkan.
                    </p>
                </div>
            </div>

            <section className="bg-background py-20">
                <div className="container mx-auto px-4">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        <div className="relative">
                            <img
                                src="/assets/img/about-2.jpg"
                                alt="Tentang kami"
                                className="w-full rounded-3xl shadow-soft"
                            />
                            <div className="bg-brand-gradient text-primary-foreground absolute -right-6 -bottom-6 hidden rounded-2xl p-7 shadow-brand md:block">
                                <p className="font-heading text-4xl font-bold">10+</p>
                                <p className="text-sm text-primary-foreground/85">
                                    Tahun pengalaman
                                </p>
                            </div>
                        </div>
                        <div>
                            <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                                Cerita Kami
                            </span>
                            <h2 className="font-heading mb-5 text-3xl font-bold tracking-tight md:text-4xl">
                                Menumbuhkan semangat belajar sejak dini
                            </h2>
                            <p className="mb-8 leading-relaxed text-muted-foreground">
                                Berawal dari sebuah kelas kecil, kini Bimbel Cerdas telah dipercaya
                                ribuan keluarga. Kami terus berkomitmen menghadirkan pengalaman
                                belajar yang bermakna dan berdampak nyata bagi prestasi siswa.
                            </p>
                            <ul className="space-y-4">
                                {values.map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <span className="bg-success/12 text-success flex size-6 items-center justify-center rounded-full">
                                            <Icon icon="mdi:check-bold" className="text-xs" />
                                        </span>
                                        <span className="font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Counts />
            <LearningMethod />
            <Facilities />
            <Testimonials />
            <FAQ />

            <Footer />
        </main>
    );
}
