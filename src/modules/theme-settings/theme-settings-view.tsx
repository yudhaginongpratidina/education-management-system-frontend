'use client';

import React, { useState, useRef } from 'react';
import { useCustomTheme, THEME_PRESETS } from '@/lib/theme-context';
import { FONT_OPTIONS, getFontConfig } from '@/lib/font-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { toast } from '@/components/ui/toast';
import { AppLogo } from '@/components/app-logo';
import { formatImageUrl } from '@/lib/image-url';
import {
    Check,
    RotateCcw,
    Save,
    Sparkles,
    Palette,
    Square,
    Sliders,
    Eye,
    Upload,
    Image as ImageIcon,
    Trash2,
    Type,
    CheckCircle2,
    Search,
} from 'lucide-react';

export function ThemeSettingsView() {
    const {
        theme,
        isDirty,
        isSaving,
        isUploadingLogo,
        updateTheme,
        updateColors,
        updateLogo,
        uploadLogo,
        applyPreset,
        saveTheme,
        resetTheme,
    } = useCustomTheme();

    const [activeTab, setActiveTab] = useState<
        'presets' | 'colors' | 'fonts' | 'logo' | 'radius' | 'components'
    >('presets');
    const [previewInputText, setPreviewInputText] = useState('Bimbel Cabang Utama');
    const [logoBgPreview, setLogoBgPreview] = useState<'white' | 'dark' | 'brand'>('white');
    const [fontFilter, setFontFilter] = useState<'all' | 'handwriting' | 'sans' | 'serif'>('all');
    const [fontSearch, setFontSearch] = useState('');
    const [fontSampleText, setFontSampleText] = useState(
        'BANYAN EMS — Pendidikan Berkualitas Masa Depan 12345',
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredFonts = FONT_OPTIONS.filter((f) => {
        const matchesCategory = fontFilter === 'all' || f.category === fontFilter;
        const matchesSearch =
            !fontSearch ||
            f.name.toLowerCase().includes(fontSearch.toLowerCase()) ||
            f.description.toLowerCase().includes(fontSearch.toLowerCase()) ||
            f.category.toLowerCase().includes(fontSearch.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleSave = async () => {
        const success = await saveTheme();
        if (success) {
            toast.add({
                title: 'Tema Berhasil Disimpan',
                type: 'success',
                description:
                    'Konfigurasi tema dan logo Anda telah diperbarui dan aktif di seluruh aplikasi.',
            });
        } else {
            toast.add({
                title: 'Gagal Menyimpan ke Server',
                type: 'error',
                description: 'Tema tetap aktif di browser Anda via penyimpanan lokal.',
            });
        }
    };

    const handleReset = async () => {
        if (confirm('Kembalikan konfigurasi tema dan logo ke standar resmi BANYAN?')) {
            await resetTheme();
            toast.add({
                title: 'Tema Direset',
                type: 'info',
                description: 'Konfigurasi tema telah dikembalikan ke standar resmi BANYAN.',
            });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.add({
                title: 'Format Tidak Didukung',
                type: 'error',
                description: 'Silakan unggah file gambar (PNG, JPG, SVG, WebP).',
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.add({
                title: 'Ukuran File Terlalu Besar',
                type: 'error',
                description: 'Ukuran logo maksimal adalah 5MB.',
            });
            return;
        }

        const url = await uploadLogo(file);
        if (url) {
            toast.add({
                title: 'Logo Berhasil Diunggah',
                type: 'success',
                description: 'Gambar logo baru siap digunakan.',
            });
        } else {
            toast.add({
                title: 'Gagal Mengunggah Logo',
                type: 'error',
                description: 'Terjadi kesalahan saat mengunggah file ke server.',
            });
        }
    };

    const removeLogoImage = () => {
        updateLogo({ url: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const logo = theme.logo || {
        url: '',
        text: 'BANYAN',
        subtitle: 'Bimbel Management',
        type: 'image_text',
        iconName: 'mdi:school',
    };

    const logoHasBorder =
        logo.hasBorder !== undefined
            ? logo.hasBorder
            : logo.borderWidth !== undefined
              ? Number(logo.borderWidth) > 0
              : false;

    const logoBorderWidth =
        logo.borderWidth !== undefined ? Number(logo.borderWidth) : logoHasBorder ? 1 : 0;

    const logoPadding = logo.padding !== undefined ? Number(logo.padding) : logoHasBorder ? 2 : 0;

    const logoHasBg =
        logo.hasBackground !== undefined
            ? logo.hasBackground
            : Boolean(logo.backgroundColor && logo.backgroundColor !== 'transparent');

    const logoBgColor = logo.backgroundColor || (logoHasBg ? '#ffffff' : 'transparent');

    const logoRadius = logo.borderRadius || 'inherit';
    const logoBorderStyle = logo.borderStyle || 'solid';
    const logoAspectRatio = logo.aspectRatio || 'square';
    const logoImageFit = logo.imageFit || 'contain';

    const iconOptions = [
        { id: 'mdi:school', label: 'Sekolah' },
        { id: 'mdi:leaf', label: 'Daun Banyan' },
        { id: 'mdi:book-education-outline', label: 'Buku' },
        { id: 'mdi:lightbulb-on-outline', label: 'Ide' },
        { id: 'mdi:crown-outline', label: 'Mahkota' },
        { id: 'mdi:star-four-points-outline', label: 'Bintang' },
        { id: 'mdi:domain', label: 'Gedung' },
    ];

    return (
        <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-sm bg-brand-gradient text-primary-foreground shadow-sm">
                            <Palette className="size-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Kustomisasi Tema & Tampilan
                        </h1>
                        {isDirty && (
                            <Badge
                                variant="outline"
                                className="border-warning/50 bg-warning/10 text-warning text-xs"
                            >
                                <span className="size-1.5 rounded-full bg-warning animate-pulse" />
                                Perubahan Belum Disimpan
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sesuaikan identitas visual aplikasi mulai dari logo institusi, warna brand,
                        gradien, radius sudut, hingga gaya tombol secara mandiri dan fleksibel.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={isSaving}
                        className="gap-1.5"
                    >
                        <RotateCcw className="size-3.5" />
                        Reset Default
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-1.5"
                    >
                        {isSaving ? (
                            <Icon icon="line-md:loading-loop" className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-3.5" />
                        )}
                        Simpan Perubahan
                    </Button>
                </div>
            </div>

            {/* Main Content Grid: Controls on Left, Live Preview on Right */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Column: Customization Controls (7 cols) */}
                <div className="space-y-6 lg:col-span-7">
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) =>
                            setActiveTab(
                                v as
                                    | 'presets'
                                    | 'colors'
                                    | 'fonts'
                                    | 'logo'
                                    | 'radius'
                                    | 'components',
                            )
                        }
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-muted/60 p-1 h-auto gap-1">
                            <TabsTrigger
                                value="presets"
                                className="gap-1.5 text-xs font-semibold py-2"
                            >
                                <Sparkles className="size-3.5" />
                                Preset
                            </TabsTrigger>
                            <TabsTrigger
                                value="colors"
                                className="gap-1.5 text-xs font-semibold py-2"
                            >
                                <Palette className="size-3.5" />
                                Warna
                            </TabsTrigger>
                            <TabsTrigger
                                value="fonts"
                                className="gap-1.5 text-xs font-semibold py-2"
                            >
                                <Type className="size-3.5" />
                                Font
                            </TabsTrigger>
                            <TabsTrigger
                                value="logo"
                                className="gap-1.5 text-xs font-semibold py-2"
                            >
                                <ImageIcon className="size-3.5" />
                                Logo
                            </TabsTrigger>
                            <TabsTrigger
                                value="radius"
                                className="gap-1.5 text-xs font-semibold py-2"
                            >
                                <Square className="size-3.5" />
                                Radius
                            </TabsTrigger>
                            <TabsTrigger
                                value="components"
                                className="gap-1.5 text-xs font-semibold py-2"
                            >
                                <Sliders className="size-3.5" />
                                Gaya UI
                            </TabsTrigger>
                        </TabsList>

                        {/* 1. PRESETS TAB */}
                        <TabsContent value="presets" className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                {THEME_PRESETS.map((preset) => {
                                    const isSelected = theme.preset === preset.id;
                                    return (
                                        <div
                                            key={preset.id}
                                            onClick={() => applyPreset(preset.id)}
                                            className={`group relative cursor-pointer rounded-sm border p-4 transition-all hover:border-primary/60 hover:shadow-sm ${
                                                isSelected
                                                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                    : 'border-border/70 bg-card'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="size-5 rounded-full border shadow-xs"
                                                        style={{
                                                            background: preset.preview.gradient,
                                                        }}
                                                    />
                                                    <h3 className="text-sm font-bold text-foreground">
                                                        {preset.name}
                                                    </h3>
                                                </div>
                                                {isSelected && (
                                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                                        <Check className="size-3" />
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                                {preset.description}
                                            </p>

                                            <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-border/50">
                                                <span className="text-[0.6875rem] font-medium text-muted-foreground">
                                                    Palet:
                                                </span>
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{
                                                        backgroundColor:
                                                            preset.config.colors.primary,
                                                    }}
                                                    title={`Primary: ${preset.config.colors.primary}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{
                                                        backgroundColor:
                                                            preset.config.colors.brandTo,
                                                    }}
                                                    title={`Gradien: ${preset.config.colors.brandTo}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{
                                                        backgroundColor:
                                                            preset.config.colors.destructive,
                                                    }}
                                                    title={`Destructive: ${preset.config.colors.destructive}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{
                                                        backgroundColor:
                                                            preset.config.colors.warning,
                                                    }}
                                                    title={`Warning: ${preset.config.colors.warning}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{
                                                        backgroundColor: preset.config.colors.info,
                                                    }}
                                                    title={`Info: ${preset.config.colors.info}`}
                                                />
                                                <span className="ml-auto text-[0.6875rem] text-muted-foreground">
                                                    Radius:{' '}
                                                    {preset.config.radiusScale.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        {/* 2. COLORS TAB */}
                        <TabsContent value="colors" className="mt-5 space-y-4">
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Identitas Warna Brand Utama
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Warna utama digunakan pada tombol penting, navbar, sidebar
                                        aktif, dan aksen visual.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ColorRow
                                        label="Warna Utama (Primary)"
                                        description="Warna identitas inti aplikasi"
                                        value={theme.colors.primary}
                                        onChange={(val) => {
                                            updateColors({
                                                primary: val,
                                                brandFrom: val,
                                                sidebarPrimary: val,
                                            });
                                        }}
                                    />

                                    <ColorRow
                                        label="Gradien Awal (Brand From)"
                                        description="Warna awal untuk tombol dan latar bergradien"
                                        value={theme.colors.brandFrom}
                                        onChange={(val) => updateColors({ brandFrom: val })}
                                    />

                                    <ColorRow
                                        label="Gradien Akhir (Brand To)"
                                        description="Warna akhir untuk efek gradien modern"
                                        value={theme.colors.brandTo}
                                        onChange={(val) => updateColors({ brandTo: val })}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Warna Status & Indikator
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Digunakan untuk pesan error, peringatan, informasi, dan
                                        konfirmasi sukses.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ColorRow
                                        label="Bahaya / Error (Destructive)"
                                        description="Tombol hapus, status ditolak, badge error"
                                        value={theme.colors.destructive}
                                        onChange={(val) => updateColors({ destructive: val })}
                                    />

                                    <ColorRow
                                        label="Peringatan (Warning)"
                                        description="Status pending, review, perhatian penting"
                                        value={theme.colors.warning}
                                        onChange={(val) => updateColors({ warning: val })}
                                    />

                                    <ColorRow
                                        label="Informasi / Sekunder (Info)"
                                        description="Label informasi, tag program, aksen alternatif"
                                        value={theme.colors.info}
                                        onChange={(val) => updateColors({ info: val })}
                                    />

                                    <ColorRow
                                        label="Sukses / Berhasil (Success)"
                                        description="Status selesai, hadir, aktif, dan pencapaian"
                                        value={theme.colors.success || '#16A34A'}
                                        onChange={(val) => updateColors({ success: val })}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 3. FONTS & TYPOGRAPHY TAB */}
                        <TabsContent value="fonts" className="mt-5 space-y-4">
                            {/* Overview & Offline Status Card */}
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                                <Type className="size-4 text-primary" />
                                                Pilihan Font & Tipografi Sistem
                                            </CardTitle>
                                            <CardDescription className="text-xs mt-1">
                                                Kustomisasi font antarmuka EMS mulai dari Times New
                                                Roman, Arial, font modern, hingga aneka font tulisan
                                                tangan artistik.
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="w-fit flex items-center gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs py-1 px-2.5 font-medium"
                                        >
                                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                            100% Siap Offline
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-0">
                                    {/* Offline notification banner */}
                                    <div className="rounded-sm border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 flex items-start gap-3">
                                        <div className="mt-0.5 rounded-full bg-emerald-500/20 p-1 text-emerald-600 dark:text-emerald-400 shrink-0">
                                            <Icon icon="mdi:cloud-check" className="size-4" />
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            <p className="font-semibold text-foreground">
                                                Semua file font telah diunduh di server lokal
                                            </p>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Pengguna dapat berganti font kapan saja tanpa
                                                memerlukan koneksi internet aktif. Seluruh font
                                                (Times New Roman, Arial, sans modern, serta font
                                                bertema tulisan tangan dan kursif) dimuat langsung
                                                dari penyimpanan lokal aplikasi.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Current Active Font & Quick Reset */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-3 rounded-sm border border-border/60 bg-muted/30">
                                        <div className="space-y-0.5">
                                            <span className="text-[0.6875rem] font-bold uppercase tracking-wider text-muted-foreground">
                                                Font Aktif Saat Ini
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-base font-bold text-foreground"
                                                    style={{
                                                        fontFamily: getFontConfig(theme.fontFamily)
                                                            .fontFamily,
                                                    }}
                                                >
                                                    {getFontConfig(theme.fontFamily).name}
                                                </span>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[0.6875rem]"
                                                >
                                                    {getFontConfig(theme.fontFamily).badge ||
                                                        'Aktif'}
                                                </Badge>
                                            </div>
                                            <p className="text-[0.6875rem] text-muted-foreground">
                                                {getFontConfig(theme.fontFamily).description}
                                            </p>
                                        </div>

                                        {theme.fontFamily &&
                                            theme.fontFamily !== 'plus-jakarta' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        updateTheme({ fontFamily: 'plus-jakarta' })
                                                    }
                                                    className="text-xs gap-1.5 h-8 shrink-0 self-start sm:self-auto"
                                                >
                                                    <RotateCcw className="size-3.5" />
                                                    Kembali ke Plus Jakarta Sans
                                                </Button>
                                            )}
                                    </div>

                                    {/* Interactive Preview Text Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                            <span>Uji Coba Teks Pratinjau:</span>
                                            <span className="text-[0.6875rem] font-normal text-muted-foreground">
                                                Ketik kalimat bebas untuk melihat karakter setiap
                                                font di bawah
                                            </span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={fontSampleText}
                                            onChange={(e) => setFontSampleText(e.target.value)}
                                            placeholder="Ketik kalimat atau angka untuk melihat karakter font..."
                                            className="text-xs"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Filter & Search Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                {/* Category Pills */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {[
                                        {
                                            id: 'all',
                                            label: 'Semua Font',
                                            count: FONT_OPTIONS.length,
                                        },
                                        {
                                            id: 'handwriting',
                                            label: 'Tulisan Tangan',
                                            count: FONT_OPTIONS.filter(
                                                (f) => f.category === 'handwriting',
                                            ).length,
                                            icon: 'mdi:draw-pen',
                                        },
                                        {
                                            id: 'serif',
                                            label: 'Serif (Times dsb)',
                                            count: FONT_OPTIONS.filter(
                                                (f) => f.category === 'serif',
                                            ).length,
                                            icon: 'mdi:format-font',
                                        },
                                        {
                                            id: 'sans',
                                            label: 'Sans-Serif (Arial dsb)',
                                            count: FONT_OPTIONS.filter((f) => f.category === 'sans')
                                                .length,
                                            icon: 'mdi:format-letter-case',
                                        },
                                    ].map((cat) => {
                                        const isActive = fontFilter === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() =>
                                                    setFontFilter(
                                                        cat.id as
                                                            | 'all'
                                                            | 'handwriting'
                                                            | 'sans'
                                                            | 'serif',
                                                    )
                                                }
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all border ${
                                                    isActive
                                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                                        : 'bg-card text-muted-foreground hover:text-foreground border-border/70 hover:bg-muted/50'
                                                }`}
                                            >
                                                {cat.icon && (
                                                    <Icon icon={cat.icon} className="size-3.5" />
                                                )}
                                                <span>{cat.label}</span>
                                                <span
                                                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[0.625rem] font-bold ${
                                                        isActive
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {cat.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search Input */}
                                <div className="relative w-full sm:w-56">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama font..."
                                        value={fontSearch}
                                        onChange={(e) => setFontSearch(e.target.value)}
                                        className="pl-8 text-xs h-8"
                                    />
                                </div>
                            </div>

                            {/* Font Options Grid */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {filteredFonts.map((font) => {
                                    const isSelected =
                                        (theme.fontFamily || 'plus-jakarta') === font.id;
                                    return (
                                        <div
                                            key={font.id}
                                            onClick={() => updateTheme({ fontFamily: font.id })}
                                            className={`group relative cursor-pointer rounded-sm border p-4 transition-all hover:border-primary/70 hover:shadow-sm ${
                                                isSelected
                                                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                    : 'border-border/70 bg-card hover:bg-muted/20'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                                            {font.name}
                                                        </h3>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-[0.625rem] py-0 px-1.5 font-medium ${
                                                                font.category === 'handwriting'
                                                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                                                    : font.category === 'serif'
                                                                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                                                      : 'border-muted-foreground/30 text-muted-foreground'
                                                            }`}
                                                        >
                                                            {font.badge || font.category}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[0.6875rem] text-muted-foreground line-clamp-2">
                                                        {font.description}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isSelected ? (
                                                        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shadow-xs">
                                                            <Check className="size-3" />
                                                        </span>
                                                    ) : (
                                                        <span className="size-5 rounded-full border border-border group-hover:border-primary/60 transition-colors" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Font Preview Area rendered in font's own font-family */}
                                            <div
                                                className="mt-3.5 rounded-sm border border-border/50 bg-background/80 p-3 transition-colors group-hover:border-border"
                                                style={{ fontFamily: font.fontFamily }}
                                            >
                                                <p className="text-sm font-semibold text-foreground leading-snug break-words">
                                                    {fontSampleText ||
                                                        font.sampleText ||
                                                        'Pendidikan Berkualitas untuk Semua Siswa 12345'}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground opacity-80">
                                                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                                                    abcdefghijklmnopqrstuvwxyz 0123456789
                                                </p>
                                            </div>

                                            <div className="mt-2.5 flex items-center justify-between text-[0.625rem] text-muted-foreground pt-1.5 border-t border-border/40">
                                                <span className="flex items-center gap-1">
                                                    <Icon
                                                        icon="mdi:server-network"
                                                        className="size-3 text-emerald-600 dark:text-emerald-400"
                                                    />
                                                    Tersimpan Offline
                                                </span>
                                                <span className="font-mono text-[0.5625rem] uppercase opacity-70">
                                                    {font.category}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {filteredFonts.length === 0 && (
                                <div className="rounded-sm border border-dashed border-border p-8 text-center space-y-2">
                                    <Type className="size-8 text-muted-foreground mx-auto opacity-50" />
                                    <p className="text-sm font-semibold text-foreground">
                                        Font Tidak Ditemukan
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Tidak ada font yang cocok dengan kata kunci &ldquo;
                                        {fontSearch}&rdquo;.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setFontSearch('');
                                            setFontFilter('all');
                                        }}
                                        className="text-xs mt-2"
                                    >
                                        Tampilkan Semua Font
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* 4. LOGO TAB */}
                        <TabsContent value="logo" className="mt-5 space-y-4">
                            {/* Upload Logo Card */}
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Gambar Logo Institusi
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Unggah gambar logo institusi atau bimbel Anda (mendukung
                                        PNG, JPG, SVG, WebP hingga 5MB).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {logo.url ? (
                                        <div className="flex items-center gap-4 p-4 border rounded-sm bg-muted/20">
                                            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-white p-1">
                                                <img
                                                    src={formatImageUrl(logo.url)}
                                                    alt="Logo Preview"
                                                    className="size-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-xs font-semibold text-foreground block">
                                                    Logo Kustom Aktif
                                                </span>
                                                <span className="text-[0.6875rem] font-mono text-muted-foreground block truncate max-w-xs">
                                                    {logo.url}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploadingLogo}
                                                    className="gap-1.5 text-xs"
                                                >
                                                    <Upload className="size-3" />
                                                    Ganti
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={removeLogoImage}
                                                    className="gap-1.5 text-xs"
                                                >
                                                    <Trash2 className="size-3" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="group flex flex-col items-center justify-center border-2 border-dashed border-border/80 p-8 text-center rounded-sm cursor-pointer transition-colors hover:border-primary/60 hover:bg-primary/5"
                                        >
                                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
                                                {isUploadingLogo ? (
                                                    <Icon
                                                        icon="line-md:loading-loop"
                                                        className="size-6 animate-spin"
                                                    />
                                                ) : (
                                                    <Upload className="size-6" />
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {isUploadingLogo
                                                    ? 'Sedang mengunggah...'
                                                    : 'Klik untuk Unggah Gambar Logo'}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Format PNG, JPG, SVG atau WebP transparan disarankan
                                                (Maks 5MB)
                                            </p>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />

                                    <div className="space-y-1.5 pt-2">
                                        <span className="text-xs font-semibold text-foreground">
                                            Atau Masukkan URL Gambar Logo Langsung:
                                        </span>
                                        <Input
                                            type="url"
                                            placeholder="https://domain.com/path-ke-logo.png"
                                            value={logo.url || ''}
                                            onChange={(e) => updateLogo({ url: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logo Framing & Spacing Customization Card */}
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Square className="size-4 text-primary" />
                                        Gaya Bingkai & Jarak Logo (Border & Padding)
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Atur tampilan logo secara fleksibel: bisa berupa gambar
                                        bersih tanpa border atau padding, atau dengan border dan
                                        padding yang dapat disesuaikan sesuka Anda.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    {/* Mini Interactive Preview Box */}
                                    <div className="rounded-sm border p-4 bg-muted/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <Eye className="size-3.5 text-primary" />
                                                Pratinjau Logo Langsung
                                            </span>
                                            {/* Preview Background Switcher */}
                                            <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-sm border text-[0.6875rem]">
                                                <span className="text-muted-foreground px-1.5">
                                                    Latar:
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoBgPreview('white')}
                                                    className={`px-2 py-0.5 rounded-sm font-medium transition-colors ${
                                                        logoBgPreview === 'white'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Terang
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoBgPreview('dark')}
                                                    className={`px-2 py-0.5 rounded-sm font-medium transition-colors ${
                                                        logoBgPreview === 'dark'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Gelap
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLogoBgPreview('brand')}
                                                    className={`px-2 py-0.5 rounded-sm font-medium transition-colors ${
                                                        logoBgPreview === 'brand'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Brand
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className={`p-6 rounded-sm border flex flex-wrap items-center justify-around gap-6 transition-colors ${
                                                logoBgPreview === 'white'
                                                    ? 'bg-white border-border/60 text-slate-900'
                                                    : logoBgPreview === 'dark'
                                                      ? 'bg-slate-950 border-slate-800 text-white'
                                                      : 'text-white'
                                            }`}
                                            style={
                                                logoBgPreview === 'brand'
                                                    ? {
                                                          backgroundImage: `linear-gradient(135deg, ${theme.colors.brandFrom}, ${theme.colors.brandTo})`,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <div className="text-center space-y-1.5">
                                                <AppLogo size="sm" showText={false} />
                                                <span className="text-[0.625rem] text-muted-foreground block">
                                                    Kecil (sm)
                                                </span>
                                            </div>
                                            <div className="text-center space-y-1.5">
                                                <AppLogo size="md" showText={false} />
                                                <span className="text-[0.625rem] text-muted-foreground block font-semibold">
                                                    Standar (md)
                                                </span>
                                            </div>
                                            <div className="text-center space-y-1.5">
                                                <AppLogo size="lg" showText={false} />
                                                <span className="text-[0.625rem] text-muted-foreground block">
                                                    Besar (lg)
                                                </span>
                                            </div>
                                            <div className="text-center space-y-1.5">
                                                <AppLogo size="xl" showText={false} />
                                                <span className="text-[0.625rem] text-muted-foreground block">
                                                    Ekstra (xl)
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gaya Cepat (Quick Presets) */}
                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold text-foreground block">
                                            Pilihan Gaya Cepat (Quick Preset):
                                        </span>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateLogo({
                                                        hasBorder: false,
                                                        borderWidth: 0,
                                                        padding: 0,
                                                        hasBackground: false,
                                                        backgroundColor: 'transparent',
                                                    })
                                                }
                                                className={`p-2.5 text-left border rounded-sm transition-all ${
                                                    !logoHasBorder &&
                                                    logoPadding === 0 &&
                                                    !logoHasBg
                                                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                        : 'border-border/70 hover:border-primary/50 bg-card'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-foreground block">
                                                    🖼️ Gambar Saja (Clean)
                                                </span>
                                                <span className="text-[0.625rem] text-muted-foreground mt-0.5 block">
                                                    Tanpa border, tanpa padding, latar transparan
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateLogo({
                                                        hasBorder: true,
                                                        borderWidth: 1,
                                                        borderColor: '',
                                                        borderStyle: 'solid',
                                                        padding: 2,
                                                        hasBackground: true,
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: 'inherit',
                                                    })
                                                }
                                                className={`p-2.5 text-left border rounded-sm transition-all ${
                                                    logoHasBorder &&
                                                    logoPadding === 2 &&
                                                    logoRadius === 'inherit' &&
                                                    (!logo.borderColor || logo.borderColor === '')
                                                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                        : 'border-border/70 hover:border-primary/50 bg-card'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-foreground block">
                                                    🔲 Kotak Kartu (Boxed)
                                                </span>
                                                <span className="text-[0.625rem] text-muted-foreground mt-0.5 block">
                                                    Border 1px halus, padding 2px, latar putih
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateLogo({
                                                        hasBorder: true,
                                                        borderWidth: 1,
                                                        borderColor: '',
                                                        borderStyle: 'solid',
                                                        padding: 4,
                                                        hasBackground: true,
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '9999px',
                                                    })
                                                }
                                                className={`p-2.5 text-left border rounded-sm transition-all ${
                                                    logoHasBorder && logoRadius === '9999px'
                                                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                        : 'border-border/70 hover:border-primary/50 bg-card'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-foreground block">
                                                    🔘 Badge Bulat (Circle)
                                                </span>
                                                <span className="text-[0.625rem] text-muted-foreground mt-0.5 block">
                                                    Lingkaran penuh, border halus, padding 4px
                                                </span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateLogo({
                                                        hasBorder: true,
                                                        borderWidth: 2,
                                                        borderColor: theme.colors.primary,
                                                        borderStyle: 'solid',
                                                        padding: 3,
                                                        hasBackground: true,
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '8px',
                                                    })
                                                }
                                                className={`p-2.5 text-left border rounded-sm transition-all ${
                                                    logoHasBorder &&
                                                    logoBorderWidth === 2 &&
                                                    logo.borderColor === theme.colors.primary
                                                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                        : 'border-border/70 hover:border-primary/50 bg-card'
                                                }`}
                                            >
                                                <span className="text-xs font-bold text-foreground block">
                                                    🎨 Aksen Brand
                                                </span>
                                                <span className="text-[0.625rem] text-muted-foreground mt-0.5 block">
                                                    Border tebal 2px warna utama brand
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Detailed Controls: Border Toggle & Configuration */}
                                    <div className="space-y-4 pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-foreground block">
                                                    Garis Tepi (Border)
                                                </span>
                                                <span className="text-[0.6875rem] text-muted-foreground block">
                                                    Aktifkan atau nonaktifkan garis pembatas di
                                                    sekeliling logo
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-sm border">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateLogo({
                                                            hasBorder: false,
                                                            borderWidth: 0,
                                                        })
                                                    }
                                                    className={`px-3 py-1 text-xs rounded-sm font-semibold transition-all ${
                                                        !logoHasBorder
                                                            ? 'bg-background text-foreground shadow-xs'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Tanpa Border
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateLogo({
                                                            hasBorder: true,
                                                            borderWidth:
                                                                logoBorderWidth > 0
                                                                    ? logoBorderWidth
                                                                    : 1,
                                                        })
                                                    }
                                                    className={`px-3 py-1 text-xs rounded-sm font-semibold transition-all ${
                                                        logoHasBorder
                                                            ? 'bg-primary text-primary-foreground shadow-xs'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    Dengan Border
                                                </button>
                                            </div>
                                        </div>

                                        {/* Sub-controls when border is active */}
                                        {logoHasBorder && (
                                            <div className="p-3.5 border rounded-sm bg-muted/10 space-y-3.5 animate-in fade-in-50 duration-200">
                                                {/* Ketebalan Border (Border Width) */}
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-medium text-foreground">
                                                            Ketebalan Border (Border Width)
                                                        </span>
                                                        <span className="font-mono text-xs font-bold text-primary">
                                                            {logoBorderWidth}px
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="8"
                                                            step="1"
                                                            value={logoBorderWidth}
                                                            onChange={(e) =>
                                                                updateLogo({
                                                                    borderWidth: parseInt(
                                                                        e.target.value,
                                                                    ),
                                                                    hasBorder: true,
                                                                })
                                                            }
                                                            className="w-full accent-primary cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1 pt-1">
                                                        {[1, 2, 3, 4, 6].map((w) => (
                                                            <button
                                                                key={w}
                                                                type="button"
                                                                onClick={() =>
                                                                    updateLogo({
                                                                        borderWidth: w,
                                                                        hasBorder: true,
                                                                    })
                                                                }
                                                                className={`px-2 py-0.5 text-[0.6875rem] rounded-sm border ${
                                                                    logoBorderWidth === w
                                                                        ? 'border-primary bg-primary text-primary-foreground font-semibold'
                                                                        : 'border-border/60 hover:border-primary/50 bg-background text-foreground'
                                                                }`}
                                                            >
                                                                {w}px
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Warna Border (Border Color) */}
                                                <div className="space-y-1.5 pt-2 border-t border-border/50">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-medium text-foreground">
                                                            Warna Border
                                                        </span>
                                                        <span className="font-mono text-xs text-muted-foreground">
                                                            {logo.borderColor ||
                                                                'Default (Border Tema)'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateLogo({ borderColor: '' })
                                                            }
                                                            className={`px-2.5 py-1 text-xs rounded-sm border transition-all ${
                                                                !logo.borderColor
                                                                    ? 'border-primary ring-2 ring-primary/20 bg-primary/10 font-semibold'
                                                                    : 'border-border/60 bg-background hover:border-primary/40'
                                                            }`}
                                                        >
                                                            Default Halus
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateLogo({
                                                                    borderColor:
                                                                        theme.colors.primary,
                                                                })
                                                            }
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm border transition-all ${
                                                                logo.borderColor ===
                                                                theme.colors.primary
                                                                    ? 'border-primary ring-2 ring-primary/20 font-semibold'
                                                                    : 'border-border/60 bg-background hover:border-primary/40'
                                                            }`}
                                                        >
                                                            <span
                                                                className="size-3 rounded-full border shadow-xs"
                                                                style={{
                                                                    backgroundColor:
                                                                        theme.colors.primary,
                                                                }}
                                                            />
                                                            Warna Utama
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateLogo({
                                                                    borderColor: '#FFFFFF',
                                                                })
                                                            }
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm border transition-all ${
                                                                logo.borderColor === '#FFFFFF'
                                                                    ? 'border-primary ring-2 ring-primary/20 font-semibold'
                                                                    : 'border-border/60 bg-background hover:border-primary/40'
                                                            }`}
                                                        >
                                                            <span className="size-3 rounded-full border bg-white shadow-xs" />
                                                            Putih
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateLogo({
                                                                    borderColor: '#0F172A',
                                                                })
                                                            }
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm border transition-all ${
                                                                logo.borderColor === '#0F172A'
                                                                    ? 'border-primary ring-2 ring-primary/20 font-semibold'
                                                                    : 'border-border/60 bg-background hover:border-primary/40'
                                                            }`}
                                                        >
                                                            <span className="size-3 rounded-full border bg-slate-900 shadow-xs" />
                                                            Gelap
                                                        </button>
                                                        <div className="flex items-center gap-1.5 ml-auto">
                                                            <input
                                                                type="color"
                                                                value={
                                                                    logo.borderColor || '#cbd5e1'
                                                                }
                                                                onChange={(e) =>
                                                                    updateLogo({
                                                                        borderColor: e.target.value,
                                                                    })
                                                                }
                                                                className="size-7 cursor-pointer rounded-sm border border-border/60 bg-transparent p-0.5"
                                                                title="Pilih warna kustom"
                                                            />
                                                            <Input
                                                                type="text"
                                                                value={logo.borderColor || ''}
                                                                onChange={(e) =>
                                                                    updateLogo({
                                                                        borderColor: e.target.value,
                                                                    })
                                                                }
                                                                placeholder="#HEX"
                                                                className="w-20 font-mono text-[0.6875rem] uppercase h-7 px-1.5"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Gaya Garis Border (Border Style) */}
                                                <div className="space-y-1.5 pt-2 border-t border-border/50">
                                                    <span className="text-xs font-medium text-foreground block">
                                                        Gaya Garis (Border Style)
                                                    </span>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {[
                                                            {
                                                                id: 'solid',
                                                                label: 'Solid (Lurus)',
                                                            },
                                                            {
                                                                id: 'dashed',
                                                                label: 'Dashed (Putus-putus)',
                                                            },
                                                            {
                                                                id: 'dotted',
                                                                label: 'Dotted (Titik-titik)',
                                                            },
                                                        ].map((s) => (
                                                            <button
                                                                key={s.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    updateLogo({
                                                                        borderStyle: s.id as any,
                                                                    })
                                                                }
                                                                className={`px-2.5 py-1.5 text-xs rounded-sm border text-center transition-all ${
                                                                    logoBorderStyle === s.id
                                                                        ? 'border-primary ring-2 ring-primary/20 bg-primary/10 font-semibold'
                                                                        : 'border-border/60 bg-background hover:border-primary/40'
                                                                }`}
                                                            >
                                                                {s.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Padding Controls */}
                                        <div className="space-y-2 pt-3 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-foreground block">
                                                        Jarak Ruang Dalam (Padding)
                                                    </span>
                                                    <span className="text-[0.6875rem] text-muted-foreground block">
                                                        Jarak antara gambar logo dengan tepi
                                                        wadah/border
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-primary">
                                                    {logoPadding}px
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="24"
                                                    step="1"
                                                    value={logoPadding}
                                                    onChange={(e) =>
                                                        updateLogo({
                                                            padding: parseInt(e.target.value),
                                                        })
                                                    }
                                                    className="w-full accent-primary cursor-pointer"
                                                />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                {[
                                                    { v: 0, label: '0px (Tanpa Padding)' },
                                                    { v: 2, label: '2px (Tipis)' },
                                                    { v: 4, label: '4px (Sedang)' },
                                                    { v: 8, label: '8px (Lebar)' },
                                                    { v: 12, label: '12px (Luas)' },
                                                    { v: 16, label: '16px (Ekstra)' },
                                                ].map((p) => (
                                                    <button
                                                        key={p.v}
                                                        type="button"
                                                        onClick={() => updateLogo({ padding: p.v })}
                                                        className={`px-2.5 py-1 text-xs rounded-sm border transition-all ${
                                                            logoPadding === p.v
                                                                ? 'border-primary bg-primary text-primary-foreground font-semibold'
                                                                : 'border-border/60 hover:border-primary/50 bg-background text-foreground'
                                                        }`}
                                                    >
                                                        {p.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Sudut Lengkung Logo (Radius) */}
                                        <div className="space-y-2 pt-3 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-foreground block">
                                                        Sudut Kelengkungan Logo (Radius)
                                                    </span>
                                                    <span className="text-[0.6875rem] text-muted-foreground block">
                                                        Bentuk sudut wadah logo institusi
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {logoRadius === 'inherit'
                                                        ? `Ikuti Tema (${theme.radius})`
                                                        : logoRadius}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                                                {[
                                                    {
                                                        id: 'inherit',
                                                        label: 'Ikuti Tema',
                                                        desc: theme.radius,
                                                    },
                                                    {
                                                        id: '0px',
                                                        label: 'Kotak (0px)',
                                                        desc: 'Tegas',
                                                    },
                                                    {
                                                        id: '4px',
                                                        label: 'Halus (4px)',
                                                        desc: 'Sedikit bulat',
                                                    },
                                                    {
                                                        id: '8px',
                                                        label: 'Sedang (8px)',
                                                        desc: 'Modern',
                                                    },
                                                    {
                                                        id: '12px',
                                                        label: 'Lebar (12px)',
                                                        desc: 'Membulat',
                                                    },
                                                    {
                                                        id: '9999px',
                                                        label: 'Bulat Penuh',
                                                        desc: 'Circle / Pill',
                                                    },
                                                ].map((r) => (
                                                    <button
                                                        key={r.id}
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ borderRadius: r.id })
                                                        }
                                                        className={`p-2 text-center border rounded-sm transition-all ${
                                                            logoRadius === r.id
                                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                                                                : 'border-border/60 hover:border-primary/50 bg-card'
                                                        }`}
                                                    >
                                                        <span className="text-xs text-foreground block">
                                                            {r.label}
                                                        </span>
                                                        <span className="text-[0.625rem] text-muted-foreground block">
                                                            {r.desc}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Background Latar Wadah Logo */}
                                        <div className="space-y-2 pt-3 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-foreground block">
                                                        Warna Latar Belakang Wadah (Background)
                                                    </span>
                                                    <span className="text-[0.6875rem] text-muted-foreground block">
                                                        Berguna bila logo PNG Anda memiliki latar
                                                        transparan
                                                    </span>
                                                </div>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {!logoHasBg ? 'Transparan' : logoBgColor}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateLogo({
                                                            hasBackground: false,
                                                            backgroundColor: 'transparent',
                                                        })
                                                    }
                                                    className={`px-3 py-1 text-xs rounded-sm border transition-all ${
                                                        !logoHasBg
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/10 font-semibold'
                                                            : 'border-border/60 bg-background hover:border-primary/40'
                                                    }`}
                                                >
                                                    Transparan (Tanpa Latar)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateLogo({
                                                            hasBackground: true,
                                                            backgroundColor: '#FFFFFF',
                                                        })
                                                    }
                                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm border transition-all ${
                                                        logoHasBg && logoBgColor === '#FFFFFF'
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/10 font-semibold'
                                                            : 'border-border/60 bg-background hover:border-primary/40'
                                                    }`}
                                                >
                                                    <span className="size-3 rounded-full border bg-white shadow-xs" />
                                                    Putih Bersih
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateLogo({
                                                            hasBackground: true,
                                                            backgroundColor: '#0F172A',
                                                        })
                                                    }
                                                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm border transition-all ${
                                                        logoHasBg && logoBgColor === '#0F172A'
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/10 font-semibold'
                                                            : 'border-border/60 bg-background hover:border-primary/40'
                                                    }`}
                                                >
                                                    <span className="size-3 rounded-full border bg-slate-900 shadow-xs" />
                                                    Gelap Elegan
                                                </button>
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    <input
                                                        type="color"
                                                        value={logoHasBg ? logoBgColor : '#ffffff'}
                                                        onChange={(e) =>
                                                            updateLogo({
                                                                hasBackground: true,
                                                                backgroundColor: e.target.value,
                                                            })
                                                        }
                                                        className="size-7 cursor-pointer rounded-sm border border-border/60 bg-transparent p-0.5"
                                                        title="Pilih warna latar kustom"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={logoHasBg ? logoBgColor : ''}
                                                        onChange={(e) =>
                                                            updateLogo({
                                                                hasBackground: true,
                                                                backgroundColor: e.target.value,
                                                            })
                                                        }
                                                        placeholder="#HEX"
                                                        className="w-20 font-mono text-[0.6875rem] uppercase h-7 px-1.5"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Aspect Ratio & Object Fit */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t">
                                            <div className="space-y-1.5">
                                                <span className="text-xs font-bold text-foreground block">
                                                    Proporsi Wadah (Aspect Ratio)
                                                </span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ aspectRatio: 'square' })
                                                        }
                                                        className={`p-2 text-xs rounded-sm border text-left transition-all ${
                                                            logoAspectRatio === 'square'
                                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                                                                : 'border-border/60 bg-card hover:border-primary/40'
                                                        }`}
                                                    >
                                                        <span className="block font-bold">
                                                            Kotak 1:1
                                                        </span>
                                                        <span className="text-[0.625rem] text-muted-foreground block">
                                                            Standar lambang/ikon
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ aspectRatio: 'wide' })
                                                        }
                                                        className={`p-2 text-xs rounded-sm border text-left transition-all ${
                                                            logoAspectRatio === 'wide'
                                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                                                                : 'border-border/60 bg-card hover:border-primary/40'
                                                        }`}
                                                    >
                                                        <span className="block font-bold">
                                                            Melebar (Wide)
                                                        </span>
                                                        <span className="text-[0.625rem] text-muted-foreground block">
                                                            Cocok logo horizontal
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <span className="text-xs font-bold text-foreground block">
                                                    Kesesuaian Gambar (Image Fit)
                                                </span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ imageFit: 'contain' })
                                                        }
                                                        className={`p-2 text-xs rounded-sm border text-left transition-all ${
                                                            logoImageFit === 'contain'
                                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                                                                : 'border-border/60 bg-card hover:border-primary/40'
                                                        }`}
                                                    >
                                                        <span className="block font-bold">
                                                            Contain (Utuh)
                                                        </span>
                                                        <span className="text-[0.625rem] text-muted-foreground block">
                                                            Proporsional tanpa potong
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ imageFit: 'cover' })
                                                        }
                                                        className={`p-2 text-xs rounded-sm border text-left transition-all ${
                                                            logoImageFit === 'cover'
                                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                                                                : 'border-border/60 bg-card hover:border-primary/40'
                                                        }`}
                                                    >
                                                        <span className="block font-bold">
                                                            Cover (Penuh)
                                                        </span>
                                                        <span className="text-[0.625rem] text-muted-foreground block">
                                                            Penuhi seluruh wadah
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logo Text & Tagline Card */}
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Teks Nama & Slogan Lembaga
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Teks yang ditampilkan mendampingi logo pada sidebar, header,
                                        dan halaman login.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="space-y-1.5">
                                            <span className="text-xs font-semibold text-foreground">
                                                Nama Lembaga / Brand (Judul Utama)
                                            </span>
                                            <Input
                                                type="text"
                                                placeholder="Contoh: BANYAN"
                                                value={logo.text || ''}
                                                onChange={(e) =>
                                                    updateLogo({ text: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <span className="text-xs font-semibold text-foreground">
                                                Slogan / Subtitle
                                            </span>
                                            <Input
                                                type="text"
                                                placeholder="Contoh: Bimbel Management"
                                                value={logo.subtitle || ''}
                                                onChange={(e) =>
                                                    updateLogo({ subtitle: e.target.value })
                                                }
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Display Mode */}
                                    <div className="space-y-2 pt-3 border-t">
                                        <span className="text-xs font-semibold text-foreground block">
                                            Mode Tampilan Logo:
                                        </span>
                                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                            {[
                                                {
                                                    id: 'image_text',
                                                    label: 'Gambar + Teks',
                                                    desc: 'Lengkap dan informatif',
                                                },
                                                {
                                                    id: 'image',
                                                    label: 'Hanya Gambar',
                                                    desc: 'Logo grafis murni',
                                                },
                                                {
                                                    id: 'icon',
                                                    label: 'Ikon + Teks',
                                                    desc: 'Simbol bawaan bergradien',
                                                },
                                                {
                                                    id: 'text',
                                                    label: 'Hanya Teks',
                                                    desc: 'Minimalis tipografi',
                                                },
                                            ].map((m) => {
                                                const isSelected =
                                                    (logo.type || 'image_text') === m.id;
                                                return (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ type: m.id as any })
                                                        }
                                                        className={`p-2.5 text-left border rounded-sm transition-all ${
                                                            isSelected
                                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                                : 'border-border/70 hover:border-primary/50 bg-card'
                                                        }`}
                                                    >
                                                        <span className="text-xs font-bold text-foreground block">
                                                            {m.label}
                                                        </span>
                                                        <span className="text-[0.625rem] text-muted-foreground mt-0.5 block">
                                                            {m.desc}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Icon Selection (Fallback) */}
                                    <div className="space-y-2 pt-3 border-t">
                                        <span className="text-xs font-semibold text-foreground block">
                                            Pilihan Ikon Bawaan (Bila Tanpa Gambar):
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {iconOptions.map((opt) => {
                                                const isSelected =
                                                    (logo.iconName || 'mdi:school') === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        type="button"
                                                        onClick={() =>
                                                            updateLogo({ iconName: opt.id })
                                                        }
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-xs transition-all ${
                                                            isSelected
                                                                ? 'border-primary bg-primary text-primary-foreground font-semibold'
                                                                : 'border-border/70 hover:border-primary/50 bg-card text-foreground'
                                                        }`}
                                                    >
                                                        <Icon icon={opt.id} className="size-4" />
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 4. RADIUS TAB */}
                        <TabsContent value="radius" className="mt-5 space-y-4">
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Pilihan Skala Kelengkungan (Radius)
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Tentukan seberapa membulat sudut kartu, tombol, dialog, dan
                                        input.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                        {[
                                            {
                                                label: 'None (0px)',
                                                scale: 'none',
                                                value: '0px',
                                                desc: 'Kotak Tegas',
                                            },
                                            {
                                                label: 'SM (4px)',
                                                scale: 'sm',
                                                value: '0.25rem',
                                                desc: 'Ringkas Modern',
                                            },
                                            {
                                                label: 'MD (6px)',
                                                scale: 'md',
                                                value: '0.375rem',
                                                desc: 'Standar',
                                            },
                                            {
                                                label: 'LG (8px)',
                                                scale: 'lg',
                                                value: '0.5rem',
                                                desc: 'Membulat',
                                            },
                                            {
                                                label: 'XL (12px)',
                                                scale: 'xl',
                                                value: '0.75rem',
                                                desc: 'Pillowy',
                                            },
                                        ].map((item) => {
                                            const isSelected = theme.radiusScale === item.scale;
                                            return (
                                                <button
                                                    key={item.scale}
                                                    type="button"
                                                    onClick={() => {
                                                        updateTheme({
                                                            radius: item.value,
                                                            radiusScale: item.scale as any,
                                                        });
                                                    }}
                                                    className={`flex flex-col items-center justify-center p-3 border text-center transition-all ${
                                                        isSelected
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                            : 'border-border/70 hover:border-primary/50 bg-card'
                                                    }`}
                                                    style={{ borderRadius: item.value }}
                                                >
                                                    <div
                                                        className="size-8 border-2 border-primary bg-primary/10 mb-2"
                                                        style={{ borderRadius: item.value }}
                                                    />
                                                    <span className="text-xs font-bold text-foreground">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[0.6875rem] text-muted-foreground mt-0.5">
                                                        {item.desc}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Custom slider for radius */}
                                    <div className="mt-5 space-y-2 pt-4 border-t">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-foreground">
                                                Kustomisasi Nilai Spesifik
                                            </span>
                                            <span className="font-mono text-muted-foreground">
                                                {theme.radius}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="range"
                                                min="0"
                                                max="20"
                                                step="1"
                                                value={
                                                    theme.radius.endsWith('rem')
                                                        ? parseFloat(theme.radius) * 16
                                                        : parseInt(theme.radius) || 4
                                                }
                                                onChange={(e) => {
                                                    const px = parseInt(e.target.value);
                                                    const rem =
                                                        (px / 16).toFixed(3).replace(/\.?0+$/, '') +
                                                        'rem';
                                                    let scale: any = 'sm';
                                                    if (px === 0) scale = 'none';
                                                    else if (px <= 4) scale = 'sm';
                                                    else if (px <= 8) scale = 'md';
                                                    else if (px <= 12) scale = 'lg';
                                                    else scale = 'xl';
                                                    updateTheme({
                                                        radius: px === 0 ? '0px' : rem,
                                                        radiusScale: scale,
                                                    });
                                                }}
                                                className="w-full accent-primary cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 5. COMPONENTS TAB */}
                        <TabsContent value="components" className="mt-5 space-y-4">
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Gaya Tombol Utama
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Pilih bagaimana tombol utama ditampilkan di seluruh halaman.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                            {
                                                id: 'gradient',
                                                name: 'Gradien Modern',
                                                desc: 'Gradien halus berenergi',
                                            },
                                            {
                                                id: 'solid',
                                                name: 'Warna Solid',
                                                desc: 'Flat tanpa gradien',
                                            },
                                            {
                                                id: 'soft',
                                                name: 'Soft Accent',
                                                desc: 'Warna latar transparan',
                                            },
                                            {
                                                id: 'outline',
                                                name: 'Border Outline',
                                                desc: 'Minimalis dengan garis tepi',
                                            },
                                        ].map((style) => {
                                            const isSelected = theme.buttonStyle === style.id;
                                            return (
                                                <button
                                                    key={style.id}
                                                    type="button"
                                                    onClick={() =>
                                                        updateTheme({
                                                            buttonStyle: style.id as any,
                                                        })
                                                    }
                                                    className={`p-3.5 text-left border rounded-sm transition-all ${
                                                        isSelected
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                            : 'border-border/70 hover:border-primary/50 bg-card'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold text-foreground block">
                                                        {style.name}
                                                    </span>
                                                    <span className="text-[0.6875rem] text-muted-foreground mt-0.5 block">
                                                        {style.desc}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Intensitas Bayangan (Shadow)
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Kedalaman bayangan untuk kartu dan modal.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                            {
                                                id: 'none',
                                                name: 'Tanpa Bayangan',
                                                desc: 'Flat 2D bersih',
                                            },
                                            {
                                                id: 'soft',
                                                name: 'Lembut (Default)',
                                                desc: 'Halus dan elegan',
                                            },
                                            {
                                                id: 'medium',
                                                name: 'Sedang',
                                                desc: 'Kedalaman seimbang',
                                            },
                                            { id: 'strong', name: 'Tegas', desc: 'Elevasi tinggi' },
                                        ].map((shadow) => {
                                            const isSelected = theme.shadowStyle === shadow.id;
                                            return (
                                                <button
                                                    key={shadow.id}
                                                    type="button"
                                                    onClick={() =>
                                                        updateTheme({
                                                            shadowStyle: shadow.id as any,
                                                        })
                                                    }
                                                    className={`p-3 text-left border rounded-sm transition-all ${
                                                        isSelected
                                                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                            : 'border-border/70 hover:border-primary/50 bg-card'
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold text-foreground block">
                                                        {shadow.name}
                                                    </span>
                                                    <span className="text-[0.6875rem] text-muted-foreground mt-0.5 block">
                                                        {shadow.desc}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Live Interactive Preview Card (5 cols) */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Eye className="size-4 text-primary" />
                                <h2 className="text-sm font-bold text-foreground">
                                    Pratinjau Langsung (Live Preview)
                                </h2>
                            </div>
                            <span className="text-[0.6875rem] text-muted-foreground">
                                Otomatis Update
                            </span>
                        </div>

                        {/* Preview Container */}
                        <div className="border border-border/80 bg-card p-5 space-y-5 rounded-sm shadow-sm">
                            {/* Card Header Preview featuring AppLogo */}
                            <div
                                className="p-4 text-white rounded-sm shadow-sm flex items-center justify-between"
                                style={{
                                    backgroundImage:
                                        theme.buttonStyle === 'solid'
                                            ? undefined
                                            : `linear-gradient(135deg, ${theme.colors.brandFrom}, ${theme.colors.brandTo})`,
                                    backgroundColor: theme.colors.primary,
                                    borderRadius: theme.radius,
                                }}
                            >
                                <AppLogo size="md" textClassName="text-white" />
                                <span className="size-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                                    ✓
                                </span>
                            </div>

                            {/* Navbar / Sidebar Sample */}
                            <div className="p-3 border rounded-sm bg-muted/30 flex items-center justify-between">
                                <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                                    Header Sidebar / Navbar:
                                </span>
                                <AppLogo size="sm" />
                            </div>

                            {/* Active Font & Typography Preview */}
                            <div className="p-3 border rounded-sm bg-muted/20 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.6875rem] font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <Type className="size-3.5 text-primary" />
                                        Font Antarmuka Aktif:
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="text-[0.625rem] py-0 px-1.5 bg-background font-mono"
                                    >
                                        {getFontConfig(theme.fontFamily).name}
                                    </Badge>
                                </div>
                                <p
                                    className="text-sm font-semibold text-foreground transition-all duration-150 leading-snug"
                                    style={{
                                        fontFamily: getFontConfig(theme.fontFamily).fontFamily,
                                    }}
                                >
                                    {previewInputText ||
                                        'Bimbel Mandiri — Masa Depan Gemilang 12345'}
                                </p>
                                <span className="text-[0.625rem] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                    <Icon icon="mdi:check-circle-outline" className="size-3" />
                                    Tersedia secara offline
                                </span>
                            </div>

                            {/* Buttons Preview */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground block">
                                    Gaya Tombol:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        style={{
                                            borderRadius: theme.radius,
                                            backgroundColor:
                                                theme.buttonStyle === 'solid'
                                                    ? theme.colors.primary
                                                    : undefined,
                                            backgroundImage:
                                                theme.buttonStyle === 'gradient'
                                                    ? `linear-gradient(135deg, ${theme.colors.brandFrom}, ${theme.colors.brandTo})`
                                                    : undefined,
                                        }}
                                    >
                                        Tombol Utama
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        style={{ borderRadius: theme.radius }}
                                    >
                                        Outline
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        style={{
                                            borderRadius: theme.radius,
                                            backgroundColor: theme.colors.destructive,
                                        }}
                                    >
                                        Hapus Data
                                    </Button>
                                </div>
                            </div>

                            {/* Badges Preview */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground block">
                                    Status & Badge:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{
                                            backgroundColor: theme.colors.primary,
                                            borderRadius: theme.radius,
                                        }}
                                    >
                                        Primary
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{
                                            backgroundColor: theme.colors.destructive,
                                            borderRadius: theme.radius,
                                        }}
                                    >
                                        Ditolak
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-black font-semibold"
                                        style={{
                                            backgroundColor: theme.colors.warning,
                                            borderRadius: theme.radius,
                                        }}
                                    >
                                        Review
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{
                                            backgroundColor: theme.colors.info,
                                            borderRadius: theme.radius,
                                        }}
                                    >
                                        Program
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{
                                            backgroundColor: theme.colors.success || '#16A34A',
                                            borderRadius: theme.radius,
                                        }}
                                    >
                                        Selesai
                                    </span>
                                </div>
                            </div>

                            {/* Input Form Preview */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground block">
                                    Form Input:
                                </span>
                                <Input
                                    placeholder="Contoh input teks dengan fokus ring tema..."
                                    value={previewInputText}
                                    onChange={(e) => setPreviewInputText(e.target.value)}
                                    className="text-xs"
                                    style={{ borderRadius: theme.radius }}
                                />
                            </div>

                            {/* Mini Stat Card Preview */}
                            <div
                                className="p-3.5 border border-border/70 bg-card flex items-center justify-between"
                                style={{ borderRadius: theme.radius }}
                            >
                                <div>
                                    <span className="text-xs text-muted-foreground">
                                        Total Siswa Aktif
                                    </span>
                                    <div className="text-lg font-bold text-foreground">
                                        1,248 Siswa
                                    </div>
                                </div>
                                <div
                                    className="size-9 flex items-center justify-center text-white"
                                    style={{
                                        backgroundColor: theme.colors.primary,
                                        borderRadius: theme.radius,
                                    }}
                                >
                                    <Icon icon="mdi:account-school" className="size-5" />
                                </div>
                            </div>

                            <p className="text-[0.6875rem] text-muted-foreground text-center italic">
                                *Setiap penyesuaian di atas langsung diterapkan seketika pada
                                seluruh aplikasi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorRow({
    label,
    description,
    value,
    onChange,
}: {
    label: string;
    description: string;
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-border/40 last:border-none">
            <div>
                <span className="text-xs font-bold text-foreground block">{label}</span>
                <span className="text-[0.6875rem] text-muted-foreground block">{description}</span>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value || '#0F3B82'}
                    onChange={(e) => onChange(e.target.value)}
                    className="size-8 cursor-pointer rounded-sm border border-border/60 bg-transparent p-0.5 shadow-xs"
                    title="Pilih warna"
                />
                <Input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#HEX"
                    className="w-24 font-mono text-xs uppercase"
                />
            </div>
        </div>
    );
}
