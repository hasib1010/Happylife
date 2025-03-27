export default function FAQ() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-2 text-lg">Find answers to common questions about HappyLife Services</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          <section className="space-y-8">
            {/* FAQ Item 1 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">What is HappyLife Services?</h2>
              <p className="text-gray-700 leading-relaxed">
                HappyLife Services is a comprehensive health and wellness platform designed to connect users with holistic products and trusted providers. Our intuitive database allows you to search for natural remedies, supplements, therapy services, alternative medicine, and wellness programs while identifying certified practitioners, clinics, and wellness centers.
              </p>
            </div>
  
            {/* FAQ Item 2 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">How do I find a provider or product?</h2>
              <p className="text-gray-700 leading-relaxed">
                Simply use our search feature to explore products or providers by category, location, or keyword. Each listing includes detailed descriptions, provider credentials, user reviews, and, where available, direct booking options to make your experience seamless.
              </p>
            </div>
  
            {/* FAQ Item 3 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">Is HappyLife Services free to use?</h2>
              <p className="text-gray-700 leading-relaxed">
                Yes, browsing our platform and accessing information is completely free for users. Some providers may charge for their services or products, but we ensure transparency with clear pricing and no hidden fees on our end.
              </p>
            </div>
  
            {/* FAQ Item 4 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">How do you verify providers?</h2>
              <p className="text-gray-700 leading-relaxed">
                We prioritize trust and quality. All providers listed on HappyLife Services are vetted for certifications, licenses, and professional credentials. User reviews also help maintain accountability and transparency.
              </p>
            </div>
  
            {/* FAQ Item 5 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">Can I book appointments directly through the platform?</h2>
              <p className="text-gray-700 leading-relaxed">
                Yes, many providers offer direct booking options through our platform. Look for the “Book Now” button on their profile to schedule an appointment instantly.
              </p>
            </div>
  
            {/* FAQ Item 6 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">What types of wellness services are available?</h2>
              <p className="text-gray-700 leading-relaxed">
                We cover a wide range, including hypnotherapy, acupuncture, functional medicine, mind-body healing, therapy services, and more. You can also find holistic products like supplements and natural remedies.
              </p>
            </div>
  
            {/* FAQ Item 7 */}
            <div>
              <h2 className="text-xl font-semibold text-green-700 mb-2">How can I contact support?</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions or need assistance, reach out to us via our <a href="/contact" className="text-green-600 underline">Contact Us</a> page or email us at support@happylife.services. We’re here to help!
              </p>
            </div>
          </section>
        </main>
  
        
      </div>
    );
  }
  
  export const metadata = {
    title: 'FAQ - HappyLife Services',
    description: 'Find answers to frequently asked questions about HappyLife Services, your health and wellness platform.',
  };