'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
    {
        title: 'Learning Today, Leading Tomorrow',
        desc: 'Empower your future with world-class education. Join a community of innovators.',
        img: '/assets/img/hero-bg.jpg',
    },
    {
        title: 'Expert Instruction at Your Fingertips',
        desc: 'Learn from industry leaders with our comprehensive course catalog.',
        img: '/assets/img/about.jpg',
    },
    {
        title: 'Unlock Your Full Potential Today',
        desc: 'Gain the skills you need to thrive in the digital economy.',
        img: '/assets/img/course-1.jpg',
    },
];

export default function Hero() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative min-h-[85vh] flex items-center bg-gray-950 text-white overflow-hidden">
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img
                        src={slide.img}
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="container mx-auto px-4 absolute inset-0 flex items-center z-10 py-20">
                        <div className="max-w-3xl">
                            <h2 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
                                {slide.title}
                            </h2>
                            <p className="text-xl mb-10 text-gray-300 leading-relaxed">
                                {slide.desc}
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    href="/course"
                                    className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition duration-300 shadow-lg shadow-primary/25"
                                >
                                    Explore Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
