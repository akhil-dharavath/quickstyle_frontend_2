import React from 'react';
import { motion } from 'framer-motion';

const OrderSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6 mb-4 mt-4 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
                <div className="flex gap-3">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
            </div>

            <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <div className="w-20 h-24 md:w-24 md:h-28 rounded-md bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/5"></div>
            </div>
        </div>
    );
};

export default OrderSkeleton;
