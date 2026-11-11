export interface FontOption {
    id: string;
    name: string;
    category: 'sans' | 'serif' | 'handwriting';
    fontFamily: string;
    description: string;
    sampleText?: string;
    badge?: string;
}

export const FONT_OPTIONS: FontOption[] = [
    {
        id: 'plus-jakarta',
        name: 'Plus Jakarta Sans',
        category: 'sans',
        fontFamily:
            "var(--font-sans), 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        description: 'Standar resmi BANYAN EMS, modern, bersih & mudah dibaca.',
        sampleText: 'Pendidikan Berkualitas untuk Masa Depan Gemilang 12345',
        badge: 'Default',
    },
    {
        id: 'times-new-roman',
        name: 'Times New Roman',
        category: 'serif',
        fontFamily: "'Times New Roman Local', 'Times New Roman', 'Liberation Serif', Times, serif",
        description: 'Serif klasik, formal & akademis untuk administrasi dan laporan.',
        sampleText: 'Sistem Informasi Manajemen Bimbingan Belajar & Kurikulum 12345',
        badge: 'Klasik',
    },
    {
        id: 'arial',
        name: 'Arial',
        category: 'sans',
        fontFamily: "'Arial Local', Arial, 'Liberation Sans', Helvetica, sans-serif",
        description: 'Sans-serif netral, sederhana & kompatibel di seluruh perangkat.',
        sampleText: 'Pengelolaan Data Guru, Siswa, Kelas & Presensi Harian 12345',
        badge: 'Netral',
    },
    // Handwriting / Cursive
    {
        id: 'caveat',
        name: 'Caveat',
        category: 'handwriting',
        fontFamily: "'Caveat Local', cursive, sans-serif",
        description: 'Tulisan spidol santai, luwes dan ramah seperti coretan catatan bimbel.',
        sampleText: 'Catatan Belajar: Jangan lupa kerjakan tugas Bab 3 hari ini! 12345',
        badge: 'Tulisan Tangan',
    },
    {
        id: 'dancing-script',
        name: 'Dancing Script',
        category: 'handwriting',
        fontFamily: "'Dancing Script Local', cursive, sans-serif",
        description: 'Tulisan bersambung (cursive) yang lincah, berenergi dan artistik.',
        sampleText: 'Selamat Datang di Portal Edukasi BANYAN Excellence 12345',
        badge: 'Cursive',
    },
    {
        id: 'patrick-hand',
        name: 'Patrick Hand',
        category: 'handwriting',
        fontFamily: "'Patrick Hand Local', cursive, sans-serif",
        description:
            'Gaya tulisan tangan guru di papan tulis, sangat cocok untuk bimbel & sekolah.',
        sampleText: 'Rangkuman Materi: Persiapan Ujian Tengah Semester Gasal 12345',
        badge: 'Papan Tulis',
    },
    {
        id: 'kalam',
        name: 'Kalam',
        category: 'handwriting',
        fontFamily: "'Kalam Local', cursive, sans-serif",
        description: 'Tulisan tangan bolpoin modern dengan ketebalan goresan alami.',
        sampleText: 'Mari Bersama Meraih Impian dan Prestasi Akademik Terbaik 12345',
        badge: 'Bolpoin',
    },
    {
        id: 'indie-flower',
        name: 'Indie Flower',
        category: 'handwriting',
        fontFamily: "'Indie Flower Local', cursive, sans-serif",
        description: 'Tulisan tangan riang dan bebas dengan gelembung kurva bersahabat.',
        sampleText: 'Jadwal Kursus & Try Out Akbar BANYAN Bimbel 12345',
        badge: 'Riang',
    },
    {
        id: 'shadows-into-light',
        name: 'Shadows Into Light',
        category: 'handwriting',
        fontFamily: "'Shadows Into Light Local', cursive, sans-serif",
        description: 'Tulisan tangan ramping, rapi, dan bersih dengan lekukan manis.',
        sampleText: 'Semangat belajar setiap hari untuk masa depan cerah 12345',
        badge: 'Ramping',
    },
    {
        id: 'pacifico',
        name: 'Pacifico',
        category: 'handwriting',
        fontFamily: "'Pacifico Local', cursive, sans-serif",
        description: 'Gaya kuas tebal (brush script) yang santai, retro, dan berkarakter.',
        sampleText: 'Bimbel Hebat, Siswa Berbakat & Guru Hebat 12345',
        badge: 'Kuas',
    },
    {
        id: 'courgette',
        name: 'Courgette',
        category: 'handwriting',
        fontFamily: "'Courgette Local', cursive, sans-serif",
        description: 'Tulisan miring tebal-tipis elegan dengan keterbacaan yang sangat baik.',
        sampleText: 'Pemberitahuan Kelulusan dan Evaluasi Prestasi Siswa 12345',
        badge: 'Elegan',
    },
    {
        id: 'great-vibes',
        name: 'Great Vibes',
        category: 'handwriting',
        fontFamily: "'Great Vibes Local', cursive, serif",
        description: 'Kaligrafi kursif anggun dan mewah untuk piagam serta sertifikat.',
        sampleText: 'Piagam Penghargaan Siswa Berprestasi Tingkat Nasional 12345',
        badge: 'Kaligrafi',
    },
    {
        id: 'sacramento',
        name: 'Sacramento',
        category: 'handwriting',
        fontFamily: "'Sacramento Local', cursive, sans-serif",
        description: 'Tulisan sambung ramping terinspirasi tipografi era 1950-an.',
        sampleText: 'Bimbingan Belajar Berkualitas dan Berdedikasi Tinggi 12345',
        badge: 'Anggun',
    },
    {
        id: 'marck-script',
        name: 'Marck Script',
        category: 'handwriting',
        fontFamily: "'Marck Script Local', cursive, sans-serif",
        description: 'Tulisan pena bulu dengan goresan luwes dan natural.',
        sampleText: 'Laporan Perkembangan Belajar Siswa Semester Genap 12345',
        badge: 'Pena Bulu',
    },
    {
        id: 'amatic-sc',
        name: 'Amatic SC',
        category: 'handwriting',
        fontFamily: "'Amatic SC Local', cursive, sans-serif",
        description: 'Huruf kapital ramping dan tinggi ala poster buatan tangan.',
        sampleText: 'PENGUMUMAN JADWAL UJIAN DAN WORKSHOP SISWA 12345',
        badge: 'Poster',
    },
    // Sans-Serif Modern
    {
        id: 'inter',
        name: 'Inter',
        category: 'sans',
        fontFamily: "'Inter Local', Inter, system-ui, sans-serif",
        description: 'Tipografi modern yang dirancang presisi untuk layar komputer & HP.',
        sampleText: 'Manajemen Keuangan, SPP Siswa & Honor Pengajar Bimbel 12345',
        badge: 'Modern UI',
    },
    {
        id: 'roboto',
        name: 'Roboto',
        category: 'sans',
        fontFamily: "'Roboto Local', Roboto, system-ui, sans-serif",
        description: 'Sans-serif neo-grotesque yang seimbang dan sangat populer.',
        sampleText: 'Dashboard Analisis Kehadiran Siswa dan Kinerja Pengajar 12345',
        badge: 'Populer',
    },
    {
        id: 'poppins',
        name: 'Poppins',
        category: 'sans',
        fontFamily: "'Poppins Local', Poppins, system-ui, sans-serif",
        description: 'Sans-serif geometris dengan lingkaran sempurna dan kesan bersahabat.',
        sampleText: 'Sistem Pembelajaran Terpadu & Jadwal Kelas Fleksibel 12345',
        badge: 'Geometris',
    },
    {
        id: 'open-sans',
        name: 'Open Sans',
        category: 'sans',
        fontFamily: "'Open Sans Local', 'Open Sans', system-ui, sans-serif",
        description: 'Sans-serif humanis dengan bentuk terbuka yang sangat nyaman di mata.',
        sampleText: 'Komunikasi Orang Tua, Siswa & Pembimbing Akademik 12345',
        badge: 'Humanis',
    },
    // Serif
    {
        id: 'merriweather',
        name: 'Merriweather',
        category: 'serif',
        fontFamily: "'Merriweather Local', Merriweather, Georgia, serif",
        description:
            'Serif berbobot sedang yang dirancang khusus untuk kenyamanan membaca teks panjang.',
        sampleText: 'Modul Teori dan Kumpulan Latihan Soal Ujian Nasional 12345',
        badge: 'Editorial',
    },
    {
        id: 'playfair-display',
        name: 'Playfair Display',
        category: 'serif',
        fontFamily: "'Playfair Display Local', 'Playfair Display', Georgia, serif",
        description: 'Serif kontras tinggi dengan nuansa berkelas dan prestisius.',
        sampleText: 'Akademi Prestasi Siswa & Pelatihan Olimpiade Sains 12345',
        badge: 'Prestisius',
    },
];

export function getFontConfig(fontId?: string): FontOption {
    if (!fontId) return FONT_OPTIONS[0];
    const found = FONT_OPTIONS.find((f) => f.id === fontId);
    return found || FONT_OPTIONS[0];
}
