import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import Testimonials from '@/modules/home/testimonials';
import FAQ from '@/modules/home/faq';
import { Icon } from '@iconify/react';

export default function AboutPage() {
    return (
        <main>
            <Header />

            {/* Enhanced Page Title */}
            <div className="bg-gray-950 py-24">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-5xl font-extrabold text-white mb-6">About Our Mission</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        We are dedicated to revolutionizing education through technology and
                        expert-led learning experiences.
                    </p>
                </div>
            </div>

            {/* About Us Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <img
                                src="/assets/img/about-2.jpg"
                                alt="About"
                                className="w-full rounded-3xl shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-primary text-white p-8 rounded-2xl shadow-xl hidden md:block">
                                <p className="text-4xl font-bold">10+</p>
                                <p className="text-sm">Years of Excellence</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-4xl font-bold mb-6">
                                Empowering Learners Globally
                            </h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua. We
                                believe in providing accessible, high-quality education to everyone.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Expert Curriculum',
                                    'Industry Recognized Certifications',
                                    'Flexible Learning Paths',
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3">
                                        <Icon
                                            icon="bi:check-circle-fill"
                                            className="text-primary text-xl"
                                        />
                                        <span className="font-semibold text-gray-800">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Testimonials />
            <FAQ />

            <Footer />
        </main>
    );
}
