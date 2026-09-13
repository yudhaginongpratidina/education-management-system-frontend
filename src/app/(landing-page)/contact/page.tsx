import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import ContactForm from '@/modules/home/contact-form';

export default function ContactPage() {
    return (
        <main>
            <Header />

            {/* Page Title */}
            <div className="bg-gray-100 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Have questions or need assistance? Reach out to us, and we'll get back to you as
                    soon as possible.
                </p>
            </div>

            <ContactForm />

            <Footer />
        </main>
    );
}
