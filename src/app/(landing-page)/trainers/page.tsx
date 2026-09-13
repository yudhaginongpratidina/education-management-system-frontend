import Header from '@/modules/home/header';
import Footer from '@/modules/home/footer';
import TrainersList from '@/modules/home/trainers-list';

export default function TrainersPage() {
    return (
        <main>
            <Header />

            {/* Page Title */}
            <div className="bg-gray-100 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Our Trainers</h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Meet our team of experienced trainers who are dedicated to helping you achieve
                    your learning goals.
                </p>
            </div>

            <TrainersList />

            <Footer />
        </main>
    );
}
