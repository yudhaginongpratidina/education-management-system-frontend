import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

const plans = [
    {
        name: 'Reguler',
        price: 'Rp 250.000',
        sessions: '8 sesi / bulan',
        desc: 'Untuk pendampingan belajar rutin sepulang sekolah.',
        features: [
            '2 sesi per minggu (90 menit)',
            'Kelas maksimal 8 siswa',
            'Modul cetak + e-modul',
            'Kuis mingguan',
            'Laporan progres tiap 4 sesi',
        ],
        featured: false,
    },
    {
        name: 'Intensif',
        price: 'Rp 450.000',
        sessions: '12 sesi / bulan',
        desc: 'Persiapan ujian sekolah, UTBK, atau mengejar target nilai.',
        features: [
            '3 sesi per minggu (90 menit)',
            'Kelas maksimal 6 siswa',
            'Modul + bank soal terlengkap',
            'Try out bulanan & analisis nilai',
            'Sesi konsultasi orang tua',
        ],
        featured: true,
    },
    {
        name: 'Privat',
        price: 'Rp 750.000',
        sessions: '8 sesi / bulan',
        desc: 'Pendampingan satu lawan satu dengan jadwal fleksibel.',
        features: [
            'Jadwal bebas, termasuk akhir pekan',
            '1 siswa dibimbing 1 tutor',
            'Kurikulum disusun personal',
            'Laporan progres mingguan',
            'Bisa di cabang, rumah, atau online',
        ],
        featured: false,
    },
];

export default function Pricing() {
    return (
        <section className="bg-muted/40 py-20">
            <div className="container mx-auto px-4">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-primary mb-3 inline-block text-sm font-semibold tracking-wide uppercase">
                        Paket Belajar
                    </span>
                    <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                        Harga jelas sejak awal
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        Tanpa biaya tersembunyi. Pilih paket, bayar bulanan, bisa berhenti kapan
                        saja.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-3xl border p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft ${
                                plan.featured
                                    ? 'border-primary/40 bg-card ring-2 ring-primary/20'
                                    : 'border-border/60 bg-card'
                            }`}
                        >
                            {plan.featured && (
                                <span className="bg-brand-gradient absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground shadow-brand">
                                    Paling banyak dipilih
                                </span>
                            )}
                            <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
                            <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                                {plan.desc}
                            </p>
                            <div className="mt-5">
                                <div className="flex items-end gap-1">
                                    <span className="font-heading text-3xl font-bold">
                                        {plan.price}
                                    </span>
                                    <span className="pb-1 text-sm text-muted-foreground">
                                        /bulan
                                    </span>
                                </div>
                                <p className="text-primary mt-1 text-xs font-semibold tracking-wide uppercase">
                                    {plan.sessions}
                                </p>
                            </div>
                            <ul className="mt-6 mb-8 flex-1 space-y-3 text-sm">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2.5">
                                        <span className="bg-success/12 text-success mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                                            <Icon
                                                icon="mdi:check-bold"
                                                className="text-[0.625rem]"
                                            />
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant={plan.featured ? 'default' : 'outline'}
                                className="w-full"
                            >
                                Pilih Paket
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border/60 bg-card p-5 text-sm text-muted-foreground shadow-card">
                    <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
                        <Icon icon="mdi:tag-outline" className="text-primary text-lg" />
                        Potongan yang tersedia
                    </p>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                        <li>Bayar 3 bulan sekaligus: hemat 10%</li>
                        <li>Pendaftaran anak kedua: potongan 15%</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
