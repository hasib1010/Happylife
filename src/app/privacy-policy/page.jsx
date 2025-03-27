export default function PrivacyPolicy() {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header className="bg-green-600 text-white py-12 text-center">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-lg">Last Updated: March 27, 2025</p>
        </header>
  
        {/* Main Content */}
        <main className="max-w-4xl mx-auto py-12 px-6">
          <section className="space-y-8 text-gray-700">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">1. Introduction</h2>
              <p className="leading-relaxed">
                At HappyLife Services (“we,” “us,” or “our”), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website, happylife.services, and our health and wellness platform (collectively, the “Service”). By using the Service, you consent to the practices described in this policy.
              </p>
            </div>
  
            {/* Information We Collect */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">2. Information We Collect</h2>
              <p className="leading-relaxed">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>
                  <strong>Personal Information:</strong> Name, email address, phone number, and other details you provide when creating an account, contacting us, or booking services.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you interact with the Service, such as IP address, browser type, pages visited, and search queries.
                </li>
                <li>
                  <strong>Provider Interactions:</strong> Details related to bookings or purchases made through the platform.
                </li>
              </ul>
            </div>
  
            {/* How We Use Your Information */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">3. How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Provide and improve the Service, including connecting you with providers and products.</li>
                <li>Process bookings, payments, and communications.</li>
                <li>Send you updates, newsletters, or promotional materials (with your consent).</li>
                <li>Analyze usage trends to enhance user experience.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </div>
  
            {/* Sharing Your Information */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">4. Sharing Your Information</h2>
              <p className="leading-relaxed">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>
                  <strong>Providers:</strong> To facilitate bookings or services you request.
                </li>
                <li>
                  <strong>Service Providers:</strong> Third parties that assist with payment processing, analytics, or hosting (e.g., cloud services).
                </li>
                <li>
                  <strong>Legal Authorities:</strong> If required by law or to protect our rights.
                </li>
              </ul>
              <p className="leading-relaxed mt-2">
                We do not sell your personal information to third parties.
              </p>
            </div>
  
            {/* Cookies and Tracking */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">5. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies to enhance your experience, track usage, and deliver personalized content. You can manage cookie preferences through your browser settings. Essential cookies are required for the Service to function, while optional cookies (e.g., for analytics) can be disabled.
              </p>
            </div>
  
            {/* Data Security */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">6. Data Security</h2>
              <p className="leading-relaxed">
                We implement reasonable security measures to protect your information from unauthorized access, loss, or disclosure. However, no system is completely secure, and we cannot guarantee absolute security.
              </p>
            </div>
  
            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">7. Your Rights</h2>
              <p className="leading-relaxed">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Access, update, or delete your personal information.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request a copy of your data or restrict its processing.</li>
              </ul>
              <p className="leading-relaxed mt-2">
                To exercise these rights, contact us at{' '}
                <a href="mailto:support@happylife.services" className="text-green-600 underline">
                  support@happylife.services
                </a>.
              </p>
            </div>
  
            {/* Third-Party Links */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">8. Third-Party Links</h2>
              <p className="leading-relaxed">
                The Service may contain links to third-party websites (e.g., provider pages). We are not responsible for the privacy practices or content of these sites. Review their policies before sharing information.
              </p>
            </div>
  
            {/* Changes to This Policy */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">9. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be posted here with an updated “Last Updated” date. Your continued use of the Service after changes constitutes acceptance of the revised policy.
              </p>
            </div>
  
            {/* Contact Us */}
            <div>
              <h2 className="text-2xl font-semibold text-green-700 mb-4">10. Contact Us</h2>
              <p className="leading-relaxed">
                For questions or concerns about this Privacy Policy, please reach out to us at:{' '}
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
    title: 'Privacy Policy - HappyLife Services',
    description: 'Learn how HappyLife Services collects, uses, and protects your personal information on our health and wellness platform.',
  };