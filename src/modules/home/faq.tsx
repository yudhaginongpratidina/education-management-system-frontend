'use client';
import { Icon } from '@iconify/react';
import { useState } from 'react';

const faqs = [
    {
        question: 'What courses do you offer?',
        answer: 'We offer a wide range of courses in web development, marketing, and content strategy.',
    },
    {
        question: 'How can I join a course?',
        answer: 'You can easily sign up by exploring our courses page and selecting the one that fits your goals.',
    },
    {
        question: 'Do you provide certificates?',
        answer: 'Yes, all our courses come with recognized certificates upon completion.',
    },
    {
        question: 'Is there any financial aid available?',
        answer: 'We are working on financial aid programs. Stay tuned for updates!',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-xl overflow-hidden">
                            <button
                                className="w-full flex justify-between items-center p-6 text-left font-semibold hover:bg-gray-50"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                {faq.question}
                                <Icon
                                    icon={openIndex === index ? 'bi:chevron-up' : 'bi:chevron-down'}
                                    className="text-primary"
                                />
                            </button>
                            {openIndex === index && (
                                <div className="p-6 pt-0 text-gray-600 bg-gray-50">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
