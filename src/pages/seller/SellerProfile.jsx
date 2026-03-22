import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, Settings, LogOut } from 'lucide-react';
import { updateProfile, requestEmailOtp, verifyEmailOtp, requestPhoneOtp, verifyPhoneOtp } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const SellerProfile = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', contactNumber: '', email: '' });

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

    // OTP Modal State
    const [otpModal, setOtpModal] = useState({
        isOpen: false,
        type: '', // 'email' or 'phone'
        newValue: '',
        otp: '',
        isLoading: false
    });

    const handleProfileSave = async () => {
        if (editForm.name !== user?.name) {
            dispatch(updateProfile({ name: editForm.name }));
            toast.success('Name updated successfully!');
        }

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
                setEditForm({ ...editForm, email: user?.email });
            }
        } else if (phoneChanged) {
            try {
                await dispatch(requestPhoneOtp({ newPhone: editForm.contactNumber })).unwrap();
                setOtpModal({ isOpen: true, type: 'phone', newValue: editForm.contactNumber, otp: '', isLoading: false });
                toast.success(`OTP requested for ${editForm.contactNumber}`);
            } catch (err) {
                toast.error(err || 'Failed to request OTP for new phone');
                setEditForm({ ...editForm, contactNumber: user?.contactNumber });
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
            setIsEditing(false);
        } catch (error) {
            toast.error(error || 'Invalid or Expired OTP');
            setOtpModal({ ...otpModal, isLoading: false });
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Seller Profile</h2>

            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <User className="h-6 w-6 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                    </div>
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
                        className="text-secondary text-sm font-medium hover:underline"
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
                                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-secondary focus:border-secondary"
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
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-secondary focus:border-secondary"
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
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-secondary focus:border-secondary"
                                />
                                <p className="text-xs text-orange-500 mt-1">Changing phone number requires OTP verification.</p>
                            </div>
                        ) : (
                            <p className="font-medium text-gray-900 dark:text-white mt-1">{user?.contactNumber ? `+91 ${user.contactNumber}` : 'Not set'}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm text-gray-500 dark:text-gray-400">Status</label>
                        <p className="font-medium mt-1">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Active Seller
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Password Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Settings className="h-6 w-6 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3>
                    </div>
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
                        className="text-secondary text-sm font-medium hover:underline"
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
                                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-secondary focus:border-secondary"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Confirm Password</label>
                            <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-secondary focus:border-secondary"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Update your password to keep your account secure.</p>
                )}
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
                            className="w-full text-center tracking-[0.5em] text-2xl font-bold px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:border-secondary mb-6"
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
                                className="flex-1 py-2 bg-secondary text-white text-sm font-bold rounded-lg hover:bg-[#ff1493] transition-colors disabled:opacity-50"
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

export default SellerProfile;
