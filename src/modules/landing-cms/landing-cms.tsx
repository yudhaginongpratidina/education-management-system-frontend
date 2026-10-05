'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

import { cn } from '@/lib/utils';
import { http } from '@/lib/http';
import { parseAxiosError } from '@/lib/parse-axios-error';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { Card, CardContent } from '@/components/ui/card';

import { initialContent, type LandingContent } from './data';
import {
    AboutEditor,
    FacilitiesEditor,
    FeaturesEditor,
    HeroEditor,
    MethodEditor,
    ProgramsEditor,
    ScheduleEditor,
    TrustEditor,
} from './sections-content';
import {
    ArticlesEditor,
    BranchesEditor,
    EnrollmentEditor,
    FaqEditor,
    FooterEditor,
    PricingEditor,
    TestimonialsEditor,
} from './sections-engage';

const SECTION_KEYS: (keyof LandingContent)[] = [
    'hero',
    'trust',
    'features',
    'about',
    'programs',
    'method',
    'schedule',
    'facilities',
    'pricing',
    'testimonials',
    'branches',
    'faqs',
    'articles',
    'enrollment',
    'footer',
];

type SectionKey =
    | 'overview'
    | 'hero'
    | 'trust'
    | 'features'
    | 'about'
    | 'programs'
    | 'method'
    | 'schedule'
    | 'facilities'
    | 'pricing'
    | 'testimonials'
    | 'branches'
    | 'faq'
    | 'articles'
    | 'enrollment'
    | 'footer';

const nav: { key: SectionKey; label: string; icon: string; group: string }[] = [
    { key: 'overview', label: 'Ringkasan', icon: 'mdi:view-dashboard-outline', group: 'Umum' },
    { key: 'hero', label: 'Hero / Banner', icon: 'mdi:image-outline', group: 'Umum' },
    { key: 'trust', label: 'Bar Kepercayaan', icon: 'mdi:shield-check-outline', group: 'Umum' },
    { key: 'features', label: 'Keunggulan', icon: 'mdi:star-outline', group: 'Umum' },
    { key: 'about', label: 'Tentang Kami', icon: 'mdi:information-outline', group: 'Umum' },
    { key: 'programs', label: 'Program Belajar', icon: 'mdi:book-open-variant', group: 'Konten' },
    { key: 'method', label: 'Metode Belajar', icon: 'mdi:map-marker-path', group: 'Konten' },
    { key: 'schedule', label: 'Jadwal Kelas', icon: 'mdi:calendar-clock-outline', group: 'Konten' },
    { key: 'facilities', label: 'Fasilitas', icon: 'mdi:office-building-outline', group: 'Konten' },
    { key: 'pricing', label: 'Paket & Harga', icon: 'mdi:tag-outline', group: 'Penawaran' },
    {
        key: 'testimonials',
        label: 'Testimoni',
        icon: 'mdi:comment-quote-outline',
        group: 'Penawaran',
    },
    { key: 'branches', label: 'Cabang', icon: 'mdi:map-marker-outline', group: 'Perusahaan' },
    { key: 'faq', label: 'FAQ', icon: 'mdi:help-circle-outline', group: 'Perusahaan' },
    {
        key: 'articles',
        label: 'Artikel & Tips',
        icon: 'mdi:newspaper-variant-outline',
        group: 'Perusahaan',
    },
    {
        key: 'enrollment',
        label: 'Pendaftaran',
        icon: 'mdi:account-plus-outline',
        group: 'Perusahaan',
    },
    { key: 'footer', label: 'Footer', icon: 'mdi:page-layout-footer', group: 'Perusahaan' },
];

const overviewRows: {
    key: SectionKey;
    label: string;
    description: string;
    count: (content: LandingContent) => string;
}[] = [
    {
        key: 'hero',
        label: 'Hero / Banner',
        description: 'Judul, tombol, slider, statistik',
        count: (c) => `${c.hero.slides.length} slide · ${c.hero.stats.length} statistik`,
    },
    {
        key: 'trust',
        label: 'Bar Kepercayaan',
        description: 'Poin singkat di bawah hero',
        count: (c) => `${c.trust.length} poin`,
    },
    {
        key: 'features',
        label: 'Keunggulan',
        description: 'Alasan memilih bimbel',
        count: (c) => `${c.features.length} keunggulan`,
    },
    {
        key: 'about',
        label: 'Tentang Kami',
        description: 'Cerita dan linimasa',
        count: (c) => `${c.about.milestones.length} tahun`,
    },
    {
        key: 'programs',
        label: 'Program Belajar',
        description: 'Daftar program',
        count: (c) => `${c.programs.filter((p) => p.published).length}/${c.programs.length} tampil`,
    },
    {
        key: 'method',
        label: 'Metode Belajar',
        description: 'Langkah proses belajar',
        count: (c) => `${c.method.length} langkah`,
    },
    {
        key: 'schedule',
        label: 'Jadwal Kelas',
        description: 'Tabel jadwal',
        count: (c) => `${c.schedule.length} baris`,
    },
    {
        key: 'facilities',
        label: 'Fasilitas',
        description: 'Sarana cabang',
        count: (c) => `${c.facilities.length} fasilitas`,
    },
    {
        key: 'pricing',
        label: 'Paket & Harga',
        description: 'Paket dan potongan',
        count: (c) => `${c.pricing.plans.length} paket`,
    },
    {
        key: 'testimonials',
        label: 'Testimoni',
        description: 'Cerita siswa & orang tua',
        count: (c) => `${c.testimonials.length} testimoni`,
    },
    {
        key: 'branches',
        label: 'Cabang',
        description: 'Lokasi dan kontak',
        count: (c) => `${c.branches.length} cabang`,
    },
    {
        key: 'faq',
        label: 'FAQ',
        description: 'Pertanyaan umum',
        count: (c) => `${c.faqs.length} pertanyaan`,
    },
    {
        key: 'articles',
        label: 'Artikel & Tips',
        description: 'Konten bacaan',
        count: (c) => `${c.articles.length} artikel`,
    },
    {
        key: 'enrollment',
        label: 'Pendaftaran',
        description: 'Alur daftar & kontak',
        count: (c) => `${c.enrollment.steps.length} langkah`,
    },
    {
        key: 'footer',
        label: 'Footer',
        description: 'Identitas & kontak',
        count: (c) => `${c.footer.socials.length} sosial`,
    },
];

export function LandingCms() {
    const [content, setContent] = useState<LandingContent>(initialContent);
    const [active, setActive] = useState<SectionKey>('overview');
    const [hydrated, setHydrated] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        http.get('/landing/content')
            .then((response) => {
                if (!mounted) return;
                const data = response.data?.data ?? {};
                setContent({ ...initialContent, ...data });
            })
            .catch((error) => {
                const { message } = parseAxiosError(error);
                toast.add({ title: 'Gagal memuat konten', type: 'error', description: message });
            })
            .finally(() => {
                if (mounted) setHydrated(true);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const sections = SECTION_KEYS.map((key) => ({ key, content: content[key] }));
            const response = await http.put('/landing/sections', { sections });
            toast.add({
                title: 'Tersimpan',
                type: 'success',
                description: response.data.message ?? 'Perubahan landing page disimpan.',
            });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal menyimpan', type: 'error', description: message });
        } finally {
            setSaving(false);
        }
    };

    const reset = async () => {
        try {
            await http.post('/landing/sections/reset');
            setContent(initialContent);
            toast.add({
                title: 'Direset',
                type: 'info',
                description: 'Konten dikembalikan ke pengaturan awal.',
            });
        } catch (error) {
            const { message } = parseAxiosError(error);
            toast.add({ title: 'Gagal reset', type: 'error', description: message });
        }
    };

    const groups = useMemo(() => {
        const map = new Map<string, typeof nav>();
        nav.forEach((item) => {
            const list = map.get(item.group) ?? [];
            list.push(item);
            map.set(item.group, list);
        });
        return Array.from(map.entries());
    }, []);

    const activeLabel = nav.find((item) => item.key === active)?.label ?? 'Ringkasan';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="bg-brand-gradient text-primary-foreground flex size-9 items-center justify-center rounded-xl shadow-brand">
                            <Icon icon="mdi:monitor-dashboard" className="text-xl" />
                        </span>
                        <h1 className="font-heading text-2xl font-bold tracking-tight">
                            Landing Page CMS
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Atur konten yang tampil di halaman publik tanpa mengubah kode.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        nativeButton={false}
                        render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
                    >
                        <Icon icon="mdi:open-in-new" />
                        Pratinjau
                    </Button>
                    <Button onClick={save} disabled={saving}>
                        <Icon icon="mdi:content-save-outline" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
                {/* Nav */}
                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <div className="flex gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card p-2 shadow-card lg:flex-col lg:overflow-visible">
                        {groups.map(([group, items]) => (
                            <div key={group} className="contents lg:block">
                                <p className="hidden px-2.5 pt-3 pb-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase lg:block">
                                    {group}
                                </p>
                                {items.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setActive(item.key)}
                                        className={cn(
                                            'flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition-colors lg:w-full',
                                            active === item.key
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                                        )}
                                    >
                                        <Icon icon={item.icon} className="text-lg" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Panel */}
                <Card className="overflow-visible">
                    <CardContent className="pt-5">
                        {!hydrated ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                Memuat konten...
                            </div>
                        ) : active === 'overview' ? (
                            <Overview content={content} onEdit={setActive} />
                        ) : (
                            <div className="space-y-6">
                                {active === 'hero' && (
                                    <HeroEditor
                                        value={content.hero}
                                        onChange={(hero) => setContent({ ...content, hero })}
                                    />
                                )}
                                {active === 'trust' && (
                                    <TrustEditor
                                        value={content.trust}
                                        onChange={(trust) => setContent({ ...content, trust })}
                                    />
                                )}
                                {active === 'features' && (
                                    <FeaturesEditor
                                        value={content.features}
                                        onChange={(features) =>
                                            setContent({ ...content, features })
                                        }
                                    />
                                )}
                                {active === 'about' && (
                                    <AboutEditor
                                        value={content.about}
                                        onChange={(about) => setContent({ ...content, about })}
                                    />
                                )}
                                {active === 'programs' && (
                                    <ProgramsEditor
                                        value={content.programs}
                                        onChange={(programs) =>
                                            setContent({ ...content, programs })
                                        }
                                    />
                                )}
                                {active === 'method' && (
                                    <MethodEditor
                                        value={content.method}
                                        onChange={(method) => setContent({ ...content, method })}
                                    />
                                )}
                                {active === 'schedule' && (
                                    <ScheduleEditor
                                        value={content.schedule}
                                        onChange={(schedule) =>
                                            setContent({ ...content, schedule })
                                        }
                                    />
                                )}
                                {active === 'facilities' && (
                                    <FacilitiesEditor
                                        value={content.facilities}
                                        onChange={(facilities) =>
                                            setContent({ ...content, facilities })
                                        }
                                    />
                                )}
                                {active === 'pricing' && (
                                    <PricingEditor
                                        value={content.pricing}
                                        onChange={(pricing) => setContent({ ...content, pricing })}
                                    />
                                )}
                                {active === 'testimonials' && (
                                    <TestimonialsEditor
                                        value={content.testimonials}
                                        onChange={(testimonials) =>
                                            setContent({ ...content, testimonials })
                                        }
                                    />
                                )}
                                {active === 'branches' && (
                                    <BranchesEditor
                                        value={content.branches}
                                        onChange={(branches) =>
                                            setContent({ ...content, branches })
                                        }
                                    />
                                )}
                                {active === 'faq' && (
                                    <FaqEditor
                                        value={content.faqs}
                                        onChange={(faqs) => setContent({ ...content, faqs })}
                                    />
                                )}
                                {active === 'articles' && (
                                    <ArticlesEditor
                                        value={content.articles}
                                        onChange={(articles) =>
                                            setContent({ ...content, articles })
                                        }
                                    />
                                )}
                                {active === 'enrollment' && (
                                    <EnrollmentEditor
                                        value={content.enrollment}
                                        onChange={(enrollment) =>
                                            setContent({ ...content, enrollment })
                                        }
                                    />
                                )}
                                {active === 'footer' && (
                                    <FooterEditor
                                        value={content.footer}
                                        onChange={(footer) => setContent({ ...content, footer })}
                                    />
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Mengedit:{' '}
                                        <span className="font-medium text-foreground">
                                            {activeLabel}
                                        </span>
                                    </p>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={reset}>
                                            <Icon icon="mdi:restore" />
                                            Reset
                                        </Button>
                                        <Button onClick={save} disabled={saving}>
                                            <Icon icon="mdi:content-save-outline" />
                                            {saving ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Overview({
    content,
    onEdit,
}: {
    content: LandingContent;
    onEdit: (key: SectionKey) => void;
}) {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                    <h2 className="font-heading text-lg font-semibold">Ringkasan Konten</h2>
                    <p className="text-sm text-muted-foreground">
                        Klik salah satu bagian untuk mulai mengedit.
                    </p>
                </div>
                <span className="bg-success/12 text-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                    <Icon icon="mdi:check-circle-outline" />
                    {overviewRows.length} bagian aktif
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {overviewRows.map((row) => {
                    const navItem = nav.find((n) => n.key === row.key);
                    return (
                        <button
                            key={row.key}
                            type="button"
                            onClick={() => onEdit(row.key)}
                            className="hover:border-primary/40 group flex flex-col rounded-xl border border-border/70 bg-card p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="bg-brand-gradient-soft text-primary flex size-9 items-center justify-center rounded-xl">
                                    <Icon
                                        icon={navItem?.icon ?? 'mdi:file-outline'}
                                        className="text-lg"
                                    />
                                </span>
                                <Icon
                                    icon="mdi:arrow-top-right"
                                    className="text-muted-foreground group-hover:text-primary transition-colors"
                                />
                            </div>
                            <p className="font-heading text-sm font-semibold">{row.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {row.description}
                            </p>
                            <p className="text-primary mt-3 text-xs font-medium">
                                {row.count(content)}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className="bg-brand-gradient-soft flex items-start gap-3 rounded-xl p-4">
                <Icon icon="mdi:information-outline" className="text-primary mt-0.5 text-lg" />
                <p className="text-sm text-muted-foreground">
                    Setiap perubahan disimpan ke backend melalui tombol Simpan, lalu langsung
                    dipakai oleh halaman publik. Gunakan Reset untuk mengembalikan ke konten awal.
                </p>
            </div>
        </div>
    );
}
