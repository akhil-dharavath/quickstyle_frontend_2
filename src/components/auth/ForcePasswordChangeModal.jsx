import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

const ForcePasswordChangeModal = () => {
    const dispatch = useDispatch();
    const { user, isLoading } = useSelector(state => state.auth);

    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

    if (!user || !user.requiresPasswordChange) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordPattern.test(passwordForm.newPassword)) {
            toast.error('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.');
            return;
        }

        // Dispatch update
        dispatch(updateUserProfile({ password: passwordForm.newPassword }))
            .unwrap()
            .then(() => {
                toast.success('Password updated securely. Welcome!');
            })
            .catch((err) => {
                // Error is handled in slice toast usually or here.
            });
    };

    return (
        <div className="fixed inset-0 z-[999] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
                {/* Header */}
                <div className="bg-primary px-6 py-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading">Security First</h2>
                    <p className="text-primary-foreground/80 text-sm mt-2">
                        For security reasons, you must change your auto-generated password before accessing your account.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                            <input
                                type="password"
                                required
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                placeholder="Enter a strong password"
                            />
                            <p className="text-xs text-gray-500 mt-2">Must be at least 8 chars long with 1 uppercase, 1 lowercase, 1 number, and 1 special char.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white"
                                placeholder="Confirm your new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide transition-all shadow-lg ${isLoading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-[#2a2a2a] hover:-translate-y-1 hover:shadow-xl'
                                } mt-6`}
                        >
                            {isLoading ? 'Updating...' : 'Update Password & Access Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordChangeModal;
