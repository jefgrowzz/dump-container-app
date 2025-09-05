"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative bg-gray-900 text-white">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt="Hero Background"
          fill
          priority
          className="object-cover opacity-40"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 flex flex-col items-center text-center">
        <h1 className="text-5xl font-extrabold sm:text-6xl mb-6">
          Rent Containers Effortlessly
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mb-8 text-gray-300">
          Find the perfect container for your project, check availability, and book instantly.
        </p>
        <div className="flex gap-4">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="border-gray-500 hover:border-white">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
