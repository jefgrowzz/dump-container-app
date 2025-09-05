"use client";

import { useState, useEffect, useMemo } from "react";
import ContainerList from "@/components/containers/ContainerList";
import ContainerFilters from "@/components/containers/ContainerFilters";
import ContainerDetailsModal from "@/components/containers/ContainerDetailModal";
import BookingForm from "@/components/containers/BookingForm";
import SuccessPage from "@/components/containers/SuccessPage";
import Head from "next/head";

export default function ContainersPage() {
  const [selectedContainer, setSelectedContainer] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a href="/" aria-label="ContainerApp Home" className="text-2xl font-bold text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-green-400">
                ContainerApp
              </a>
            </div>
            <nav aria-label="Primary" className="flex items-center space-x-6">
              <a href="/" className="text-gray-300 hover:text-white transition focus:outline-focus-ring">Home</a>
              <a href="/inventory" aria-current="page" className="text-white font-semibold underline">
                Inventory
              </a>
              <a href="/bookings" className="text-gray-300 hover:text-white transition focus:outline-focus-ring">Bookings</a>
              <a href="/contact" className="text-gray-300 hover:text-white transition focus:outline-focus-ring">Contact</a>
            </nav>
          </div>
        </header>

        {/* Animated Background Elements */}
        <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Main content */}
        <main className="relative z-10 pt-24 max-w-7xl mx-auto px-6" role="main">
          {/* Page introduction for SEO and users */}
          <section className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
              Available Shipping & Storage Containers
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl">
              Browse through our extensive container inventory to find the perfect option for storage, shipping, or custom needs. Filter by size, location, availability, and price.
            </p>
          </section>

          {/* Filters Section */}
          <section aria-label="Container Filters" className="mb-8 bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">
                Filter & Search Containers
              </h2>
            </div>
            <ContainerFilters filters={filters} onChange={setFilters} />
          </section>

          {/* Inventory list with improved section landmark and aria-label */}
          <section aria-label="Container Inventory" className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">
            <header className="p-6 border-b border-gray-700/50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">Container Inventory</h2>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm" aria-live="polite">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Updated in real-time</span>
              </div>
            </header>

            <div className="p-6">
              {/* Pass filters as props for filtering in ContainerList */}
              <ContainerList filters={filteredContainersProps} onSelect={setSelectedContainer} />
            </div>
          </section>
        </main>

        {/* Details Modal with accessible roles and aria labels */}
        {selectedContainer && !isBooking && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Container details for ${selectedContainer.title}`}
            tabIndex={-1}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto focus:outline-none">
              <ContainerDetailsModal
                container={selectedContainer}
                onClose={() => setSelectedContainer(null)}
                onBook={() => setIsBooking(true)}
              />
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

        {/* Success Page modal */}
        {bookingSuccess && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Booking Success"
            tabIndex={-1}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl max-w-md w-full">
              <SuccessPage onClose={() => setBookingSuccess(false)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}