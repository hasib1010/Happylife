// src/app/page.js
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Find Health & Wellness Solutions
              </h1>
              <p className="text-xl mb-8">
                Connect with trusted providers and discover holistic products for your well-being journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/search" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-center">
                  Explore Services
                </Link>
                <Link href="/products" className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium text-center">
                  Browse Products
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-gray-800 text-2xl font-semibold mb-4">Find What You Need</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="search" className="block text-gray-700 mb-2">What are you looking for?</label>
                    <input
                      type="text"
                      id="search"
                      placeholder="E.g., yoga, meditation, supplements..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      id="location"
                      placeholder="City, state, or zip code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Acupuncture', icon: '🧠' },
              { name: 'Yoga', icon: '🧘‍♀️' },
              { name: 'Massage', icon: '💆‍♂️' },
              { name: 'Nutrition', icon: '🥗' },
              { name: 'Meditation', icon: '🧘‍♂️' },
              { name: 'Supplements', icon: '💊' },
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-medium">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Providers</h2>
            <Link href="/providers" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Provider cards would be dynamically generated here */}
            {[1, 2, 3].map((provider) => (
              <div key={provider} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Wellness Provider {provider}</h3>
                  <p className="text-gray-600 mb-4">Specializing in holistic healing and natural therapies</p>
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-gray-600 ml-2">(42 reviews)</span>
                  </div>
                  <Link href={`/providers/${provider}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Product cards would be dynamically generated here */}
            {[1, 2, 3, 4].map((product) => (
              <div key={product} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">Natural Product {product}</h3>
                  <p className="text-gray-600 text-sm mb-2">Premium quality wellness supplement</p>
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 text-sm">
                      {'★'.repeat(5)}
                    </div>
                    <span className="text-gray-600 text-xs ml-2">(28 reviews)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">$29.99</span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600">Browse our extensive directory of wellness providers and products.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Read reviews, compare options, and connect with providers.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Thrive</h3>
              <p className="text-gray-600">Experience the benefits of holistic wellness solutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join as Provider CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Wellness Provider or Seller?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our platform to showcase your services or products to thousands of wellness seekers.
            Get started for just $20/month!
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup?role=provider" className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-medium">
              Join as Provider
            </Link>
            <Link href="/auth/signup?role=seller" className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium">
              Join as Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}