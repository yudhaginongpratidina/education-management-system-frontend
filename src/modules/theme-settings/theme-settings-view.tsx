'use client';

import React, { useState, useRef } from 'react';
import { useCustomTheme, THEME_PRESETS } from '@/lib/theme-context';
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
        'presets' | 'colors' | 'logo' | 'radius' | 'components'
    >('presets');
    const [previewInputText, setPreviewInputText] = useState('Bimbel Cabang Utama');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                        onValueChange={(v) => setActiveTab(v as any)}
                        className="w-full"
                    >
                        <TabsList className="grid w-full grid-cols-5 bg-muted/60 p-1">
                            <TabsTrigger value="presets" className="gap-1.5 text-xs font-semibold">
                                <Sparkles className="size-3.5" />
                                Preset
                            </TabsTrigger>
                            <TabsTrigger value="colors" className="gap-1.5 text-xs font-semibold">
                                <Palette className="size-3.5" />
                                Warna
                            </TabsTrigger>
                            <TabsTrigger value="logo" className="gap-1.5 text-xs font-semibold">
                                <ImageIcon className="size-3.5" />
                                Logo
                            </TabsTrigger>
                            <TabsTrigger value="radius" className="gap-1.5 text-xs font-semibold">
                                <Square className="size-3.5" />
                                Radius
                            </TabsTrigger>
                            <TabsTrigger
                                value="components"
                                className="gap-1.5 text-xs font-semibold"
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

                        {/* 3. LOGO TAB */}
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
