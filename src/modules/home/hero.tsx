import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-[85vh] flex items-center bg-gray-950 text-white overflow-hidden">
            <img
                src="/assets/img/hero-bg.jpg"
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="container mx-auto px-4 relative z-10 py-20">
                <div className="max-w-3xl">
                    <span className="inline-block py-1 px-3 mb-4 rounded-full bg-primary/20 text-primary-foreground text-sm font-semibold tracking-wider uppercase">
                        Start Your Journey Today
                    </span>
                    <h2 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
                        Learning Today, <span className="text-primary">Leading Tomorrow</span>
                    </h2>
                    <p className="text-xl mb-10 text-gray-300 leading-relaxed">
                        Empower your future with world-class education. Join a community of
                        innovators and start building the career of your dreams.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            href="/courses"
                            className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition duration-300 shadow-lg shadow-primary/25"
                        >
                            Explore Courses
                        </Link>
                        <Link
                            href="/about"
                            className="bg-white/10 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-white/20 transition duration-300"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
