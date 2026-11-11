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

    const isWide = (logo?.aspectRatio === 'wide' || logo?.aspectRatio === 'auto') && !collapsed;

    const sizeClasses = {
        sm: {
            container: 'size-7',
            containerWide: 'h-7 w-auto min-w-7 max-w-[120px]',
            icon: 'size-4',
            title: 'text-sm font-bold',
            subtitle: 'text-[0.625rem]',
        },
        md: {
            container: 'size-9',
            containerWide: 'h-9 w-auto min-w-9 max-w-[160px]',
            icon: 'size-5',
            title: 'text-base font-bold',
            subtitle: 'text-xs',
        },
        lg: {
            container: 'size-11',
            containerWide: 'h-11 w-auto min-w-11 max-w-[200px]',
            icon: 'size-6',
            title: 'text-lg font-bold',
            subtitle: 'text-xs',
        },
        xl: {
            container: 'size-14',
            containerWide: 'h-14 w-auto min-w-14 max-w-[240px]',
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

    // Styling calculations for border, padding, and background
    const hasBorder =
        logo?.hasBorder !== undefined
            ? logo.hasBorder
            : logo?.borderWidth !== undefined
              ? Number(logo.borderWidth) > 0
              : false;

    const borderWidth = hasBorder
        ? logo?.borderWidth !== undefined
            ? Number(logo.borderWidth)
            : 1
        : 0;

    const resolvedPadding =
        logo?.padding !== undefined ? `${logo.padding}px` : hasBorder ? '2px' : '0px';

    const hasBg =
        logo?.hasBackground !== undefined
            ? logo.hasBackground
            : logo?.backgroundColor && logo.backgroundColor !== 'transparent';

    const resolvedBg = hasBg ? logo?.backgroundColor || '#ffffff' : 'transparent';

    const resolvedRadius = logo?.borderRadius
        ? logo.borderRadius === 'inherit'
            ? theme.radius || '0.25rem'
            : logo.borderRadius
        : theme.radius || '0.25rem';

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
                            'flex shrink-0 items-center justify-center overflow-hidden transition-all',
                            isWide ? sizeClasses.containerWide : sizeClasses.container,
                            hasBorder && !logo?.borderColor && 'border border-border/40',
                            hasBorder && 'shadow-xs',
                            iconClassName,
                        )}
                        style={{
                            borderRadius: resolvedRadius,
                            padding: resolvedPadding,
                            backgroundColor: resolvedBg,
                            borderWidth: hasBorder ? `${borderWidth}px` : 0,
                            borderColor:
                                hasBorder && logo?.borderColor ? logo.borderColor : undefined,
                            borderStyle: hasBorder ? logo?.borderStyle || 'solid' : 'none',
                        }}
                    >
                        <img
                            src={resolvedImageUrl}
                            alt={logoText}
                            className={cn(
                                'size-full',
                                logo?.imageFit === 'cover' ? 'object-cover' : 'object-contain',
                            )}
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
                        style={{ borderRadius: resolvedRadius }}
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
