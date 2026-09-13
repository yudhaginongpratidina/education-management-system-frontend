import { Icon } from '@iconify/react';

export default function ContactForm() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-4 rounded-full h-fit">
                                <Icon icon="bi:geo-alt" className="text-2xl text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Address</h3>
                                <p className="text-gray-600">
                                    A108 Adam Street, New York, NY 535022
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-4 rounded-full h-fit">
                                <Icon icon="bi:telephone" className="text-2xl text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Call Us</h3>
                                <p className="text-gray-600">+1 5589 55488 55</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-primary/10 p-4 rounded-full h-fit">
                                <Icon icon="bi:envelope" className="text-2xl text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Email Us</h3>
                                <p className="text-gray-600">info@example.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="lg:col-span-2 bg-gray-50 p-8 rounded-2xl shadow-sm space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Your Email"
                                className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Subject"
                            className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <textarea
                            placeholder="Message"
                            rows={5}
                            className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        ></textarea>
                        <button
                            type="submit"
                            className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition w-full md:w-auto"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
