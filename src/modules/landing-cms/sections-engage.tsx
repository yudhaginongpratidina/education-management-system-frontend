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
    Article,
    BranchContent,
    EnrollmentStep,
    Faq,
    LandingContent,
    PricingPlan,
    SocialLink,
    Testimonial,
} from './data';
import { uid } from './data';

type Updater<T> = (value: T) => void;

/* -------------------------------- Pricing --------------------------------- */

export function PricingEditor({
    value,
    onChange,
}: {
    value: LandingContent['pricing'];
    onChange: Updater<LandingContent['pricing']>;
}) {
    const updatePlan = (id: string, patch: Partial<PricingPlan>) =>
        onChange({
            ...value,
            plans: value.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        });

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Paket & Harga"
                description="Atur paket belajar, fitur tiap paket, dan info potongan harga."
                action={
                    <AddButton
                        label="Tambah paket"
                        onClick={() =>
                            onChange({
                                ...value,
                                plans: [
                                    ...value.plans,
                                    {
                                        id: uid('plan'),
                                        name: '',
                                        price: '',
                                        sessions: '',
                                        desc: '',
                                        features: [],
                                        featured: false,
                                    },
                                ],
                            })
                        }
                    />
                }
            />

            <div className="grid gap-3 lg:grid-cols-3">
                {value.plans.map((plan, index) => (
                    <ItemCard
                        key={plan.id}
                        title={plan.name || `Paket ${index + 1}`}
                        badge={plan.featured ? <PublishBadge published /> : undefined}
                        onRemove={() =>
                            onChange({
                                ...value,
                                plans: value.plans.filter((p) => p.id !== plan.id),
                            })
                        }
                    >
                        <TextField
                            label="Nama paket"
                            value={plan.name}
                            onChange={(name) => updatePlan(plan.id, { name })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <TextField
                                label="Harga"
                                value={plan.price}
                                onChange={(price) => updatePlan(plan.id, { price })}
                            />
                            <TextField
                                label="Sesi"
                                value={plan.sessions}
                                onChange={(sessions) => updatePlan(plan.id, { sessions })}
                            />
                        </div>
                        <TextAreaField
                            label="Deskripsi"
                            value={plan.desc}
                            onChange={(desc) => updatePlan(plan.id, { desc })}
                            rows={2}
                        />
                        <StringListEditor
                            label="Fitur"
                            values={plan.features}
                            onChange={(features) => updatePlan(plan.id, { features })}
                            placeholder="Tambah fitur..."
                        />
                        <ToggleField
                            label="Tandai paling populer"
                            checked={plan.featured}
                            onChange={(featured) => updatePlan(plan.id, { featured })}
                        />
                    </ItemCard>
                ))}
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-card">
                <StringListEditor
                    label="Potongan harga"
                    values={value.discounts}
                    onChange={(discounts) => onChange({ ...value, discounts })}
                    placeholder="Contoh: Bayar 3 bulan sekaligus: hemat 10%"
                />
            </div>
        </div>
    );
}

/* ------------------------------ Testimonials ------------------------------ */

export function TestimonialsEditor({
    value,
    onChange,
}: {
    value: Testimonial[];
    onChange: Updater<Testimonial[]>;
}) {
    const update = (id: string, patch: Partial<Testimonial>) =>
        onChange(value.map((t) => (t.id === id ? { ...t, ...patch } : t)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Testimoni"
                description="Cerita dari siswa atau orang tua beserta hasil yang dicapai."
                action={
                    <AddButton
                        label="Tambah testimoni"
                        onClick={() =>
                            onChange([
                                {
                                    id: uid('t'),
                                    name: '',
                                    role: '',
                                    image: 'testimonials-1.jpg',
                                    result: '',
                                    text: '',
                                },
                                ...value,
                            ])
                        }
                    />
                }
            />
            <div className="grid gap-3 md:grid-cols-2">
                {value.map((item, index) => (
                    <ItemCard
                        key={item.id}
                        title={item.name || `Testimoni ${index + 1}`}
                        onRemove={() => onChange(value.filter((t) => t.id !== item.id))}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <TextField
                                label="Nama"
                                value={item.name}
                                onChange={(name) => update(item.id, { name })}
                            />
                            <TextField
                                label="Peran"
                                value={item.role}
                                onChange={(role) => update(item.id, { role })}
                            />
                        </div>
                        <TextField
                            label="Hasil (badge)"
                            value={item.result}
                            onChange={(result) => update(item.id, { result })}
                            placeholder="Matematika 68 → 84"
                        />
                        <TextAreaField
                            label="Testimoni"
                            value={item.text}
                            onChange={(text) => update(item.id, { text })}
                        />
                        <TextField
                            label="Gambar (nama file di /assets/img/testimonials)"
                            value={item.image}
                            onChange={(image) => update(item.id, { image })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------- Branches -------------------------------- */

export function BranchesEditor({
    value,
    onChange,
}: {
    value: BranchContent[];
    onChange: Updater<BranchContent[]>;
}) {
    const update = (id: string, patch: Partial<BranchContent>) =>
        onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Cabang"
                description="Daftar cabang beserta alamat, kontak, dan jam operasional."
                action={
                    <AddButton
                        label="Tambah cabang"
                        onClick={() =>
                            onChange([
                                ...value,
                                {
                                    id: uid('br'),
                                    city: '',
                                    address: '',
                                    phone: '',
                                    wa: '',
                                    hours: '',
                                    programs: '',
                                },
                            ])
                        }
                    />
                }
            />
            <div className="space-y-3">
                {value.map((branch, index) => (
                    <ItemCard
                        key={branch.id}
                        title={branch.city || `Cabang ${index + 1}`}
                        onRemove={() => onChange(value.filter((b) => b.id !== branch.id))}
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Nama kota"
                                value={branch.city}
                                onChange={(city) => update(branch.id, { city })}
                            />
                            <TextField
                                label="Telepon"
                                value={branch.phone}
                                onChange={(phone) => update(branch.id, { phone })}
                            />
                            <TextField
                                label="Alamat"
                                value={branch.address}
                                onChange={(address) => update(branch.id, { address })}
                                className="md:col-span-2"
                            />
                            <TextField
                                label="Jam operasional"
                                value={branch.hours}
                                onChange={(hours) => update(branch.id, { hours })}
                            />
                            <TextField
                                label="Nomor WhatsApp (62...)"
                                value={branch.wa}
                                onChange={(wa) => update(branch.id, { wa })}
                            />
                        </div>
                        <TextField
                            label="Program tersedia (pisahkan dengan koma)"
                            value={branch.programs}
                            onChange={(programs) => update(branch.id, { programs })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* ---------------------------------- FAQ ----------------------------------- */

export function FaqEditor({ value, onChange }: { value: Faq[]; onChange: Updater<Faq[]> }) {
    const update = (id: string, patch: Partial<Faq>) =>
        onChange(value.map((f) => (f.id === id ? { ...f, ...patch } : f)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Pertanyaan Umum (FAQ)"
                description="Pertanyaan dan jawaban yang sering ditanyakan calon siswa."
                action={
                    <AddButton
                        label="Tambah pertanyaan"
                        onClick={() =>
                            onChange([...value, { id: uid('faq'), question: '', answer: '' }])
                        }
                    />
                }
            />
            <div className="space-y-3">
                {value.map((item, index) => (
                    <ItemCard
                        key={item.id}
                        title={item.question || `Pertanyaan ${index + 1}`}
                        onRemove={() => onChange(value.filter((f) => f.id !== item.id))}
                    >
                        <TextField
                            label="Pertanyaan"
                            value={item.question}
                            onChange={(question) => update(item.id, { question })}
                        />
                        <TextAreaField
                            label="Jawaban"
                            value={item.answer}
                            onChange={(answer) => update(item.id, { answer })}
                            rows={3}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------- Articles -------------------------------- */

export function ArticlesEditor({
    value,
    onChange,
}: {
    value: Article[];
    onChange: Updater<Article[]>;
}) {
    const update = (id: string, patch: Partial<Article>) =>
        onChange(value.map((a) => (a.id === id ? { ...a, ...patch } : a)));

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Artikel & Tips"
                description="Konten bacaan yang tampil di bagian bawah landing page."
                action={
                    <AddButton
                        label="Tambah artikel"
                        onClick={() =>
                            onChange([
                                {
                                    id: uid('art'),
                                    category: '',
                                    title: '',
                                    excerpt: '',
                                    date: '',
                                    read: '',
                                    image: '',
                                },
                                ...value,
                            ])
                        }
                    />
                }
            />
            <div className="space-y-3">
                {value.map((item, index) => (
                    <ItemCard
                        key={item.id}
                        title={item.title || `Artikel ${index + 1}`}
                        badge={
                            item.category ? (
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[0.6875rem] font-medium">
                                    {item.category}
                                </span>
                            ) : undefined
                        }
                        onRemove={() => onChange(value.filter((a) => a.id !== item.id))}
                    >
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Kategori"
                                value={item.category}
                                onChange={(category) => update(item.id, { category })}
                            />
                            <TextField
                                label="Judul"
                                value={item.title}
                                onChange={(title) => update(item.id, { title })}
                            />
                        </div>
                        <TextAreaField
                            label="Ringkasan"
                            value={item.excerpt}
                            onChange={(excerpt) => update(item.id, { excerpt })}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Tanggal"
                                value={item.date}
                                onChange={(date) => update(item.id, { date })}
                            />
                            <TextField
                                label="Estimasi baca"
                                value={item.read}
                                onChange={(read) => update(item.id, { read })}
                            />
                        </div>
                        <ImageField
                            value={item.image}
                            onChange={(image) => update(item.id, { image })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* ------------------------------- Enrollment ------------------------------- */

export function EnrollmentEditor({
    value,
    onChange,
}: {
    value: LandingContent['enrollment'];
    onChange: Updater<LandingContent['enrollment']>;
}) {
    const updateStep = (id: string, patch: Partial<EnrollmentStep>) =>
        onChange({
            ...value,
            steps: value.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        });

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Pendaftaran & CTA"
                description="Alur pendaftaran dan informasi kontak untuk calon siswa."
                action={
                    <AddButton
                        label="Tambah langkah"
                        onClick={() =>
                            onChange({
                                ...value,
                                steps: [...value.steps, { id: uid('en'), title: '', desc: '' }],
                            })
                        }
                    />
                }
            />
            <div className="grid gap-3 sm:grid-cols-3">
                <TextField
                    label="Nomor WhatsApp (62...)"
                    value={value.whatsapp}
                    onChange={(whatsapp) => onChange({ ...value, whatsapp })}
                />
                <TextField
                    label="Nomor telepon tampil"
                    value={value.phone}
                    onChange={(phone) => onChange({ ...value, phone })}
                />
                <TextField
                    label="Jam layanan"
                    value={value.hours}
                    onChange={(hours) => onChange({ ...value, hours })}
                />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                {value.steps.map((step, index) => (
                    <ItemCard
                        key={step.id}
                        title={`Langkah ${index + 1}`}
                        onRemove={() =>
                            onChange({
                                ...value,
                                steps: value.steps.filter((s) => s.id !== step.id),
                            })
                        }
                    >
                        <TextField
                            label="Judul"
                            value={step.title}
                            onChange={(title) => updateStep(step.id, { title })}
                        />
                        <TextAreaField
                            label="Deskripsi"
                            value={step.desc}
                            onChange={(desc) => updateStep(step.id, { desc })}
                            rows={2}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}

/* --------------------------------- Footer --------------------------------- */

export function FooterEditor({
    value,
    onChange,
}: {
    value: LandingContent['footer'];
    onChange: Updater<LandingContent['footer']>;
}) {
    const updateSocial = (id: string, patch: Partial<SocialLink>) =>
        onChange({
            ...value,
            socials: value.socials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        });

    return (
        <div className="animate-fade-in space-y-5">
            <SectionHeader
                title="Footer"
                description="Identitas brand dan kontak yang tampil di bagian bawah halaman."
                action={
                    <AddButton
                        label="Tambah sosial"
                        onClick={() =>
                            onChange({
                                ...value,
                                socials: [
                                    ...value.socials,
                                    { id: uid('soc'), icon: 'mdi:link', href: '#' },
                                ],
                            })
                        }
                    />
                }
            />
            <div className="grid gap-3 md:grid-cols-2">
                <TextField
                    label="Nama brand"
                    value={value.brand}
                    onChange={(brand) => onChange({ ...value, brand })}
                />
                <TextField
                    label="Email"
                    value={value.email}
                    onChange={(email) => onChange({ ...value, email })}
                />
                <TextField
                    label="Alamat"
                    value={value.address}
                    onChange={(address) => onChange({ ...value, address })}
                    className="md:col-span-2"
                />
                <TextField
                    label="Telepon"
                    value={value.phone}
                    onChange={(phone) => onChange({ ...value, phone })}
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {value.socials.map((social) => (
                    <ItemCard
                        key={social.id}
                        title={<Icon icon={social.icon || 'mdi:link'} className="text-lg" />}
                        onRemove={() =>
                            onChange({
                                ...value,
                                socials: value.socials.filter((s) => s.id !== social.id),
                            })
                        }
                    >
                        <TextField
                            label="Ikon"
                            value={social.icon}
                            onChange={(icon) => updateSocial(social.id, { icon })}
                        />
                        <TextField
                            label="Tautan"
                            value={social.href}
                            onChange={(href) => updateSocial(social.id, { href })}
                        />
                    </ItemCard>
                ))}
            </div>
        </div>
    );
}
