import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import ContactForm from '@/modules/home/contact-form';

export default function ContactPage() {
    return (
        <main>
            <Header />

            <div className="gradient-mesh border-b border-border/60 py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="font-heading text-4xl font-bold tracking-tight">Hubungi Kami</h1>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Punya pertanyaan atau butuh bantuan? Kirim pesan dan tim kami akan segera
                        menghubungi Anda.
                    </p>
                </div>
            </div>

            <ContactForm />

            <Footer />
        </main>
    );
}
