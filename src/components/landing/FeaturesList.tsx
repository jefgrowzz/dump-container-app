"use client";

import { Star, Check, Truck } from "lucide-react"; // ✅ named imports

const features = [
  { title: "Fast Booking", description: "Quick and easy reservations", icon: Star },
  { title: "Reliable Service", description: "Always on time and professional", icon: Check },
  { title: "Large Fleet", description: "Multiple container sizes available", icon: Truck },
];

export default function FeaturesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <div key={idx} className="p-6 bg-gray-800 rounded-xl shadow hover:shadow-lg transition">
            <div className="flex items-center justify-center mb-4 w-12 h-12 bg-purple-600 rounded-full mx-auto">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">{feature.title}</h3>
            <p className="text-gray-400 text-center">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}
