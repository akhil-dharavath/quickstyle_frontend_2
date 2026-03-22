import React from 'react';

const Skeleton = ({ className, variant = "text", ...props }) => {
    // Variants: text, circular, rectangular
    const baseClasses = "bg-gray-200 dark:bg-gray-700 animate-pulse rounded";

    let variantClasses = "";
    switch (variant) {
        case "circular":
            variantClasses = "rounded-full";
            break;
        case "rectangular":
            variantClasses = "rounded-lg";
            break;
        default:
            variantClasses = "rounded";
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
