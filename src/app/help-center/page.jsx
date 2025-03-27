export default function HelpCenter() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Help Center</h1>
          <p className="mt-2 text-lg">We’re here to support your wellness journey</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          {/* Welcome Section */}
          <section className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">How Can We Assist You?</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to the HappyLife Services Help Center. Whether you have questions about using our platform, need help finding a provider, or want to troubleshoot an issue, we’ve got you covered. Explore the resources below or reach out to our support team directly.
            </p>
          </section>
  
          {/* Quick Links Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a
                href="/faq"
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-green-600">FAQs</h3>
                <p className="text-gray-600 mt-2">Find answers to common questions about our platform.</p>
              </a>
              <a
                href="/guides"
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-green-600">User Guides</h3>
                <p className="text-gray-600 mt-2">Step-by-step instructions for navigating HappyLife Services.</p>
              </a>
              <a
                href="/providers"
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-green-600">Provider Support</h3>
                <p className="text-gray-600 mt-2">Resources for practitioners and wellness centers.</p>
              </a>
              <a
                href="/contact"
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-green-600">Contact Us</h3>
                <p className="text-gray-600 mt-2">Get in touch with our support team.</p>
              </a>
            </div>
          </section>
  
          {/* Contact Support Section */}
          <section className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Need More Help?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our team is ready to assist you with any questions or concerns. Reach out via email or submit a support request below.
            </p>
            <div className="space-y-4">
              <p className="text-gray-700">
                Email us at:{' '}
                <a href="mailto:support@happylife.services" className="text-green-600 underline">
                  support@happylife.services
                </a>
              </p>
              <a
                href="/contact"
                className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit a Support Request
              </a>
            </div>
          </section>
  
          {/* Search Bar (Optional) */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-green-700 mb-4 text-center">Search for Help</h2>
            <div className="flex justify-center">
              <input
                type="text"
                placeholder="Type your question here..."
                className="w-full max-w-md p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button className="bg-green-600 text-white p-3 rounded-r-lg hover:bg-green-700 transition-colors">
                Search
              </button>
            </div>
            <p className="text-gray-600 mt-2 text-sm">e.g., “How do I book an appointment?”</p>
          </section>
        </main>
  
        
      </div>
    );
  }
  
  export const metadata = {
    title: 'Help Center - HappyLife Services',
    description: 'Get support and resources from the HappyLife Services Help Center to enhance your wellness journey.',
  };