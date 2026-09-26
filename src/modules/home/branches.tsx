import { Icon } from '@iconify/react';

const branches = [
    {
        city: 'Jakarta Selatan',
        address: 'Jl. Sudirman No. 123, Kebayoran Baru',
        phone: '(021) 555-0101',
        wa: '6281234567801',
        hours: 'Senin–Sabtu, 08.00–20.00',
        programs: 'Calistung, SD, SMP, SMA, UTBK',
    },
    {
        city: 'Bandung',
        address: 'Jl. Braga No. 45, Sumur Bandung',
        phone: '(022) 555-0202',
        wa: '6281234567802',
        hours: 'Senin–Sabtu, 08.00–20.00',
        programs: 'SD, SMP, SMA, Privat',
    },
    {
        city: 'Surabaya',
        address: 'Jl. Basuki Rahmat No. 78, Tegalsari',
        phone: '(031) 555-0303',
        wa: '6281234567803',
        hours: 'Senin–Sabtu, 09.00–20.00',
        programs: 'SD, SMP, SMA, UTBK',
    },
    {
        city: 'Yogyakarta',
        address: 'Jl. Malioboro No. 90, Gedongtengen',
        phone: '(0274) 555-0404',
        wa: '6281234567804',
        hours: 'Senin–Jumat, 09.00–19.00',
        programs: 'SD, SMP, SMA, Privat',
    },
];

export default function Branches() {
    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Cabang Kami
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Empat cabang, satu standar kualitas
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Setiap cabang dikelola dengan kurikulum dan standar pengajaran yang sama.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {branches.map((branch) => (
                        <div
                            key={branch.city}
                            className="rounded-2xl border border-border/60 bg-card p-6 shadow-card transition-colors hover:border-primary/30"
                        >
                            <div className="mb-4 flex items-start gap-4">
                                <div className="bg-brand-gradient-soft text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl">
                                    <Icon
                                        icon="mdi:office-building-marker-outline"
                                        className="text-2xl"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-heading text-lg font-semibold">
                                        {branch.city}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {branch.address}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{branch.hours}</p>
                                </div>
                            </div>

                            <div className="mb-4 flex flex-wrap gap-2">
                                {branch.programs.split(', ').map((program) => (
                                    <span
                                        key={program}
                                        className="bg-primary/10 text-primary rounded-full px-2.5 py-1 text-xs font-medium"
                                    >
                                        {program}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                                    <Icon icon="mdi:phone-outline" className="text-primary" />
                                    {branch.phone}
                                </span>
                                <div className="flex gap-2">
                                    <a
                                        href={`https://wa.me/${branch.wa}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-brand-gradient inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-transparent hover:text-primary-foreground"
                                    >
                                        <Icon icon="mdi:whatsapp" className="text-base" />
                                        WhatsApp
                                    </a>
                                    <a
                                        href="#"
                                        className="hover:bg-brand-gradient inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-transparent hover:text-primary-foreground"
                                    >
                                        <Icon icon="mdi:map-marker-outline" className="text-base" />
                                        Lihat peta
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
