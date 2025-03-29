// Component Path: src/components/admin/ProductSellerFix.js
// Modal component to fix product seller issues

'use client';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/lib/authUtils';
import toast from 'react-hot-toast';

export default function ProductSellerFix({ product, onClose, onProductUpdated }) {
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/admin/products/fix-seller');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sellers');
      }
      
      const data = await response.json();
      setSellers(data.sellers || []);
      
      // If the product has a seller ID, select it by default
      if (product.sellerId) {
        setSelectedSellerId(product.sellerId);
      } else if (data.sellers && data.sellers.length > 0) {
        // Otherwise select the first seller
        setSelectedSellerId(data.sellers[0]._id);
      }
    } catch (err) {
      console.error('Error fetching sellers:', err);
      setError(err.message);
      toast.error(`Error loading sellers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSellerId) {
      toast.error('Please select a seller');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetchWithAuth('/api/admin/products/fix-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          sellerId: selectedSellerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update product seller');
      }
      
      const data = await response.json();
      toast.success('Product seller updated successfully');
      
      // Notify parent component that the product was updated
      if (onProductUpdated) {
        onProductUpdated(data.product);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating product seller:', err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Fix Product Seller
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {product.seller?.name 
                    ? 'This product is currently assigned to ' + product.seller.name
                    : 'This product has no seller assigned or an invalid seller ID'}
                </p>
                
                <div className="mt-4">
                  {loading && sellers.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading sellers...</span>
                    </div>
                  ) : error && sellers.length === 0 ? (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Error loading sellers</h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="mt-2">
                        <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">
                          Select Seller
                        </label>
                        <select
                          id="sellerId"
                          value={selectedSellerId}
                          onChange={(e) => setSelectedSellerId(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select a seller</option>
                          {sellers.map((seller) => (
                            <option key={seller._id} value={seller._id}>
                              {seller.name} ({seller.email}) - {seller.role}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={onClose}
                          className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !selectedSellerId}
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                        >
                          {loading ? 'Updating...' : 'Update Seller'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}