import { Icon } from '@iconify/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const items = [
    {
        icon: 'mdi:clipboard-text-outline',
        title: 'Materi Terstruktur',
        desc: 'Rangkaian materi disusun runtut mulai dari dasar hingga mahir.',
    },
    {
        icon: 'mdi:gem',
        title: 'Pengajar Berkualitas',
        desc: 'Tutor diseleksi ketat dan berpengalaman mengajar di bidangnya.',
    },
    {
        icon: 'mdi:inbox-multiple-outline',
        title: 'Evaluasi Rutin',
        desc: 'Kuis dan try out berkala untuk mengukur kesiapan siswa.',
    },
];

export default function WhyUs() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="bg-brand-gradient flex flex-col justify-between rounded-3xl p-8 text-primary-foreground shadow-brand">
                        <div>
                            <h3 className="font-heading mb-4 text-2xl font-bold">
                                Kenapa memilih Bimbel Cerdas?
                            </h3>
                            <p className="text-primary-foreground/85">
                                Kami menghadirkan pengalaman belajar yang personal, terukur, dan
                                menyenangkan untuk hasil yang nyata.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="mt-6 w-fit bg-white/15 text-primary-foreground hover:bg-white/25"
                            nativeButton={false}
                            render={<Link href="/about" />}
                        >
                            Selengkapnya
                        </Button>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3 lg:col-span-2">
                        {items.map((item) => (
                            <div
                                key={item.title}
                                className="hover:border-primary/30 rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                            >
                                <div className="bg-brand-gradient-soft text-primary mb-4 flex size-12 items-center justify-center rounded-2xl">
                                    <Icon icon={item.icon} className="text-2xl" />
                                </div>
                                <h4 className="font-heading mb-2 font-semibold">{item.title}</h4>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
