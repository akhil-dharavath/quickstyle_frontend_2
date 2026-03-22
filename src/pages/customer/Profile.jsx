import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Settings, CreditCard, Navigation } from 'lucide-react';
import { addAddress, removeAddress, setSelectedAddress } from '../../redux/slices/addressSlice';
import { updateProfile, logout, requestEmailOtp, verifyEmailOtp, requestPhoneOtp, verifyPhoneOtp } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { getCurrentLocationAddress } from '../../utils/geolocation';

const Profile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { orders } = useSelector(state => state.orders);
    const { addresses, selectedAddressId } = useSelector(state => state.address);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', contactNumber: '', email: '' });

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '', address: '', city: '', state: '', pincode: '', phone: ''
    });

    // OTP Modal State
    const [otpModal, setOtpModal] = useState({
        isOpen: false,
        type: '', // 'email' or 'phone'
        newValue: '',
        otp: '',
        isLoading: false
    });

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        try {
            const loc = await getCurrentLocationAddress();
            setNewAddress(prev => ({
                ...prev,
                address: loc.address || prev.address,
                city: loc.city || prev.city,
                state: loc.state || prev.state,
                pincode: loc.pincode || prev.pincode,
                lat: loc.lat,
                lng: loc.lng,
            }));
            toast.success('Location fetched successfully!');
        } catch (err) {
            toast.error(err.message || 'Unable to retrieve your location');
        } finally {
            setIsLocating(false);
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        dispatch(addAddress(newAddress));
        setNewAddress({ name: '', address: '', city: '', state: '', pincode: '', phone: '' });
        setShowAddressForm(false);
        toast.success('Address added successfully!');
    };

    // Filter orders for current user
    const userId = user?._id || user?.id;
    const myOrders = orders.filter(o =>
        o.userId === userId || o.customerId === userId || o.userId?._id === userId
    );

    const handleProfileSave = async () => {
        // If Name changed, update it directly
        if (editForm.name !== user?.name) {
            dispatch(updateProfile({ name: editForm.name }));
            toast.success('Name updated successfully!');
        }

        // Check if sensitive fields changed requires OTP
        const emailChanged = editForm.email !== user?.email;
        const phoneChanged = editForm.contactNumber !== user?.contactNumber;

        if (emailChanged && phoneChanged) {
            toast.error("Please update email and phone number one at a time.");
            return;
        }

        if (emailChanged) {
            try {
                await dispatch(requestEmailOtp({ newEmail: editForm.email })).unwrap();
                setOtpModal({ isOpen: true, type: 'email', newValue: editForm.email, otp: '', isLoading: false });
                toast.success(`OTP sent to ${editForm.email}`);
            } catch (err) {
                toast.error(err || 'Failed to send OTP to new email');
                setEditForm({ ...editForm, email: user?.email }); // Revert
            }
        } else if (phoneChanged) {
            try {
                await dispatch(requestPhoneOtp({ newPhone: editForm.contactNumber })).unwrap();
                setOtpModal({ isOpen: true, type: 'phone', newValue: editForm.contactNumber, otp: '', isLoading: false });
                toast.success(`OTP requested for ${editForm.contactNumber}`);
            } catch (err) {
                toast.error(err || 'Failed to request OTP for new phone');
                setEditForm({ ...editForm, contactNumber: user?.contactNumber }); // Revert
            }
        }

        if (!emailChanged && !phoneChanged) {
            setIsEditing(false);
        }
    };

    const handleOtpSubmit = async () => {
        setOtpModal({ ...otpModal, isLoading: true });
        try {
            if (otpModal.type === 'email') {
                await dispatch(verifyEmailOtp({ newEmail: otpModal.newValue, otp: otpModal.otp })).unwrap();
                toast.success('Email updated successfully!');
            } else if (otpModal.type === 'phone') {
                await dispatch(verifyPhoneOtp({ newPhone: otpModal.newValue, otp: otpModal.otp })).unwrap();
                toast.success('Phone number updated successfully!');
            }
            setOtpModal({ isOpen: false, type: '', newValue: '', otp: '', isLoading: false });
            setIsEditing(false); // Close edit mode entirely on success
        } catch (error) {
            toast.error(error || 'Invalid or Expired OTP');
            setOtpModal({ ...otpModal, isLoading: false });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            <Helmet>
                <title>My Account | QuickStyle</title>
            </Helmet>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Account</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name || 'User Name'}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email || 'user@example.com'}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {[
                            { label: 'Profile Settings', icon: User, active: true },
                            { label: 'My Orders', icon: Package, link: '/orders' },
                            { label: 'Saved Addresses', icon: MapPin },
                            { label: 'Payment Methods', icon: CreditCard },
                            { label: 'Account Settings', icon: Settings }
                        ].map((item, idx) => (
                            item.link ? (
                                <Link
                                    key={idx}
                                    to={item.link}
                                    className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ) : (
                                <button
                                    key={idx}
                                    className={`w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${item.active ? 'bg-primary/5 text-primary border-l-4 border-primary' : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </button>
                            )
                        ))}
                        <button
                            onClick={() => dispatch(logout())}
                            className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left text-red-600 font-bold"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                            <button
                                onClick={() => {
                                    if (isEditing) {
                                        handleProfileSave();
                                    } else {
                                        setEditForm({
                                            name: user?.name || '',
                                            contactNumber: user?.contactNumber || '',
                                            email: user?.email || ''
                                        });
                                        setIsEditing(true);
                                    }
                                }}
                                className="text-primary text-sm font-medium hover:underline"
                            >
                                {isEditing ? 'Save Changes' : 'Edit'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full mt-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-white mt-1">{user?.name || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Email Address</label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full mt-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs text-orange-500 mt-1">Changing email requires OTP verification.</p>
                                    </div>
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-white mt-1">{user?.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Phone Number</label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="tel"
                                            value={editForm.contactNumber}
                                            onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                                            className="w-full mt-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs text-orange-500 mt-1">Changing phone number requires OTP verification.</p>
                                    </div>
                                ) : (
                                    <p className="font-medium text-gray-900 dark:text-white mt-1">{user?.contactNumber ? `+91 ${user.contactNumber}` : 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Role</label>
                                <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">{user?.role || 'Customer'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Password Management */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
                            <button
                                onClick={() => {
                                    if (isEditingPassword) {
                                        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                            toast.error('Passwords do not match');
                                            return;
                                        }
                                        if (passwordForm.newPassword.length < 8) {
                                            toast.error('Password must be at least 8 characters long');
                                            return;
                                        }
                                        dispatch(updateProfile({ password: passwordForm.newPassword }));
                                        toast.success('Password updated successfully!');
                                        setIsEditingPassword(false);
                                        setPasswordForm({ newPassword: '', confirmPassword: '' });
                                    } else {
                                        setIsEditingPassword(true);
                                    }
                                }}
                                className="text-primary text-sm font-medium hover:underline"
                            >
                                {isEditingPassword ? 'Save Password' : 'Change Password'}
                            </button>
                        </div>
                        {isEditingPassword ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full mt-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full mt-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Update your password to keep your account secure.</p>
                        )}
                    </div>

                    {/* Saved Addresses */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="text-primary text-sm font-medium hover:underline"
                            >
                                {showAddressForm ? 'Cancel' : 'Add New'}
                            </button>
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isLocating}
                                        className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                                    >
                                        {isLocating ? (
                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Navigation className="h-4 w-4" />
                                        )}
                                        Use Current Location
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g., Home)"
                                        required
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        value={newAddress.name}
                                        onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        required
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        value={newAddress.phone}
                                        onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Full Address"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    value={newAddress.address}
                                    onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        required
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        value={newAddress.city}
                                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        required
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        value={newAddress.state}
                                        onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        required
                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        value={newAddress.pincode}
                                        onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#2a2a2a]">
                                    Save Address
                                </button>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map(addr => (
                                <div key={(addr._id || addr.id)} className={`border rounded-lg p-4 relative ${(addr._id || addr.id) === selectedAddressId ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded font-medium">{addr.name}</span>
                                            {(addr._id || addr.id) === selectedAddressId && <span className="text-xs text-primary font-bold">Default</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            {(addr._id || addr.id) !== selectedAddressId && (
                                                <button
                                                    onClick={() => dispatch(setSelectedAddress((addr._id || addr.id)))}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button
                                                onClick={() => dispatch(removeAddress((addr._id || addr.id)))}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <LogOut className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {addr.address}<br />
                                        {addr.city}, {addr.state} - {addr.pincode}<br />
                                        Phone: {addr.phone}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                            <Link to="/orders" className="text-primary text-sm font-medium hover:underline">View All</Link>
                        </div>
                        {myOrders.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No recent orders found.</p>
                        ) : (
                            <div className="space-y-4">
                                {myOrders.slice(0, 2).map(order => (
                                    <div key={(order._id || order.id)} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Order #{(order._id || order.id)}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Placed on {order.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900 dark:text-white">₹{order.total}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* OTP Modal overlay */}
            {otpModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm shadow-2xl transform transition-all">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Verify Update</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Enter the 6-digit code sent to <span className="font-bold text-gray-900 dark:text-gray-100">{otpModal.newValue}</span>
                        </p>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="------"
                            className="w-full text-center tracking-[0.5em] text-2xl font-bold px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary mb-6"
                            value={otpModal.otp}
                            onChange={(e) => setOtpModal({ ...otpModal, otp: e.target.value.replace(/\D/g, '') })}
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setOtpModal({ isOpen: false, type: '', newValue: '', otp: '', isLoading: false });
                                    setEditForm({ name: user?.name, contactNumber: user?.contactNumber, email: user?.email });
                                    setIsEditing(false); // abort entirely
                                }}
                                className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleOtpSubmit}
                                disabled={otpModal.otp.length !== 6 || otpModal.isLoading}
                                className="flex-1 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {otpModal.isLoading ? 'Verifying...' : 'Verify'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
