import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';
import { Lock, Mail, Loader, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            if (user.role === 'admin') navigate('/admin');
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
        setEmail('mailforakhild@gmail.com');
        setPassword('Password@123');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Dark abstract decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="absolute top-8 left-8">
                <Link to="/login" className="flex items-center text-zinc-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Customer Login
                </Link>
            </div>

            <div className="max-w-md w-full space-y-8 bg-zinc-900/60 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-white/5 relative z-10">
                <div className="text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20">
                        <ShieldAlert className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Restricted access. Authorized personnel only.
                    </p>
                </div>

                <div className="flex justify-center mb-4">
                    <button type="button" onClick={quickFill} className="text-xs text-white/40 hover:text-white/80 transition cursor-pointer">Quick Fill Test Data</button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                                <Mail className="h-5 w-5" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="appearance-none block w-full px-3 py-3.5 pl-11 bg-zinc-950/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                placeholder="Admin Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-blue-400 transition-colors">
                                <Lock className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-3.5 pl-11 bg-zinc-950/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
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
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
                        >
                            {isLoading ? (
                                <Loader className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                "Authenticate"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
