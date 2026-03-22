import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, registerUser, googleLogin } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Lock, Mail, Loader, User, ArrowRight, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import apiService from '../../services/api';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading, error } = useSelector((state) => state.auth);

    // If path is /signup, default to signup tab
    useEffect(() => {
        if (location.pathname === '/signup') {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }, [location.pathname]);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'seller') navigate('/seller');
            else if (user.role === 'delivery') navigate('/delivery');
            else navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLogin) {
            dispatch(loginUser({ email, password }));
        } else {
            if (!otpSent) {
                // Send OTP mode
                if (!email) {
                    toast.error("Please enter email to send OTP");
                    return;
                }
                try {
                    setIsSendingOtp(true);
                    await apiService.sendRegistrationOtp(email);
                    setOtpSent(true);
                    toast.success("OTP sent to your email!");
                } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to send OTP");
                } finally {
                    setIsSendingOtp(false);
                }
            } else {
                // Register mode
                if (password !== confirmPassword) {
                    toast.error("Passwords do not match");
                    return;
                }
                if (!otp) {
                    toast.error("Please enter the OTP");
                    return;
                }
                dispatch(registerUser({ name, email, password, otp }));
            }
        }
    };

    const handleGoogleSuccess = (credentialResponse) => {
        dispatch(googleLogin(credentialResponse.credential));
    };

    const handleGoogleError = () => {
        toast.error("Google Sign-In failed. Please try again.");
    };

    // Quick fill handlers for demo
    const quickFill = () => {
        setEmail('tempdemo33@gmail.com');
        setPassword('Password@123');
        setIsLogin(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none bg-white/80" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10 sm:p-8 lg:p-10">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {isLogin ? "Sign in to your QuickStyle account" : "Join the fashion revolution"}
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(true); navigate('/login'); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsLogin(false); navigate('/signup'); }}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sign Up
                    </button>
                </div>

                {isLogin && (
                    <div className="flex justify-center mb-6">
                        <button type="button" onClick={quickFill} className="text-xs text-gray-400 hover:text-primary transition cursor-pointer font-medium">Quick Fill Test Data</button>
                    </div>
                )}

                <div className="flex justify-center mb-6 w-full">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        theme="outline"
                        size="large"
                        width="100%"
                        text={isLogin ? "signin_with" : "signup_with"}
                    />
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-400">Or continue with email</span>
                    </div>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {!isLogin && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                disabled={!isLogin && otpSent}
                                className={`appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300 ${!isLogin && otpSent ? 'bg-gray-100 opacity-70 cursor-not-allowed' : ''}`}
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {!isLogin && otpSent && (
                            <div className="relative group animate-fade-in">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <input
                                    name="otp"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                        )}

                        {(isLogin || (!isLogin && otpSent)) && (
                            <>
                                <div className="relative group animate-fade-in">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {!isLogin && (
                                    <div className="relative group animate-fade-in">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                            <Lock className="h-5 w-5" />
                                        </div>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            className="appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300"
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || isSendingOtp}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {isLoading || isSendingOtp ? (
                                <Loader className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                isLogin ? "Sign In" : (otpSent ? "Create Account" : "Send OTP")
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 pt-6 border-t border-gray-100 gap-3">
                    <Link to="/seller/login" className="hover:text-primary transition-colors flex items-center">
                        Seller Login <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                    <Link to="/delivery/login" className="hover:text-primary transition-colors flex items-center">
                        Delivery Login <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                    <Link to="/admin/login" className="hover:text-primary transition-colors flex items-center">
                        Admin Login <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
