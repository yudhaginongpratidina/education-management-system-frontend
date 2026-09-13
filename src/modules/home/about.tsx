import { Icon } from '@iconify/react';

export default function About() {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="order-2 lg:order-1">
                        <img
                            src="/assets/img/about.jpg"
                            alt="About"
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                    <div className="order-1 lg:order-2">
                        <h3 className="text-3xl font-bold mb-4">
                            Voluptatem dignissimos provident quasi corporis
                        </h3>
                        <p className="italic text-gray-600 mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                            tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Icon
                                    icon="bi:check-circle"
                                    className="text-primary text-xl mt-1"
                                />
                                <span>
                                    Ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Icon
                                    icon="bi:check-circle"
                                    className="text-primary text-xl mt-1"
                                />
                                <span>
                                    Duis aute irure dolor in reprehenderit in voluptate velit.
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
