'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Search, Filter, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Import UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for products and loading
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters and pagination
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Get query params from URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    setPage(parseInt(params.get('page') || '1'));
    setSearchQuery(params.get('query') || '');
    setSelectedCategory(params.get('category') || '');
    setSortBy(params.get('sort') || 'createdAt');
    setSortOrder(params.get('order') || 'desc');
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query params
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '12');

        if (searchQuery) {
          params.append('query', searchQuery);
        }

        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        params.append('sort', sortBy);
        params.append('order', sortOrder);

        // Fetch products from API
        const response = await fetch(`/api/public/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        setProducts(data.products);
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Update URL with query params
  const updateQueryParams = (params) => {
    const urlParams = new URLSearchParams(searchParams);

    // Update params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    // Reset page to 1 if changing filters
    if (!('page' in params)) {
      urlParams.set('page', '1');
    }

    // Navigate to new URL
    router.push(`/products?${urlParams.toString()}`);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    updateQueryParams({ query: searchQuery, page: '1' });
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateQueryParams({ category, page: '1' });
  };

  // Handle sort change
  const handleSortChange = (value) => {
    let sort = 'createdAt';
    let order = 'desc';

    switch (value) {
      case 'newest':
        sort = 'createdAt';
        order = 'desc';
        break;
      case 'oldest':
        sort = 'createdAt';
        order = 'asc';
        break;
      case 'price-low':
        sort = 'price';
        order = 'asc';
        break;
      case 'price-high':
        sort = 'price';
        order = 'desc';
        break;
      case 'popular':
        sort = 'popular';
        order = 'desc';
        break;
    }

    setSortBy(sort);
    setSortOrder(order);
    updateQueryParams({ sort, order, page: '1' });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateQueryParams({ page: newPage.toString() });

      // Scroll to top of results
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

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

  // Check if product is featured and not expired
  const isProductFeatured = (product) => {
    return (
      product.isFeatured &&
      product.featureExpiration &&
      new Date(product.featureExpiration) > new Date()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Browse Products</h1>
          <p className="text-lg max-w-2xl mb-6">
            Discover a wide range of products from our trusted sellers.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white text-black"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile filter button */}
          <div className="md:hidden mb-4">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between">
                  <span className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </span>
                  <Badge>{selectedCategory ? 1 : 0}</Badge>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-3">Categories</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        id="all-mobile"
                        checked={selectedCategory === ''}
                        onCheckedChange={() => {
                          handleCategoryChange('');
                          setMobileFiltersOpen(false);
                        }}
                      />
                      <Label htmlFor="all-mobile" className="ml-2">
                        All Categories
                      </Label>
                    </div>
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <Checkbox
                          id={`category-${category}-mobile`}
                          checked={selectedCategory === category}
                          onCheckedChange={() => {
                            handleCategoryChange(category);
                            setMobileFiltersOpen(false);
                          }}
                        />
                        <Label htmlFor={`category-${category}-mobile`} className="ml-2">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Filters sidebar (desktop) */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="font-medium text-lg mb-4">Filters</h3>

              <div className="mb-6">
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="all"
                      checked={selectedCategory === ''}
                      onCheckedChange={() => handleCategoryChange('')}
                    />
                    <Label htmlFor="all" className="ml-2">
                      All Categories
                    </Label>
                  </div>
                  {categories.map((category) => (
                    <div key={category} className="flex items-center">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategory === category}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="ml-2">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products grid */}
          <div className="flex-1">
            {/* Sort and results info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                Showing products
                {selectedCategory && <> in <span className="font-medium">{selectedCategory}</span></>}
                {searchQuery && <> matching "<span className="font-medium">{searchQuery}</span>"</>}
              </p>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active filters */}
            {(selectedCategory || searchQuery) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {selectedCategory}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleCategoryChange('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => {
                        setSearchQuery('');
                        updateQueryParams({ query: '' });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading products...</span>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <p>{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && products.length === 0 && (
              <div className="bg-white border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    updateQueryParams({ query: '', category: '', page: '1' });
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Products grid */}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    href={`/products/${product.id}`}
                    key={product.id}
                  >
                    <Card className={`h-full overflow-hidden transition-all hover:shadow-md ${ product.isFeatured ? 'ring-2 ring-yellow-400' : ''
                      }`}>
                      <div className="aspect-square relative">
                        {product.images && product.images[0] ? (
                          <div className="w-full h-full">
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Replace with placeholder on error
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
                          {product.seller && (
                            <div className="text-sm text-gray-600">
                              {product.seller.businessName || product.seller.name}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    {totalPages > 5 && page < totalPages - 2 && (
                      <>
                        <span className="text-gray-500">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="h-8 w-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}