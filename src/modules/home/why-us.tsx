import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function WhyUs() {
    const items = [
        {
            icon: 'bi:clipboard-data',
            title: 'Corporis voluptates',
            desc: 'Consequuntur sunt aut quasi enim aliquam quae harum pariatur laboris',
        },
        {
            icon: 'bi:gem',
            title: 'Ullamco laboris',
            desc: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia',
        },
        {
            icon: 'bi:inboxes',
            title: 'Labore consequatur',
            desc: 'Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut maiores omnis',
        },
    ];
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="bg-primary text-white p-8 rounded-lg">
                        <h3 className="text-2xl font-bold mb-4">Why Choose Our Products?</h3>
                        <p className="mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <Link
                            href="#"
                            className="inline-block bg-white/20 px-6 py-2 rounded-full hover:bg-white/30 transition"
                        >
                            Learn More
                        </Link>
                    </div>
                    <div className="lg:col-span-2 grid md:grid-cols-3 gap-6">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition"
                            >
                                <Icon
                                    icon={item.icon}
                                    className="text-3xl text-primary mb-4 mx-auto"
                                />
                                <h4 className="font-bold mb-2">{item.title}</h4>
                                <p className="text-sm text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
