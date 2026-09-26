import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import CoursesList from '@/modules/home/courses-list';
import Pricing from '@/modules/home/pricing';
import Schedule from '@/modules/home/schedule';
import EnrollmentCta from '@/modules/home/enrollment-cta';

export default function CoursePricingPage() {
    return (
        <main>
            <Header />

            <div className="gradient-mesh border-b border-border/60 py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="font-heading text-4xl font-bold tracking-tight">
                        Program & Harga
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                        Jelajahi program belajar kami dan pilih paket yang paling sesuai dengan
                        kebutuhan.
                    </p>
                </div>
            </div>

            <CoursesList />
            <Schedule />
            <Pricing />
            <EnrollmentCta />

            <Footer />
        </main>
    );
}
