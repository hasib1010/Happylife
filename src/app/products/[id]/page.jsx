'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Check,
  Calendar,
  ArrowLeft,
  Share2
} from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent
} from '@/components/ui/card';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);

  // Fetch the product
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch the product from the API
        const response = await fetch(`/api/public/products/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data.product);

        // Increment view count
        fetch(`/api/public/products/${id}/view`, {
          method: 'POST'
        }).catch(err => console.error('Error incrementing view count:', err));

        // Fetch similar products
        const similarResponse = await fetch(`/api/public/products?category=${data.product.category}&limit=4`);
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          // Filter out the current product
          setSimilarProducts(
            similarData.products.filter(p => p.id !== id).slice(0, 3)
          );
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Format price with currency
  const formatPrice = (price, discountPrice, currency = 'USD') => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    });

    if (discountPrice) {
      return (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary">{formatter.format(discountPrice)}</span>
          <span className="text-lg text-gray-500 line-through">{formatter.format(price)}</span>
        </div>
      );
    }

    return <span className="text-2xl font-bold text-primary">{formatter.format(price)}</span>;
  };

  // Calculate discount percentage
  const calculateDiscount = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price) return null;
    const discount = ((price - discountPrice) / price) * 100;
    return Math.round(discount);
  };

  // Check if product is featured
  const isProductFeatured = (product) => {
    return (
      product.isFeatured &&
      product.featureExpiration &&
      new Date(product.featureExpiration) > new Date()
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Navigate between images
  const nextImage = () => {
    if (product?.images?.length > 0) {
      setActiveImageIndex((prev) =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setActiveImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  // Business hours utility functions
  const getDayName = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';

    // Check if time is in 24h format
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Product</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-700 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/products')}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  // Discount percentage
  const discountPercentage = calculateDiscount(product.price, product.discountPrice);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/products')}
              className="flex items-center text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Products
            </Button>
            <span className="mx-2">/</span>
            <span>{product.category}</span>
            {product.subcategory && (
              <>
                <span className="mx-2">/</span>
                <span>{product.subcategory}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Product details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product images */}
            <div className="space-y-4">
              {/* Main image */}
              <div className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[activeImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                        e.target.classList.add("p-4");
                      }}
                    />

                    {/* Navigation arrows */}
                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    {/* Discount badge */}
                    {discountPercentage && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-500 text-white">
                          {discountPercentage}% OFF
                        </Badge>
                      </div>
                    )}

                    {/* Featured badge */}
                    {isProductFeatured(product) && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Thumbnail images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto py-2 px-1">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      className={`relative flex-shrink-0 w-16 h-16 rounded border overflow-hidden ${index === activeImageIndex ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                        }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{product.title}</h1>

                {product.seller && (
                  <Link
                    href={`/sellers/${product.seller.id}`}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                  >
                    {product.seller.profilePicture && (
                      <div className="h-5 w-5 rounded-full overflow-hidden mr-1">
                        <img
                          src={product.seller.profilePicture}
                          alt={product.seller.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}
                    {product.seller.businessName || product.seller.name}
                  </Link>
                )}
              </div>

              {/* Price section */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    {formatPrice(product.price, product.discountPrice, product.currency)}
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Listed on {formatDate(product.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    {product.viewCount || 0} views
                  </div>
                </div>
              </div>

              {/* Contact information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {product.contact?.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-600" />
                      <a
                        href={`mailto:${product.contact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {product.contact.email}
                      </a>
                    </div>
                  )}

                  {product.contact?.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-600" />
                      <a
                        href={`tel:${product.contact.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {product.contact.phone}
                      </a>
                    </div>
                  )}

                  {product.contact?.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-gray-600" />
                      <a
                        href={product.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {product.contact.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {console.log(product.location)
              }

              {/* Location information */}
              {product.location && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-3">Location</h3>
                  {product.location.isRemote ? (
                    <Badge>Remote / Online</Badge>
                  ) : (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        {product.location.address && <p>{product.location.address}</p>}
                        <p>
                          {[
                            product.location.city,
                            product.location.state,
                            product.location.zipCode,
                            product.location.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Link href={`/products?query=${tag}`} key={index}>
                      <Badge variant="outline" className="cursor-pointer">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabs for product details */}
          <Tabs defaultValue="description" className="px-6 pb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="features">Features & Specs</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              {product.businessHours && product.businessHours.length > 0 && (
                <TabsTrigger value="hours">Business Hours</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                  <div className="bg-gray-50 rounded-md overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {product.specifications.map((spec, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                            <td className="py-2 px-4 border-b font-medium">{spec.name}</td>
                            <td className="py-2 px-4 border-b">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              {product.faqs && product.faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {product.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="whitespace-pre-line">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-gray-500">No FAQs available for this product.</p>
              )}
            </TabsContent>

            {product.businessHours && product.businessHours.length > 0 && (
              <TabsContent value="hours">
                <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {product.businessHours.map((hour, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                          <td className="py-2 px-4 border-b font-medium">{getDayName(hour.day)}</td>
                          <td className="py-2 px-4 border-b">
                            {hour.isClosed ? (
                              <Badge variant="outline" className="text-red-500">Closed</Badge>
                            ) : (
                              `${formatTime(hour.open)} - ${formatTime(hour.close)}`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProducts.map((similarProduct) => (
                <Link
                  href={`/products/${similarProduct.id}`}
                  key={similarProduct.id}
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-all">
                    <div className="aspect-video relative">
                      {similarProduct.images && similarProduct.images[0] ? (
                        <img
                          src={similarProduct.images[0]}
                          alt={similarProduct.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                            e.target.classList.add("p-4");
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{similarProduct.title}</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          {formatPrice(
                            similarProduct.price,
                            similarProduct.discountPrice,
                            similarProduct.currency
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}