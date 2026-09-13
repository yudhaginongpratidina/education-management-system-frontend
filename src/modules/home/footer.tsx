import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-50 py-16 border-t">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div>
                        <Link href="/" className="text-2xl font-bold text-primary mb-4 block">
                            Mentor
                        </Link>
                        <p className="text-gray-600 mb-4">
                            A108 Adam Street
                            <br />
                            New York, NY 535022
                        </p>
                        <p className="text-gray-600">
                            <strong>Phone:</strong> +1 5589 55488 55
                        </p>
                        <p className="text-gray-600">
                            <strong>Email:</strong> info@example.com
                        </p>
                        <div className="flex gap-4 mt-6">
                            <Link href="#" className="text-gray-400 hover:text-primary">
                                <Icon icon="bi:twitter-x" className="text-xl" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary">
                                <Icon icon="bi:facebook" className="text-xl" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary">
                                <Icon icon="bi:instagram" className="text-xl" />
                            </Link>
                            <Link href="#" className="text-gray-400 hover:text-primary">
                                <Icon icon="bi:linkedin" className="text-xl" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Useful Links</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li>
                                <Link href="/">Home</Link>
                            </li>
                            <li>
                                <Link href="/about">About us</Link>
                            </li>
                            <li>
                                <Link href="#">Services</Link>
                            </li>
                            <li>
                                <Link href="#">Terms of service</Link>
                            </li>
                            <li>
                                <Link href="#">Privacy policy</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Our Services</h4>
                        <ul className="space-y-2 text-gray-600">
                            <li>
                                <Link href="#">Web Design</Link>
                            </li>
                            <li>
                                <Link href="#">Web Development</Link>
                            </li>
                            <li>
                                <Link href="#">Product Management</Link>
                            </li>
                            <li>
                                <Link href="#">Marketing</Link>
                            </li>
                            <li>
                                <Link href="#">Graphic Design</Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-4">Our Newsletter</h4>
                        <p className="text-gray-600 mb-4 text-sm">
                            Subscribe to receive the latest news!
                        </p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                className="border rounded-md px-3 py-2 w-full"
                                placeholder="Your email"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t text-gray-600">
                    <p>
                        © Copyright <strong>Mentor</strong> All Rights Reserved
                    </p>
                    <p className="text-sm mt-2">Designed by BootstrapMade</p>
                </div>
            </div>
        </footer>
    );
}
