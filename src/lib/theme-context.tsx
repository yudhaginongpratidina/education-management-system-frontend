'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { http } from '@/lib/http';

export interface ThemeColors {
    primary: string;
    primaryForeground: string;
    brandFrom: string;
    brandTo: string;
    secondary?: string;
    accent?: string;
    destructive: string;
    destructiveForeground: string;
    warning: string;
    warningForeground: string;
    info: string;
    infoForeground: string;
    success: string;
    successForeground: string;
    background?: string;
    card?: string;
    sidebar?: string;
    sidebarPrimary?: string;
}

export interface AppThemeConfig {
    preset: string;
    themeName: string;
    colors: ThemeColors;
    radius: string;
    radiusScale: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    buttonStyle: 'gradient' | 'solid' | 'soft' | 'outline';
    shadowStyle: 'none' | 'soft' | 'medium' | 'strong';
    fontFamily: string;
}

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    preview: {
        primary: string;
        accent: string;
        gradient: string;
    };
    config: AppThemeConfig;
}

export const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'banyan',
        name: 'BANYAN Official',
        description: 'Deep Blue & Sapphire dengan aksen Warm Red & Golden Yellow resmi BANYAN.',
        preview: {
            primary: '#0F3B82',
            accent: '#F4B400',
            gradient: 'linear-gradient(135deg, #0F3B82, #1D54B2)',
        },
        config: {
            preset: 'banyan',
            themeName: 'BANYAN Official',
            colors: {
                primary: '#0F3B82',
                primaryForeground: '#FFFFFF',
                brandFrom: '#0F3B82',
                brandTo: '#1D54B2',
                secondary: '#F0F4FA',
                accent: '#E6EFFD',
                destructive: '#D64545',
                destructiveForeground: '#FFFFFF',
                warning: '#F4B400',
                warningForeground: '#2A1F00',
                info: '#1E7B85',
                infoForeground: '#FFFFFF',
                success: '#16A34A',
                successForeground: '#FFFFFF',
                background: '',
                card: '',
                sidebar: '',
                sidebarPrimary: '#0F3B82',
            },
            radius: '0.25rem',
            radiusScale: 'sm',
            buttonStyle: 'gradient',
            shadowStyle: 'soft',
            fontFamily: 'plus-jakarta',
        },
    },
    {
        id: 'emerald',
        name: 'Emerald Clean',
        description: 'Nuansa hijau emerald modern dan segar untuk lingkungan edukasi yang dinamis.',
        preview: {
            primary: '#059669',
            accent: '#F59E0B',
            gradient: 'linear-gradient(135deg, #059669, #10B981)',
        },
        config: {
            preset: 'emerald',
            themeName: 'Emerald Clean',
            colors: {
                primary: '#059669',
                primaryForeground: '#FFFFFF',
                brandFrom: '#059669',
                brandTo: '#10B981',
                secondary: '#ECFDF5',
                accent: '#D1FAE5',
                destructive: '#E11D48',
                destructiveForeground: '#FFFFFF',
                warning: '#F59E0B',
                warningForeground: '#1F1400',
                info: '#0284C7',
                infoForeground: '#FFFFFF',
                success: '#10B981',
                successForeground: '#FFFFFF',
                background: '',
                card: '',
                sidebar: '',
                sidebarPrimary: '#059669',
            },
            radius: '0.375rem',
            radiusScale: 'md',
            buttonStyle: 'gradient',
            shadowStyle: 'soft',
            fontFamily: 'plus-jakarta',
        },
    },
    {
        id: 'sapphire',
        name: 'Ocean Sapphire',
        description: 'Biru laut cerah berenergi tinggi yang cocok untuk aplikasi modern dan profesional.',
        preview: {
            primary: '#2563EB',
            accent: '#06B6D4',
            gradient: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        },
        config: {
            preset: 'sapphire',
            themeName: 'Ocean Sapphire',
            colors: {
                primary: '#2563EB',
                primaryForeground: '#FFFFFF',
                brandFrom: '#1D4ED8',
                brandTo: '#3B82F6',
                secondary: '#EFF6FF',
                accent: '#DBEAFE',
                destructive: '#EF4444',
                destructiveForeground: '#FFFFFF',
                warning: '#F59E0B',
                warningForeground: '#261500',
                info: '#06B6D4',
                infoForeground: '#FFFFFF',
                success: '#10B981',
                successForeground: '#FFFFFF',
                background: '',
                card: '',
                sidebar: '',
                sidebarPrimary: '#2563EB',
            },
            radius: '0.25rem',
            radiusScale: 'sm',
            buttonStyle: 'gradient',
            shadowStyle: 'soft',
            fontFamily: 'plus-jakarta',
        },
    },
    {
        id: 'sunset',
        name: 'Sunset Coral',
        description: 'Gradien hangat coral dan jingga yang ramah, kreatif, dan inspiratif.',
        preview: {
            primary: '#EA580C',
            accent: '#EAB308',
            gradient: 'linear-gradient(135deg, #C2410C, #F97316)',
        },
        config: {
            preset: 'sunset',
            themeName: 'Sunset Coral',
            colors: {
                primary: '#EA580C',
                primaryForeground: '#FFFFFF',
                brandFrom: '#C2410C',
                brandTo: '#F97316',
                secondary: '#FFF7ED',
                accent: '#FFEDD5',
                destructive: '#DC2626',
                destructiveForeground: '#FFFFFF',
                warning: '#EAB308',
                warningForeground: '#261C00',
                info: '#0284C7',
                infoForeground: '#FFFFFF',
                success: '#16A34A',
                successForeground: '#FFFFFF',
                background: '',
                card: '',
                sidebar: '',
                sidebarPrimary: '#EA580C',
            },
            radius: '0.5rem',
            radiusScale: 'lg',
            buttonStyle: 'gradient',
            shadowStyle: 'medium',
            fontFamily: 'plus-jakarta',
        },
    },
    {
        id: 'royal',
        name: 'Royal Purple',
        description: 'Sentuhan warna ungu ningrat yang mewah, elegan, dan menonjolkan prestise.',
        preview: {
            primary: '#7C3AED',
            accent: '#EC4899',
            gradient: 'linear-gradient(135deg, #6D28D9, #8B5CF6)',
        },
        config: {
            preset: 'royal',
            themeName: 'Royal Purple',
            colors: {
                primary: '#7C3AED',
                primaryForeground: '#FFFFFF',
                brandFrom: '#6D28D9',
                brandTo: '#8B5CF6',
                secondary: '#F5F3FF',
                accent: '#EDE9FE',
                destructive: '#E11D48',
                destructiveForeground: '#FFFFFF',
                warning: '#F59E0B',
                warningForeground: '#2A1700',
                info: '#3B82F6',
                infoForeground: '#FFFFFF',
                success: '#10B981',
                successForeground: '#FFFFFF',
                background: '',
                card: '',
                sidebar: '',
                sidebarPrimary: '#7C3AED',
            },
            radius: '0.375rem',
            radiusScale: 'md',
            buttonStyle: 'gradient',
            shadowStyle: 'soft',
            fontFamily: 'plus-jakarta',
        },
    },
    {
        id: 'slate',
        name: 'Slate Minimalist',
        description: 'Tampilan monokromatik abu-abu gelap dengan sudut kotak tajam ala dev-tool modern.',
        preview: {
            primary: '#334155',
            accent: '#64748B',
            gradient: 'linear-gradient(135deg, #1E293B, #475569)',
        },
        config: {
            preset: 'slate',
            themeName: 'Slate Minimalist',
            colors: {
                primary: '#334155',
                primaryForeground: '#FFFFFF',
                brandFrom: '#1E293B',
                brandTo: '#475569',
                secondary: '#F1F5F9',
                accent: '#E2E8F0',
                destructive: '#DC2626',
                destructiveForeground: '#FFFFFF',
                warning: '#D97706',
                warningForeground: '#1F1200',
                info: '#2563EB',
                infoForeground: '#FFFFFF',
                success: '#16A34A',
                successForeground: '#FFFFFF',
                background: '',
                card: '',
                sidebar: '',
                sidebarPrimary: '#334155',
            },
            radius: '0px',
            radiusScale: 'none',
            buttonStyle: 'solid',
            shadowStyle: 'none',
            fontFamily: 'plus-jakarta',
        },
    },
];

export const DEFAULT_THEME = THEME_PRESETS[0].config;

interface CustomThemeContextType {
    theme: AppThemeConfig;
    isDirty: boolean;
    isLoading: boolean;
    isSaving: boolean;
    updateTheme: (newTheme: Partial<AppThemeConfig>) => void;
    updateColors: (colors: Partial<ThemeColors>) => void;
    applyPreset: (presetId: string) => void;
    saveTheme: () => Promise<boolean>;
    resetTheme: () => Promise<boolean>;
    presets: ThemePreset[];
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ems_active_theme_config';

function applyThemeToDocument(theme: AppThemeConfig) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply Colors
    if (theme.colors.primary) {
        root.style.setProperty('--primary', theme.colors.primary);
        root.style.setProperty('--color-banyan-blue', theme.colors.primary);
        root.style.setProperty('--sidebar-primary', theme.colors.primary);
        root.style.setProperty('--ring', theme.colors.primary);
    }
    if (theme.colors.primaryForeground) {
        root.style.setProperty('--primary-foreground', theme.colors.primaryForeground);
        root.style.setProperty('--sidebar-primary-foreground', theme.colors.primaryForeground);
    }
    if (theme.colors.brandFrom) {
        root.style.setProperty('--brand-from', theme.colors.brandFrom);
    }
    if (theme.colors.brandTo) {
        root.style.setProperty('--brand-to', theme.colors.brandTo);
    }
    if (theme.colors.destructive) {
        root.style.setProperty('--destructive', theme.colors.destructive);
        root.style.setProperty('--color-banyan-red', theme.colors.destructive);
    }
    if (theme.colors.destructiveForeground) {
        root.style.setProperty('--destructive-foreground', theme.colors.destructiveForeground);
    }
    if (theme.colors.warning) {
        root.style.setProperty('--warning', theme.colors.warning);
        root.style.setProperty('--color-banyan-yellow', theme.colors.warning);
    }
    if (theme.colors.warningForeground) {
        root.style.setProperty('--warning-foreground', theme.colors.warningForeground);
    }
    if (theme.colors.info) {
        root.style.setProperty('--info', theme.colors.info);
        root.style.setProperty('--color-banyan-teal', theme.colors.info);
    }
    if (theme.colors.infoForeground) {
        root.style.setProperty('--info-foreground', theme.colors.infoForeground);
    }
    if (theme.colors.success) {
        root.style.setProperty('--success', theme.colors.success);
    }
    if (theme.colors.successForeground) {
        root.style.setProperty('--success-foreground', theme.colors.successForeground);
    }
    if (theme.colors.secondary) {
        root.style.setProperty('--secondary', theme.colors.secondary);
    }
    if (theme.colors.accent) {
        root.style.setProperty('--accent', theme.colors.accent);
    }
    if (theme.colors.background) {
        root.style.setProperty('--background', theme.colors.background);
    }
    if (theme.colors.card) {
        root.style.setProperty('--card', theme.colors.card);
    }

    // Apply Radius Scale
    const r = theme.radius || '0.25rem';
    root.style.setProperty('--radius', r);
    root.style.setProperty('--radius-sm', r === '0px' ? '0px' : 'calc(var(--radius) * 0.6)');
    root.style.setProperty('--radius-md', r);
    root.style.setProperty('--radius-lg', r);
    root.style.setProperty('--radius-xl', r);
    root.style.setProperty('--radius-2xl', r);
    root.style.setProperty('--radius-3xl', r);
    root.style.setProperty('--radius-4xl', r);

    // Button style class on root
    root.dataset.buttonStyle = theme.buttonStyle || 'gradient';
    root.dataset.shadowStyle = theme.shadowStyle || 'soft';
}

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<AppThemeConfig>(DEFAULT_THEME);
    const [savedTheme, setSavedTheme] = useState<AppThemeConfig>(DEFAULT_THEME);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Initial load: read cache first to prevent flash, then fetch from API
    useEffect(() => {
        try {
            const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                setThemeState(parsed);
                setSavedTheme(parsed);
                applyThemeToDocument(parsed);
            }
        } catch {
            // Ignore storage parse error
        }

        async function fetchRemoteTheme() {
            try {
                const response = await http.get('/theme');
                if (response.data?.success && response.data?.data) {
                    const remoteTheme = response.data.data as AppThemeConfig;
                    setThemeState(remoteTheme);
                    setSavedTheme(remoteTheme);
                    applyThemeToDocument(remoteTheme);
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remoteTheme));
                }
            } catch (err) {
                console.warn('Could not load remote theme, using default/cached theme:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRemoteTheme();
    }, []);

    const updateTheme = useCallback((newTheme: Partial<AppThemeConfig>) => {
        setThemeState((prev) => {
            const next: AppThemeConfig = {
                ...prev,
                ...newTheme,
                colors: {
                    ...prev.colors,
                    ...(newTheme.colors ?? {}),
                },
            };
            applyThemeToDocument(next);
            setIsDirty(true);
            return next;
        });
    }, []);

    const updateColors = useCallback((colors: Partial<ThemeColors>) => {
        setThemeState((prev) => {
            const next: AppThemeConfig = {
                ...prev,
                preset: 'custom',
                colors: {
                    ...prev.colors,
                    ...colors,
                },
            };
            applyThemeToDocument(next);
            setIsDirty(true);
            return next;
        });
    }, []);

    const applyPreset = useCallback((presetId: string) => {
        const found = THEME_PRESETS.find((p) => p.id === presetId);
        if (found) {
            setThemeState(found.config);
            applyThemeToDocument(found.config);
            setIsDirty(true);
        }
    }, []);

    const saveTheme = useCallback(async (): Promise<boolean> => {
        setIsSaving(true);
        try {
            const response = await http.put('/theme', theme);
            if (response.data?.success) {
                const updated = response.data.data;
                setSavedTheme(updated);
                setThemeState(updated);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
                applyThemeToDocument(updated);
                setIsDirty(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to save theme to backend:', error);
            // Even if remote save fails (e.g. offline), keep it saved in local storage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(theme));
            setIsDirty(false);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [theme]);

    const resetTheme = useCallback(async (): Promise<boolean> => {
        setIsSaving(true);
        try {
            await http.post('/theme/reset');
        } catch {
            // If backend request fails, continue resetting locally
        } finally {
            setThemeState(DEFAULT_THEME);
            setSavedTheme(DEFAULT_THEME);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_THEME));
            applyThemeToDocument(DEFAULT_THEME);
            setIsDirty(false);
            setIsSaving(false);
        }
        return true;
    }, []);

    return (
        <CustomThemeContext.Provider
            value={{
                theme,
                isDirty,
                isLoading,
                isSaving,
                updateTheme,
                updateColors,
                applyPreset,
                saveTheme,
                resetTheme,
                presets: THEME_PRESETS,
            }}
        >
            {children}
        </CustomThemeContext.Provider>
    );
}

export function useCustomTheme() {
    const context = useContext(CustomThemeContext);
    if (!context) {
        throw new Error('useCustomTheme must be used within a CustomThemeProvider');
    }
    return context;
}
