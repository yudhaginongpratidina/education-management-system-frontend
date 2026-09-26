import { Icon } from '@iconify/react';
import Link from 'next/link';

const trainers = [
    {
        name: 'Rina Kartika',
        role: 'Matematika',
        img: 'trainer-1.jpg',
        bio: 'Alumni pendidikan matematika dengan pengalaman 8 tahun mengajar.',
    },
    {
        name: 'Andi Pratama',
        role: 'Bahasa Inggris',
        img: 'trainer-2.jpg',
        bio: 'Praktisi bahasa dengan metode belajar aktif dan menyenangkan.',
    },
    {
        name: 'Dita Larasati',
        role: 'IPA & Sains',
        img: 'trainer-3.jpg',
        bio: 'Pengajar sains yang suka mengajak siswa bereksperimen langsung.',
    },
];

export default function TrainersList() {
    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Tim Pengajar
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Belajar bersama pengajar terbaik
                    </h2>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {trainers.map((trainer) => (
                        <div
                            key={trainer.name}
                            className="group hover:border-primary/30 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={`/assets/img/trainers/${trainer.img}`}
                                    alt={trainer.name}
                                    className="h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="bg-brand-gradient absolute inset-0 flex items-center justify-center gap-4 opacity-0 transition-opacity duration-300 group-hover:opacity-90">
                                    {['mdi:twitter', 'mdi:facebook', 'mdi:instagram'].map(
                                        (icon) => (
                                            <Link
                                                key={icon}
                                                href="#"
                                                className="text-primary-foreground hover:text-primary-foreground/70 text-2xl"
                                            >
                                                <Icon icon={icon} />
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="font-heading mb-1 text-xl font-semibold">
                                    {trainer.name}
                                </h3>
                                <p className="text-primary mb-3 font-medium">{trainer.role}</p>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {trainer.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
