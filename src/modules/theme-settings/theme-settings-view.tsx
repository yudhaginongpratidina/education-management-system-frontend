'use client';

import React, { useState } from 'react';
import { useCustomTheme, THEME_PRESETS } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { toast } from '@/components/ui/toast';
import { Check, RotateCcw, Save, Sparkles, Palette, Square, Sliders, Eye } from 'lucide-react';

export function ThemeSettingsView() {
    const {
        theme,
        isDirty,
        isSaving,
        updateTheme,
        updateColors,
        applyPreset,
        saveTheme,
        resetTheme,
    } = useCustomTheme();

    const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'radius' | 'components'>('presets');

    const handleSave = async () => {
        const success = await saveTheme();
        if (success) {
            toast.add({
                title: 'Tema Berhasil Disimpan',
                type: 'success',
                description: 'Konfigurasi tema Anda telah diperbarui dan aktif di seluruh aplikasi.',
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
        if (confirm('Kembalikan konfigurasi tema ke standar resmi BANYAN?')) {
            await resetTheme();
            toast.add({
                title: 'Tema Direset',
                type: 'info',
                description: 'Konfigurasi tema telah dikembalikan ke standar resmi BANYAN.',
            });
        }
    };

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
                            <Badge variant="outline" className="border-warning/50 bg-warning/10 text-warning text-xs">
                                <span className="size-1.5 rounded-full bg-warning animate-pulse" />
                                Perubahan Belum Disimpan
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sesuaikan identitas visual aplikasi mulai dari warna brand, gradien, radius sudut, hingga gaya tombol secara mandiri dan fleksibel.
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
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1">
                            <TabsTrigger value="presets" className="gap-1.5 text-xs font-semibold">
                                <Sparkles className="size-3.5" />
                                Preset
                            </TabsTrigger>
                            <TabsTrigger value="colors" className="gap-1.5 text-xs font-semibold">
                                <Palette className="size-3.5" />
                                Warna
                            </TabsTrigger>
                            <TabsTrigger value="radius" className="gap-1.5 text-xs font-semibold">
                                <Square className="size-3.5" />
                                Radius
                            </TabsTrigger>
                            <TabsTrigger value="components" className="gap-1.5 text-xs font-semibold">
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
                                                        style={{ background: preset.preview.gradient }}
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
                                                <span className="text-[0.6875rem] font-medium text-muted-foreground">Palet:</span>
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{ backgroundColor: preset.config.colors.primary }}
                                                    title={`Primary: ${preset.config.colors.primary}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{ backgroundColor: preset.config.colors.brandTo }}
                                                    title={`Gradien: ${preset.config.colors.brandTo}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{ backgroundColor: preset.config.colors.destructive }}
                                                    title={`Destructive: ${preset.config.colors.destructive}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{ backgroundColor: preset.config.colors.warning }}
                                                    title={`Warning: ${preset.config.colors.warning}`}
                                                />
                                                <span
                                                    className="size-3.5 rounded-sm border"
                                                    style={{ backgroundColor: preset.config.colors.info }}
                                                    title={`Info: ${preset.config.colors.info}`}
                                                />
                                                <span className="ml-auto text-[0.6875rem] text-muted-foreground">
                                                    Radius: {preset.config.radiusScale.toUpperCase()}
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
                                    <CardTitle className="text-sm font-semibold">Identitas Warna Brand Utama</CardTitle>
                                    <CardDescription className="text-xs">
                                        Warna utama digunakan pada tombol penting, navbar, sidebar aktif, dan aksen visual.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Primary Color */}
                                    <ColorRow
                                        label="Warna Utama (Primary)"
                                        description="Warna identitas inti aplikasi"
                                        value={theme.colors.primary}
                                        onChange={(val) => {
                                            updateColors({ primary: val, brandFrom: val, sidebarPrimary: val });
                                        }}
                                    />

                                    {/* Brand Gradient From */}
                                    <ColorRow
                                        label="Gradien Awal (Brand From)"
                                        description="Warna awal untuk tombol dan latar bergradien"
                                        value={theme.colors.brandFrom}
                                        onChange={(val) => updateColors({ brandFrom: val })}
                                    />

                                    {/* Brand Gradient To */}
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
                                    <CardTitle className="text-sm font-semibold">Warna Status & Indikator</CardTitle>
                                    <CardDescription className="text-xs">
                                        Digunakan untuk pesan error, peringatan, informasi, dan konfirmasi sukses.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Destructive */}
                                    <ColorRow
                                        label="Bahaya / Error (Destructive)"
                                        description="Tombol hapus, status ditolak, badge error"
                                        value={theme.colors.destructive}
                                        onChange={(val) => updateColors({ destructive: val })}
                                    />

                                    {/* Warning */}
                                    <ColorRow
                                        label="Peringatan (Warning)"
                                        description="Status pending, review, perhatian penting"
                                        value={theme.colors.warning}
                                        onChange={(val) => updateColors({ warning: val })}
                                    />

                                    {/* Info */}
                                    <ColorRow
                                        label="Informasi / Sekunder (Info)"
                                        description="Label informasi, tag program, aksen alternatif"
                                        value={theme.colors.info}
                                        onChange={(val) => updateColors({ info: val })}
                                    />

                                    {/* Success */}
                                    <ColorRow
                                        label="Sukses / Berhasil (Success)"
                                        description="Status selesai, hadir, aktif, dan pencapaian"
                                        value={theme.colors.success || '#16A34A'}
                                        onChange={(val) => updateColors({ success: val })}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 3. RADIUS TAB */}
                        <TabsContent value="radius" className="mt-5 space-y-4">
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Pilihan Skala Kelengkungan (Radius)</CardTitle>
                                    <CardDescription className="text-xs">
                                        Tentukan seberapa membulat sudut kartu, tombol, dialog, dan input.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                        {[
                                            { label: 'None (0px)', scale: 'none', value: '0px', desc: 'Kotak Tegas' },
                                            { label: 'SM (4px)', scale: 'sm', value: '0.25rem', desc: 'Ringkas Modern' },
                                            { label: 'MD (6px)', scale: 'md', value: '0.375rem', desc: 'Standar' },
                                            { label: 'LG (8px)', scale: 'lg', value: '0.5rem', desc: 'Membulat' },
                                            { label: 'XL (12px)', scale: 'xl', value: '0.75rem', desc: 'Pillowy' },
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
                                            <span className="font-medium text-foreground">Kustomisasi Nilai Spesifik</span>
                                            <span className="font-mono text-muted-foreground">{theme.radius}</span>
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
                                                    const rem = (px / 16).toFixed(3).replace(/\.?0+$/, '') + 'rem';
                                                    let scale: any = 'sm';
                                                    if (px === 0) scale = 'none';
                                                    else if (px <= 4) scale = 'sm';
                                                    else if (px <= 8) scale = 'md';
                                                    else if (px <= 12) scale = 'lg';
                                                    else scale = 'xl';
                                                    updateTheme({ radius: px === 0 ? '0px' : rem, radiusScale: scale });
                                                }}
                                                className="w-full accent-primary cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* 4. COMPONENTS TAB */}
                        <TabsContent value="components" className="mt-5 space-y-4">
                            <Card className="rounded-sm border-border/70">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">Gaya Tombol Utama</CardTitle>
                                    <CardDescription className="text-xs">
                                        Pilih bagaimana tombol utama ditampilkan di seluruh halaman.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                            { id: 'gradient', name: 'Gradien Modern', desc: 'Gradien halus berenergi' },
                                            { id: 'solid', name: 'Warna Solid', desc: 'Flat tanpa gradien' },
                                            { id: 'soft', name: 'Soft Accent', desc: 'Warna latar transparan' },
                                            { id: 'outline', name: 'Border Outline', desc: 'Minimalis dengan garis tepi' },
                                        ].map((style) => {
                                            const isSelected = theme.buttonStyle === style.id;
                                            return (
                                                <button
                                                    key={style.id}
                                                    type="button"
                                                    onClick={() => updateTheme({ buttonStyle: style.id as any })}
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
                                    <CardTitle className="text-sm font-semibold">Intensitas Bayangan (Shadow)</CardTitle>
                                    <CardDescription className="text-xs">
                                        Kedalaman bayangan untuk kartu dan modal.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                            { id: 'none', name: 'Tanpa Bayangan', desc: 'Flat 2D bersih' },
                                            { id: 'soft', name: 'Lembut (Default)', desc: 'Halus dan elegan' },
                                            { id: 'medium', name: 'Sedang', desc: 'Kedalaman seimbang' },
                                            { id: 'strong', name: 'Tegas', desc: 'Elevasi tinggi' },
                                        ].map((shadow) => {
                                            const isSelected = theme.shadowStyle === shadow.id;
                                            return (
                                                <button
                                                    key={shadow.id}
                                                    type="button"
                                                    onClick={() => updateTheme({ shadowStyle: shadow.id as any })}
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
                                <h2 className="text-sm font-bold text-foreground">Pratinjau Langsung (Live Preview)</h2>
                            </div>
                            <span className="text-[0.6875rem] text-muted-foreground">Otomatis Update</span>
                        </div>

                        {/* Preview Container */}
                        <div className="border border-border/80 bg-card p-5 space-y-5 rounded-sm shadow-sm">
                            {/* Card Header Preview */}
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
                                <div>
                                    <span className="text-xs uppercase tracking-wider text-white/80 font-semibold">
                                        {theme.themeName}
                                    </span>
                                    <h3 className="text-lg font-bold">EMS Dashboard</h3>
                                </div>
                                <span className="size-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                                    ✓
                                </span>
                            </div>

                            {/* Buttons Preview */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground block">Gaya Tombol:</span>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        style={{
                                            borderRadius: theme.radius,
                                            backgroundColor: theme.buttonStyle === 'solid' ? theme.colors.primary : undefined,
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
                                <span className="text-xs font-semibold text-muted-foreground block">Status & Badge:</span>
                                <div className="flex flex-wrap gap-1.5">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radius }}
                                    >
                                        Primary
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: theme.colors.destructive, borderRadius: theme.radius }}
                                    >
                                        Ditolak
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-black font-semibold"
                                        style={{ backgroundColor: theme.colors.warning, borderRadius: theme.radius }}
                                    >
                                        Review
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: theme.colors.info, borderRadius: theme.radius }}
                                    >
                                        Program
                                    </span>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-white"
                                        style={{ backgroundColor: theme.colors.success || '#16A34A', borderRadius: theme.radius }}
                                    >
                                        Selesai
                                    </span>
                                </div>
                            </div>

                            {/* Input Form Preview */}
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-muted-foreground block">Form Input:</span>
                                <Input
                                    placeholder="Contoh input teks dengan fokus ring tema..."
                                    defaultValue="Bimbel Cabang Utama"
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
                                    <span className="text-xs text-muted-foreground">Total Siswa Aktif</span>
                                    <div className="text-lg font-bold text-foreground">1,248 Siswa</div>
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
                                *Setiap penyesuaian di atas langsung diterapkan seketika pada seluruh aplikasi.
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
