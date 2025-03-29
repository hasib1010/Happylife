// Component Path: src/components/admin/AdminProducts.js
// Used in admin dashboard to manage products

'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';
import ProductSellerFix from './ProductSellerFix';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSellerFixModalOpen, setIsSellerFixModalOpen] = useState(false);
  const [productToFix, setProductToFix] = useState(null);

  const fetchProducts = async (page = 1, search = '', status = 'all', category = 'all') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(category !== 'all' && { category }),
      });

      const response = await fetchWithAuth(`/api/admin/products?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      toast.error(`Error loading products: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter);
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchProducts(1, searchTerm, statusFilter, categoryFilter);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleFixSeller = (product) => {
    setProductToFix(product);
    setIsSellerFixModalOpen(true);
  };

  const handleProductUpdated = (updatedProduct) => {
    // Update the product in the list
    setProducts(products.map(p => 
      p._id === updatedProduct._id ? { ...p, ...updatedProduct } : p
    ));
    
    // If this product is currently selected in the detail modal, update it there too
    if (selectedProduct && selectedProduct._id === updatedProduct._id) {
      setSelectedProduct({ ...selectedProduct, ...updatedProduct });
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      const response = await fetchWithAuth(`/api/admin/products/${productId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${newStatus === 'published' ? 'publish' : 'unpublish'} product`);
      }

      toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      
      // Refresh the products list
      fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      console.error('Error updating product status:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Product deleted successfully');
      
      // Refresh the products list
      fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter);
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(`Error deleting product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format price for display
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Check if seller info is missing or incomplete
  const hasSellerIssue = (product) => {
    return !product.seller || !product.seller.name;
  };

  // Product Detail Modal
  const ProductDetailModal = ({ isOpen, onClose, product }) => {
    if (!isOpen || !product) return null;

    return (
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Product Details</h3>
                  <div className="mt-4">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Title</p>
                      <p className="mt-1 text-sm text-gray-900">{product.title}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Seller</p>
                      {hasSellerIssue(product) ? (
                        <div className="mt-1 flex items-center">
                          <p className="text-sm text-red-600">Unknown or Missing Seller</p>
                          <button 
                            onClick={() => {
                              onClose();
                              handleFixSeller(product);
                            }}
                            className="ml-2 rounded-md border border-transparent bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Fix
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1 text-sm text-gray-900">
                            {product.seller?.name || 'Unknown Seller'}
                          </p>
                          <p className="text-sm text-gray-500">{product.seller?.email || 'No email'}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Price</p>
                        <p className="mt-1 text-sm text-gray-900">{formatPrice(product.price)}</p>
                        {product.discountPrice && (
                          <p className="text-sm text-red-600">
                            Discount: {formatPrice(product.discountPrice)}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="mt-1 text-sm text-gray-900">{product.category}</p>
                        {product.subcategory && (
                          <p className="text-sm text-gray-500">Subcategory: {product.subcategory}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="mt-1 text-sm text-gray-900">{product.description}</p>
                    </div>
                    
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <p className="mt-1 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : product.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Active</p>
                        <p className="mt-1 text-sm">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.isActive ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    {product.features && product.features.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Features</p>
                        <ul className="mt-1 list-disc list-inside text-sm text-gray-900">
                          {product.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">View Count</p>
                        <p className="mt-1 text-sm text-gray-900">{product.viewCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Created</p>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(product.createdAt)}</p>
                      </div>
                    </div>
                    
                    {product.images && product.images.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500">Images</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {product.images.map((image, index) => (
                            <div key={index} className="h-16 w-16 overflow-hidden rounded border border-gray-200">
                              <img src={image} alt={`${product.title} - ${index}`} className="h-full w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => handleToggleProductStatus(product._id, product.status)}
                className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                  product.status === 'published'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {product.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              {hasSellerIssue(product) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    handleFixSeller(product);
                  }}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Fix Seller
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  handleDeleteProduct(product._id);
                }}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow">
      {/* Search and Filter */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Herbal Supplements">Herbal Supplements</option>
                <option value="Essential Oils">Essential Oils</option>
                <option value="Natural Beauty">Natural Beauty</option>
                <option value="Organic Foods">Organic Foods</option>
                <option value="Meditation Tools">Meditation Tools</option>
                <option value="Fitness Equipment">Fitness Equipment</option>
                <option value="Wellness Books">Wellness Books</option>
              </select>
            </div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        {loading && products.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            <span className="ml-2 text-gray-500">Loading products...</span>
          </div>
        ) : error && products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <p className="mb-4 text-red-500">{error}</p>
            <button
              onClick={() => fetchProducts(currentPage, searchTerm, statusFilter, categoryFilter)}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Seller
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {product.images && product.images.length > 0 ? (
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-md object-cover" src={product.images[0]} alt="" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">{product.title?.charAt(0)}</span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description?.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {hasSellerIssue(product) ? (
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm text-red-600">Unknown Seller</div>
                            <div className="text-sm text-gray-500">Needs assignment</div>
                          </div>
                          <button
                            onClick={() => handleFixSeller(product)}
                            className="ml-2 rounded-md border border-transparent bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Fix
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm text-gray-900">{product.seller.name}</div>
                          <div className="text-sm text-gray-500">{product.seller.email || 'No email'}</div>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatPrice(product.price)}
                      {product.discountPrice && (
                        <div className="text-xs text-red-600">
                          Sale: {formatPrice(product.discountPrice)}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleProductStatus(product._id, product.status)}
                        className={`ml-4 ${
                          product.status === 'published' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {product.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="ml-4 text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, (totalPages * 10))}</span> of{' '}
              <span className="font-medium">{totalPages * 10}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === 1
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
      />

      {/* Seller Fix Modal */}
      {isSellerFixModalOpen && productToFix && (
        <ProductSellerFix
          product={productToFix}
          onClose={() => setIsSellerFixModalOpen(false)}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}