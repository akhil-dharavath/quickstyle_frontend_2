import React from 'react';
import ReactStars from 'react-rating-stars-component';
import { ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

const ReviewsList = ({ reviews = [] }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No reviews yet. Be the first to review!
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {reviews.map((review, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                {review.userName ? review.userName[0] : 'U'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{review.userName || 'Anonymous'}</h4>
                                <div className="flex items-center gap-2">
                                    <ReactStars
                                        count={5}
                                        value={review.rating}
                                        size={16}
                                        edit={false}
                                        activeColor="#ffd700"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{review.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {review.comment}
                    </p>

                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {review.images.map((img, i) => (
                                <img key={i} src={img} alt="Review" className="h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            Helpful ({review.helpful || 0})
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ReviewsList;
