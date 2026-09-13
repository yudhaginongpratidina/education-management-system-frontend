import { Icon } from '@iconify/react';

const branches = [
    { city: 'Jakarta', address: 'Jl. Sudirman No. 123', phone: '(021) 555-0101' },
    { city: 'Bandung', address: 'Jl. Braga No. 45', phone: '(022) 555-0202' },
    { city: 'Surabaya', address: 'Jl. Basuki Rahmat No. 78', phone: '(031) 555-0303' },
    { city: 'Yogyakarta', address: 'Jl. Malioboro No. 90', phone: '(0274) 555-0404' },
];

export default function Branches() {
    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-4">Our Branches</h2>
                <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
                    Visit us at our various locations across Indonesia to get the best learning
                    experience.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {branches.map((branch, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
                        >
                            <Icon icon="bi:building" className="text-3xl text-primary mb-4" />
                            <h3 className="text-lg font-bold mb-1">{branch.city}</h3>
                            <p className="text-gray-500 text-sm mb-2">{branch.address}</p>
                            <p className="text-primary text-sm font-semibold">{branch.phone}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
