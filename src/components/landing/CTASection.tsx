"use client";

import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="bg-gray-900 text-white py-20 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-4">
          Ready to take your business to the next level?
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          Join hundreds of satisfied customers using our platform to simplify
          their operations and grow faster.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-gray-500 text-gray-300 hover:bg-gray-800 hover:border-gray-400"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
