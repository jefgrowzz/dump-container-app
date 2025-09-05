"use client";

import React from "react";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Jane Doe",
    role: "CEO of TilePro",
    avatar: "/avatars/jane.jpg",
    quote: "This service completely transformed how we manage our containers. Super easy and efficient!",
  },
  {
    id: 2,
    name: "John Smith",
    role: "Operations Manager",
    avatar: "/avatars/john.jpg",
    quote: "I love the intuitive interface and the booking system. Highly recommended!",
  },
  {
    id: 3,
    name: "Emily Johnson",
    role: "Entrepreneur",
    avatar: "/avatars/emily.jpg",
    quote: "A must-have tool for anyone needing reliable container management. Amazing support too!",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-900 text-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center text-center hover:scale-105 transition-transform"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-16 h-16 rounded-full mb-4 border-2 border-indigo-500"
              />
              <p className="italic mb-4">"{t.quote}"</p>
              <h3 className="font-semibold text-lg">{t.name}</h3>
              <p className="text-sm text-gray-400">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
