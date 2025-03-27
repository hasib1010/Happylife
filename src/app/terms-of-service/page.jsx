export default function TermsOfService() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-lg">Last Updated: March 27, 2025</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          <section className="space-y-8 text-gray-700">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to HappyLife Services (“we,” “us,” or “our”), a comprehensive health and wellness platform accessible at happylife.services. By using our website, services, or platform (collectively, the “Service”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree to these Terms, please do not use the Service. These Terms govern your access to and use of our platform, including the discovery of holistic products, providers, and wellness services.
              </p>
            </div>
  
            {/* Acceptance of Terms */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">2. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the Service, you confirm that you are at least 18 years old and have the legal capacity to enter into this agreement. These Terms may be updated periodically, and we will notify you of significant changes via email or a notice on the platform. Your continued use of the Service after such updates constitutes acceptance of the revised Terms.
              </p>
            </div>
  
            {/* Use of the Service */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">3. Use of the Service</h2>
              <p className="leading-relaxed">
                HappyLife Services provides a public directory to connect users with holistic products and trusted wellness providers. You may:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Search for and explore natural remedies, supplements, and wellness programs.</li>
                <li>Connect with certified practitioners, clinics, and wellness centers.</li>
                <li>Book appointments or purchase products directly through the platform where available.</li>
              </ul>
              <p className="leading-relaxed mt-2">
                You agree not to misuse the Service, including but not limited to: submitting false information, harassing providers, or attempting to access unauthorized areas of the platform.
              </p>
            </div>
  
            {/* User Accounts */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">4. User Accounts</h2>
              <p className="leading-relaxed">
                Some features may require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately at support@happylife.services if you suspect unauthorized use of your account.
              </p>
            </div>
  
            {/* Provider Relationships */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">5. Provider Relationships</h2>
              <p className="leading-relaxed">
                HappyLife Services acts as a platform to connect users with independent providers. We do not employ providers or endorse specific services. Any agreements, transactions, or disputes between you and a provider are solely between you and that provider. We are not liable for the quality, safety, or outcome of services or products provided.
              </p>
            </div>
  
            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on the Service, including text, images, logos, and software, is owned by HappyLife Services or its licensors and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works from this content without our prior written consent.
              </p>
            </div>
  
            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">7. Limitation of Liability</h2>
              <p className="leading-relaxed">
                The Service is provided “as is” without warranties of any kind. To the fullest extent permitted by law, HappyLife Services is not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to errors in provider listings, service interruptions, or reliance on information provided.
              </p>
            </div>
  
            {/* Termination */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">8. Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your access to the Service at our discretion, with or without notice, for any violation of these Terms or for any other reason deemed necessary to protect the platform or its users.
              </p>
            </div>
  
            {/* Governing Law */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">9. Governing Law</h2>
              <p className="leading-relaxed">
                These Terms are governed by the laws of [Insert Jurisdiction, e.g., “the State of California, USA”], without regard to its conflict of law principles. Any disputes arising from these Terms will be resolved in the courts of [Insert Jurisdiction].
              </p>
            </div>
  
            {/* Contact Us */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">10. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about these Terms, please contact us at:{' '}
                <a href="mailto:support@happylife.services" className="text-green-600 underline">
                  support@happylife.services
                </a>.
              </p>
            </div>
          </section>
        </main>
  
        
      </div>
    );
  }
  
  export const metadata = {
    title: 'Terms of Service - HappyLife Services',
    description: 'Read the Terms of Service for HappyLife Services, outlining the rules and guidelines for using our health and wellness platform.',
  };