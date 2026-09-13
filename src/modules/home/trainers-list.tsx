import { Icon } from '@iconify/react';
import Link from 'next/link';

const trainers = [
    {
        name: 'Walter White',
        role: 'Web Development',
        img: 'trainer-1.jpg',
        bio: 'Expert in modern web technologies.',
    },
    {
        name: 'Sarah Jhinson',
        role: 'Marketing',
        img: 'trainer-2.jpg',
        bio: 'Creative digital marketing strategist.',
    },
    {
        name: 'William Anderson',
        role: 'Content',
        img: 'trainer-3.jpg',
        bio: 'Professional content strategist.',
    },
];

export default function TrainersList() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {trainers.map((trainer, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                        >
                            <div className="relative overflow-hidden">
                                <img
                                    src={`/assets/img/trainers/${trainer.img}`}
                                    alt={trainer.name}
                                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                    <Link
                                        href="#"
                                        className="text-white text-2xl hover:text-gray-200"
                                    >
                                        <Icon icon="bi:twitter-x" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="text-white text-2xl hover:text-gray-200"
                                    >
                                        <Icon icon="bi:facebook" />
                                    </Link>
                                    <Link
                                        href="#"
                                        className="text-white text-2xl hover:text-gray-200"
                                    >
                                        <Icon icon="bi:instagram" />
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-2xl font-bold mb-1">{trainer.name}</h3>
                                <p className="text-primary font-semibold mb-3">{trainer.role}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {trainer.bio}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
