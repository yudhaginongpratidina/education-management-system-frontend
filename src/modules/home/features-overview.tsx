import { Icon } from '@iconify/react';

const features = [
    { icon: 'bi:mortarboard', title: 'Expert Instruction', desc: 'Learn from industry leaders.' },
    { icon: 'bi:globe', title: 'Global Community', desc: 'Connect with students worldwide.' },
    { icon: 'bi:clock', title: 'Flexible Learning', desc: 'Study at your own pace.' },
    { icon: 'bi:award', title: 'Certified Skills', desc: 'Gain recognized certifications.' },
];

export default function FeaturesOverview() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-gray-50 hover:bg-primary/5 transition duration-300"
                        >
                            <Icon icon={feature.icon} className="text-4xl text-primary mb-6" />
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
