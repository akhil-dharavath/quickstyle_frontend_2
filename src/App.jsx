import { Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { ToastContainer, Slide } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { initTheme } from './redux/slices/uiSlice';

import PrivateRoute from './components/common/PrivateRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';
import MainLayout from './components/layout/MainLayout';
import AdminSidebar from './components/admin/AdminSidebar';
import SellerSidebar from './components/seller/SellerSidebar';
import DeliverySidebar from './components/delivery/DeliverySidebar';
import ForcePasswordChangeModal from './components/auth/ForcePasswordChangeModal';

const Login = lazy(() => import('./pages/auth/Login'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const SellerLogin = lazy(() => import('./pages/auth/SellerLogin'));
const DeliveryLogin = lazy(() => import('./pages/auth/DeliveryLogin'));
const SetPassword = lazy(() => import('./pages/auth/SetPassword'));
const Home = lazy(() => import('./pages/customer/Home'));
const Cart = lazy(() => import('./pages/customer/Cart'));
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'));
const SearchResults = lazy(() => import('./pages/customer/SearchResults'));
const Wishlist = lazy(() => import('./pages/customer/Wishlist'));
const Profile = lazy(() => import('./pages/customer/Profile'));
const Orders = lazy(() => import('./pages/customer/Orders'));
const Checkout = lazy(() => import('./pages/customer/Checkout'));
const AboutUs = lazy(() => import('./pages/customer/AboutUs'));
const ContactUs = lazy(() => import('./pages/customer/ContactUs'));
const Services = lazy(() => import('./pages/customer/Services'));
const Policies = lazy(() => import('./pages/customer/Policies'));
const FAQ = lazy(() => import('./pages/customer/FAQ'));
const ReturnPolicy = lazy(() => import('./pages/customer/ReturnPolicy'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Sellers = lazy(() => import('./pages/admin/Sellers'));
const Products = lazy(() => import('./pages/admin/Products'));
const Tracking = lazy(() => import('./pages/admin/Tracking'));
const DeliveryPersons = lazy(() => import('./pages/admin/DeliveryPersons'));
const Users = lazy(() => import('./pages/admin/Users'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const DeliveryPickups = lazy(() => import('./pages/delivery/DeliveryPickups'));
const DeliveryActive = lazy(() => import('./pages/delivery/DeliveryActive'));
const DeliveryHistory = lazy(() => import('./pages/delivery/DeliveryHistory'));
const DeliveryProfile = lazy(() => import('./pages/delivery/DeliveryProfile'));
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'));
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'));
const SellerProfile = lazy(() => import('./pages/seller/SellerProfile'));
const SellerShop = lazy(() => import('./pages/seller/SellerShop'));

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);
function App() {
  const dispatch = useDispatch();
  
  React.useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  return (
    <HelmetProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Slide}
        />
        <ForcePasswordChangeModal />
        <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/seller/login" element={<SellerLogin />} />
                <Route path="/delivery/login" element={<DeliveryLogin />} />
                <Route path="/set-password" element={<SetPassword />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<PrivateRoute roles={['admin']} />}>
                <Route path="/admin" element={<DashboardLayout Sidebar={AdminSidebar} />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<Users />} />
                  <Route path="sellers" element={<Sellers />} />
                  <Route path="delivery-persons" element={<DeliveryPersons />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="tracking" element={<Tracking />} />
                </Route>
              </Route>

              {/* Delivery Person Routes */}
              <Route element={<PrivateRoute roles={['delivery']} />}>
                <Route path="/delivery" element={<DashboardLayout Sidebar={DeliverySidebar} />}>
                  <Route index element={<DeliveryDashboard />} />
                  <Route path="pickups" element={<DeliveryPickups />} />
                  <Route path="active" element={<DeliveryActive />} />
                  <Route path="history" element={<DeliveryHistory />} />
                  <Route path="profile" element={<DeliveryProfile />} />
                </Route>
              </Route>

              {/* Seller Routes */}
              <Route element={<PrivateRoute roles={['seller']} />}>
                <Route path="/seller" element={<DashboardLayout Sidebar={SellerSidebar} />}>
                  <Route index element={<SellerDashboard />} />
                  <Route path="products" element={<SellerProducts />} />
                  <Route path="orders" element={<SellerOrders />} />
                  <Route path="profile" element={<SellerProfile />} />
                  <Route path="shop" element={<SellerShop />} />
                </Route>
              </Route>

              {/* Customer Routes */}
              {/* Customer Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<AboutUs />} />
                <Route path="contact" element={<ContactUs />} />
                <Route path="services" element={<Services />} />
                <Route path="policies" element={<Policies />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="returns" element={<ReturnPolicy />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="search" element={<SearchResults />} />
                <Route path="cart" element={<Cart />} />

                {/* Protected Customer Routes */}
                <Route element={<PrivateRoute roles={['customer']} />}>
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="orders" element={<Orders />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
    </HelmetProvider>
  );
}

export default App;
