import React from 'react';
import { useSelector } from 'react-redux';
import BottomNav from '../../components/layout/BottomNav';
import { Helmet } from 'react-helmet-async';

const Policies = () => {
    const { user } = useSelector(state => state.auth);
    const role = user?.role || 'customer';

    const renderCustomerPolicies = () => (
        <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">Privacy Policy & Terms of Service</h1>
            <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms of Service</h2>
                    <p className="mb-4">Last updated: October 2023</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Acceptance of Terms</h3>
                    <p>By accessing and using the QuickStyle application, you accept and agree to be bound by the terms and provision of this agreement.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Description of Service</h3>
                    <p>QuickStyle provides a platform that connects users with local fashion boutiques for the purchase and hyperlocal delivery of clothing and accessories.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. User Conduct</h3>
                    <p>You agree to use our services only for lawful purposes. You must not use our platform to conduct any fraudulent activity or distribute any harmful material.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Purchasing, Delivery, and Replacements</h3>
                    <p>All purchases made through QuickStyle are subject to product availability. Delivery times are estimates and may vary based on traffic, weather, and distance from the boutique.</p>
                    <p className="mt-2 font-bold text-gray-800">Replacement Policy: We do not offer returns or refunds. You may request a replacement for delivered items a maximum of 2 times per product. Exceptions apply to inherently non-replaceable items as dictated by hygiene or seller policies.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pt-8 border-t">Privacy Policy</h2>
                    <p className="mb-4">Last updated: October 2023</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Information We Collect</h3>
                    <p>We collect information you provide directly to us when you create an account, update your profile, place an order, or contact us for support. This includes your name, email address, phone number, delivery address, and payment information.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. How We Use Your Information</h3>
                    <p>We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Process and fulfill your orders, including hyperlocal delivery routing.</li>
                        <li>Communicate with you about your account, orders, and promotional offers.</li>
                        <li>Improve our services, app functionality, and user experience.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Sharing of Information</h3>
                    <p>We share your delivery address and contact number with our delivery partners strictly for the purpose of fulfilling your order. We do not sell your personal data to third parties.</p>

                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">4. Data Security & Contact</h3>
                    <p>We implement appropriate technical measures to protect your personal information. If you have questions, please contact privacy@quickstyle.com.</p>
                </section>
            </div>
        </>
    );

    const renderSellerPolicies = () => (
        <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">Seller Policies & Guidelines</h1>
            <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Seller Agreement</h2>
                    <p className="mb-4">Last updated: October 2023</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Listing & Quality</h3>
                    <p>Sellers are responsible for ensuring that all products listed on QuickStyle are genuine, accurately described, and in good condition. Misrepresentation of products may lead to account suspension.</p>
                </section>
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pt-8 border-t">Commission & Payout Policy</h2>
                    <p>QuickStyle charges a standard commission fee of 15% on each successful sale. Payouts are scheduled every 7 days straight to your registered bank account via Razorpay Route.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pt-8 border-t">Order Fulfillment Requirements</h2>
                    <p>Orders must be packed and ready for pickup within 30 minutes of receiving the order notification to maintain our hyperlocal delivery promise.</p>
                </section>
            </div>
        </>
    );

    const renderDeliveryPolicies = () => (
        <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">Delivery Partner Guidelines</h1>
            <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Partner Terms</h2>
                    <p className="mb-4">Last updated: October 2023</p>
                    <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Responsibilities</h3>
                    <p>Partners must ensure timely and safe delivery of all orders. Orders must be picked up within 15 minutes of acceptance and delivered within the estimated time.</p>
                </section>
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pt-8 border-t">Safety Guidelines</h2>
                    <p>Partners must obey all local traffic laws and maintain their vehicles in good condition. Safety is our top priority. Contact support immediately in case of an emergency.</p>
                </section>
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 pt-8 border-t">Payouts Schedule</h2>
                    <p>Delivery partners are paid per successful delivery based on the distance algorithm. Payouts securely processed to your bank account weekly.</p>
                </section>
            </div>
        </>
    );

    const renderAdminPolicies = () => (
        <>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 border-b pb-6">Admin Platform Rules</h1>
            <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Governance</h2>
                    <p className="mb-4">Internal use only.</p>
                    <p>Administrators are responsible for monitoring platform activity, verifying sellers, and ensuring compliance across the network.</p>
                </section>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
            <Helmet>
                <title>Policies & Guidelines | QuickStyle</title>
                <meta name="description" content="Read QuickStyle's policies and guidelines for your role." />
            </Helmet>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
                    {role === 'seller' && renderSellerPolicies()}
                    {role === 'delivery' && renderDeliveryPolicies()}
                    {role === 'admin' && renderAdminPolicies()}
                    {(!role || role === 'customer') && renderCustomerPolicies()}
                </div>
            </main>

            {(!role || role === 'customer') && <BottomNav />}
        </div>
    );
};

export default Policies;
