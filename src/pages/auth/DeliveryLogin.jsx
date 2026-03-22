import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Lock, Mail, Loader, Truck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DeliveryLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            if (user.role === 'delivery') navigate('/delivery');
            else navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    const quickFill = () => {
        setEmail('akhildharavath1999@gmail.com');
        setPassword('Password@123');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50/30 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Abstract decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="absolute top-8 left-8">
                <Link to="/login" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group font-medium">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Customer Login
                </Link>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10">
                <div className="text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-4 text-orange-600 shadow-inner">
                        <Truck className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Delivery Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage your deliveries
                    </p>
                </div>

                <div className="flex justify-center mb-4">
                    <button type="button" onClick={quickFill} className="text-xs text-gray-400 hover:text-orange-600 transition cursor-pointer font-medium">Quick Fill Test Data</button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300"
                                placeholder="Delivery Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-600 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-3.5 pl-11 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all sm:text-sm font-medium shadow-sm hover:border-gray-300"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_8px_16px_rgba(234,88,12,0.2)] hover:shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <Loader className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                "Start Shift"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryLogin;
