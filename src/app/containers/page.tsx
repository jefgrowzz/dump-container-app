"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ContainerList from "@/components/containers/ContainerList";
import ContainerFilters from "@/components/containers/ContainerFilters";
import ContainerDetailsModal from "@/components/containers/ContainerDetailModal";
import BookingForm from "@/components/containers/BookingForm";
import PaymentSuccess from "@/components/containers/PaymentSuccess";
import SuccessPage from "@/components/containers/SuccessPage";
import Head from "next/head";

export default function ContainersPage() {
  const searchParams = useSearchParams();
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // Check for payment success/cancellation in URL params
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      setShowPaymentSuccess(true);
    } else if (payment === 'cancelled') {
      // Handle cancellation if needed
      console.log('Payment was cancelled');
    }
  }, [searchParams]);

  // Example state for filters (assuming ContainerFilters supports input/output)
  const [filters, setFilters] = useState({
    location: "",
    size: "",
    availableDate: "",
    priceRange: [0, 10000],
    isAvailable: null,
  });

  // Assume ContainerList can accept filters props for filtering
  // Using useMemo to avoid unnecessary re-renders if applicable
  const filteredContainersProps = useMemo(() => filters, [filters]);

  // Accessibility: trap focus when modal or booking forms open
  // Could implement focus management libs later

  return (
    <>
      {/* SEO and Meta tags */}
      <Head>
        <title>Available Containers for Rent & Booking | ContainerApp</title>
        <meta
          name="description"
          content="Discover and book containers of various sizes and locations. Check availability, pricing and detailed info on each container."
        />
        <meta name="keywords" content="containers, container rental, container booking, shipping containers, storage containers" />
        <meta name="author" content="ContainerApp" />
        <meta property="og:title" content="Available Containers - ContainerApp" />
        <meta property="og:description" content="Find and reserve your ideal container today. Filter by location, size, price and more." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-200">
        {/* Navbar - Consider using a <header><nav> structure for semantics */}
        <header aria-label="Primary Navigation" className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-white">ContainerApp</h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="/containers" className="text-white font-medium">Containers</a>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Available Containers
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Find the perfect container for your needs. Filter by location, size, and availability.
              </p>
            </div>

            {/* Filters Section */}
            <div className="mb-8">
              <ContainerFilters
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>

            {/* Container List */}
            <ContainerList
              onContainerSelect={setSelectedContainer}
              onBookContainer={(container) => {
                setSelectedContainer(container);
                setIsBooking(true);
              }}
              filters={filteredContainersProps}
            />
          </div>
        </main>

        {/* Container Details Modal */}
        {selectedContainer && !isBooking && !bookingSuccess && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Container Details"
            tabIndex={-1}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-4xl transform transition-all duration-300 scale-100">
              <div className="p-8">
                <ContainerDetailsModal
                  container={selectedContainer}
                  onClose={() => setSelectedContainer(null)}
                  onBook={() => setIsBooking(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Booking Form modal */}
        {isBooking && !bookingSuccess && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Booking Form"
            tabIndex={-1}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
              <div className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Complete Your Booking</h3>
                </div>
                <BookingForm
                  container={selectedContainer}
                  onCancel={() => setIsBooking(false)}
                  onSuccess={() => {
                    setIsBooking(false);
                    setBookingSuccess(true);
                    setSelectedContainer(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Modal */}
        {showPaymentSuccess && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Payment Success"
            tabIndex={-1}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
              <div className="p-8">
                <PaymentSuccess
                  onClose={() => {
                    setShowPaymentSuccess(false);
                    // Clean up URL params
                    window.history.replaceState({}, '', '/containers');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Success Page modal */}
        {bookingSuccess && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Booking Success"
            tabIndex={-1}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
              <div className="p-8">
                <SuccessPage
                  onClose={() => setBookingSuccess(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}