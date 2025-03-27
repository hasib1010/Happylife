'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  Calendar, 
  ArrowLeft,
  Store,
  User as UserIcon,
  Briefcase,
  ChevronRight
} from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SellerProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/public/sellers/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch seller data');
        }
        
        const data = await response.json();
        setSeller(data.seller);
        setProducts(data.products);
      } catch (err) {
        console.error('Error fetching seller data:', err);
        setError(err.message || 'An error occurred while fetching seller data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchSellerData();
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
          <span className="text-lg font-bold text-primary">{formatter.format(discountPrice)}</span>
          <span className="text-sm text-gray-500 line-through">{formatter.format(price)}</span>
        </div>
      );
    }
    
    return <span className="text-lg font-bold text-primary">{formatter.format(price)}</span>;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Check if product is featured
  const isProductFeatured = (product) => {
    return (
      product.isFeatured &&
      product.featureExpiration &&
      new Date(product.featureExpiration) > new Date()
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading seller profile...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/sellers')}>
            Back to Sellers
          </Button>
        </div>
      </div>
    );
  }
  
  // Seller not found
  if (!seller) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">Seller Not Found</h2>
          <p className="text-gray-700 mb-6">The seller you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/sellers')}>
            Browse Sellers
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="mx-2">/</span>
            <span>Sellers</span>
            <span className="mx-2">/</span>
            <span>{seller.businessName || seller.name}</span>
          </div>
        </div>
      </div>
      
      {/* Seller profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Seller header */}
          <div className="relative">
            {/* Cover image (placeholder) */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            
            {/* Seller information */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4 space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile picture */}
                <div className="relative h-32 w-32 rounded-xl overflow-hidden border-4 border-white bg-white shadow-md">
                  {seller.profilePicture ? (
                    <img 
                      src={seller.profilePicture} 
                      alt={seller.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";
                        e.target.className = "h-full w-full object-cover p-4 text-gray-400";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <UserIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Seller name and role */}
                <div className="md:pb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {seller.businessName || seller.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                      {seller.role === 'seller' ? 'Seller' : seller.role === 'provider' ? 'Service Provider' : 'Admin'}
                    </Badge>
                    
                    {seller.isSubscribed && (
                      <Badge className="bg-green-500">Verified</Badge>
                    )}
                    
                    {seller.categories && seller.categories.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {seller.categories.slice(0, 2).join(', ')}
                          {seller.categories.length > 2 && ' & more'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="about" className="px-6 pb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6">
              {/* Business description */}
              {seller.businessDescription && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">About {seller.businessName || seller.name}</h3>
                  <p className="text-gray-700 whitespace-pre-line">{seller.businessDescription}</p>
                </div>
              )}
              
              {/* Personal bio */}
              {seller.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Bio</h3>
                  <p className="text-gray-700 whitespace-pre-line">{seller.bio}</p>
                </div>
              )}
              
              {/* Categories */}
              {seller.categories && seller.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {seller.categories.map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="products" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Products</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-sm text-blue-600"
                >
                  <Link href={`/products?sellerId=${seller.id}`}>
                    View all
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <Link
                      href={`/products/${product.id}`}
                      key={product.id}
                    >
                      <Card className={`h-full overflow-hidden transition-all hover:shadow-md ${
                        isProductFeatured(product) ? 'ring-2 ring-yellow-400' : ''
                      }`}>
                        <div className="aspect-square relative">
                          {product.images && product.images[0] ? (
                            <div className="w-full h-full">
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                                  e.target.classList.add("p-4");
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          
                          {/* Featured badge */}
                          {isProductFeatured(product) && (
                            <div className="absolute top-2 left-2">
                              <Badge className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <div>
                              {formatPrice(product.price, product.discountPrice, product.currency)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border rounded-lg p-8 text-center">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Store className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-600">
                    This seller doesn't have any products listed at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              {/* Contact information */}
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <Card>
                  <CardContent className="flex items-start p-6">
                    <Mail className="h-10 w-10 text-blue-500 mr-4" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <a 
                        href={`mailto:${seller.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {seller.email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Phone */}
                {seller.phoneNumber && (
                  <Card>
                    <CardContent className="flex items-start p-6">
                      <Phone className="h-10 w-10 text-blue-500 mr-4" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone</p>
                        <a 
                          href={`tel:${seller.phoneNumber}`}
                          className="text-blue-600 hover:underline"
                        >
                          {seller.phoneNumber}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Location */}
                {seller.address && (
                  <Card>
                    <CardContent className="flex items-start p-6">
                      <MapPin className="h-10 w-10 text-blue-500 mr-4" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p>
                          {[
                            seller.address.street,
                            seller.address.city,
                            seller.address.state,
                            seller.address.zipCode,
                            seller.address.country
                          ].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}