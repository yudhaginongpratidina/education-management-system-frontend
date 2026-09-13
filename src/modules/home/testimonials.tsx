import { Icon } from '@iconify/react';

const testimonials = [
    {
        name: 'Saul Goodman',
        role: 'Ceo & Founder',
        img: 'testimonials-1.jpg',
        text: 'Proin iaculis purus consequat sem cure digni ssim donec porttitora entum suscipit rhoncus.',
    },
    {
        name: 'Sara Wilsson',
        role: 'Designer',
        img: 'testimonials-2.jpg',
        text: 'Export tempor illum tamen malis malis eram quae irure esse labore quem cillum quid cillum eram.',
    },
    {
        name: 'Jena Karlis',
        role: 'Store Owner',
        img: 'testimonials-3.jpg',
        text: 'Enim nisi quem export duis labore cillum quae magna enim sint quorum nulla quem veniam.',
    },
];

export default function Testimonials() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold">Testimonials</h2>
                    <p className="text-gray-600 mt-2">What are they saying</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                            <img
                                src={`/assets/img/testimonials/${t.img}`}
                                alt={t.name}
                                className="w-20 h-20 rounded-full mx-auto mb-4"
                            />
                            <h3 className="font-bold text-lg">{t.name}</h3>
                            <h4 className="text-gray-500 mb-4">{t.role}</h4>
                            <p className="text-gray-600 italic">
                                <Icon
                                    icon="bi:quote"
                                    className="text-primary inline-block text-2xl mr-2"
                                />
                                {t.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
