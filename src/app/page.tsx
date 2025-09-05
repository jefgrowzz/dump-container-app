"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowUp, Phone, Mail, MapPin } from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import HeroSection from "@/components/landing/HeroSection";
import FeaturesList from "@/components/landing/FeaturesList";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import PricingPlans from "@/components/landing/PricingPlans";
import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/auth/AuthModal";




export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authInitial, setAuthInitial] = useState<"login" | "register">(
    "register"
  );

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY || 0);
      setShowScrollTop((window.scrollY || 0) > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openAuth = (initial: "login" | "register" = "register") => {
    setAuthInitial(initial);
    setAuthOpen(true);
  };

  const closeAuth = () => setAuthOpen(false);

  const navItems = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Reviews" },
    { href: "#faq", label: "FAQ" },
  ];

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100 min-h-screen font-sans relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/6 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      {/* Top contact strip */}
      <div className="bg-gradient-to-r from-gray-800/90 to-slate-800/90 backdrop-blur-xl border-b border-gray-700/30 py-2 px-6 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-green-400" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3 text-blue-400" />
              <span>info@waterfieldrentals.com</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-gray-300">
            <MapPin className="w-3 h-3 text-red-400" />
            <span>Serving the Greater Metro Area</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-gray-900/95 backdrop-blur-xl shadow-2xl border-b border-gray-700/50"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo only */}
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center justify-center">
              <Image
                src="/WaterFieldDumpsterRental.png"
                alt="WaterField"
                width={300}
                height={300}
                className="max-h-28 sm:max-h-32 md:max-h-36 w-auto object-contain"

            />
          </Link>
          </div>
          {/* Desktop nav & CTAs */}
          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {navItems.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  className="relative text-gray-300 hover:text-white transition group py-2"
                >
                  {it.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-blue-500 group-hover:w-full transition-all" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => openAuth("login")}
                className="px-4 py-2 text-gray-300 hover:text-white rounded-md bg-gray-800/40"
              >
                Sign in
              </button>

              <button
                onClick={() => openAuth("register")}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:scale-105 transition-transform"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => openAuth("login")}
              className="hidden md:inline px-3 py-2 rounded-md bg-gray-800/60 text-gray-200"
            >
              Sign in
            </button>

            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300"
              aria-label="toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 p-4 bg-gray-800/95 rounded-2xl border border-gray-700/50 shadow-2xl">
            <nav className="flex flex-col gap-3">
              {navItems.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="py-3 px-3 rounded-lg text-gray-300 hover:bg-gray-700/50"
                >
                  {it.label}
                </a>
              ))}

              <div className="pt-3 border-t border-gray-700/50 mt-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAuth("register");
                  }}
                  className="w-full py-3 px-4 mb-2 text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-lg"
                >
                  Book Now
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    openAuth("login");
                  }}
                  className="w-full py-3 px-4 text-gray-300 border border-gray-600 rounded-lg"
                >
                  Sign in
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="relative z-10">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-gray-900/40 pointer-events-none" />
          <HeroSection openAuth={() => openAuth("register")} />
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
                Why Choose WaterField?
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Premium container rentals with transparent pricing and reliable service.
              </p>
            </div>

            <FeaturesList />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 px-6 bg-gray-800/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
                Simple Process
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Three easy steps to get your container delivered.
              </p>
            </div>

            <HowItWorks />
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
                What Our Customers Say
              </h2>
            </div>

            <Testimonials />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-6 bg-gray-800/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
                Transparent Pricing
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">No hidden fees — simple plans for every job.</p>
            </div>

            <PricingPlans />
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <CTASection openAuth={() => openAuth("register")} />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <FAQSection />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800 to-transparent pointer-events-none" />
        <Footer />
      </footer>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-full shadow-2xl z-50"
          aria-label="scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Floating call button */}
      <div className="fixed bottom-8 left-8 z-50">
        <a
          href="tel:(555)123-4567"
          className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-2xl"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Call Now</span>
        </a>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={!!authOpen}
        initial={authInitial}
        onClose={closeAuth}
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}
