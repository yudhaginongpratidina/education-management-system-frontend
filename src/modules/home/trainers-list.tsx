'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { extractList } from '@/lib/ems-constants';
import TeacherPhoto from '@/components/teacher-photo';
import { toast } from '@/components/ui/toast';

type Trainer = {
    id: number;
    name: string;
    photo?: string | null;
    role: string;
    bio: string;
};

export default function TrainersList() {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadTrainers = async () => {
            try {
                const [teachersRes, programsRes] = await Promise.all([
                    http.get('/teachers'),
                    http.get('/teacher-programs'),
                ]);

                // Group the programs (subjects) each teacher handles.
                const programMap = new Map<number, string[]>();
                for (const row of extractList(programsRes.data)) {
                    const list = programMap.get(row.teacher_id) ?? [];
                    if (row.program_name && !list.includes(row.program_name)) {
                        list.push(row.program_name);
                    }
                    programMap.set(row.teacher_id, list);
                }

                const list: Trainer[] = extractList(teachersRes.data)
                    .filter((teacher: any) => Boolean(teacher.still_actively_working))
                    .map((teacher: any) => {
                        const programs = programMap.get(teacher.id) ?? [];
                        return {
                            id: teacher.id,
                            name: teacher.full_name,
                            photo: teacher.photo,
                            role: programs.length > 0 ? programs.join(' · ') : teacher.position,
                            bio: teacher.last_education
                                ? `Pendidikan terakhir: ${teacher.last_education}.`
                                : 'Pengajar berpengalaman di Bimbel Cerdas.',
                        };
                    });

                if (mounted) setTrainers(list);
            } catch (error) {
                const { message } = parseAxiosError(error);
                if (mounted) {
                    toast.add({ title: 'Error', type: 'error', description: message });
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadTrainers();
        return () => {
            mounted = false;
        };
    }, []);

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

                {!loading && trainers.length === 0 && (
                    <p className="text-center text-muted-foreground">
                        Data pengajar belum tersedia.
                    </p>
                )}

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {trainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            className="group hover:border-primary/30 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                        >
                            <div className="relative overflow-hidden">
                                <TeacherPhoto
                                    slug={trainer.photo}
                                    alt={trainer.name}
                                    className="h-80 w-full rounded-none"
                                    iconClassName="size-12"
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
