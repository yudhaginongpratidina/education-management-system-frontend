const stats = [
    { label: 'Siswa Aktif', value: '1.232' },
    { label: 'Program Belajar', value: '64' },
    { label: 'Kelas Tersedia', value: '42' },
    { label: 'Pengajar Ahli', value: '24' },
];

export default function Counts() {
    return (
        <section className="bg-brand-gradient py-16 text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="font-heading mb-1 text-4xl font-extrabold md:text-5xl">
                                {stat.value}
                            </div>
                            <p className="text-sm text-primary-foreground/80 md:text-base">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
