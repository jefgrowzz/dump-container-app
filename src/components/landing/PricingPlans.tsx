"use client";

import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Basic",
    price: "$49/mo",
    features: ["1 Container Listing", "Basic Support", "Limited Analytics"],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$99/mo",
    features: ["5 Container Listings", "Priority Support", "Advanced Analytics"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited Listings", "Dedicated Account Manager", "Full Analytics Suite"],
    highlight: false,
  },
];

export default function PricingPlans() {
  return (
    <section className="bg-gray-900 text-gray-100 py-16 px-6">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Pricing Plans</h2>
        <p className="text-gray-400">Choose the plan that fits your business best</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 rounded-xl shadow-lg border ${
              plan.highlight
                ? "bg-gradient-to-tr from-purple-700 via-purple-800 to-indigo-900 text-white border-transparent"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
            <p className="text-3xl font-bold mb-6">{plan.price}</p>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <span className="mr-2 text-green-400">✔</span> {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlight ? "default" : "ghost"}
              className="w-full text-black"
            >
              {plan.highlight ? "Get Started" : "Select Plan"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
