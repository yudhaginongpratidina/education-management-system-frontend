'use client';

import React, { useState, useEffect } from 'react';
import { useCustomTheme } from '@/lib/theme-context';
import { formatImageUrl } from '@/lib/image-url';
import { Icon } from '@iconify/react';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    collapsed?: boolean;
    showText?: boolean;
    showSubtitle?: boolean;
    className?: string;
    textClassName?: string;
    iconClassName?: string;
}

export function AppLogo({
    size = 'md',
    collapsed = false,
    showText = true,
    showSubtitle = true,
    className,
    textClassName,
    iconClassName,
}: AppLogoProps) {
    const { theme } = useCustomTheme();
    const logo = theme.logo;
    const [imgError, setImgError] = useState(false);

    // Reset error state whenever the URL changes
    useEffect(() => {
        setImgError(false);
    }, [logo?.url]);

    const sizeClasses = {
        sm: {
            container: 'size-7',
            icon: 'size-4',
            title: 'text-sm font-bold',
            subtitle: 'text-[0.625rem]',
        },
        md: {
            container: 'size-9',
            icon: 'size-5',
            title: 'text-base font-bold',
            subtitle: 'text-xs',
        },
        lg: {
            container: 'size-11',
            icon: 'size-6',
            title: 'text-lg font-bold',
            subtitle: 'text-xs',
        },
        xl: {
            container: 'size-14',
            icon: 'size-8',
            title: 'text-xl font-bold',
            subtitle: 'text-sm',
        },
    }[size];

    const displayType = logo?.type || 'image_text';
    const logoText = logo?.text || 'BANYAN';
    const logoSubtitle = logo?.subtitle || 'Bimbel Management';

    // Format URL using standard helper (handles /storage/ paths, local assets, and absolute URLs)
    const resolvedImageUrl = formatImageUrl(logo?.url);
    const hasCustomImage = Boolean(
        resolvedImageUrl && !imgError && displayType !== 'icon' && displayType !== 'text',
    );

    // Display rules based on type
    const showVisual = displayType !== 'text' || collapsed;
    const showTextContent = !collapsed && showText && displayType !== 'image';

    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            {/* Visual: Image or Icon */}
            {showVisual &&
                (hasCustomImage ? (
                    <div
                        className={cn(
                            'flex shrink-0 items-center justify-center overflow-hidden border border-border/40 bg-white p-0.5 shadow-xs',
                            sizeClasses.container,
                            iconClassName,
                        )}
                        style={{ borderRadius: theme.radius || '0.25rem' }}
                    >
                        <img
                            src={resolvedImageUrl}
                            alt={logoText}
                            className="size-full object-contain"
                            onError={() => {
                                console.warn(
                                    'Logo image failed to load, falling back to icon:',
                                    resolvedImageUrl,
                                );
                                setImgError(true);
                            }}
                        />
                    </div>
                ) : (
                    <div
                        className={cn(
                            'flex shrink-0 items-center justify-center bg-brand-gradient text-primary-foreground shadow-sm',
                            sizeClasses.container,
                            iconClassName,
                        )}
                        style={{ borderRadius: theme.radius || '0.25rem' }}
                    >
                        {displayType === 'text' && collapsed ? (
                            <span className="font-bold text-xs uppercase">
                                {logoText.charAt(0)}
                            </span>
                        ) : logo?.iconName ? (
                            <Icon icon={logo.iconName} className={sizeClasses.icon} />
                        ) : (
                            <GraduationCap className={sizeClasses.icon} />
                        )}
                    </div>
                ))}

            {/* Logo Text & Subtitle */}
            {showTextContent && (
                <div
                    className={cn(
                        'grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden',
                        textClassName,
                    )}
                >
                    <span className={cn('truncate font-heading tracking-tight', sizeClasses.title)}>
                        {logoText}
                    </span>
                    {showSubtitle && logoSubtitle && (
                        <span
                            className={cn('truncate text-muted-foreground', sizeClasses.subtitle)}
                        >
                            {logoSubtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
