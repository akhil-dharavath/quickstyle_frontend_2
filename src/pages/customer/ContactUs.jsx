import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/common/Navbar';
import BottomNav from '../../components/layout/BottomNav';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const ContactUs = () => {
    const { user } = useSelector((state) => state.auth);
    const role = user?.role || 'customer';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const getHeaderContent = () => {
        if (role === 'seller') return { title1: 'Seller', title2: 'Support', subtitle: 'Need help with your listings or payouts? Send our specialized seller success team a message.', email: 'sellersupport@quickstyle.com' };
        if (role === 'delivery') return { title1: 'Partner', title2: 'Support', subtitle: 'Issues with an active delivery or your earnings? Contact our partner support team for immediate assistance.', email: 'partnersupport@quickstyle.com' };
        return { title1: 'Contact', title2: 'Us', subtitle: "Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.", email: 'support@quickstyle.com' };
    };
    const content = getHeaderContent();

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            {/* <Navbar /> */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        {content.title1} <span className="text-primary">{content.title2}</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        {content.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Get In Touch</h3>

                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-gray-900">Email</p>
                                        <p className="text-gray-600">{content.email}</p>
                                        <p className="text-gray-600">info@quickstyle.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-gray-900">Phone</p>
                                        <p className="text-gray-600">+1 (800) 123-4567</p>
                                        <p className="text-gray-600">Mon-Fri 9am to 6pm</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-1">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-semibold text-gray-900">Office</p>
                                        <p className="text-gray-600">123 Fashion Avenue</p>
                                        <p className="text-gray-600">New York, NY 10001</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map placeholder */}
                        <div className="bg-gray-200 rounded-3xl h-64 overflow-hidden relative shadow-sm">
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800"
                                alt="Map"
                                className="absolute inset-0 w-full h-full object-cover opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full font-semibold shadow-lg text-primary flex items-center gap-2">
                                    <MapPin className="w-5 h-5" /> HQ Location
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Send a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                        placeholder="How can we help you?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Send Message
                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {(!role || role === 'customer') && <BottomNav />}
        </div>
    );
};

export default ContactUs;
