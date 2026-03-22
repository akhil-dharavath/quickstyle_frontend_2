import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    isLoading = false,
    disabled = false,
    onClick,
    type = 'button',
    ...props
}) => {

    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hovered:from-blue-500 hovered:to-indigo-500 text-white shadow-lg shadow-blue-900/20 border border-transparent hover:shadow-blue-900/40",
        secondary: "bg-[#27272a] text-gray-200 border border-gray-700 hover:bg-[#3f3f46] hover:border-gray-600 hover:text-white",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        outline: "bg-transparent border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/50"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
        icon: "p-2"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
