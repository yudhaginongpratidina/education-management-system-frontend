import Header from '@/modules/home/header';
import Hero from '@/modules/home/hero';
import FeaturesOverview from '@/modules/home/features-overview';
import About from '@/modules/home/about';
import Counts from '@/modules/home/counts';
import WhyUs from '@/modules/home/why-us';
import Branches from '@/modules/home/branches';
import Footer from '@/modules/home/footer';

export default function Page() {
    return (
        <main>
            <Header />
            <Hero />
            <FeaturesOverview />
            <About />
            <Counts />
            <WhyUs />
            <Branches />
            <Footer />
        </main>
    );
}
