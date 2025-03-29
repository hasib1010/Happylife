'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Hero Carousel data
const carouselItems = [
  {
    id: 1,
    title: "Discover Natural Wellness Solutions",
    description: "Find trusted providers and holistic products for your well-being journey.",
    ctaText: "Explore Services",
    ctaLink: "/search",
    bgImage: "/images/hero-wellness-1.jpg", // Add your image paths
    bgColor: "from-blue-600 to-purple-700"
  },
  {
    id: 2,
    title: "Holistic Health At Your Fingertips",
    description: "Connect with certified practitioners and premium wellness products.",
    ctaText: "Browse Products",
    ctaLink: "/products",
    bgImage: "/images/hero-wellness-2.jpg", // Add your image paths
    bgColor: "from-teal-600 to-emerald-700"
  },
  {
    id: 3,
    title: "Your Journey To Balance Starts Here",
    description: "Personalized recommendations for mind, body, and spirit wellness.",
    ctaText: "Find Your Path",
    ctaLink: "/categories",
    bgImage: "/images/hero-wellness-3.jpg", // Add your image paths
    bgColor: "from-indigo-600 to-purple-800"
  }
];

export default function Home() {
  // Client-side state for carousel and data
  const [activeSlide, setActiveSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState([]);

  // Handle client-side rendering and data fetching
  useEffect(() => {
    setIsClient(true);

    // Auto-rotate carousel
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);

    // Fetch providers data
    const fetchProviders = async () => {
      try {
        const response = await fetch('/api/public/services?isFeatured=true&limit=3');
        if (!response.ok) throw new Error('Failed to fetch providers');
        const data = await response.json();
        setFeaturedProviders(data.services || []);

        // Extract categories if available
        if (data.categories && data.categories.length) {
          setCategories(data.categories.slice(0, 6).map(cat => ({
            name: cat,
            icon: getCategoryIcon(cat),
            color: getCategoryColor(cat)
          })));
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    // Fetch products data
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/public/products?limit=4&sort=popular');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setFeaturedProducts(data.products || []);

        // If no categories from services, use product categories
        if (categories.length === 0 && data.categories && data.categories.length) {
          setCategories(data.categories.slice(0, 6).map(cat => ({
            name: cat,
            icon: getCategoryIcon(cat),
            color: getCategoryColor(cat)
          })));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    // Fetch blogs data
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?limit=3');
        if (!response.ok) throw new Error('Failed to fetch blogs');
        const data = await response.json();
        setBlogPosts(data.blogs || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    // Execute fetch operations
    fetchProviders();
    fetchProducts();
    fetchBlogs();

    return () => clearInterval(interval);
  }, []);

  // Function to change slides
  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  // Helper function to assign icons to categories
  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'Acupuncture': '🧠',
      'Yoga': '🧘‍♀️',
      'Massage': '💆‍♂️',
      'Nutrition': '🥗',
      'Meditation': '🧘‍♂️',
      'Supplements': '💊',
      'Fitness': '💪',
      'Therapy': '🧠',
      'Coaching': '📝',
      'Naturopathy': '🌿',
      'Holistic': '⭐',
      // Add more mappings as needed
    };

    // Default to a generic icon if no mapping exists
    return categoryIcons[category] || '✨';
  };

  // Helper function to assign colors to categories
  const getCategoryColor = (category) => {
    const categoryColors = {
      'Acupuncture': 'bg-red-100 text-red-600',
      'Yoga': 'bg-blue-100 text-blue-600',
      'Massage': 'bg-green-100 text-green-600',
      'Nutrition': 'bg-yellow-100 text-yellow-600',
      'Meditation': 'bg-purple-100 text-purple-600',
      'Supplements': 'bg-indigo-100 text-indigo-600',
      'Fitness': 'bg-orange-100 text-orange-600',
      'Therapy': 'bg-teal-100 text-teal-600',
      'Coaching': 'bg-pink-100 text-pink-600',
      'Naturopathy': 'bg-emerald-100 text-emerald-600',
      'Holistic': 'bg-violet-100 text-violet-600',
      // Add more mappings as needed
    };

    // Rotate through colors if no mapping exists
    const defaultColors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-red-100 text-red-600',
      'bg-yellow-100 text-yellow-600',
      'bg-indigo-100 text-indigo-600'
    ];

    return categoryColors[category] || defaultColors[Math.floor(Math.random() * defaultColors.length)];
  };

  // Format currency display
  const formatCurrency = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  // Default categories if API doesn't provide any
  const defaultCategories = [
    { name: 'Acupuncture', icon: '🧠', color: 'bg-red-100 text-red-600' },
    { name: 'Yoga', icon: '🧘‍♀️', color: 'bg-blue-100 text-blue-600' },
    { name: 'Massage', icon: '💆‍♂️', color: 'bg-green-100 text-green-600' },
    { name: 'Nutrition', icon: '🥗', color: 'bg-yellow-100 text-yellow-600' },
    { name: 'Meditation', icon: '🧘‍♂️', color: 'bg-purple-100 text-purple-600' },
    { name: 'Supplements', icon: '💊', color: 'bg-indigo-100 text-indigo-600' },
  ];

  // Use API categories or default if none available
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Carousel Section */}
      <section className="relative h-[600px] md:h-[650px] overflow-hidden">
        {isClient && (
          <>
            {/* Carousel slides */}
            {carouselItems.map((item, index) => (
              <div
                key={item.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out
            ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {/* Background gradient for the entire slide */}
                <div className={`absolute inset-0 bg-gradient-to-r ${item.bgColor} opacity-90`}></div>

                {/* Main content container with side-by-side layout */}
                <div className="relative z-20 container mx-auto px-4 h-full flex flex-col md:flex-row items-center">
                  {/* Left side: Content */}
                  <div className="w-full md:w-1/2 text-white flex flex-col justify-center py-8 md:py-0">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-[fadeInUp_0.5s_ease-out]">
                      {item.title}
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 animate-[fadeInUp_0.7s_ease-out]">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-4 animate-[fadeInUp_0.9s_ease-out]">
                      <Link
                        href={item.ctaLink}
                        className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-center shadow-lg transition-all hover:scale-105"
                      >
                        {item.ctaText}
                      </Link>
                      <Link
                        href="/how-it-works"
                        className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium text-center transition"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>

                  {/* Right side: Image */}
                  {item.bgImage && (
                    <div className="w-full md:w-1/2 h-full relative">
                      <Image
                        src={item.bgImage}
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg md:rounded-none"
                        priority={index === 0} // Prioritize the first slide for faster loading
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Carousel indicators */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white
              ${index === activeSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Spacer for search box overlap */}
      <div className="h-20 bg-gray-50  "></div>

      {/* Featured Categories - Card Grid with Icons */}
      <section className="py-20 bg-gray-50  ">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Find What You Need</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore our most popular wellness categories and discover services and products tailored to your needs.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displayCategories.map((category, index) => (
              <Link
                href={`/category/${category.name.toLowerCase()}`}
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`${category.color} text-4xl rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="font-medium text-lg">{category.name}</h3>
                <p className="text-gray-500 text-sm mt-2">Find top providers</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center cursor-pointer z-50">
              View All Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {/* Featured Providers - Card Slider */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Providers</h2>
              <p className="text-gray-600 mt-2">Discover top-rated wellness experts in your area</p>
            </div>
            <Link href="/services" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mb-6"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProviders.length > 0 ? (
                featuredProviders.map((provider) => (
                  <div key={provider.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-gray-200 relative">
                      {provider.coverImage && (
                        <Image
                          src={provider.coverImage}
                          alt={provider.businessName || "Provider"}
                          layout="fill"
                          objectFit="cover"
                        />
                      )}
                      {/* Featured badge */}
                      {provider.isFeatured && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{provider.businessName}</h3>
                          <p className="text-gray-700 text-sm">{provider.category}</p>
                        </div>
                        <div className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded">
                          Verified
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {provider.description ?
                          (provider.description.length > 100 ?
                            `${provider.description.substring(0, 100)}...` :
                            provider.description
                          ) :
                          "Specializing in holistic wellness solutions."
                        }
                      </p>
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-gray-600 ml-2">({provider.viewCount || 0} views)</span>
                      </div>
                      {provider.location && provider.location.address && (
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            {typeof provider.location.address === 'string'
                              ? provider.location.address
                              : `${provider.location.address.street}, ${provider.location.address.city}, ${provider.location.address.state}`}
                          </span>
                        </div>
                      )}
                      <Link href={`/services/${provider.id}`} className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        View Service
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback if no providers are found
                [1, 2, 3].map((provider) => (
                  <div key={provider} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="h-48 bg-gray-200 relative">
                      {/* Featured badge */}
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
                        Featured
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">Wellness Provider {provider}</h3>
                          <p className="text-gray-700 text-sm">Acupuncture • Massage • Therapy</p>
                        </div>
                        <div className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded">
                          Verified
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">Specializing in holistic healing and natural therapies for chronic pain and stress management.</p>
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400">
                          {'★'.repeat(5)}
                        </div>
                        <span className="text-gray-600 ml-2">(42 reviews)</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>New York, NY • 2.3 miles away</span>
                      </div>
                      <Link href={`/services/${provider}`} className="block text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        View Profile
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products - Grid with hover effects */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-gray-600 mt-2">Premium wellness products for your healthy lifestyle</p>
            </div>
            <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((skeleton) => (
                <div key={skeleton} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="h-56 bg-gray-200 relative overflow-hidden">
                      {product.isFeatured ? (
                        <div className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full z-10">
                          Featured
                        </div>
                      ) : null}
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      )}
                      {/* Sale badge conditionally rendered */}
                      {product.discountPrice && product.discountPrice < product.price && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                          SALE
                        </div>
                      )}
                      {/* Image overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <Link href={`/products/${product.id}`} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          Quick View
                        </Link>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">{product.title}</h3>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-1">
                        {product.description ?
                          (product.description.length > 60 ?
                            `${product.description.substring(0, 60)}...` :
                            product.description
                          ) :
                          "Premium quality wellness product"
                        }
                      </p>
                      <p className="text-gray-500 text-xs mb-3">
                        By {product.seller ? product.seller.businessName || product.seller.name : "Wellness Brand"}
                      </p>

                      <div className="flex justify-between items-center">
                        <div>
                          {product.discountPrice && product.discountPrice < product.price ? (
                            <div className="flex items-center">
                              <span className="font-bold text-lg">{formatCurrency(product.discountPrice, product.currency)}</span>
                              <span className="text-gray-500 line-through text-sm ml-2">{formatCurrency(product.price, product.currency)}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-lg">{formatCurrency(product.price, product.currency)}</span>
                          )}
                        </div>
                        <Link href={`/products/${product.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          View Details
                        </Link>
                      </div></div>
                  </div>
                ))
              ) : (
                // Fallback if no products are found from API
                [1, 2, 3, 4].map((product) => (
                  <div key={product} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="h-56 bg-gray-200 relative overflow-hidden">
                      {/* Sale badge conditionally rendered */}
                      {product === 2 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                          SALE
                        </div>
                      )}
                      {/* Image overlay on hover */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">Natural Product {product}</h3>
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(5)}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mb-1">Premium quality wellness supplement</p>
                      <p className="text-gray-500 text-xs mb-3">By Wellness Brand</p>

                      <div className="flex justify-between items-center">
                        <div>
                          {product === 2 ? (
                            <div className="flex items-center">
                              <span className="font-bold text-lg">$24.99</span>
                              <span className="text-gray-500 line-through text-sm ml-2">$29.99</span>
                            </div>
                          ) : (
                            <span className="font-bold text-lg">$29.99</span>
                          )}
                        </div>
                        <Link href={`/products/${product}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works - Visual Steps with Icons */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our platform makes it easy to find the right wellness solutions for your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line between steps (hidden on mobile) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-blue-100 z-0"></div>

            <div className="text-center relative z-10">
              <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-6 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Search</h3>
              <p className="text-gray-600">Browse our extensive directory of wellness providers and products based on your needs.</p>
            </div>

            <div className="text-center relative z-10">
              <div className="bg-purple-100 text-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-6 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Connect</h3>
              <p className="text-gray-600">Read reviews, compare options, and connect directly with vetted service providers.</p>
            </div>

            <div className="text-center relative z-10">
              <div className="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl mx-auto mb-6 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Thrive</h3>
              <p className="text-gray-600">Experience the benefits of personalized holistic wellness solutions for your well-being.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold">Wellness Insights</h2>
              <p className="text-gray-600 mt-2">Expert articles and guides for your wellness journey</p>
            </div>
            <Link href="/blogs" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View All Articles
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((skeleton) => (
                <div key={skeleton} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.length > 0 ? (
                blogPosts.map((post) => (
                  <Link href={`/blogs/${post._id}`} key={post._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="h-48 bg-gray-200 relative">
                      {post.featuredImage ? (
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {post.category || "Wellness"}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-gray-500 text-sm mb-2">
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <h3 className="text-lg font-semibold mb-3 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{post.summary}</p>
                      )}
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 overflow-hidden relative">
                          {post.author && post.author.profilePicture ? (
                            <Image
                              src={post.author.profilePicture}
                              alt={post.author.name || "Author"}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <span>by <span className="font-medium">{post.author ? post.author.name : "Wellness Expert"}</span></span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                // Fallback if no blogs are found from API
                [
                  {
                    title: "The Science Behind Meditation and Stress Reduction",
                    category: "Mental Health",
                    image: "/images/blog1.jpg",
                    date: "Mar 25, 2025"
                  },
                  {
                    title: "Nutrition Essentials: Building a Balanced Diet for Energy",
                    category: "Nutrition",
                    image: "/images/blog2.jpg",
                    date: "Mar 20, 2025"
                  },
                  {
                    title: "Holistic Approaches to Managing Chronic Pain",
                    category: "Alternative Medicine",
                    image: "/images/blog3.jpg",
                    date: "Mar 15, 2025"
                  }
                ].map((post, index) => (
                  <Link href={`/blog/post-${index + 1}`} key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className="h-48 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-gray-500 text-sm mb-2">{post.date}</div>
                      <h3 className="text-lg font-semibold mb-3 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                        <span>by <span className="font-medium">Wellness Expert</span></span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Join as Provider CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Are You a Wellness Provider or Seller?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our platform to showcase your services or products to thousands of wellness seekers.
            Get started for just $20/month with a 14-day free trial!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
            <Link href="/auth/signup?role=provider" className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              Join as Provider
            </Link>
            <Link href="/auth/signup?role=seller" className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium text-lg transition-all">
              Join as Seller
            </Link>
          </div>
          <p className="mt-6 text-white/80 text-sm">No credit card required to start your trial.</p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Real testimonials from providers and customers who use our platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah J.",
                role: "Yoga Instructor",
                quote: "Since joining this platform, I've been able to reach new clients who truly value holistic wellness. The booking system is intuitive, and the support team is always helpful.",
                rating: 5
              },
              {
                name: "Michael T.",
                role: "Customer",
                quote: "I was looking for alternative approaches to manage my chronic back pain. This platform helped me find a fantastic acupuncturist in my area, and I'm finally experiencing relief.",
                rating: 5
              },
              {
                name: "Elena R.",
                role: "Nutritionist",
                quote: "The exposure I've received through this platform has been incredible. I'm able to focus on helping my clients while the platform handles all the marketing and scheduling.",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-all">
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-6 italic">{`"${testimonial.quote}"`}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10,000+", label: "Active Users" },
              { value: "5,000+", label: "Wellness Products" },
              { value: "2,500+", label: "Verified Providers" },
              { value: "50+", label: "Wellness Categories" },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <div className="text-blue-600 text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}