import React from 'react';
import BottomNav from '../../components/layout/BottomNav';
import { Truck, ShoppingBag, ShieldCheck, Clock, HeadphonesIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Services = () => {
    const services = [
        {
            icon: <Truck className="w-10 h-10 text-primary" />,
            title: "Hyperlocal Delivery",
            description: "Get your fashion items delivered to your doorstep within hours from local boutiques."
        },
        {
            icon: <ShoppingBag className="w-10 h-10 text-primary" />,
            title: "Curated Local Fashion",
            description: "Discover unique styles and collections from the best independent sellers in your city."
        },
        {
            icon: <ShieldCheck className="w-10 h-10 text-primary" />,
            title: "Personal Styling Services",
            description: "Expert stylists to help you curate the perfect wardrobe for any occasion."
        },
        {
            icon: <Clock className="w-10 h-10 text-primary" />,
            title: "Real-time Tracking",
            description: "Track your delivery person in real-time from the store directly to your location."
        },
        {
            icon: <HeadphonesIcon className="w-10 h-10 text-primary" />,
            title: "24/7 Support",
            description: "Our customer service team is always available to help with orders, returns, and sizing."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            <Helmet>
                <title>Our Services | QuickStyle</title>
                <meta name="description" content="Discover the premium fashion delivery services offered by QuickStyle. From hyperlocal delivery to 24/7 support." />
            </Helmet>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Our <span className="text-primary">Services</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Bridging the gap between local fashion boutiques and your wardrobe.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-6 group cursor-pointer hover:bg-primary/20 transition-all">
                                {service.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h2>
                            <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default Services;
