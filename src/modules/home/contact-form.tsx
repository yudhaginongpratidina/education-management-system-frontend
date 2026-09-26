import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const contactInfo = [
    {
        icon: 'mdi:map-marker-outline',
        title: 'Alamat',
        value: 'Jl. Sudirman No. 123, Jakarta',
    },
    {
        icon: 'mdi:phone-outline',
        title: 'Telepon',
        value: '(021) 555-0101',
    },
    {
        icon: 'mdi:email-outline',
        title: 'Email',
        value: 'halo@bimbelcerdas.id',
    },
];

export default function ContactForm() {
    return (
        <section className="bg-background py-20">
            <div className="container mx-auto px-4">
                <div className="grid gap-10 lg:grid-cols-3">
                    {/* Contact Info */}
                    <div className="space-y-5">
                        {contactInfo.map((item) => (
                            <div
                                key={item.title}
                                className="hover:border-primary/30 flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-card transition-colors"
                            >
                                <div className="bg-brand-gradient-soft text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl">
                                    <Icon icon={item.icon} className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="font-heading font-semibold">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <form className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 shadow-card lg:col-span-2 lg:p-8">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label htmlFor="contact-name" className="text-sm font-medium">
                                    Nama
                                </label>
                                <Input id="contact-name" placeholder="Nama lengkap" required />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="contact-email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="contact-email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="contact-subject" className="text-sm font-medium">
                                Subjek
                            </label>
                            <Input
                                id="contact-subject"
                                placeholder="Ingin bertanya tentang..."
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="contact-message" className="text-sm font-medium">
                                Pesan
                            </label>
                            <Textarea
                                id="contact-message"
                                placeholder="Tuliskan pesan Anda..."
                                rows={5}
                                required
                            />
                        </div>
                        <Button type="submit" size="lg" className="w-full md:w-auto">
                            Kirim Pesan
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
