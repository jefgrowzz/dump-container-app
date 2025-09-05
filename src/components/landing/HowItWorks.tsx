"use client";

import { CheckCircle } from "lucide-react";

const steps = [
  {
    title: "Browse Containers",
    description: "Explore all available containers with details, prices, and availability.",
  },
  {
    title: "Select & Customize",
    description: "Choose the container you need and add optional add-ons or services.",
  },
  {
    title: "Book & Pay",
    description: "Pick your dates, fill out the booking form, and complete your payment securely.",
  },
  {
    title: "Enjoy & Track",
    description: "Get your container delivered and track its status until completion.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-900 text-gray-100 py-20 px-6 md:px-16">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-400 text-lg">
          Renting a container has never been easier. Just follow these simple steps:
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4 mx-auto">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">{step.title}</h3>
            <p className="text-gray-400 text-center">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
