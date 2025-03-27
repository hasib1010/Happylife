export default function SuccessStories() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Success Stories</h1>
          <p className="mt-2 text-lg">Real people, real transformations with HappyLife Services</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          {/* Introduction */}
          <section className="mb-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Inspiring Journeys</h2>
            <p className="text-gray-700 leading-relaxed">
              At HappyLife Services, we’re proud to connect individuals with holistic solutions and trusted providers that transform lives. Below are some stories from our community—people who found wellness, balance, and hope through our platform. Have a story to share?{' '}
              <a href="/contact" className="text-green-600 underline">
                Contact us!
              </a>
            </p>
          </section>
  
          {/* Success Stories */}
          <section className="space-y-12">
            {/* Story 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Sarah’s Journey to Mindfulness</h3>
              <p className="text-gray-600 italic mb-4">“After years of stress, I found a hypnotherapist through HappyLife Services who changed my life.”</p>
              <p className="text-gray-700 leading-relaxed">
                Sarah, a 34-year-old teacher, struggled with anxiety and burnout. Through our platform, she discovered a certified hypnotherapist offering sessions tailored to stress relief. After just a few months, Sarah reports feeling calmer, more focused, and in control of her well-being. “The platform made it so easy to find someone I could trust,” she says.
              </p>
            </div>
  
            {/* Story 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Mark’s Path to Pain Relief</h3>
              <p className="text-gray-600 italic mb-4">“Acupuncture was a game-changer, and HappyLife Services led me to the perfect practitioner.”</p>
              <p className="text-gray-700 leading-relaxed">
                Mark, a 45-year-old construction worker, suffered from chronic back pain. Using HappyLife Services, he found a local acupuncturist with glowing reviews. After a series of sessions, Mark’s pain decreased significantly, allowing him to return to work with renewed energy. “I didn’t know where to start until I found this platform,” he shares.
              </p>
            </div>
  
            {/* Story 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Lila’s Holistic Healing</h3>
              <p className="text-gray-600 italic mb-4">“Functional medicine gave me answers, and HappyLife Services made it accessible.”</p>
              <p className="text-gray-700 leading-relaxed">
                Lila, a 29-year-old entrepreneur, battled unexplained fatigue for years. Through our platform, she connected with a functional medicine practitioner who identified dietary triggers and created a personalized plan. Today, Lila feels vibrant and credits HappyLife Services for simplifying her search. “It’s like having a wellness guide at your fingertips,” she says.
              </p>
            </div>
          </section>
  
          {/* Call to Action */}
          <section className="mt-12 text-center">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">Share Your Story</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Have you experienced a positive change with HappyLife Services? We’d love to hear about it and inspire others!
            </p>
            <a
              href="/contact"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Tell Us Your Story
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
    title: 'Success Stories - HappyLife Services',
    description: 'Discover inspiring success stories from users of HappyLife Services, your health and wellness platform.',
  };