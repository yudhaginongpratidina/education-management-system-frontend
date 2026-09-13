const plans = [
    { name: 'Free', price: '$0', features: ['Aida dere', 'Nec feugiat', 'Nulla at volutpat dola'] },
    {
        name: 'Business',
        price: '$19',
        features: ['Aida dere', 'Nec feugiat', 'Nulla at volutpat dola', 'Pharetra massa'],
    },
    {
        name: 'Developer',
        price: '$29',
        features: [
            'Aida dere',
            'Nec feugiat',
            'Nulla at volutpat dola',
            'Pharetra massa',
            'Massa ultricies mi',
        ],
    },
];

export default function Pricing() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Pricing</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg border text-center">
                            <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                            <div className="text-4xl font-bold mb-6">
                                {plan.price}
                                <span className="text-sm font-normal text-gray-500"> / month</span>
                            </div>
                            <ul className="space-y-2 mb-8 text-gray-600">
                                {plan.features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                            <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-blue-700">
                                Buy Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
