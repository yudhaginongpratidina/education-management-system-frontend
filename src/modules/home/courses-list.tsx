import { Icon } from '@iconify/react';

const courses = [
    { title: 'Website Design', price: '$169', category: 'Web Development', trainer: 'Antonio' },
    { title: 'Search Engine Optimization', price: '$250', category: 'Marketing', trainer: 'Lana' },
    { title: 'Copywriting', price: '$180', category: 'Content', trainer: 'Brandon' },
];

export default function CoursesList() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Popular Courses</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map((course, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-6 hover:shadow-lg transition"
                        >
                            <img
                                src={`/assets/img/course-${index + 1}.jpg`}
                                alt={course.title}
                                className="w-full rounded-md mb-4"
                            />
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">{course.category}</span>
                                <span className="font-bold text-primary">{course.price}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-4">Trainer: {course.trainer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
