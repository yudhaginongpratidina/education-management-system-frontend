import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import TrainersList from '@/modules/home/trainers-list';
import Testimonials from '@/modules/home/testimonials';
import { Icon } from '@iconify/react';

const standards = [
    {
        icon: 'mdi:account-check-outline',
        title: 'Seleksi ketat',
        desc: 'Setiap calon tutor melewati tes materi dan simulasi mengajar sebelum bergabung.',
    },
    {
        icon: 'mdi:school-outline',
        title: 'Latar pendidikan sesuai',
        desc: 'Minimal S1 di bidang yang diampu, dengan pengalaman mengajar terverifikasi.',
    },
    {
        icon: 'mdi:account-group-outline',
        title: 'Pelatihan rutin',
        desc: 'Tutor mengikuti pelatihan internal setiap semester untuk menyegarkan metode ajar.',
    },
    {
        icon: 'mdi:clipboard-check-outline',
        title: 'Dievaluasi berkala',
        desc: 'Penilaian dari siswa dan orang tua dipakai untuk perbaikan kualitas pengajaran.',
    },
];

export default function TrainersPage() {
    return (
        <main>
            <Header />

            <div className="gradient-mesh border-b border-border/60 py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="font-heading text-4xl font-bold tracking-tight">
                        Pengajar Kami
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Kenali tim pengajar berpengalaman yang siap membantu Anda mencapai tujuan
                        belajar.
                    </p>
                </div>
            </div>

            <TrainersList />

            <section className="bg-background py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                            Standar Pengajar
                        </span>
                        <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                            Cara kami memilih tutor
                        </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {standards.map((item) => (
                            <div
                                key={item.title}
                                className="hover:border-primary/30 rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-colors"
                            >
                                <div className="bg-brand-gradient-soft text-primary mb-5 flex size-12 items-center justify-center rounded-2xl">
                                    <Icon icon={item.icon} className="text-2xl" />
                                </div>
                                <h3 className="font-heading mb-2 font-semibold">{item.title}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Testimonials />

            <Footer />
        </main>
    );
}
