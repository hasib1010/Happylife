// Server Component (no 'use client') 

import ContactForm from "./ContactForm";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-green-600 text-white py-12 text-center">
        <h1 className="text-4xl font-bold">Contact Us</h1>
        <p className="mt-2 text-lg">We’d love to hear from you</p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-6">
        {/* Contact Form Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">Send Us a Message</h2>
          <ContactForm /> {/* Render the client component */}
        </section>

        {/* Contact Details Section */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold text-green-700 mb-6">Other Ways to Reach Us</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Email:{' '}
              <a href="mailto:support@happylife.services" className="text-green-600 underline">
                support@happylife.services
              </a>
            </p>
            <p className="text-gray-700">
              Phone: <span className="text-green-600">+1-303-810-8888</span> (Mon-Fri, 9 AM - 5 PM)
            </p>
             
          </div>
        </section>
      </main>

       
    </div>
  );
}

// Export metadata from the server component
export const metadata = {
  title: 'Contact Us - HappyLife Services',
  description: 'Get in touch with HappyLife Services for support or inquiries about our health and wellness platform.',
};