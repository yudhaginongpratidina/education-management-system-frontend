'use client';

import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import {
    Search,
    Grid,
    Check,
    X,
    Sparkles,
    HelpCircle,
    Loader2,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export const CURATED_ICON_CATEGORIES = [
    {
        name: 'Dashboard & Umum',
        icons: [
            'bxs:dashboard',
            'mdi:view-dashboard',
            'mdi:view-dashboard-outline',
            'lucide:layout-dashboard',
            'material-symbols:home-outline',
            'material-symbols:home',
            'material-symbols:analytics-outline',
            'mdi:chart-timeline-variant',
            'mdi:chart-box-outline',
            'solar:widget-2-bold-duotone',
            'tabler:layout-grid',
            'mdi:compass-outline',
        ],
    },
    {
        name: 'Akademik & Belajar',
        icons: [
            'mdi:school',
            'mdi:school-outline',
            'mdi:book-education-outline',
            'mdi:book-open-page-variant',
            'mdi:book-open-variant',
            'mdi:teach',
            'arcticons:classroom',
            'mdi:google-classroom',
            'mdi:certificate-outline',
            'mdi:notebook-outline',
            'mdi:presentation',
            'mdi:library',
            'ph:chalkboard-teacher',
            'tabler:books',
        ],
    },
    {
        name: 'Pengguna, Guru & Siswa',
        icons: [
            'mdi:account-group',
            'mdi:account-group-outline',
            'mdi:account-school',
            'mdi:account-tie',
            'mdi:human-male-board',
            'fa-solid:chalkboard-teacher',
            'arcticons:hkust-student',
            'griddy-icons:student',
            'mdi:badge-account-horizontal-outline',
            'mdi:account-circle',
            'mdi:card-account-details-outline',
            'mdi:account-multiple',
            'tabler:users',
            'solar:users-group-two-rounded-bold-duotone',
        ],
    },
    {
        name: 'Presensi & Jadwal',
        icons: [
            'mdi:calendar-account-outline',
            'mdi:calendar-check',
            'mdi:calendar-clock',
            'mdi:calendar-month',
            'ic:sharp-co-present',
            'fluent:presence-away-16-regular',
            'iconmind:baseline-approve-duotone-thin',
            'mdi:clock-time-four-outline',
            'mdi:camera-account',
            'mdi:fingerprint',
            'mdi:clipboard-check-outline',
            'mdi:calendar-refresh',
            'tabler:clock-check',
            'solar:calendar-date-bold-duotone',
        ],
    },
    {
        name: 'Keuangan & Kas',
        icons: [
            'mdi:cashflow',
            'mdi:cash-multiple',
            'mdi:currency-usd',
            'mdi:finance',
            'mdi:wallet-outline',
            'mdi:receipt-text-outline',
            'mdi:bank-transfer',
            'mdi:cash-register',
            'mdi:hand-coin-outline',
            'mdi:credit-card-outline',
            'solar:wallet-money-bold-duotone',
            'tabler:coins',
        ],
    },
    {
        name: 'Laporan & Dokumen',
        icons: [
            'boxicons:file-report',
            'mdi:file-chart-outline',
            'mdi:file-document-outline',
            'mdi:table-large',
            'mdi:poll',
            'mdi:printer-outline',
            'mdi:download-box-outline',
            'mdi:chart-bar',
            'mdi:file-excel-outline',
            'mdi:file-pdf-box',
            'tabler:report-analytics',
            'solar:document-text-bold-duotone',
        ],
    },
    {
        name: 'Keamanan & Akses',
        icons: [
            'akar-icons:key',
            'streamline-ultimate:login-key-bold',
            'mdi:shield-account',
            'mdi:shield-key-outline',
            'mdi:shield-check',
            'mdi:lock-outline',
            'fluent-mdl2:password-field',
            'mdi:security',
            'ant-design:menu-outlined',
            'mdi:account-lock-outline',
            'solar:shield-keyhole-bold-duotone',
            'tabler:key',
        ],
    },
    {
        name: 'Pengaturan & Master',
        icons: [
            'mdi:cog-outline',
            'mdi:tune-variant',
            'mdi:palette-outline',
            'mdi:domain',
            'mdi:office-building',
            'mdi:layers-outline',
            'bxl:payload-cms',
            'mdi:archive-outline',
            'mdi:help-circle-outline',
            'mdi:database-outline',
            'solar:settings-bold-duotone',
            'tabler:building-store',
        ],
    },
];

interface IconPickerProps {
    value?: string;
    onChange: (value: string) => void;
    id?: string;
    placeholder?: string;
    className?: string;
}

export function IconPicker({
    value = '',
    onChange,
    id,
    placeholder = 'Contoh: bxs:dashboard, mdi:school',
    className,
}: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [apiResults, setApiResults] = useState<string[]>([]);
    const [isSearchingApi, setIsSearchingApi] = useState(false);
    const [tempSelected, setTempSelected] = useState<string>(value);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            setTempSelected(value);
            setSearchTerm('');
            setApiResults([]);
        }
    };

    // Debounced search on Iconify API
    useEffect(() => {
        const query = searchTerm.trim();
        if (!query || query.length < 2) {
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearchingApi(true);
            try {
                const res = await fetch(
                    `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=36`,
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.icons)) {
                        setApiResults(data.icons);
                    }
                }
            } catch {
                // Ignore API network errors
            } finally {
                setIsSearchingApi(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Local curated filtered icons
    const filteredCuratedIcons = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        let list: string[] = [];

        if (selectedCategory === 'all') {
            CURATED_ICON_CATEGORIES.forEach((cat) => {
                list.push(...cat.icons);
            });
        } else {
            const cat = CURATED_ICON_CATEGORIES.find((c) => c.name === selectedCategory);
            if (cat) list.push(...cat.icons);
        }

        // Deduplicate
        list = Array.from(new Set(list));

        if (!query) return list;
        return list.filter((icon) => icon.toLowerCase().includes(query));
    }, [searchTerm, selectedCategory]);

    // Combined icons for display
    const displayedIcons = useMemo(() => {
        const set = new Set<string>();
        // Add curated matches first
        filteredCuratedIcons.forEach((i) => set.add(i));
        // Add API search results
        apiResults.forEach((i) => set.add(i));
        return Array.from(set);
    }, [filteredCuratedIcons, apiResults]);

    const handleSelectIcon = (iconName: string) => {
        setTempSelected(iconName);
        onChange(iconName);
        setOpen(false);
    };

    const handleConfirm = () => {
        onChange(tempSelected);
        setOpen(false);
    };

    return (
        <div className={`space-y-1.5 ${className ?? ''}`}>
            <div className="flex items-center gap-2">
                {/* Live Icon Preview Button */}
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger
                        render={
                            <button
                                type="button"
                                className="group relative flex size-10 shrink-0 items-center justify-center rounded-sm border border-input bg-card shadow-xs transition-colors hover:border-primary hover:bg-muted/50 cursor-pointer"
                                title="Klik untuk memilih ikon dari Iconify"
                            >
                                {value ? (
                                    <Icon
                                        icon={value}
                                        className="size-5 text-primary transition-transform group-hover:scale-110"
                                    />
                                ) : (
                                    <Grid className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </button>
                        }
                    />

                    {/* Dialog Content */}
                    <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-4 border-b bg-muted/20">
                            <DialogTitle className="text-base font-semibold flex items-center gap-2">
                                <Sparkles className="size-4 text-primary" />
                                Pilih Ikon Menu (Iconify)
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Pilih ikon dari koleksi siap pakai atau cari dari ribuan ikon Iconify berdasarkan kata kunci.
                            </DialogDescription>

                            {/* Search Bar */}
                            <div className="relative mt-2">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Cari ikon (contoh: dashboard, student, report, key, book)..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (!e.target.value.trim()) {
                                            setApiResults([]);
                                        }
                                    }}
                                    className="h-9 pl-8 pr-8 text-xs bg-background"
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setApiResults([]);
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills (shown when no active search) */}
                            {!searchTerm && (
                                <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none pb-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors shrink-0 ${
                                            selectedCategory === 'all'
                                                ? 'bg-primary text-primary-foreground font-semibold'
                                                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    {CURATED_ICON_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors shrink-0 ${
                                                selectedCategory === cat.name
                                                    ? 'bg-primary text-primary-foreground font-semibold'
                                                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </DialogHeader>

                        {/* Icon Grid Area */}
                        <div className="flex-1 overflow-y-auto p-4 max-h-[50vh]">
                            {isSearchingApi && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 py-1 px-2 rounded-sm bg-muted/40">
                                    <Loader2 className="size-3 animate-spin text-primary" />
                                    Mencari ikon di repositori Iconify...
                                </div>
                            )}

                            {displayedIcons.length > 0 ? (
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                    {displayedIcons.map((iconName) => {
                                        const isSelected = tempSelected === iconName;
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => handleSelectIcon(iconName)}
                                                className={`group relative flex flex-col items-center justify-center p-2.5 rounded-sm border transition-all aspect-square cursor-pointer ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                                                        : 'border-border/60 bg-card hover:border-primary/60 hover:bg-muted/40'
                                                }`}
                                                title={iconName}
                                            >
                                                <Icon
                                                    icon={iconName}
                                                    className={`size-6 transition-transform group-hover:scale-115 ${
                                                        isSelected ? 'text-primary' : 'text-foreground'
                                                    }`}
                                                />
                                                <span className="mt-1.5 w-full text-[9px] font-mono text-muted-foreground truncate text-center group-hover:text-foreground">
                                                    {iconName.split(':').pop()}
                                                </span>
                                                {isSelected && (
                                                    <span className="absolute top-1 right-1 size-3.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[9px]">
                                                        <Check className="size-2.5 stroke-[3]" />
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-2">
                                    <HelpCircle className="size-8 mx-auto text-muted-foreground/60" />
                                    <p className="text-xs font-semibold text-foreground">
                                        Tidak ada ikon yang cocok
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        Coba gunakan kata kunci dalam bahasa Inggris (misal: home, user, book, chart, money, star).
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Dialog Footer */}
                        <DialogFooter className="p-3 border-t bg-muted/20 flex flex-row items-center justify-between sm:justify-between w-full">
                            <div className="flex items-center gap-2 min-w-0">
                                {tempSelected ? (
                                    <div className="flex items-center gap-1.5 text-xs truncate">
                                        <Icon icon={tempSelected} className="size-4 text-primary shrink-0" />
                                        <span className="font-mono text-[11px] text-foreground font-semibold truncate">
                                            {tempSelected}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-muted-foreground italic">
                                        Belum ada ikon terpilih
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                    className="h-8 text-xs"
                                >
                                    Tutup
                                </Button>
                                {tempSelected && (
                                    <Button
                                        size="sm"
                                        onClick={handleConfirm}
                                        className="h-8 text-xs gap-1.5"
                                    >
                                        <Check className="size-3.5" />
                                        Gunakan Ikon
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Text Input for Icon String */}
                <div className="relative flex-1">
                    <Input
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="h-10 pr-20 font-mono text-xs"
                    />

                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {value && (
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="p-1 rounded-sm text-muted-foreground hover:text-foreground"
                                title="Hapus ikon"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setOpen(true)}
                            className="h-7 px-2 text-[11px] gap-1 shadow-xs"
                        >
                            <Sparkles className="size-3 text-primary" />
                            Pilih
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick helper tip */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                    Format: <code className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded">koleksi:nama-ikon</code> (misal: <code>bxs:dashboard</code>)
                </span>
                {value && (
                    <span className="flex items-center gap-1 text-primary font-medium text-[10px]">
                        <Check className="size-3" /> Ikon aktif
                    </span>
                )}
            </div>
        </div>
    );
}
