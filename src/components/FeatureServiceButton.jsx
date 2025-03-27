'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const FeatureServiceButton = ({ service, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [expirationDate, setExpirationDate] = useState(null);

  // Check featured status on mount and when service changes
  useEffect(() => {
    if (!service) return;

    // Debug log the raw service data
    console.log(`Feature button checking service:`, {
      id: service._id,
      isFeatured: service.isFeatured,
      featureExpiration: service.featureExpiration,
      type: typeof service.isFeatured
    });

    // Check if service is currently featured - ensure boolean conversion
    const featured = Boolean(service.isFeatured);
    if (featured && !service.featureExpiration) {
      console.log("Service is featured but missing expiration date, setting default");
      // Set default expiration to 30 days from now
      const defaultExpiration = new Date();
      defaultExpiration.setDate(defaultExpiration.getDate() + 30);

      // Update the service in the database
      fetch(`/api/services/${service._id}/update-feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureExpiration: defaultExpiration.toISOString()
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log("Updated feature expiration:", data);
          // Set local state
          setExpirationDate(defaultExpiration.toLocaleDateString());
        })
        .catch(err => {
          console.error("Failed to update expiration date:", err);
        });
    }
    // Update local state
    setIsFeatured(featured);

    // Format expiration date if available
    if (service.featureExpiration) {
      try {
        setExpirationDate(new Date(service.featureExpiration).toLocaleDateString());
      } catch (e) {
        console.error('Error formatting date:', e);
        setExpirationDate(null);
      }
    } else {
      setExpirationDate(null);
    }

    // Debug log
    console.log(`Feature status check for service ${service._id}:`, {
      isFeatured: service.isFeatured,
      expiration: service.featureExpiration,
      isCurrentlyValid: featured,
      formattedDate: expirationDate
    });
  }, [service]);

  const handleFeatureService = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Call API to create Stripe checkout session
      const response = await fetch('/api/stripe/create-feature-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start checkout process');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;

    } catch (error) {
      console.error('Error featuring service:', error);
      toast.error(error.message || 'Failed to process feature request');
      setIsLoading(false);
    }
  };

  // Return featured badge if service is featured
  if (isFeatured) {
    return (
      <div className={`inline-flex items-center px-3 py-1 border border-yellow-200 text-xs font-medium rounded text-yellow-700 bg-yellow-50 ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5 mr-1 text-yellow-500"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        {expirationDate ? `Featured until ${expirationDate}` : 'Featured'}
      </div>
    );
  }

  // Show feature button if not featured
  return (
    <button
      onClick={handleFeatureService}
      disabled={isLoading}
      className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition ${className}`}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-3.5 w-3.5 mr-1"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {isLoading ? 'Processing...' : 'Feature Service'}
    </button>
  );
};

export default FeatureServiceButton;