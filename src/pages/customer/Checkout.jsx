import { Helmet } from 'react-helmet-async';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Truck, Check, Plus, MapPin, Navigation, Pencil, Trash2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAddress, removeAddress, setSelectedAddress, updateAddress,
} from "../../redux/slices/addressSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../redux/slices/cartSlice";
import { createNewOrder } from "../../redux/slices/orderSlice";
import { getCurrentLocationAddress } from "../../utils/geolocation";
import apiService from "../../services/api";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addresses, selectedAddressId } = useSelector((state) => state.address);
  const { items, total, discount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const orderPlacedRef = React.useRef(false);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [items, navigate]);

  const [newAddress, setNewAddress] = useState({
    name: "", flatNo: "", apartment: "", address: "",
    landmark: "", city: "", state: "", pincode: "", phone: "",
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editAddressData, setEditAddressData] = useState(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const handleNextStep = (nextStep) => {
    if (step === 1 && !selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    if (step === 2 && !paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleUseCurrentLocation = async (setter) => {
    setIsLocating(true);
    try {
      const loc = await getCurrentLocationAddress();
      setter((prev) => ({
        ...prev,
        address: loc.address || prev.address,
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        pincode: loc.pincode || prev.pincode,
        lat: loc.lat,
        lng: loc.lng,
      }));
      toast.success("Location fetched successfully!");
    } catch (err) {
      toast.error(err.message || "Unable to retrieve your location");
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.name || !newAddress.address || !newAddress.phone || !newAddress.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }
    dispatch(addAddress(newAddress));
    setNewAddress({ name: "", flatNo: "", apartment: "", address: "", landmark: "", city: "", state: "", pincode: "", phone: "" });
    setShowAddressForm(false);
    toast.success("Address added successfully!");
  };

  // FIX: DELIVERY_FEE = 40 to match backend orderController.js
  // Previously was 0 — causing Razorpay to charge the wrong amount
  const DELIVERY_FEE = 40;
  const GST = Math.round(total * 0.05);
  const finalTotal = total + GST - discount + DELIVERY_FEE;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    const selectedAddr = addresses.find((a) => (a._id || a.id) === selectedAddressId);

    // FIX: shopId may be a populated object from MongoDB — extract _id string
    const rawShopId = items?.[0]?.shopId ?? items?.[0]?.shop ?? null;
    const shopId = rawShopId?._id || rawShopId || null;

    if (!shopId) {
      toast.error("Cannot identify the seller for this order. Please re-add items from the product page.");
      setIsProcessing(false);
      return;
    }

    // FIX: Warn if address has no geocoordinates (previously silently used Hyderabad as default)
    if (selectedAddr && (selectedAddr.lat == null || selectedAddr.lng == null)) {
      console.warn('Address missing lat/lng — delivery ETA may be inaccurate');
    }

    const orderPayload = {
      shopId,
      customerId: user?._id || user?.id,
      items: items.map((i) => ({
        productId: i._id || i.id,
        quantity: i.quantity,
        price: i.price,
        name: i.name,
        image: i.image || i.images?.[0],
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
      })),
      // NOTE: backend recalculates totalAmount from DB prices for security.
      totalAmount: finalTotal,
      // FIX: Send couponCode to backend for server-side validation and discount application
      couponCode: coupon || undefined,
      deliveryAddress: selectedAddr
        ? { ...selectedAddr, lat: selectedAddr.lat ?? null, lng: selectedAddr.lng ?? null }
        : null,
      userLocation: selectedAddr && selectedAddr.lat != null && selectedAddr.lng != null
        ? { lat: selectedAddr.lat, lng: selectedAddr.lng }
        : null,
      paymentMethod: paymentMethod === "Cash on Delivery" ? "COD" : "Online",
      deliveryInstructions,
      deliveryDistanceKm: 5,
      etaMinutes: 45,
    };

    try {
      const orderAction = await dispatch(createNewOrder(orderPayload));
      if (createNewOrder.rejected.match(orderAction)) {
        throw new Error(orderAction.payload || orderAction.error.message || "Failed to create order");
      }
      const order = orderAction.payload;

      if (paymentMethod === "Cash on Delivery") {
        orderPlacedRef.current = true;
        dispatch(clearCart());
        toast.success("Order placed successfully!");
        navigate("/orders");
      } else {
        // Razorpay Flow
        try {
          const { data: { key } } = await apiService.getRazorpayKey();
          const { data: paymentOrder } = await apiService.createPaymentOrder({
            amount: finalTotal,
            currency: "INR",
            receipt: order?._id || order?.id,
            orderId: order?._id || order?.id,
          });

          const options = {
            key,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: "QuickStyle",
            description: "Order Payment",
            order_id: paymentOrder.id,
            handler: async function (response) {
              try {
                await apiService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order._id || order.id,
                });
                orderPlacedRef.current = true;
                dispatch(clearCart());
                navigate("/orders");
                toast.success("Payment successful! Order placed.");
              } catch (err) {
                console.error(err);
                toast.error("Payment verification failed. If amount was deducted, a refund will be processed within 5-7 business days.");
              }
            },
            prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.contactNumber || "9999999999",
            },
            theme: { color: "#000000" },
          };

          const rzp1 = new window.Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            toast.error(response.error.description || "Payment failed. Please try again.");
          });
          // FIX: Handle user closing the Razorpay modal without paying
          // Previously the order was left orphaned with no feedback to the user
          rzp1.on("payment.cancelled", function () {
            toast.info("Payment cancelled. Your order is saved — retry payment from the Orders page.");
            navigate("/orders");
          });
          rzp1.open();
        } catch (payErr) {
          console.error(payErr);
          toast.error("Payment initialization failed. Your order is saved, you can retry from Orders page.");
          navigate("/orders");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
  };

  const AddressFormFields = ({ data, onChange, onLocationClick, isLocating }) => (
    <>
      <div className="mb-4">
        <button type="button" onClick={onLocationClick} disabled={isLocating}
          className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
          {isLocating
            ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            : <Navigation className="h-4 w-4" />}
          Use Current Location
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" placeholder="Full Name *" required value={data.name || ""}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors" />
        <input type="tel" placeholder="Phone Number *" required value={data.phone || ""}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input type="text" placeholder="Flat / House No" value={data.flatNo || ""}
          onChange={(e) => onChange({ ...data, flatNo: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600" />
        <input type="text" placeholder="Apartment / Building" value={data.apartment || ""}
          onChange={(e) => onChange({ ...data, apartment: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600" />
      </div>
      <input type="text" placeholder="Street Address *" required value={data.address || ""}
        onChange={(e) => onChange({ ...data, address: e.target.value })}
        className="w-full p-3 mb-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors" />
      <input type="text" placeholder="Landmark (Optional)" value={data.landmark || ""}
        onChange={(e) => onChange({ ...data, landmark: e.target.value })}
        className="w-full p-3 mb-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <input type="text" placeholder="City" value={data.city || ""}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors" />
        <input type="text" placeholder="State" value={data.state || ""}
          onChange={(e) => onChange({ ...data, state: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors" />
        <input type="text" placeholder="Pincode *" required value={data.pincode || ""}
          onChange={(e) => onChange({ ...data, pincode: e.target.value })}
          className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors" />
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-screen">
      <Helmet><title>Checkout | QuickStyle</title></Helmet>
      <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-center text-gray-900 dark:text-white">Checkout</h1>

      {/* Steps Indicator */}
      <div className="flex justify-center mb-4 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex items-center min-w-max px-4">
          {[{ id: 1, label: "Address", icon: Truck }, { id: 2, label: "Payment", icon: CreditCard }, { id: 3, label: "Review", icon: Check }].map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center gap-2 ${step >= s.id ? "text-black dark:text-white" : "text-gray-400"}`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all ${step >= s.id ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "border-gray-300"}`}>
                  <s.icon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{s.label}</span>
              </div>
              {i < 2 && <div className={`w-12 md:w-32 h-0.5 mx-2 md:mx-4 transition-colors ${step > s.id ? "bg-black dark:bg-white" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          {/* STEP 1: Address */}
          {step === 1 && (
            <motion.div key="step1" custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ type: "tween", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Delivery Address</h2>
                <button onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-2 text-primary font-medium hover:underline">
                  <Plus className="h-4 w-4" />
                  {showAddressForm ? "Cancel" : "Add New"}
                </button>
              </div>

              <AnimatePresence>
                {showAddressForm && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleAddAddress}
                    className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30 overflow-hidden">
                    <AddressFormFields data={newAddress} onChange={setNewAddress}
                      onLocationClick={() => handleUseCurrentLocation(setNewAddress)} isLocating={isLocating} />
                    <button type="submit" className="w-full md:w-auto px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90">
                      Save Address
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {addresses.map((addr) => {
                  const isEditing = editingAddressId === (addr._id || addr.id);
                  return (
                    <div key={addr._id || addr.id}
                      className={`p-4 border-2 rounded-xl transition-all ${selectedAddressId === (addr._id || addr.id) ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700/50" : "border-gray-100 dark:border-gray-700 hover:border-gray-300"}`}>
                      {!isEditing ? (
                        <div onClick={() => dispatch(setSelectedAddress(addr._id || addr.id))} className="cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 dark:text-white">{addr.name}</span>
                                <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">{addr.pincode}</span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {addr.flatNo ? addr.flatNo + ", " : ""}
                                {addr.apartment ? addr.apartment + ", " : ""}
                                {addr.address}, {addr.city}, {addr.state}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Phone: {addr.phone}</p>
                            </div>
                            <div className="flex gap-3 items-center">
                              <button onClick={(e) => { e.stopPropagation(); setEditingAddressId(addr._id || addr.id); setEditAddressData({ ...addr }); }}
                                className="text-gray-500 hover:text-blue-600 transition-colors"><Pencil size={16} /></button>
                              <button onClick={(e) => { e.stopPropagation(); dispatch(removeAddress(addr._id || addr.id)); }}
                                className="text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={(e) => { e.preventDefault(); dispatch(updateAddress(editAddressData)); setEditingAddressId(null); toast.success("Address updated!"); }}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30 overflow-hidden">
                          <AddressFormFields data={editAddressData} onChange={setEditAddressData}
                            onLocationClick={() => handleUseCurrentLocation(setEditAddressData)} isLocating={isLocating} />
                          <div className="flex gap-4">
                            <button type="submit" className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-90">Update Address</button>
                            <button type="button" onClick={() => setEditingAddressId(null)}
                              className="px-6 py-2 border border-gray-400 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={() => handleNextStep(2)}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold mt-8 hover:opacity-90 transition-opacity shadow-lg">
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <motion.div key="step2" custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ type: "tween", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-bold font-heading mb-6 text-gray-900 dark:text-white">Payment Method</h2>
              <div className="space-y-4">
                {["Pay Online (Cards, UPI, Netbanking)", "Cash on Delivery"].map((method) => (
                  <div key={method} onClick={() => setPaymentMethod(method)}
                    className={`p-4 border-2 rounded-xl flex flex-col gap-2 cursor-pointer transition-all ${paymentMethod === method ? "border-black dark:border-white bg-gray-50 dark:bg-gray-700/50" : "border-gray-100 dark:border-gray-700 hover:border-gray-300"}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? "border-black dark:border-white" : "border-gray-300"}`}>
                        {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />}
                      </div>
                      <CreditCard className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                      <span className="font-bold text-gray-900 dark:text-white">{method}</span>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4 mt-8">
                  <button onClick={() => handleNextStep(1)}
                    className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Back
                  </button>
                  <button onClick={() => handleNextStep(3)}
                    className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                    Review Order
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <motion.div key="step3" custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{ type: "tween", duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              {!isProcessing ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading mb-2 text-gray-900 dark:text-white">Review Your Order</h2>
                    <p className="text-gray-500 dark:text-gray-400">Double-check your details before placing.</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Items ({items.length})</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{total}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">GST (5%)</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{GST}</span>
                    </div>
                    {/* FIX: Show real delivery fee line item (was showing "Free" or wrong amount) */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{DELIVERY_FEE}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Discount</span>
                        <span className="font-bold text-green-600">-₹{discount}</span>
                      </div>
                    )}
                    <div className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-bold">Total Amount</span>
                      <span className="font-bold text-xl text-gray-900 dark:text-white">₹{finalTotal}</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-600 my-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivering to:</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {addresses.find((a) => (a._id || a.id) === selectedAddressId)?.address},{" "}
                          {addresses.find((a) => (a._id || a.id) === selectedAddressId)?.city}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method:</p>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-3 w-3 text-gray-400" />
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      placeholder="Leave any specific instructions for delivery agent..."
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 outline-none focus:border-black dark:focus:border-white transition-colors h-24 resize-none"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => handleNextStep(2)}
                      className="flex-1 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Back
                    </button>
                    <button onClick={handlePlaceOrder}
                      className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg">
                      Place Order — ₹{finalTotal}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-black dark:border-gray-700 dark:border-t-white rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Booking Order...</h3>
                  <p className="text-gray-500 dark:text-gray-400">Please wait while we secure your styles.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
