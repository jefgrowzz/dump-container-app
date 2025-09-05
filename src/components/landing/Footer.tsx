"use client";

import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6 md:flex md:justify-between md:items-start">
        
        {/* Logo & Description */}
        <div className="mb-8 md:mb-0">
          <h1 className="text-2xl font-bold text-white mb-2">YourBrand</h1>
          <p className="text-gray-400 max-w-sm">
            Empowering your business with seamless solutions and exceptional service.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-8 md:flex md:space-x-12">
          <div>
            <h3 className="font-semibold text-white mb-3">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Socials */}
        <div className="mt-8 md:mt-0">
          <h3 className="font-semibold text-white mb-3">Follow Us</h3>
          <div className="flex space-x-4">
            <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-800"><FaFacebookF /></Button>
            <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-800"><FaTwitter /></Button>
            <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-800"><FaInstagram /></Button>
            <Button variant="ghost" className="p-2 rounded-full hover:bg-gray-800"><FaLinkedinIn /></Button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} YourBrand. All rights reserved.
      </div>
    </footer>
  );
}
