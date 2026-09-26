'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const slides = [
    {
        title: 'Belajar hari ini, berprestasi esok hari',
        desc: 'Bimbingan belajar berkualitas untuk jenjang SD, SMP, dan SMA dengan pengajar berpengalaman.',
        img: '/assets/img/hero-bg.jpg',
    },
    {
        title: 'Kelas kecil, perhatian lebih',
        desc: 'Setiap siswa mendapat pendampingan personal agar konsep benar-benar dipahami, bukan sekadar dihafal.',
        img: '/assets/img/about.jpg',
    },
    {
        title: 'Raih nilai terbaikmu bersama kami',
        desc: 'Program terstruktur, evaluasi rutin, dan laporan progres untuk orang tua.',
        img: '/assets/img/course-1.jpg',
    },
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const slide = slides[current];

    return (
        <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-slate-950 text-white">
            {slides.map((s, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={s.img} alt="" className="h-full w-full object-cover opacity-25" />
                </div>
            ))}
            <div className="from-slate-950 via-slate-950/80 absolute inset-0 bg-gradient-to-r to-transparent" />
            <div className="from-primary/30 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

            <div className="container relative z-10 mx-auto grid items-center gap-12 px-4 py-20 lg:grid-cols-2">
                <div key={current} className="animate-fade-up max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                        <Sparkles className="size-4" />
                        Bimbel modern untuk generasi cerdas
                    </span>
                    <h1 className="mt-6 font-heading text-4xl leading-[1.1] font-extrabold tracking-tight md:text-6xl">
                        {slide.title}
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                        {slide.desc}
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Button size="lg" nativeButton={false} render={<Link href="/course" />}>
                            Lihat Program
                            <ArrowRight className="size-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-foreground"
                            nativeButton={false}
                            render={<Link href="/contact" />}
                        >
                            <PlayCircle className="size-4" />
                            Konsultasi Gratis
                        </Button>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-8">
                        {[
                            { value: '1.200+', label: 'Siswa aktif' },
                            { value: '64', label: 'Program belajar' },
                            { value: '24', label: 'Pengajar ahli' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="font-heading text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative hidden lg:block">
                    <div className="animate-float relative mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-gradient">
                                <Sparkles className="size-5" />
                            </span>
                            <div>
                                <p className="font-heading font-semibold">Progres belajar</p>
                                <p className="text-sm text-slate-300">Minggu ini</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            {[
                                { label: 'Matematika', value: 92 },
                                { label: 'Bahasa Inggris', value: 85 },
                                { label: 'IPA', value: 78 },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="mb-1.5 flex items-center justify-between text-sm">
                                        <span>{item.label}</span>
                                        <span className="text-slate-300">{item.value}%</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/15">
                                        <div
                                            className="bg-brand-gradient h-full rounded-full"
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                            i === current ? 'bg-brand-gradient w-8' : 'w-2.5 bg-white/40'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
