export default function Pricing() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Pricing</h1>
          <p className="mt-2 text-lg">Free for users, affordable for providers</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          {/* Introduction */}
          <section className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Simple Pricing for Everyone</h2>
            <p className="text-gray-700 leading-relaxed">
              HappyLife Services is free for all users to explore holistic wellness solutions. If you’re a provider or blogger looking to list your products, services, or content, our affordable subscription plan unlocks those opportunities. Questions?{' '}
              <a href="/contact" className="text-green-600 underline">
                Contact us!
              </a>
            </p>
          </section>
  
          {/* Pricing Plans */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Free User Plan</h3>
              <p className="text-4xl font-bold text-gray-800 mb-2">$0</p>
              <p className="text-gray-600 mb-6">forever</p>
              <ul className="text-gray-700 space-y-4 mb-8 text-left">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Browse our provider directory
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Access free resources and guides
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Book appointments with providers
                </li>
              </ul>
              <p className="text-gray-600 text-sm">No account needed to get started</p>
            </div>
  
            {/* Paid Tier */}
            <div className="bg-white p-8 rounded-lg shadow-md text-center border-2 border-green-600">
              <h3 className="text-2xl font-semibold text-green-700 mb-4">Provider Subscription</h3>
              <p className="text-4xl font-bold text-gray-800 mb-2">$20</p>
              <p className="text-gray-600 mb-6">per month</p>
              <ul className="text-gray-700 space-y-4 mb-8 text-left">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  List your products and services
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Publish blog posts and articles
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Reach a wider audience
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support for listings
                </li>
              </ul>
              <a
                href="/subscription"
                className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Subscribe Now
              </a>
              <p className="text-gray-600 text-sm mt-4">Cancel anytime, no hidden fees</p>
            </div>
          </section>
  
          {/* Additional Info */}
          <section className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Why Subscribe as a Provider?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our $20/month subscription empowers providers and bloggers to showcase their offerings to a growing community of wellness seekers. From listing holistic products to sharing expert insights, it’s an affordable way to expand your reach.
            </p>
            <p className="text-gray-700">
              Need more details? Check our{' '}
              <a href="/faq" className="text-green-600 underline">
                FAQ
              </a>{' '}
              or{' '}
              <a href="/contact" className="text-green-600 underline">
                get in touch
              </a>.
            </p>
          </section>
        </main>
  
      
      </div>
    );
  }
  
  export const metadata = {
    title: 'Pricing - HappyLife Services',
    description: 'Explore our free user plan and $20/month provider subscription for listing products, services, and blogs on HappyLife Services.',
  };