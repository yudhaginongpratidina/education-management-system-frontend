'use client';

import * as React from 'react';
import { Icon } from '@iconify/react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';

export function SectionHeader({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
            <div>
                <h2 className="font-heading text-lg font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function TextField({
    label,
    value,
    onChange,
    placeholder,
    className,
    type = 'text',
}: {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    type?: string;
}) {
    return (
        <Field className={className}>
            {label ? <FieldLabel>{label}</FieldLabel> : null}
            <Input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </Field>
    );
}

export function TextAreaField({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
    className,
}: {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
}) {
    return (
        <Field className={className}>
            {label ? <FieldLabel>{label}</FieldLabel> : null}
            <Textarea
                rows={rows}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </Field>
    );
}

export function ImageField({
    label = 'Gambar',
    value,
    onChange,
}: {
    label?: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex items-end gap-3">
            <TextField
                label={label}
                value={value}
                onChange={onChange}
                placeholder="/assets/img/..."
                className="flex-1"
            />
            <div className="mb-0.5 size-16 shrink-0 overflow-hidden rounded-lg border border-border/70 bg-muted">
                {value ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={value} alt="" className="h-full w-full object-cover" />
                ) : null}
            </div>
        </div>
    );
}

export function ItemCard({
    title,
    onRemove,
    children,
    badge,
}: {
    title: React.ReactNode;
    onRemove?: () => void;
    children: React.ReactNode;
    badge?: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                    {title}
                    {badge}
                </span>
                {onRemove ? (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={onRemove}
                        aria-label="Hapus"
                    >
                        <Icon icon="mdi:trash-can-outline" />
                    </Button>
                ) : null}
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

export function AddButton({
    onClick,
    label = 'Tambah item',
}: {
    onClick: () => void;
    label?: string;
}) {
    return (
        <Button variant="outline" size="sm" onClick={onClick}>
            <Icon icon="mdi:plus" />
            {label}
        </Button>
    );
}

export function PublishBadge({ published }: { published: boolean }) {
    return (
        <span
            className={cn(
                'rounded-full px-2 py-0.5 text-[0.6875rem] font-medium',
                published ? 'bg-success/12 text-success' : 'bg-muted text-muted-foreground',
            )}
        >
            {published ? 'Tampil' : 'Draft'}
        </span>
    );
}

export function ToggleField({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                'flex w-full items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2 text-sm transition-colors hover:bg-accent/50',
            )}
        >
            <span className="font-medium">{label}</span>
            <span
                className={cn(
                    'relative h-5 w-9 rounded-full transition-colors',
                    checked ? 'bg-brand-gradient' : 'bg-muted-foreground/30',
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 size-4 rounded-full bg-white shadow transition-all',
                        checked ? 'left-4.5' : 'left-0.5',
                    )}
                />
            </span>
        </button>
    );
}

export function StringListEditor({
    label,
    values,
    onChange,
    placeholder = 'Tambah poin...',
}: {
    label?: string;
    values: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = React.useState('');

    const add = () => {
        const value = draft.trim();
        if (!value) return;
        onChange([...values, value]);
        setDraft('');
    };

    return (
        <div className="space-y-2">
            {label ? <p className="text-sm font-medium">{label}</p> : null}
            <div className="flex flex-wrap gap-2">
                {values.map((value, index) => (
                    <span
                        key={`${value}-${index}`}
                        className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full py-1 pr-1.5 pl-3 text-sm"
                    >
                        {value}
                        <button
                            type="button"
                            onClick={() => onChange(values.filter((_, i) => i !== index))}
                            className="hover:text-destructive text-muted-foreground"
                            aria-label={`Hapus ${value}`}
                        >
                            <Icon icon="mdi:close" className="text-sm" />
                        </button>
                    </span>
                ))}
                {values.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Belum ada data.</span>
                ) : null}
            </div>
            <div className="flex gap-2">
                <Input
                    value={draft}
                    placeholder={placeholder}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            add();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={add}>
                    <Icon icon="mdi:plus" />
                    Tambah
                </Button>
            </div>
        </div>
    );
}
