'use client';

import { Icon } from '@iconify/react';

import {
    AddButton,
    ImageField,
    ItemCard,
    PublishBadge,
    SectionHeader,
    StringListEditor,
    TextAreaField,
    TextField,
    ToggleField,
} from './fields';
import type {
    Facility,
    Feature,
    LandingContent,
    MethodStep,
    Milestone,
    Program,
    ScheduleRow,
    TrustItem,
} from './data';
import { uid } from './data';

type Updater<T> = (value: T) => void;

/* ---------------------------------- Hero ---------------------------------- */

export function HeroEditor({
    value,
    onChange,
}: {
    value: LandingContent['hero'];
    onChange: Updater<LandingContent['hero']>;
}) {
    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Hero / Banner Utama"
                description="Bagian paling atas halaman. Menentukan kesan pertama pengunjung."
            />

            <TextField
                label="Teks badge"
                value={value.badge}
                onChange={(badge) => onChange({ ...value, badge })}
                placeholder="Bimbel modern untuk generasi cerdas"
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-semibold">Tombol utama</p>
                    <TextField
                        label="Label"
                        value={value.primaryCta.label}
                        onChange={(label) =>
                            onChange({ ...value, primaryCta: { ...value.primaryCta, label } })
                        }
                    />
                    <TextField
                        label="Tautan"
                        value={value.primaryCta.href}
                        onChange={(href) =>
                            onChange({ ...value, primaryCta: { ...value.primaryCta, href } })
                        }
                        placeholder="/course"
                    />
                </div>
                <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
                    <p className="text-sm font-semibold">Tombol sekunder</p>
                    <TextField
                        label="Label"
                        value={value.secondaryCta.label}
                        onChange={(label) =>
                            onChange({ ...value, secondaryCta: { ...value.secondaryCta, label } })
                        }
                    />
                    <TextField
                        label="Tautan"
                        value={value.secondaryCta.href}
                        onChange={(href) =>
                            onChange({ ...value, secondaryCta: { ...value.secondaryCta, href } })
                        }
                        placeholder="/contact"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Slider banner</p>
                    <AddButton
                        label="Tambah slide"
                        onClick={() =>
                            onChange({
                                ...value,
                                slides: [
                                    ...value.slides,
                                    { id: uid('slide'), title: 'Judul baru', desc: '', image: '' },
                                ],
                            })
                        }
                    />
                </div>
                {value.slides.map((slide, index) => (
                    <ItemCard
                        key={slide.id}
                        title={`Slide ${index + 1}`}
                        onRemove={
                            value.slides.length > 1
                                ? () =>
                                      onChange({
                                          ...value,
                                          slides: value.slides.filter((s) => s.id !== slide.id),
                                      })
                                : undefined
                        }
                    >
                        <TextField
                            label="Judul"
                            value={slide.title}
                            onChange={(title) =>
                                onChange({
                                    ...value,
                                    slides: value.slides.map((s) =>
                                        s.id === slide.id ? { ...s, title } : s,
                                    ),
                                })
                            }
                        />
                        <TextAreaField
                            label="Deskripsi"
                            value={slide.desc}
                            onChange={(desc) =>
                                onChange({
                                    ...value,
                                    slides: value.slides.map((s) =>
                                        s.id === slide.id ? { ...s, desc } : s,
                                    ),
                                })
                            }
                        />
                        <ImageField
                            label="Gambar latar"
                            value={slide.image}
                            onChange={(image) =>
                                onChange({
                                    ...value,
                                    slides: value.slides.map((s) =>
                                        s.id === slide.id ? { ...s, image } : s,
                                    ),
                                })
                            }
                        />
                    </ItemCard>
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Statistik singkat</p>
                    <AddButton
                        label="Tambah statistik"
                        onClick={() =>
                            onChange({
                                ...value,
                                stats: [...value.stats, { id: uid('stat'), value: '0', label: '' }],
                            })
                        }
                    />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    {value.stats.map((stat) => (
                        <ItemCard
                            key={stat.id}
                            title={stat.label || 'Statistik'}
                            onRemove={() =>
                                onChange({
                                    ...value,
                                    stats: value.stats.filter((s) => s.id !== stat.id),
                                })
                            }
                        >
                            <TextField
                                label="Nilai"
                                value={stat.value}
                                onChange={(v) =>
                                    onChange({
                                        ...value,
                                        stats: value.stats.map((s) =>
                                            s.id === stat.id ? { ...s, value: v } : s,
                                        ),
                                    })
                                }
                            />
                            <TextField
                                label="Label"
                                value={stat.label}
                                onChange={(v) =>
                                    onChange({
                                        ...value,
                                        stats: value.stats.map((s) =>
                                            s.id === stat.id ? { ...s, label: v } : s,
                                        ),
                                    })
                                }
                            />
                        </ItemCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* --------------------------------- Trust ---------------------------------- */

export function TrustEditor({
    value,
    onChange,
}: {
    value: TrustItem[];
    onChange: Updater<TrustItem[]>;
}) {
    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Bar Kepercayaan"
                description="Empat poin singkat di bawah hero, misalnya izin resmi atau rating."
                action={
                    <AddButton
                        label="Tambah poin"
                        onClick={() =>
                            onChange([
                                ...value,
                                { id: uid('trust'), icon: 'mdi:check-circle-outline', label: '' },
                            ])
                        }
                    />
                }
            />
            <div className="grid gap-3 sm:grid-cols-2">
                {value.map((item) => (
                    <ItemCard
                        key={item.id}
                        title={item.label || 'Poin baru'}
                        onRemove={() => onChange(value.filter((t) => t.id !== item.id))}
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-brand-gradient-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                <Icon icon={item.icon || 'mdi:check'} className="text-xl" />
                            </span>
                            <TextField
                                label="Ikon (mdi:...)"
                                value={item.icon}
                                onChange={(icon) =>
                                    onChange(
                                        value.map((t) => (t.id === item.id ? { ...t, icon } : t)),
                                    )
                                }
                                className="flex-1"
                            />
                        </div>
                        <TextField
                            label="Teks"
                            value={item.label}
                            onChange={(label) =>
                                onChange(value.map((t) => (t.id === item.id ? { ...t, label } : t)))
                            }
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------- Features -------------------------------- */

export function FeaturesEditor({
    value,
    onChange,
}: {
    value: Feature[];
    onChange: Updater<Feature[]>;
}) {
    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Keunggulan"
                description="Alasan singkat mengapa orang tua memilih bimbel ini."
                action={
                    <AddButton
                        label="Tambah keunggulan"
                        onClick={() =>
                            onChange([
                                ...value,
                                { id: uid('feat'), icon: 'mdi:star-outline', title: '', desc: '' },
                            ])
                        }
                    />
                }
            />
            <div className="grid gap-3 md:grid-cols-2">
                {value.map((item, index) => (
                    <ItemCard
                        key={item.id}
                        title={`Keunggulan ${index + 1}`}
                        onRemove={() => onChange(value.filter((f) => f.id !== item.id))}
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-brand-gradient-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                <Icon icon={item.icon || 'mdi:star'} className="text-xl" />
                            </span>
                            <TextField
                                label="Ikon"
                                value={item.icon}
                                onChange={(icon) =>
                                    onChange(
                                        value.map((f) => (f.id === item.id ? { ...f, icon } : f)),
                                    )
                                }
                                className="flex-1"
                            />
                        </div>
                        <TextField
                            label="Judul"
                            value={item.title}
                            onChange={(title) =>
                                onChange(value.map((f) => (f.id === item.id ? { ...f, title } : f)))
                            }
                        />
                        <TextAreaField
                            label="Deskripsi"
                            value={item.desc}
                            onChange={(desc) =>
                                onChange(value.map((f) => (f.id === item.id ? { ...f, desc } : f)))
                            }
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* --------------------------------- About ---------------------------------- */

export function AboutEditor({
    value,
    onChange,
}: {
    value: LandingContent['about'];
    onChange: Updater<LandingContent['about']>;
}) {
    const updateMilestone = (id: string, patch: Partial<Milestone>) =>
        onChange({
            ...value,
            milestones: value.milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Tentang Kami"
                description="Cerita brand, badge pengalaman, poin pembeda, dan linimasa perjalanan."
            />
            <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                    label="Badge angka"
                    value={value.badgeYear}
                    onChange={(badgeYear) => onChange({ ...value, badgeYear })}
                    placeholder="12"
                />
                <TextField
                    label="Badge keterangan"
                    value={value.badgeLabel}
                    onChange={(badgeLabel) => onChange({ ...value, badgeLabel })}
                    placeholder="tahun menemani belajar"
                />
            </div>
            <TextField
                label="Judul"
                value={value.heading}
                onChange={(heading) => onChange({ ...value, heading })}
            />
            <TextAreaField
                label="Paragraf"
                value={value.paragraph}
                onChange={(paragraph) => onChange({ ...value, paragraph })}
                rows={4}
            />
            <StringListEditor
                label="Poin pembeda"
                values={value.points}
                onChange={(points) => onChange({ ...value, points })}
            />

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Linimasa</p>
                    <AddButton
                        label="Tambah tahun"
                        onClick={() =>
                            onChange({
                                ...value,
                                milestones: [
                                    ...value.milestones,
                                    { id: uid('ms'), year: '', text: '' },
                                ],
                            })
                        }
                    />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {value.milestones.map((milestone) => (
                        <ItemCard
                            key={milestone.id}
                            title={milestone.year || 'Tahun baru'}
                            onRemove={() =>
                                onChange({
                                    ...value,
                                    milestones: value.milestones.filter(
                                        (m) => m.id !== milestone.id,
                                    ),
                                })
                            }
                        >
                            <TextField
                                label="Tahun"
                                value={milestone.year}
                                onChange={(year) => updateMilestone(milestone.id, { year })}
                            />
                            <TextAreaField
                                label="Keterangan"
                                value={milestone.text}
                                onChange={(text) => updateMilestone(milestone.id, { text })}
                            />
                        </ItemCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------- Programs -------------------------------- */

export function ProgramsEditor({
    value,
    onChange,
}: {
    value: Program[];
    onChange: Updater<Program[]>;
}) {
    const update = (id: string, patch: Partial<Program>) =>
        onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Program Belajar"
                description="Kelola daftar program yang tampil di halaman publik."
                action={
                    <AddButton
                        label="Tambah program"
                        onClick={() =>
                            onChange([
                                {
                                    id: uid('prog'),
                                    title: '',
                                    level: '',
                                    price: '',
                                    duration: '',
                                    frequency: '',
                                    topics: [],
                                    image: '',
                                    published: true,
                                },
                                ...value,
                            ])
                        }
                    />
                }
            />
            <div className="space-y-3">
                {value.map((program, index) => (
                    <ItemCard
                        key={program.id}
                        title={program.title || `Program ${index + 1}`}
                        badge={<PublishBadge published={program.published} />}
                        onRemove={() => onChange(value.filter((p) => p.id !== program.id))}
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Nama program"
                                value={program.title}
                                onChange={(title) => update(program.id, { title })}
                                className="md:col-span-2"
                            />
                            <TextField
                                label="Jenjang"
                                value={program.level}
                                onChange={(level) => update(program.id, { level })}
                            />
                            <TextField
                                label="Harga"
                                value={program.price}
                                onChange={(price) => update(program.id, { price })}
                            />
                            <TextField
                                label="Durasi"
                                value={program.duration}
                                onChange={(duration) => update(program.id, { duration })}
                            />
                            <TextField
                                label="Frekuensi"
                                value={program.frequency}
                                onChange={(frequency) => update(program.id, { frequency })}
                            />
                        </div>
                        <ImageField
                            value={program.image}
                            onChange={(image) => update(program.id, { image })}
                        />
                        <StringListEditor
                            label="Fokus materi"
                            values={program.topics}
                            onChange={(topics) => update(program.id, { topics })}
                            placeholder="Tambah materi..."
                        />
                        <ToggleField
                            label="Tampilkan di landing page"
                            checked={program.published}
                            onChange={(published) => update(program.id, { published })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* --------------------------------- Method --------------------------------- */

export function MethodEditor({
    value,
    onChange,
}: {
    value: MethodStep[];
    onChange: Updater<MethodStep[]>;
}) {
    const update = (id: string, patch: Partial<MethodStep>) =>
        onChange(value.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Metode Belajar"
                description="Langkah-langkah proses belajar yang ditampilkan ke pengunjung."
                action={
                    <AddButton
                        label="Tambah langkah"
                        onClick={() =>
                            onChange([
                                ...value,
                                {
                                    id: uid('m'),
                                    icon: 'mdi:check-circle-outline',
                                    title: '',
                                    duration: '',
                                    desc: '',
                                },
                            ])
                        }
                    />
                }
            />
            <div className="space-y-3">
                {value.map((step, index) => (
                    <ItemCard
                        key={step.id}
                        title={`Langkah ${index + 1}`}
                        onRemove={() => onChange(value.filter((s) => s.id !== step.id))}
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-brand-gradient-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                <Icon icon={step.icon || 'mdi:check'} className="text-xl" />
                            </span>
                            <TextField
                                label="Ikon"
                                value={step.icon}
                                onChange={(icon) => update(step.id, { icon })}
                                className="flex-1"
                            />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <TextField
                                label="Judul"
                                value={step.title}
                                onChange={(title) => update(step.id, { title })}
                            />
                            <TextField
                                label="Durasi"
                                value={step.duration}
                                onChange={(duration) => update(step.id, { duration })}
                            />
                        </div>
                        <TextAreaField
                            label="Deskripsi"
                            value={step.desc}
                            onChange={(desc) => update(step.id, { desc })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------- Schedule -------------------------------- */

export function ScheduleEditor({
    value,
    onChange,
}: {
    value: ScheduleRow[];
    onChange: Updater<ScheduleRow[]>;
}) {
    const update = (id: string, patch: Partial<ScheduleRow>) =>
        onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Jadwal Kelas"
                description="Tabel jadwal yang tampil di halaman publik."
                action={
                    <AddButton
                        label="Tambah baris"
                        onClick={() =>
                            onChange([
                                ...value,
                                {
                                    id: uid('sch'),
                                    program: '',
                                    days: '',
                                    time: '',
                                    type: 'Reguler',
                                    quota: '',
                                },
                            ])
                        }
                    />
                }
            />
            <div className="space-y-3">
                {value.map((row, index) => (
                    <ItemCard
                        key={row.id}
                        title={row.program || `Baris ${index + 1}`}
                        onRemove={() => onChange(value.filter((r) => r.id !== row.id))}
                    >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <TextField
                                label="Program"
                                value={row.program}
                                onChange={(program) => update(row.id, { program })}
                            />
                            <TextField
                                label="Hari"
                                value={row.days}
                                onChange={(days) => update(row.id, { days })}
                            />
                            <TextField
                                label="Jam"
                                value={row.time}
                                onChange={(time) => update(row.id, { time })}
                            />
                            <TextField
                                label="Jenis"
                                value={row.type}
                                onChange={(type) => update(row.id, { type })}
                            />
                            <TextField
                                label="Kuota"
                                value={row.quota}
                                onChange={(quota) => update(row.id, { quota })}
                            />
                        </div>
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------- Facilities ------------------------------- */

export function FacilitiesEditor({
    value,
    onChange,
}: {
    value: Facility[];
    onChange: Updater<Facility[]>;
}) {
    const update = (id: string, patch: Partial<Facility>) =>
        onChange(value.map((f) => (f.id === id ? { ...f, ...patch } : f)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Fasilitas"
                description="Sarana yang tersedia di cabang, ditampilkan sebagai daftar."
                action={
                    <AddButton
                        label="Tambah fasilitas"
                        onClick={() =>
                            onChange([
                                ...value,
                                { id: uid('fac'), icon: 'mdi:star-outline', title: '', desc: '' },
                            ])
                        }
                    />
                }
            />
            <div className="grid gap-3 md:grid-cols-2">
                {value.map((item, index) => (
                    <ItemCard
                        key={item.id}
                        title={item.title || `Fasilitas ${index + 1}`}
                        onRemove={() => onChange(value.filter((f) => f.id !== item.id))}
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-brand-gradient-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                                <Icon icon={item.icon || 'mdi:star'} className="text-xl" />
                            </span>
                            <TextField
                                label="Ikon"
                                value={item.icon}
                                onChange={(icon) => update(item.id, { icon })}
                                className="flex-1"
                            />
                        </div>
                        <TextField
                            label="Judul"
                            value={item.title}
                            onChange={(title) => update(item.id, { title })}
                        />
                        <TextAreaField
                            label="Deskripsi"
                            value={item.desc}
                            onChange={(desc) => update(item.id, { desc })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}
