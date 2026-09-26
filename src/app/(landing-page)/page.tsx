import Header from '@/modules/home/header';
import Hero from '@/modules/home/hero';
import TrustBar from '@/modules/home/trust-bar';
import FeaturesOverview from '@/modules/home/features-overview';
import About from '@/modules/home/about';
import Counts from '@/modules/home/counts';
import CoursesList from '@/modules/home/courses-list';
import LearningMethod from '@/modules/home/learning-method';
import Schedule from '@/modules/home/schedule';
import WhyUs from '@/modules/home/why-us';
import Results from '@/modules/home/results';
import Facilities from '@/modules/home/facilities';
import TrainersList from '@/modules/home/trainers-list';
import Pricing from '@/modules/home/pricing';
import Testimonials from '@/modules/home/testimonials';
import Branches from '@/modules/home/branches';
import FAQ from '@/modules/home/faq';
import BlogTips from '@/modules/home/blog-tips';
import EnrollmentCta from '@/modules/home/enrollment-cta';
import Footer from '@/modules/home/footer';

export default function Page() {
    return (
        <main>
            <Header />
            <Hero />
            <TrustBar />
            <FeaturesOverview />
            <About />
            <Counts />
            <CoursesList />
            <LearningMethod />
            <Schedule />
            <WhyUs />
            <Results />
            <Facilities />
            <TrainersList />
            <Pricing />
            <Testimonials />
            <Branches />
            <FAQ />
            <BlogTips />
            <EnrollmentCta />
            <Footer />
        </main>
    );
}
