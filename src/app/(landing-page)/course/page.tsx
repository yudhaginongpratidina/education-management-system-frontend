import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import CoursesList from '@/modules/home/courses-list';
import Pricing from '@/modules/home/pricing';

export default function CoursePricingPage() {
    return (
        <main>
            <Header />

            {/* Page Title */}
            <div className="bg-gray-100 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Courses & Pricing</h1>
                <p className="text-gray-600">
                    Explore our courses and choose the plan that suits you best.
                </p>
            </div>

            <CoursesList />
            <Pricing />

            <Footer />
        </main>
    );
}
