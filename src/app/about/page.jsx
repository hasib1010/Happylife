import Head from 'next/head';

export default function About() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>About Us - HappyLife Services</title>
                <meta name="description" content="Learn about HappyLife Services, your comprehensive植物 health and wellness platform." />
            </Head>

            {/* Same header, main, and footer content as above */}
            <header className="bg-green-600 text-white py-12 text-center">
                <h1 className="text-4xl font-bold">About Us</h1>
                <p className="mt-2 text-lg">Your Trusted Partner in Holistic Wellness</p>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto py-12 px-6">
                <section className="mb-12">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Welcome to <span className="font-semibold">HappyLife Services</span>, your trusted companion on the journey to holistic health and well-being. We believe that wellness is a deeply personal experience, and finding the right solutions—whether it’s natural remedies, alternative therapies, or expert providers—should be simple, transparent, and empowering. That’s why we’ve created a comprehensive platform that brings together the best of health and wellness in one intuitive, user-friendly space.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-green-700 mb-4">Our Mission</h2>
                    <p className="text-gray-700 leading-relaxed">
                        At HappyLife Services, our mission is to connect individuals with the tools and trusted professionals they need to live healthier, happier lives. We’re here to bridge the gap between high-quality holistic products—like supplements, natural remedies, and wellness programs—and the certified practitioners, clinics, and wellness centers that bring these solutions to life. Whether you’re exploring hypnotherapy, acupuncture, functional medicine, or mind-body healing, we make it easy to discover, compare, and access what’s right for you.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-green-700 mb-4">What We Offer</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        HappyLife Services is more than just a directory—it’s a wellness ecosystem designed with you in mind. Our platform features:
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li className="mb-2"><span className="font-semibold">A Curated Database:</span> Search for holistic products and services, from therapy and alternative medicine to wellness programs, with detailed descriptions to guide your choices.</li>
                        <li className="mb-2"><span className="font-semibold">Trusted Providers:</span> Connect with certified practitioners and wellness centers, complete with credentials, reviews, and direct booking options.</li>
                        <li><span className="font-semibold">Personalized Experience:</span> Access expert insights, compare options, and take proactive steps toward your well-being—all in one seamless platform.</li>
                    </ul>
                </section>
            </main>
             
        </div>
    );
}

export const metadata = {
    title: 'About Us - HappyLife Services',
    description: 'Learn about HappyLife Services, your comprehensive health and wellness platform.',
};