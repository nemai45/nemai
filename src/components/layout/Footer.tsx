import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className=" text-unicorn-dark py-3 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-blue-400" />
            <a 
              href="mailto:nemaiplatform@gmail.com" 
              className="hover:text-blue-400 transition-colors"
            >
              nemaiplatform@gmail.com
            </a>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-green-400" />
            <a 
              href="tel:+1234567890" 
              className="hover:text-green-400 transition-colors"
            >
              +91 9876543210
            </a>
          </div>
          
          
          {/* Copyright */}
          <div className="text-gray-400 border-l border-gray-600 pl-6">
            © 2025 NéMai. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}