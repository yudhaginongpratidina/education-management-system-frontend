export default function Counts() {
    const stats = [
        { label: 'Students', value: '1232' },
        { label: 'Courses', value: '64' },
        { label: 'Events', value: '42' },
        { label: 'Trainers', value: '24' },
    ];
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                            <p className="text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
