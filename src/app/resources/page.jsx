export default function Resources() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Resources</h1>
          <p className="mt-2 text-lg">Tools and insights for your wellness journey</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          {/* Introduction */}
          <section className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Empower Your Health</h2>
            <p className="text-gray-700 leading-relaxed">
              At HappyLife Services, we believe knowledge is key to well-being. Explore our collection of articles, guides, and tools designed to help you make informed decisions about your health. Whether you’re new to holistic wellness or a seasoned explorer, there’s something here for you. Have a resource suggestion?{' '}
              <a href="/contact" className="text-green-600 underline">
                Let us know!
              </a>
            </p>
          </section>
  
          {/* Resources Sections */}
          <section className="space-y-12">
            {/* Articles */}
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-4">Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="#"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-green-600">The Benefits of Hypnotherapy</h4>
                  <p className="text-gray-600 mt-2">
                    Discover how hypnotherapy can reduce stress and improve mental clarity.
                  </p>
                </a>
                <a
                  href="#"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-green-600">Understanding Functional Medicine</h4>
                  <p className="text-gray-600 mt-2">
                    Learn how this approach uncovers the root causes of health issues.
                  </p>
                </a>
              </div>
            </div>
  
            {/* Guides */}
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-4">Guides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="#"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-green-600">Choosing the Right Supplement</h4>
                  <p className="text-gray-600 mt-2">
                    A step-by-step guide to finding safe and effective natural remedies.
                  </p>
                </a>
                <a
                  href="#"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-green-600">Getting Started with Acupuncture</h4>
                  <p className="text-gray-600 mt-2">
                    What to expect from your first session and how to prepare.
                  </p>
                </a>
              </div>
            </div>
  
            {/* Tools */}
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-4">Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="#"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-green-600">Wellness Goal Tracker</h4>
                  <p className="text-gray-600 mt-2">
                    Download our free tool to set and monitor your health goals.
                  </p>
                </a>
                <a
                  href="#"
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h4 className="text-lg font-semibold text-green-600">Mindfulness Meditation Audio</h4>
                  <p className="text-gray-600 mt-2">
                    Access a free 10-minute guided meditation to start your day.
                  </p>
                </a>
              </div>
            </div>
          </section>
  
          {/* Call to Action */}
          <section className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Have a Resource Idea?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              We’re always looking to expand our library. Share your suggestions with us!
            </p>
            <a
              href="/contact"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Suggest a Resource
            </a>
          </section>
        </main>
  
        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-6">
          <p>© {new Date().getFullYear()} HappyLife Services. All rights reserved.</p>
          <p className="mt-1">
            <a href="https://happylife.services" className="underline">happylife.services</a>
          </p>
        </footer>
      </div>
    );
  }
  
  export const metadata = {
    title: 'Resources - HappyLife Services',
    description: 'Explore articles, guides, and tools to support your health and wellness journey with HappyLife Services.',
  };