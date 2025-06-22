"use client"
import React from 'react';
import { ArrowLeft, Phone, Mail, MessageCircle, MapPin, Search, Facebook, Instagram } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContactUsPage() {
    const router = useRouter();
    return (
        <div className="min-h-screen ">

            <div className="px-4 py-4 flex items-center gap-4">
                <ArrowLeft size={24} className="cursor-pointer" onClick={() => router.back()} />
                <h1 className="text-xl font-semibold">Contact Us</h1>
            </div>

            {/* Contact Options */}
            <div className="px-4 py-6 space-y-4">
                {/* Call Us */}
                <div className="rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full">
                            <Phone size={24} className="text-unicorn" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Call Us (+91 94289 27753)
                            </h2>
                            <p className="text-gray-600 text-sm">
                                We are here to support between 10:00 am to 08:00 pm
                            </p>
                        </div>
                    </div>
                </div>

                {/* Email Us */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full">
                            <Mail size={24} className="text-unicorn" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Email Us
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Please keep your subject clear!
                            </p>
                            <Link
                                href="mailto:nemaiplatform@gmail.com"
                                className="hover:text-blue-200 transition-colors"
                            >
                                nemaiplatform@gmail.com
                            </Link>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Us */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full">
                            <MessageCircle size={24} className="text-unicorn" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                WhatsApp Us
                            </h2>
                            <p className="text-gray-600 text-sm">
                                We reply to all the message!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full">
                            <MapPin size={24} className="text-unicorn" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Address
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Surat
                            </p>
                        </div>
                    </div>
                </div>

                {/* Find Us At */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full">
                            <Search size={24} className="text-unicorn" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Find Us At
                            </h2>
                            <div className="flex items-center gap-4">

                                {/* Facebook */}
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Facebook size={24} className="text-unicorn" />
                                </div>

                                {/* Instagram */}
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                                    <Instagram size={24} className="text-unicorn" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}