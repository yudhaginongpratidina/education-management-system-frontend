// Types and initial content for the landing page CMS (UI-first / demo data).

export function uid(prefix = 'item'): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export type HeroSlide = { id: string; title: string; desc: string; image: string };
export type HeroStat = { id: string; value: string; label: string };
export type TrustItem = { id: string; icon: string; label: string };
export type Feature = { id: string; icon: string; title: string; desc: string };
export type Milestone = { id: string; year: string; text: string };
export type Program = {
    id: string;
    title: string;
    level: string;
    price: string;
    duration: string;
    frequency: string;
    topics: string[];
    image: string;
    published: boolean;
};
export type MethodStep = {
    id: string;
    icon: string;
    title: string;
    duration: string;
    desc: string;
};
export type ScheduleRow = {
    id: string;
    program: string;
    days: string;
    time: string;
    type: string;
    quota: string;
};
export type Facility = { id: string; icon: string; title: string; desc: string };
export type PricingPlan = {
    id: string;
    name: string;
    price: string;
    sessions: string;
    desc: string;
    features: string[];
    featured: boolean;
};
export type Testimonial = {
    id: string;
    name: string;
    role: string;
    image: string;
    result: string;
    text: string;
};
export type BranchContent = {
    id: string;
    city: string;
    address: string;
    phone: string;
    wa: string;
    hours: string;
    programs: string;
};
export type Faq = { id: string; question: string; answer: string };
export type Article = {
    id: string;
    category: string;
    title: string;
    excerpt: string;
    date: string;
    read: string;
    image: string;
};
export type EnrollmentStep = { id: string; title: string; desc: string };
export type SocialLink = { id: string; icon: string; href: string };

export type LandingContent = {
    hero: {
        badge: string;
        slides: HeroSlide[];
        stats: HeroStat[];
        primaryCta: { label: string; href: string };
        secondaryCta: { label: string; href: string };
    };
    trust: TrustItem[];
    features: Feature[];
    about: {
        badgeYear: string;
        badgeLabel: string;
        heading: string;
        paragraph: string;
        points: string[];
        milestones: Milestone[];
    };
    programs: Program[];
    method: MethodStep[];
    schedule: ScheduleRow[];
    facilities: Facility[];
    pricing: {
        plans: PricingPlan[];
        discounts: string[];
    };
    testimonials: Testimonial[];
    branches: BranchContent[];
    faqs: Faq[];
    articles: Article[];
    enrollment: {
        steps: EnrollmentStep[];
        whatsapp: string;
        phone: string;
        hours: string;
    };
    footer: {
        brand: string;
        address: string;
        phone: string;
        email: string;
        socials: SocialLink[];
    };
};

export const initialContent: LandingContent = {
    hero: {
        badge: 'Bimbel modern untuk generasi cerdas',
        slides: [
            {
                id: 'slide-1',
                title: 'Belajar hari ini, berprestasi esok hari',
                desc: 'Bimbingan belajar berkualitas untuk jenjang SD, SMP, dan SMA dengan pengajar berpengalaman.',
                image: '/assets/img/hero-bg.jpg',
            },
            {
                id: 'slide-2',
                title: 'Kelas kecil, perhatian lebih',
                desc: 'Setiap siswa mendapat pendampingan personal agar konsep benar-benar dipahami, bukan sekadar dihafal.',
                image: '/assets/img/about.jpg',
            },
            {
                id: 'slide-3',
                title: 'Raih nilai terbaikmu bersama kami',
                desc: 'Program terstruktur, evaluasi rutin, dan laporan progres untuk orang tua.',
                image: '/assets/img/course-1.jpg',
            },
        ],
        stats: [
            { id: 'stat-1', value: '1.200+', label: 'Siswa aktif' },
            { id: 'stat-2', value: '64', label: 'Program belajar' },
            { id: 'stat-3', value: '24', label: 'Pengajar ahli' },
        ],
        primaryCta: { label: 'Lihat Program', href: '/course' },
        secondaryCta: { label: 'Konsultasi Gratis', href: '/contact' },
    },
    trust: [
        {
            id: 'trust-1',
            icon: 'mdi:shield-check-outline',
            label: 'Terdaftar resmi Dinas Pendidikan',
        },
        { id: 'trust-2', icon: 'mdi:book-education-outline', label: 'Kurikulum Merdeka & K13' },
        { id: 'trust-3', icon: 'mdi:star-outline', label: 'Rating 4,9/5 dari 1.240 ulasan' },
        { id: 'trust-4', icon: 'mdi:calendar-check-outline', label: 'Melayani sejak 2013' },
    ],
    features: [
        {
            id: 'feat-1',
            icon: 'mdi:teacher',
            title: 'Pengajar Berpengalaman',
            desc: 'Dibimbing tutor pilihan yang sabar dan menguasai materi.',
        },
        {
            id: 'feat-2',
            icon: 'mdi:account-group',
            title: 'Kelas Kecil',
            desc: 'Maksimal 8 siswa per kelas agar lebih fokus dan terarah.',
        },
        {
            id: 'feat-3',
            icon: 'mdi:clock-outline',
            title: 'Jadwal Fleksibel',
            desc: 'Pilih jadwal sesuai kesibukan sekolah dan kegiatanmu.',
        },
        {
            id: 'feat-4',
            icon: 'mdi:chart-line',
            title: 'Laporan Progres',
            desc: 'Pantau perkembangan belajar melalui laporan berkala.',
        },
    ],
    about: {
        badgeYear: '12',
        badgeLabel: 'tahun menemani belajar',
        heading: 'Berawal dari satu ruang kelas pada 2013',
        paragraph:
            'Saat itu hanya ada satu ruang kelas, satu papan tulis, dan dua belas anak yang datang sepulang sekolah. Yang kami pegang sejak awal sederhana: pahami dulu di mana anak kesulitan, baru ajar.',
        points: [
            'Kurikulum selaras dengan materi sekolah',
            'Setiap tutor menangani maksimal 3 kelas agar fokus',
            'Laporan progres terbuka untuk orang tua',
        ],
        milestones: [
            {
                id: 'ms-1',
                year: '2013',
                text: 'Dibuka di Jakarta dengan satu ruang kelas dan 12 siswa pertama.',
            },
            {
                id: 'ms-2',
                year: '2017',
                text: 'Cabang Bandung dibuka, modul belajar mulai disusun sendiri.',
            },
            {
                id: 'ms-3',
                year: '2021',
                text: 'Mengembangkan kelas online agar siswa tetap belajar saat pandemi.',
            },
            {
                id: 'ms-4',
                year: '2025',
                text: 'Tumbuh menjadi 4 cabang, 24 pengajar, dan 1.200+ siswa aktif.',
            },
        ],
    },
    programs: [
        {
            id: 'prog-1',
            title: 'Matematika Dasar & Olimpiade',
            level: 'SD – SMP',
            price: 'Rp 350.000',
            duration: '90 menit/sesi',
            frequency: '2x per minggu',
            topics: ['Bilangan & operasi', 'Aljabar dasar', 'Geometri', 'Soal cerita'],
            image: '/assets/img/course-1.jpg',
            published: true,
        },
        {
            id: 'prog-2',
            title: 'Bahasa Inggris Aktif',
            level: 'SMP – SMA',
            price: 'Rp 400.000',
            duration: '90 menit/sesi',
            frequency: '2x per minggu',
            topics: ['Speaking & pronunciation', 'Grammar', 'Reading', 'TOEFL dasar'],
            image: '/assets/img/course-2.jpg',
            published: true,
        },
        {
            id: 'prog-3',
            title: 'IPA Terpadu & Sains',
            level: 'SD – SMP',
            price: 'Rp 375.000',
            duration: '90 menit/sesi',
            frequency: '2x per minggu',
            topics: ['Fisika dasar', 'Biologi', 'Kimia dasar', 'Praktik sederhana'],
            image: '/assets/img/course-3.jpg',
            published: true,
        },
        {
            id: 'prog-4',
            title: 'Intensif UTBK',
            level: 'SMA Kelas 12 & Alumni',
            price: 'Rp 550.000',
            duration: '180 menit/sesi',
            frequency: '1x per minggu',
            topics: ['Penalaran umum', 'TPS kuantitatif', 'Literasi', 'Try out berkala'],
            image: '/assets/img/hero-bg.jpg',
            published: true,
        },
        {
            id: 'prog-5',
            title: 'Bahasa Indonesia & Menulis',
            level: 'SD – SMA',
            price: 'Rp 330.000',
            duration: '90 menit/sesi',
            frequency: '2x per minggu',
            topics: ['Membaca pemahaman', 'Menulis karangan', 'Tata bahasa', 'Karya ilmiah'],
            image: '/assets/img/course-details.jpg',
            published: true,
        },
        {
            id: 'prog-6',
            title: 'Calistung (Baca Tulis Hitung)',
            level: 'TK – SD awal',
            price: 'Rp 300.000',
            duration: '60 menit/sesi',
            frequency: '2x per minggu',
            topics: ['Mengenal huruf', 'Menulis permulaan', 'Berhitung', 'Permainan edukatif'],
            image: '/assets/img/about-2.jpg',
            published: true,
        },
    ],
    method: [
        {
            id: 'm-1',
            icon: 'mdi:clipboard-pulse-outline',
            title: 'Tes diagnostik',
            duration: '45 menit',
            desc: 'Siswa mengerjakan tes singkat untuk memetakan kemampuan awal dan bagian materi yang perlu diperkuat.',
        },
        {
            id: 'm-2',
            icon: 'mdi:map-outline',
            title: 'Rencana belajar personal',
            duration: '1–2 hari',
            desc: 'Tutor menyusun target dan urutan materi sesuai hasil tes, lalu mendiskusikannya dengan orang tua.',
        },
        {
            id: 'm-3',
            icon: 'mdi:account-group-outline',
            title: 'Kelas kecil & aktif',
            duration: '2–3 sesi/minggu',
            desc: 'Maksimal 8 siswa per kelas. Sekitar 70% waktu dipakai untuk latihan soal dan pembahasan langsung.',
        },
        {
            id: 'm-4',
            icon: 'mdi:chart-timeline-variant',
            title: 'Evaluasi & laporan',
            duration: 'Tiap 4 sesi',
            desc: 'Kuis mingguan dan laporan progres dikirim ke orang tua agar perkembangan belajar terpantau jelas.',
        },
    ],
    schedule: [
        {
            id: 'sch-1',
            program: 'SD (Kelas 1–6)',
            days: 'Senin & Rabu',
            time: '15.00 – 16.30',
            type: 'Reguler',
            quota: '8 siswa',
        },
        {
            id: 'sch-2',
            program: 'SMP (Kelas 7–9)',
            days: 'Selasa & Kamis',
            time: '16.00 – 17.30',
            type: 'Reguler',
            quota: '8 siswa',
        },
        {
            id: 'sch-3',
            program: 'SMA (Kelas 10–12)',
            days: 'Senin – Kamis',
            time: '17.00 – 18.30',
            type: 'Reguler',
            quota: '8 siswa',
        },
        {
            id: 'sch-4',
            program: 'Intensif UTBK',
            days: 'Sabtu',
            time: '09.00 – 12.00',
            type: 'Intensif',
            quota: '10 siswa',
        },
        {
            id: 'sch-5',
            program: 'Privat',
            days: 'Fleksibel',
            time: 'Sesuai kesepakatan',
            type: 'Privat',
            quota: '1 siswa',
        },
    ],
    facilities: [
        {
            id: 'fac-1',
            icon: 'mdi:air-conditioner',
            title: 'Ruang kelas ber-AC',
            desc: 'Kapasitas 8–10 kursi, pencahayaan cukup, dan sirkulasi udara yang nyaman.',
        },
        {
            id: 'fac-2',
            icon: 'mdi:book-open-page-variant-outline',
            title: 'Modul cetak & e-modul',
            desc: 'Ringkasan materi dan latihan soal, bisa diakses lewat ponsel setelah sesi selesai.',
        },
        {
            id: 'fac-3',
            icon: 'mdi:cctv',
            title: 'CCTV & ruang tunggu',
            desc: 'Orang tua bisa menunggu di ruang tunggu yang nyaman sambil memantau aktivitas kelas.',
        },
        {
            id: 'fac-4',
            icon: 'mdi:library-shelves',
            title: 'Perpustakaan mini',
            desc: 'Kumpulan buku latihan, ensiklopedia, dan komik edukasi untuk mengisi waktu sebelum kelas.',
        },
        {
            id: 'fac-5',
            icon: 'mdi:wifi',
            title: 'Wi-Fi & ruang diskusi',
            desc: 'Area belajar kelompok untuk mengerjakan tugas proyek atau diskusi soal bersama tutor.',
        },
        {
            id: 'fac-6',
            icon: 'mdi:food-apple-outline',
            title: 'Kantin sehat',
            desc: 'Menyediakan air minum dan makanan ringan dengan harga terjangkau bagi siswa.',
        },
    ],
    pricing: {
        plans: [
            {
                id: 'plan-1',
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
                id: 'plan-2',
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
                id: 'plan-3',
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
        ],
        discounts: ['Bayar 3 bulan sekaligus: hemat 10%', 'Pendaftaran anak kedua: potongan 15%'],
    },
    testimonials: [
        {
            id: 't-1',
            name: 'Ibu Sari',
            role: 'Orang tua siswa SMP',
            image: 'testimonials-1.jpg',
            result: 'Matematika 68 → 84',
            text: 'Awalnya saya ragu karena anak saya sudah les di tempat lain tapi tidak ada perkembangan. Setelah tiga bulan di sini, nilai matematikanya naik.',
        },
        {
            id: 't-2',
            name: 'Bima',
            role: 'Siswa SMA kelas 12',
            image: 'testimonials-2.jpg',
            result: 'Try out UTBK 512 → 578',
            text: 'Dulu saya selalu kehabisan waktu di bagian kuantitatif. Tutor mengajari urutan pengerjaan dan cara menandai soal sulit.',
        },
        {
            id: 't-3',
            name: 'Ibu Dewi',
            role: 'Orang tua siswa SD',
            image: 'testimonials-3.jpg',
            result: 'Naik peringkat 12 → 5',
            text: 'Anak saya tadinya takut pelajaran hitung-hitungan. Sekarang malah minta ditemani belajar karena soalnya jadi mudah dimengerti.',
        },
        {
            id: 't-4',
            name: 'Pak Hendra',
            role: 'Orang tua siswa SMP',
            image: 'testimonials-4.jpg',
            result: 'Kehadiran 100%',
            text: 'Yang paling membantu adalah laporan tiap empat sesi. Kami jadi tahu bagian mana yang masih lemah.',
        },
        {
            id: 't-5',
            name: 'Nadia',
            role: 'Siswa SMP kelas 9',
            image: 'testimonials-5.jpg',
            result: 'Nilai IPA 70 → 88',
            text: 'Tutornya sabar dan mau menjelaskan ulang kalau saya belum paham. Suasana kelasnya juga santai.',
        },
        {
            id: 't-6',
            name: 'Ibu Ratna',
            role: 'Orang tua alumni',
            image: 'testimonials-1.jpg',
            result: 'Diterima di SMAN favorit',
            text: 'Anak saya diterima lewat jalur prestasi. Terima kasih untuk bimbingan selama persiapan ujian.',
        },
    ],
    branches: [
        {
            id: 'br-1',
            city: 'Jakarta Selatan',
            address: 'Jl. Sudirman No. 123, Kebayoran Baru',
            phone: '(021) 555-0101',
            wa: '6281234567801',
            hours: 'Senin–Sabtu, 08.00–20.00',
            programs: 'Calistung, SD, SMP, SMA, UTBK',
        },
        {
            id: 'br-2',
            city: 'Bandung',
            address: 'Jl. Braga No. 45, Sumur Bandung',
            phone: '(022) 555-0202',
            wa: '6281234567802',
            hours: 'Senin–Sabtu, 08.00–20.00',
            programs: 'SD, SMP, SMA, Privat',
        },
        {
            id: 'br-3',
            city: 'Surabaya',
            address: 'Jl. Basuki Rahmat No. 78, Tegalsari',
            phone: '(031) 555-0303',
            wa: '6281234567803',
            hours: 'Senin–Sabtu, 09.00–20.00',
            programs: 'SD, SMP, SMA, UTBK',
        },
        {
            id: 'br-4',
            city: 'Yogyakarta',
            address: 'Jl. Malioboro No. 90, Gedongtengen',
            phone: '(0274) 555-0404',
            wa: '6281234567804',
            hours: 'Senin–Jumat, 09.00–19.00',
            programs: 'SD, SMP, SMA, Privat',
        },
    ],
    faqs: [
        {
            id: 'faq-1',
            question: 'Apakah ada kelas percobaan gratis?',
            answer: 'Ada. Setiap calon siswa mendapat satu sesi percobaan gratis setelah mengikuti tes diagnostik.',
        },
        {
            id: 'faq-2',
            question: 'Bagaimana cara memantau perkembangan anak?',
            answer: 'Laporan progres dikirim setiap empat sesi melalui WhatsApp, berisi catatan tutor dan hasil kuis.',
        },
        {
            id: 'faq-3',
            question: 'Berapa jumlah siswa dalam satu kelas?',
            answer: 'Kelas reguler maksimal 8 siswa, kelas intensif maksimal 6 siswa, dan kelas privat 1 siswa dengan 1 tutor.',
        },
        {
            id: 'faq-4',
            question: 'Kalau berhalangan, apakah jadwal bisa diganti?',
            answer: 'Bisa. Beri tahu admin minimal satu hari sebelumnya, lalu sesi dapat dipindahkan ke kelas lain yang setara.',
        },
        {
            id: 'faq-5',
            question: 'Apakah tersedia kelas online?',
            answer: 'Tersedia, terutama untuk program privat dan beberapa kelas reguler.',
        },
        {
            id: 'faq-6',
            question: 'Bagaimana sistem pembayarannya?',
            answer: 'Pembayaran dilakukan bulanan di awal periode melalui transfer atau tunai di cabang.',
        },
        {
            id: 'faq-7',
            question: 'Apakah ada biaya pendaftaran?',
            answer: 'Ada, sebesar Rp 50.000 sekali bayar. Sudah termasuk modul belajar pertama.',
        },
    ],
    articles: [
        {
            id: 'art-1',
            category: 'Tips Belajar',
            title: '5 kebiasaan kecil yang membuat belajar di rumah lebih efektif',
            excerpt: 'Mulai dari menyiapkan meja belajar sampai teknik jeda 25 menit.',
            date: '12 Feb 2026',
            read: '6 menit',
            image: '/assets/img/course-1.jpg',
        },
        {
            id: 'art-2',
            category: 'Untuk Orang Tua',
            title: 'Mendampingi anak belajar tanpa membuatnya merasa ditekan',
            excerpt: 'Peran orang tua bukan sekadar menagih nilai. Berikut cara memberi dukungan.',
            date: '28 Jan 2026',
            read: '5 menit',
            image: '/assets/img/about.jpg',
        },
        {
            id: 'art-3',
            category: 'UTBK & Ujian',
            title: 'Strategi mengerjakan soal UTBK agar tidak kehabisan waktu',
            excerpt: 'Urutan pengerjaan, cara menandai soal sulit, dan manajemen menit per subtes.',
            date: '9 Jan 2026',
            read: '7 menit',
            image: '/assets/img/course-3.jpg',
        },
    ],
    enrollment: {
        steps: [
            {
                id: 'en-1',
                title: 'Isi formulir',
                desc: 'Daftar online atau langsung di cabang terdekat.',
            },
            {
                id: 'en-2',
                title: 'Tes diagnostik',
                desc: 'Gratis 45 menit untuk memetakan kemampuan awal.',
            },
            {
                id: 'en-3',
                title: 'Pilih jadwal',
                desc: 'Tentukan kelas dan jam yang sesuai hasil tes.',
            },
            {
                id: 'en-4',
                title: 'Mulai belajar',
                desc: 'Sesi pertama bisa dicoba gratis tanpa komitmen.',
            },
        ],
        whatsapp: '6281234567890',
        phone: '0812-3456-7890',
        hours: 'Senin–Sabtu, 08.00–20.00',
    },
    footer: {
        brand: 'Bimbel Cerdas',
        address: 'Jl. Sudirman No. 123, Jakarta, Indonesia',
        phone: '(021) 555-0101',
        email: 'halo@bimbelcerdas.id',
        socials: [
            { id: 'soc-1', icon: 'mdi:twitter', href: '#' },
            { id: 'soc-2', icon: 'mdi:facebook', href: '#' },
            { id: 'soc-3', icon: 'mdi:instagram', href: '#' },
            { id: 'soc-4', icon: 'mdi:linkedin', href: '#' },
        ],
    },
};
