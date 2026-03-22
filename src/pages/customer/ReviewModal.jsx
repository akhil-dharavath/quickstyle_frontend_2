import React, { useState } from 'react';
import ReactStars from 'react-rating-stars-component';
import { X, Camera, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const ReviewModal = ({ isOpen, onClose, onSubmit, productName }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please provide a rating');
            return;
        }
        onSubmit({ rating, comment, images });
        onClose();
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        e.target.value = '';
        if (!files || files.length === 0) return;

        // Validate files
        const validFiles = [];
        for (const file of files) {
          if (!file.type.startsWith('image/')) {
            toast.error(`'${file.name}' is not a valid image file.`);
            continue;
          }
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`'${file.name}' exceeds the 5MB limit.`);
            continue;
          }
          validFiles.push(file);
        }
        
        if (validFiles.length === 0) return;

        setIsUploading(true);
        try {
            let uploadedUrls = [];
            if (validFiles.length === 1) {
                const response = await apiService.uploadImage(validFiles[0]);
                uploadedUrls = [response.data.url];
            } else {
                const response = await apiService.uploadMultipleImages(validFiles);
                uploadedUrls = response.data.urls.map(u => u.url);
            }
            
            setImages(prev => [...prev, ...uploadedUrls]);
            toast.success(validFiles.length === 1 ? 'Image uploaded!' : `${uploadedUrls.length} images uploaded!`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Image upload failed. Please try again.';
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Write a Review</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Rate {productName || 'Product'}
                        </p>
                        <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <ReactStars
                                count={5}
                                onChange={setRating}
                                size={40}
                                activeColor="#ffd700"
                                isHalf={true}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like or dislike?"
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Add Photos
                        </label>
                        <div className="flex items-center gap-4">
                            <label className={`flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl transition-all ${isUploading ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}`}>
                                {isUploading ? (
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                ) : (
                                    <>
                                        <Camera className="h-6 w-6 text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">Add</span>
                                    </>
                                )}
                                <input type="file" multiple accept="image/*" disabled={isUploading} onChange={handleImageUpload} className="hidden" />
                            </label>
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <img src={img} alt="Upload" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#2a2a2a] transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? 'Uploading Please Wait...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
