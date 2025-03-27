'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function FeatureProductButton({ product, className = '' }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [expirationDate, setExpirationDate] = useState(null);
    const [isRecentlyFeatured, setIsRecentlyFeatured] = useState(false);
    // In your FeatureProductButton component
    useEffect(() => {
        if (!product) return;

        // Check if featured and not expired
        if (product.isFeatured && product.featureExpiration) {
            const expDate = new Date(product.featureExpiration);
            if (expDate > new Date()) {
                // Still featured
                setIsFeatured(true);
                setExpirationDate(expDate.toLocaleDateString());
            } else {
                // Expired
                setIsFeatured(false);
                setExpirationDate(null);
            }
        }
    }, [product]);
    // Check featured status on mount and when product changes
    useEffect(() => {
        if (!product) return;

        // Check if product is currently featured - ensure boolean conversion
        const featured = Boolean(product.isFeatured);
        if (featured && !product.featureExpiration) {
            console.log("Product is featured but missing expiration date, setting default");
            // Set default expiration to 30 days from now
            const defaultExpiration = new Date();
            defaultExpiration.setDate(defaultExpiration.getDate() + 30);

            // Update the product in the database
            fetch(`/api/products/${product._id}/update-feature`, {
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

        // Check if featured and not expired
        if (featured && product.featureExpiration) {
            const expDate = new Date(product.featureExpiration);
            if (expDate > new Date()) {
                // Still featured
                setIsFeatured(true);
                setExpirationDate(expDate.toLocaleDateString());
            } else {
                // Expired
                setIsFeatured(false);
                setExpirationDate(null);
            }
        } else {
            setIsFeatured(featured);
            setExpirationDate(null);
        }

        // Check recently featured status (to prevent double-clicks)
        if (typeof window !== 'undefined') {
            const recentlyFeatured = localStorage.getItem('recentlyFeatured');
            if (recentlyFeatured === product._id) {
                setIsRecentlyFeatured(true);

                // Clear after 5 minutes
                setTimeout(() => {
                    localStorage.removeItem('recentlyFeatured');
                    setIsRecentlyFeatured(false);
                }, 5 * 60 * 1000);
            }
        }
    }, [product]);

    // Calculate if a featured product is within 3 days of expiring
    const isExpiringSoon =
        isFeatured &&
        product.featureExpiration &&
        new Date(product.featureExpiration) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const handleFeatureProduct = async () => {
        if (isLoading || isRecentlyFeatured) return;

        setIsLoading(true);

        // Store product ID to prevent double clicking
        localStorage.setItem('recentlyFeatured', product._id);

        try {
            // Call API to create Stripe checkout session
            const response = await fetch('/api/stripe/create-feature-product-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product._id,
                    duration: 30, // Fixed at 30 days
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start checkout process');
            }

            const data = await response.json();

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (error) {
            console.error('Error featuring product:', error);
            toast.error(error.message || 'Failed to process feature request');
            localStorage.removeItem('recentlyFeatured');
            setIsLoading(false);
        }
    };

    // Return featured badge if product is featured
    if (isFeatured) {
        return (
            <Button
                variant={isExpiringSoon ? "outline" : "secondary"}
                size="sm"
                className={`gap-1 ${isExpiringSoon ? 'border-amber-500 text-amber-600' : 'bg-amber-100 text-amber-800'} ${className}`}
                onClick={handleFeatureProduct} // Allow extending
                disabled={isLoading || isRecentlyFeatured}
            >
                <Star className="h-4 w-4" />
                {isExpiringSoon
                    ? 'Expires Soon'
                    : expirationDate
                        ? `Featured until ${expirationDate}`
                        : 'Featured'
                }
            </Button>
        );
    }

    // Show feature button if not featured
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleFeatureProduct}
            disabled={isLoading || isRecentlyFeatured}
            className={`gap-1 ${className}`}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-4 w-4 mr-1"
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
                <Star className="h-4 w-4" />
            )}
            {isLoading ? 'Processing...' : 'Feature'}
        </Button>
    );
}