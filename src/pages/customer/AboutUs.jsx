import React from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { Shield, Truck, Zap, Heart } from 'lucide-react';

const AboutUs = () => {
    const { user } = useSelector((state) => state.auth);
    const role = user?.role || 'customer';

    const getContent = () => {
        if (role === 'seller') return {
            subtitle: "Empowering local boutiques to reach more customers and increase sales through hyperlocal delivery.",
            missionTitle: "Empowering Sellers",
            mission1: "Our mission is to help local retail businesses thrive in the digital age.",
            mission2: "We provide the platform and delivery infrastructure so you can focus on what you do best: sourcing great fashion and serving your customers.",
            ctaTitle: "Grow Your Business With Us",
            ctaText: "Join our network of top-rated local sellers and start increasing your revenue today."
        };
        if (role === 'delivery') return {
            subtitle: "Providing fast, reliable delivery opportunities for partners in our growing fashion network.",
            missionTitle: "Partnering for Success",
            mission1: "Our mission is to build a reliable delivery network that benefits the community.",
            mission2: "We provide our partners with flexible earning opportunities, competitive payouts, and a supportive environment.",
            ctaTitle: "Drive With QuickStyle",
            ctaText: "Join our fleet of delivery partners and enjoy flexible hours and competitive payouts."
        };
        return {
            subtitle: "We're revolutionizing the way you shop for fashion by bringing local boutiques directly to you.",
            missionTitle: "Our Mission",
            mission1: "QuickStyle was born out of a simple idea: why wait days for your favorite clothes when you can have them in hours? We partner with top local fashion retailers to create a seamless, hyperlocal shopping experience.",
            mission2: "Our platform empowers local sellers while giving customers unprecedented access to the latest trends with immediate delivery. It's a win-win for the fashion community.",
            ctaTitle: "Join the Fashion Revolution",
            ctaText: "Whether you're a shopper looking for the latest styles or a seller wanting to reach local customers, we'd love to have you."
        };
    };

    const content = getContent();

    const values = [
        {
            icon: <Shield className="w-8 h-8 text-primary" />,
            title: "Quality First",
            description: "We source only the finest materials for our clothing."
        },
        {
            icon: <Zap className="w-8 h-8 text-primary" />,
            title: "Fast Fashion",
            description: "Stay ahead of the curve with our trendy, rapidly-updated collections."
        },
        {
            icon: <Truck className="w-8 h-8 text-primary" />,
            title: "Hyperlocal Delivery",
            description: "Get your favorite styles delivered to your doorstep in hours, not days."
        },
        {
            icon: <Heart className="w-8 h-8 text-primary" />,
            title: "Customer Love",
            description: "Your satisfaction is our priority. We're here for you 24/7."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            {/* <Navbar /> */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        About <span className="text-primary">QuickStyle</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        {content.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 shadow-xl rounded-3xl overflow-hidden bg-white">
                    <div className="p-8 md:p-12 order-2 md:order-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">{content.missionTitle}</h2>
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                            {content.mission1}
                        </p>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {content.mission2}
                        </p>
                    </div>
                    <div className="h-full min-h-[400px] w-full bg-gray-200 relative order-1 md:order-2">
                        <img
                            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200"
                            alt="Fashion boutique"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 relative group cursor-pointer hover:bg-primary/20 transition-all">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-primary text-white rounded-3xl p-10 md:p-16 text-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">{content.ctaTitle}</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto relative z-10 text-white/90">
                        {content.ctaText}
                    </p>
                </div>
            </main>

            {(!role || role === 'customer') && <BottomNav />}
        </div>
    );
};

export default AboutUs;
