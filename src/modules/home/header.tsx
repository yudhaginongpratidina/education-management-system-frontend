'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-primary">
                    Mentor
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="font-semibold text-primary">
                        Home
                    </Link>
                    <Link href="/about" className="text-gray-600 hover:text-primary">
                        About
                    </Link>
                    <Link href="/course" className="text-gray-600 hover:text-primary">
                        Courses
                    </Link>
                    <Link href="/trainers" className="text-gray-600 hover:text-primary">
                        Trainers
                    </Link>
                    <Link href="/contact" className="text-gray-600 hover:text-primary">
                        Contact
                    </Link>
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/course"
                        className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Icon icon={isMenuOpen ? 'bi:x' : 'bi:list'} />
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <nav className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4">
                    <Link
                        href="/"
                        className="font-semibold text-primary"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/about"
                        className="text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                    <Link
                        href="/course"
                        className="text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Courses
                    </Link>
                    <Link
                        href="/trainers"
                        className="text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Trainers
                    </Link>
                    <Link
                        href="/contact"
                        className="text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Contact
                    </Link>
                    <Link
                        href="/course"
                        className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold text-center"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Get Started
                    </Link>
                </nav>
            )}
        </header>
    );
}
