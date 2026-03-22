import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import BottomNav from '../../components/layout/BottomNav';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CUSTOMER_FAQS = [
    {
        question: "How fast is delivery?",
        answer: "We aim for hyperlocal delivery within 2-4 hours depending on the distance from the boutique and current traffic conditions."
    },
    {
        question: "Can I track my order?",
        answer: "Yes, you can track your order in real-time through the Orders section in your profile once a delivery partner has picked it up."
    },
    {
        question: "What if I receive a defective product?",
        answer: "We have a strict quality check, but if you receive a damaged item, you can request a replacement up to 2 times from the Orders page within 24 hours of delivery. Note: we do not offer refunds/returns."
    },
    {
        question: "Do you offer cash on delivery?",
        answer: "Currently, we only support prepaid orders via credit/debit cards, UPI, and net banking to ensure a contactless and fast delivery experience."
    }
];

const SELLER_FAQS = [
    {
        question: "How do I list a product?",
        answer: "Log into your Seller Dashboard and navigate to the Products section. Click 'Add Product' and fill in the details including photos, sizes, and stock."
    },
    {
        question: "When do I get paid?",
        answer: "Payments are processed directly to your registered bank account every 7 days through Razorpay Route for all completed and non-returned orders."
    },
    {
        question: "What happens if a customer requests a replacement?",
        answer: "If an item is requested to be replaced due to a defect, the defective unit will be brought back to your store, and a replacement will be dispatched. You are responsible for maintaining the quality of listed products to minimize replacements."
    },
    {
        question: "Can I run promotions?",
        answer: "Currently, QuickStyle handles platform-wide promotions. However, you can adjust your base prices at any time to offer competitive rates."
    }
];

const DELIVERY_FAQS = [
    {
        question: "How do I get assigned orders?",
        answer: "Active orders in your vicinity will appear on your Delivery Dashboard. You can accept an order to begin the pickup process."
    },
    {
        question: "How is my payout calculated?",
        answer: "Payouts are based on the base delivery fee plus an additional amount determined by the total distance from pickup to drop-off."
    },
    {
        question: "What if the customer is not available at the location?",
        answer: "Try contacting the customer via the app. If unreachable after 10 minutes, contact QuickStyle support through the help center for further instructions."
    },
    {
        question: "Are there any penalties for late deliveries?",
        answer: "Repeated unjustified delays may affect your rating, which determines the volume of tasks assigned to you in the future."
    }
];

const ADMIN_FAQS = [
    {
        question: "How do I add a new Delivery Partner?",
        answer: "Go to the Delivery Persons tab in the Admin Dashboard, click 'Add Delivery Person', and enter their details. An invite link will be sent to them."
    },
    {
        question: "Can I block a user or seller?",
        answer: "Yes, navigate to the Users or Sellers tab, find the specific account, and use the 'Block' or 'Suspend' action."
    }
];

const FAQ = () => {
    const { user } = useSelector(state => state.auth);
    const role = user?.role || 'customer';
    const [openIndex, setOpenIndex] = useState(null);

    let activeFAQS = CUSTOMER_FAQS;
    if (role === 'seller') activeFAQS = SELLER_FAQS;
    else if (role === 'delivery') activeFAQS = DELIVERY_FAQS;
    else if (role === 'admin') activeFAQS = ADMIN_FAQS;

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            <Helmet>
                <title>Frequently Asked Questions | QuickStyle</title>
                <meta name="description" content="Find answers to common questions about QuickStyle orders, delivery, and returns." />
            </Helmet>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">
                        Frequently Asked Questions
                    </h1>

                    <div className="space-y-4">
                        {activeFAQS.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span className="font-bold text-gray-900">{faq.question}</span>
                                    {openIndex === index ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                                </button>
                                {openIndex === index && (
                                    <div className="p-4 bg-white text-gray-600">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 text-center text-gray-500">
                        <p>Still have questions? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>.</p>
                    </div>
                </div>
            </main>

            {(!role || role === 'customer') && <BottomNav />}
        </div>
    );
};

export default FAQ;
