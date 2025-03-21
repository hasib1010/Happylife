
// src/components/Footer.jsx
export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-2xl font-bold text-emerald-400 mb-4">HappyLife.Services</h2>
              <p className="text-gray-300 mb-4">
                Your comprehensive health and wellness platform to discover holistic products 
                and connect with trusted wellness providers.
              </p>
              <p className="text-gray-300">
                © {new Date().getFullYear()} HappyLife.Services. All rights reserved.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/providers" className="text-gray-300 hover:text-emerald-400">Find Providers</a></li>
                <li><a href="/products" className="text-gray-300 hover:text-emerald-400">Explore Products</a></li>
                <li><a href="/blogs" className="text-gray-300 hover:text-emerald-400">Read Blogs</a></li>
                <li><a href="/subscribe" className="text-gray-300 hover:text-emerald-400">Subscribe</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="/faq" className="text-gray-300 hover:text-emerald-400">FAQ</a></li>
                <li><a href="/contact" className="text-gray-300 hover:text-emerald-400">Contact Us</a></li>
                <li><a href="/privacy" className="text-gray-300 hover:text-emerald-400">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-300 hover:text-emerald-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  }