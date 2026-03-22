import React from 'react';
import BottomNav from '../../components/layout/BottomNav';
import { Helmet } from 'react-helmet-async';

const ReturnPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            <Helmet>
                <title>Return Policy | QuickStyle</title>
                <meta name="description" content="Read the QuickStyle Return and Refund Policy. Learn how to return items and get refunds." />
            </Helmet>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 md:pt-32">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">Return & Refund Policy</h1>

                    <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                        <p>At QuickStyle, we strive to ensure you are satisfied with your purchase. If you are not entirely happy, we're here to help.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Eligibility for Returns</h2>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You have 7 calendar days to return an item from the date you received it.</li>
                            <li>To be eligible for a return, your item must be unused and in the same condition that you received it.</li>
                            <li>Your item must be in the original packaging, with all tags intact.</li>
                            <li>Your item needs to have the receipt or proof of purchase.</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Non-returnable Items</h2>
                        <p>Certain items cannot be returned, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Innerwear</li>
                            <li>Customized apparel</li>
                            <li>Clearance items</li>
                        </ul>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Refunds & Replacements</h2>
                        <p>No refunds, only replacements within 48 hours for damaged items. Once we receive your item, we will inspect it and notify you that we have received your returned item.</p>
                        <p>If your replacement is approved, we will initiate a replacement order or provide store credit.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Shipping for Returns</h2>
                        <p>Our delivery partners will pick up the return item from your delivery address. A nominal return pickup fee may be deducted from your refund amount, depending on the reason for return.</p>

                        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h2>
                        <p>If you have any questions on how to return your item to us, please contact us at returns@quickstyle.com.</p>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default ReturnPolicy;
