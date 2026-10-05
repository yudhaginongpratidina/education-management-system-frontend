'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <span className="bg-brand-gradient text-primary-foreground font-heading flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-brand">
                {n}
            </span>
            <div className="min-w-0 space-y-1">
                <p className="font-medium">{title}</p>
                <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

function Info({ children, tone = 'info' }: { children: React.ReactNode; tone?: string }) {
    const tones: Record<string, string> = {
        info: 'border-info/30 bg-info/5 text-info',
        warning: 'border-warning/30 bg-warning/5 text-warning',
        success: 'border-success/30 bg-success/5 text-success',
    };
    return (
        <div className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${tones[tone]}`}>
            <Icon icon="mdi:information-outline" className="mt-0.5 shrink-0 text-base" />
            <span className="text-foreground/80">{children}</span>
        </div>
    );
}

function GuideLink({
    href,
    icon,
    title,
    description,
}: {
    href: string;
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="hover:border-primary/40 group flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
        >
            <span className="bg-brand-gradient-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon icon={icon} className="text-xl" />
            </span>
            <div className="min-w-0">
                <p className="font-heading text-sm font-semibold">{title}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Icon
                icon="mdi:arrow-right"
                className="text-muted-foreground group-hover:text-primary ml-auto mt-1 shrink-0"
            />
        </Link>
    );
}

function FlowStep({ label }: { label: string }) {
    return (
        <span className="bg-muted rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap">
            {label}
        </span>
    );
}

export default function UserGuide() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            {/* HEADER */}
            <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-primary-foreground shadow-brand md:p-8">
                <div className="grid-pattern absolute inset-0 opacity-15" />
                <div className="relative space-y-2">
                    <div className="flex items-center gap-2">
                        <Icon icon="mdi:book-open-page-variant-outline" className="text-2xl" />
                        <span className="text-sm text-primary-foreground/80">Panduan Pengguna</span>
                    </div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
                        Cara Menggunakan EMS Bimbel Management
                    </h1>
                    <p className="max-w-3xl text-sm text-primary-foreground/85">
                        Panduan lengkap dari awal sampai akhir: menyiapkan data master, pendaftaran
                        siswa, kelas &amp; jadwal, sesi pembelajaran, absensi, reschedule, laporan
                        keuangan, aset, hingga halaman publik.
                    </p>
                </div>
            </div>

            {/* ALUR UMUM */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Icon icon="mdi:sitemap-outline" className="text-primary text-lg" />
                        Alur Besar Sistem
                    </CardTitle>
                    <CardDescription>Urutan pengerjaan yang disarankan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                        <FlowStep label="1. Data Master" />
                        <Icon icon="mdi:chevron-right" />
                        <FlowStep label="2. Pendaftaran Siswa" />
                        <Icon icon="mdi:chevron-right" />
                        <FlowStep label="3. Kelas & Guru" />
                        <Icon icon="mdi:chevron-right" />
                        <FlowStep label="4. Jadwal & Sesi" />
                        <Icon icon="mdi:chevron-right" />
                        <FlowStep label="5. Absensi & Reschedule" />
                        <Icon icon="mdi:chevron-right" />
                        <FlowStep label="6. Laporan & Keuangan" />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="mulai">
                <TabsList className="flex flex-wrap">
                    <TabsTrigger value="mulai">Mulai</TabsTrigger>
                    <TabsTrigger value="master">Data Master</TabsTrigger>
                    <TabsTrigger value="akademik">Akademik</TabsTrigger>
                    <TabsTrigger value="guru">Guru</TabsTrigger>
                    <TabsTrigger value="laporan">Laporan & Keuangan</TabsTrigger>
                    <TabsTrigger value="asetcms">Aset & CMS</TabsTrigger>
                    <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>

                {/* ================= MULAI ================= */}
                <TabsContent value="mulai" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <GuideLink
                            href="/student-registration"
                            icon="mdi:account-plus-outline"
                            title="Pendaftaran Siswa Baru"
                            description="Mulai dari sini: daftarkan siswa lalu assign program."
                        />
                        <GuideLink
                            href="/class-management"
                            icon="mdi:google-classroom"
                            title="Manajemen Kelas"
                            description="Buat kelas untuk program tertentu, tambah siswa & guru."
                        />
                        <GuideLink
                            href="/class-session"
                            icon="mdi:calendar-clock"
                            title="Sesi Pembelajaran"
                            description="Buat sesi, absensi, jadwalkan ulang."
                        />
                        <GuideLink
                            href="/reports"
                            icon="mdi:file-chart-outline"
                            title="Laporan"
                            description="Absensi guru/siswa, sesi, dan reschedule."
                        />
                        <GuideLink
                            href="/cashflow"
                            icon="mdi:cash-multiple"
                            title="Cashflow / Keuangan"
                            description="Catat uang masuk & keluar, lihat grafik."
                        />
                        <GuideLink
                            href="/asset-management"
                            icon="mdi:package-variant-closed"
                            title="Asset Management"
                            description="Kelola aset, kategori, dan riwayat perpindahan."
                        />
                    </div>
                    <Info>
                        Sebagian menu muncul di sidebar sesuai peran (role) Anda. Jika tidak
                        menemukan menu, buka langsung lewat tautan di atas atau minta admin
                        menambahkan akses menu.
                    </Info>
                </TabsContent>

                {/* ================= DATA MASTER ================= */}
                <TabsContent value="master" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Langkah 1 — Siapkan Data Master
                            </CardTitle>
                            <CardDescription>
                                Dilakukan sekali di awal (oleh admin / kepala sekolah).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <Step n={1} title="Cabang">
                                Buat cabang di <Badge variant="secondary">Cabang Management</Badge>.
                                Cabang akan dipakai untuk membatasi kelas dan siswa. Isi alamat &
                                titik koordinat bila tersedia (dipakai untuk absensi guru).
                            </Step>
                            <Step n={2} title="Program & Level">
                                Buat <Badge variant="secondary">Program</Badge> (misal Matematika,
                                Bahasa Inggris), lalu tentukan <b>Level</b> di dalam program (misal
                                Level 1, Level 2).
                            </Step>
                            <Step n={3} title="Paket (durasi & intensitas)">
                                Di <Badge variant="secondary">Program Package</Badge>, isi{' '}
                                <b>durasi (bulan)</b>, <b>jumlah sesi per periode</b>, dan{' '}
                                <b>periode</b> (mingguan / bulanan / total durasi). Ini yang
                                menentukan <b>total sesi</b> siswa nanti.
                            </Step>
                            <Step n={4} title="Guru">
                                Tambah guru di <Badge variant="secondary">Manajemen Guru</Badge>,
                                lalu tugaskan <b>program</b> yang diampu dan <b>cabang</b> tempat
                                mengajar.
                            </Step>
                            <Step n={5} title="Siswa">
                                Data siswa dibuat saat pendaftaran (langkah berikutnya), atau
                                langsung di <Badge variant="secondary">Manajemen Siswa</Badge>.
                            </Step>
                            <Info tone="warning">
                                Aturan penting: siswa hanya bisa ditambahkan ke kelas dan sesi jika
                                ia mengambil <b>program</b> yang sama dengan kelas tersebut.
                            </Info>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ================= AKADEMIK ================= */}
                <TabsContent value="akademik" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Langkah 2 — Daftarkan Siswa</CardTitle>
                            <CardDescription>
                                Menu: Pendaftaran Siswa Baru / Manajemen Siswa.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Isi data siswa & orang tua">
                                Lengkapi nama, sekolah, dan kontak wali.
                            </Step>
                            <Step n={2} title="Assign program">
                                Pilih <b>cabang</b>, <b>program</b>, <b>paket</b>, dan <b>level</b>.
                            </Step>
                            <Step n={3} title="Tanggal otomatis dari paket">
                                Setelah <b>tanggal mulai</b> diisi, sistem menghitung otomatis:
                                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                                    <li>Tanggal selesai = tanggal mulai + durasi paket</li>
                                    <li>Total sesi = durasi × intensitas pertemuan</li>
                                </ul>
                                Tanggal selesai tidak bisa diubah manual.
                            </Step>
                            <Info>
                                Buka tombol <b>Ringkasan Paket</b> pada daftar program siswa untuk
                                melihat pemakaian sesi (terpakai / total / sisa).
                            </Info>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Langkah 3 — Kelas & Guru</CardTitle>
                            <CardDescription>Menu: Manajemen Kelas.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Buat kelas">
                                Pilih <b>cabang</b> dan <b>program</b> kelas (opsional level). Kelas
                                ini khusus untuk siswa dari program tersebut.
                            </Step>
                            <Step n={2} title="Tambah siswa ke kelas">
                                Hanya siswa yang mengambil program kelas yang muncul, lengkap dengan
                                <b> asal cabang</b> dan <b>sisa sesi</b>.
                            </Step>
                            <Step n={3} title="Tugaskan guru">
                                Tambahkan guru utama (dan guru pengganti bila perlu) pada kelas.
                            </Step>
                            <Step n={4} title="Atur jadwal rutin">
                                Isi <b>Jadwal Kelas</b> (hari & jam) sebagai template mingguan.
                            </Step>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Langkah 4 — Sesi Pembelajaran
                            </CardTitle>
                            <CardDescription>Menu: Sesi Pembelajaran.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Buat sesi">
                                <b>Tambah Sesi</b> untuk satu sesi, <b>Tambah Banyak</b> untuk
                                beberapa tanggal &amp; jam sekaligus, atau <b>Generate</b> dari
                                jadwal rutin.
                            </Step>
                            <Step n={2} title="Pilih peserta">
                                Sistem menampilkan hanya siswa kelas yang masih punya{' '}
                                <b>sisa sesi</b>. Siswa yang kuotanya penuh otomatis dinonaktifkan.
                            </Step>
                            <Info tone="warning">
                                Jika siswa sudah memenuhi total sesi paketnya, ia <b>tidak bisa</b>{' '}
                                ditambahkan ke sesi baru — kecuali lewat <b>reschedule</b>.
                            </Info>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Langkah 5 — Absensi & Reschedule
                            </CardTitle>
                            <CardDescription>
                                Dilakukan per sesi pada menu Sesi Pembelajaran.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Absensi siswa">
                                Klik ikon <b>Peserta Sesi</b> pada baris sesi, ubah status kehadiran
                                (Hadir/Alfa/Sakit/Izin), atau <b>Tandai Semua Hadir</b>.
                            </Step>
                            <Step n={2} title="Jadwalkan ulang sesi">
                                Klik ikon <b>Jadwalkan Ulang</b>. Tanggal baru wajib masih dalam
                                periode paket siswa (ada opsi paksa bila perlu).
                            </Step>
                            <Step n={3} title="Guru pengganti">
                                Klik ikon <b>Guru Pengganti</b> untuk menetapkan guru pengganti
                                (hanya guru yang terdaftar sebagai pengganti kelas tsb).
                            </Step>
                            <Step n={4} title="Jadwalkan ulang siswa (make-up)">
                                Di dialog Peserta Sesi, klik tombol <b>jadwalkan ulang siswa</b>{' '}
                                untuk memindahkan sesi seorang siswa. Ini <b>tidak</b> memakai kuota
                                baru.
                            </Step>
                            <Step n={5} title="Riwayat">
                                Tombol <b>Riwayat</b> menampilkan jejak semua reschedule
                                (sesi/guru/siswa).
                            </Step>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ================= GURU ================= */}
                <TabsContent value="guru" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Untuk Guru / Pengajar</CardTitle>
                            <CardDescription>
                                Guru login dengan akunnya sendiri (role: guru).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Buka Kelas Saya">
                                Menu <Badge variant="secondary">Kelas Saya</Badge> (`/my-sessions`)
                                menampilkan jadwal mengajar dan daftar sesi milik guru yang login.
                            </Step>
                            <Step n={2} title="Kelola sesi sendiri">
                                Mulai sesi (Mulai), tandai selesai (Selesai), absensi siswa, dan
                                lihat lokasi/cabang kelas.
                            </Step>
                            <Step n={3} title="Absensi guru">
                                Menu <Badge variant="secondary">Absensi Saya</Badge> untuk check-in
                                dan check-out (datang &amp; pulang). Durasi dihitung otomatis.
                            </Step>
                            <Info>
                                Guru hanya melihat sesi yang ditugaskan kepadanya. Jadwal ulang dan
                                pergantian guru dilakukan oleh admin.
                            </Info>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ================= LAPORAN & KEUANGAN ================= */}
                <TabsContent value="laporan" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Laporan</CardTitle>
                            <CardDescription>Menu: Laporan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Pilih periode & cabang">
                                Atur tanggal dari–sampai dan cabang di bagian atas.
                            </Step>
                            <Step n={2} title="Lihat per jenis">
                                Tab <b>Absensi Guru</b> (datang, keluar, durasi),{' '}
                                <b>Absensi Siswa</b> (rekap/detail), <b>Sesi</b>, dan{' '}
                                <b>Reschedule</b>.
                            </Step>
                            <Step n={3} title="Export Excel">
                                Klik tombol <b>Export</b> pada tiap tab untuk mengunduh file Excel.
                            </Step>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Cashflow / Keuangan</CardTitle>
                            <CardDescription>Menu: Cashflow.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Tambah transaksi">
                                Isi <b>Keterangan</b>, <b>Jenis</b> (Masuk/Keluar), <b>Nominal</b>,
                                kategori, cabang, dan metode pembayaran.
                            </Step>
                            <Step n={2} title="Pantau saldo">
                                Kartu ringkasan menampilkan <b>Masuk</b>, <b>Keluar</b>, dan{' '}
                                <b>Sisa</b>. Kolom Sisa pada tabel adalah saldo berjalan.
                            </Step>
                            <Step n={3} title="Grafik & export">
                                Grafik 12 bulan membandingkan uang masuk &amp; keluar. Gunakan{' '}
                                <b>Export Excel</b> untuk laporan.
                            </Step>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Dashboard</CardTitle>
                            <CardDescription>Menu: Dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            Ringkasan operasional: jumlah siswa &amp; guru aktif, tren pendaftaran,
                            aktivitas sesi, kehadiran, performa cabang, program terpopuler, dan
                            peringatan yang butuh tindakan.
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ================= ASET & CMS ================= */}
                <TabsContent value="asetcms" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Asset Management</CardTitle>
                            <CardDescription>Menu: Asset Management.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Buat kategori">
                                Isi nama kategori dan <b>prefix kode</b> (misal ELK) — dipakai untuk
                                kode aset otomatis.
                            </Step>
                            <Step n={2} title="Tambah aset">
                                Isi nama, kategori, nilai, tanggal perolehan, dan umur maksimal.
                                Sistem menghitung <b>umur</b> &amp; <b>sisa umur</b> otomatis. Kode
                                aset dibuat otomatis (mis. ELK-00001).
                            </Step>
                            <Step n={3} title="Lengkapi kondisi & lokasi">
                                Atur kondisi (Baik/Rusak), status, cabang/lokasi, dan penanggung
                                jawab.
                            </Step>
                            <Step n={4} title="Catat perpindahan">
                                Buka detail aset → <b>Catat Perpindahan</b> untuk memindahkan
                                lokasi/ pengguna. Riwayatnya tersimpan.
                            </Step>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Landing Page CMS</CardTitle>
                            <CardDescription>Menu: Landing Page CMS.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Step n={1} title="Edit konten">
                                Pilih bagian (Hero, Keunggulan, Tentang, Program, Harga, Testimoni,
                                FAQ, Pendaftaran, Footer, dll).
                            </Step>
                            <Step n={2} title="Simpan">
                                Klik <b>Simpan</b>. Perubahan langsung dipakai halaman publik.
                            </Step>
                            <Step n={3} title="Tim Pengajar otomatis">
                                Bagian <b>Tim Pengajar</b> di halaman publik diambil otomatis dari
                                data guru (yang masih aktif) beserta program yang diampu.
                            </Step>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ================= FAQ ================= */}
                <TabsContent value="faq" className="space-y-4">
                    <Card>
                        <CardContent className="space-y-4 pt-5">
                            <div>
                                <p className="font-medium">
                                    Kenapa siswa tertentu tidak muncul saat menambah ke kelas?
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Kelas terikat pada satu program. Hanya siswa yang mengambil
                                    program tersebut (dan belum menjadi anggota aktif) yang muncul.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Kenapa siswa tidak bisa ditambahkan ke sesi baru?
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Kuota sesi paketnya sudah habis. Gunakan <b>reschedule</b> untuk
                                    memindahkan sesinya, atau perpanjang/perbarui paketnya.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Tanggal selesai program kok tidak bisa diubah?
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Tanggal selesai dihitung otomatis dari tanggal mulai + durasi
                                    paket. Ubah paket bila perlu menyesuaikan durasi.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Guru pengganti saya tidak ada di daftar?
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Guru harus ditugaskan sebagai <b>pengganti</b> pada kelas itu
                                    dan aktif pada tanggal sesi.
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">
                                    Grafik/laporan kosong padahal ada data?
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Periksa rentang tanggal (default: bulan berjalan). Data di luar
                                    rentang tidak akan tampil.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
