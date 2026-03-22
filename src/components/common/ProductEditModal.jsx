import React, { useState } from 'react';
import { X, Plus, ImagePlus, Upload, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addProduct, updateProduct } from '../../redux/slices/productSlice';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const normalizeVariants = (v) => {
  if (!v || !Array.isArray(v)) return [];
  return v.map((x) => ({
    color: x.color || '',
    images: Array.isArray(x.images) ? x.images : x.image ? [x.image] : [],
    sizes: Array.isArray(x.sizes) ? x.sizes : [{ size: 'M', stock: 0 }],
  }));
};

const ProductEditModal = ({ product, onClose, isAdmin = false, sellerId }) => {
  const dispatch = useDispatch();
  const initVariants = normalizeVariants(product?.variants);
  const hasVariants = initVariants.length > 0;
  // Track which image slots are currently uploading: Set of "colorIdx-imgSlot" keys
  const [uploadingSlots, setUploadingSlots] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || 'Men',
    subCategory: product?.subCategory || 'T-Shirts',
    stock: product?.stock || '10',
    rating: product?.rating || '4.5',
    discount: product?.discount || '0',
    deliveryTime: product?.deliveryTime || '2 hours',
    pattern: product?.pattern || 'Solid',
    sleeveLength: product?.sleeveLength || 'Half Sleeve',
    neckType: product?.neckType || 'Round Neck',
    occasion: product?.occasion || 'Casual',
    fit: product?.fit || 'Regular',
    variants: hasVariants ? initVariants : [{ color: '', images: [], sizes: [{ size: 'M', stock: '' }] }],
  });

  const updateVariant = (idx, field, value) => {
    const v = [...formData.variants];
    v[idx] = { ...v[idx], [field]: value };
    setFormData({ ...formData, variants: v });
  };

  const addColorVariant = () => {
    if (formData.variants.some((v) => !v.color?.trim())) {
      toast.error('Fill color for all variants before adding');
      return;
    }
    setFormData({
      ...formData,
      variants: [...formData.variants, { color: '', images: [], sizes: [{ size: 'M', stock: '' }] }],
    });
  };

  const removeColorVariant = (idx) => {
    if (formData.variants.length <= 1) {
      toast.error('At least one color variant is required');
      return;
    }
    const v = formData.variants.filter((_, i) => i !== idx);
    setFormData({ ...formData, variants: v });
  };

  const updateVariantImage = (colorIdx, imgIdx, urlOrBase64) => {
    const v = [...formData.variants];
    v[colorIdx].images = v[colorIdx].images || [];
    v[colorIdx].images[imgIdx] = urlOrBase64;
    setFormData({ ...formData, variants: v });
  };

  const removeVariantImage = (colorIdx, imgIdx) => {
    const v = [...formData.variants];
    v[colorIdx].images = (v[colorIdx].images || []).filter((_, i) => i !== imgIdx);
    setFormData({ ...formData, variants: v });
  };

  const addSizeToVariant = (colorIdx) => {
    const v = [...formData.variants];
    v[colorIdx].sizes = v[colorIdx].sizes || [];
    const used = new Set((v[colorIdx].sizes || []).map((s) => s.size));
    const next = SIZES.find((s) => !used.has(s)) || 'M';
    v[colorIdx].sizes.push({ size: next, stock: '' });
    setFormData({ ...formData, variants: v });
  };

  const updateVariantSize = (colorIdx, sizeIdx, field, value) => {
    const v = [...formData.variants];
    v[colorIdx].sizes[sizeIdx] = { ...v[colorIdx].sizes[sizeIdx], [field]: value };
    setFormData({ ...formData, variants: v });
  };

  const removeVariantSize = (colorIdx, sizeIdx) => {
    const v = [...formData.variants];
    v[colorIdx].sizes = v[colorIdx].sizes.filter((_, i) => i !== sizeIdx);
    if (v[colorIdx].sizes.length === 0) v[colorIdx].sizes = [{ size: 'M', stock: '' }];
    setFormData({ ...formData, variants: v });
  };

  const handleImageUpload = async (e, cIdx) => {
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

    const slotKey = `${cIdx}-uploading`;
    setUploadingSlots((prev) => new Set(prev).add(slotKey));

    try {
      let uploadedUrls = [];
      if (validFiles.length === 1) {
        const response = await apiService.uploadImage(validFiles[0]);
        uploadedUrls = [response.data.url];
      } else {
        const response = await apiService.uploadMultipleImages(validFiles);
        uploadedUrls = response.data.urls.map(u => u.url);
      }

      const v = [...formData.variants];
      v[cIdx].images = [...(v[cIdx].images || []).filter(Boolean), ...uploadedUrls];
      setFormData((prev) => ({ ...prev, variants: v }));
      toast.success(validFiles.length === 1 ? 'Image uploaded!' : `${uploadedUrls.length} images uploaded!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Image upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(slotKey);
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const variants = formData.variants
      .filter((v) => v.color?.trim())
      .map((v) => ({
        color: v.color.trim(),
        images: (v.images || []).filter((u) => u && (typeof u === 'string' ? u.trim() : true)),
        sizes: (v.sizes || [])
          .filter((s) => s.size && (s.stock !== '' && s.stock !== undefined))
          .map((s) => ({ size: s.size, stock: parseInt(s.stock, 10) || 0 })),
      }))
      .filter((v) => v.images.length > 0 && v.sizes.length > 0);

    if (variants.length === 0) {
      toast.error('Add at least one color variant with images and sizes (with stock)');
      return;
    }

    const mainImage = variants[0].images[0] || product?.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b';
    const totalStock = variants.reduce(
      (acc, v) => acc + (v.sizes || []).reduce((a, s) => a + (s.stock || 0), 0),
      0
    );

    const productData = {
      ...formData,
      image: mainImage,
      images: variants.flatMap((v) => v.images),
      price: parseFloat(formData.price),
      stock: totalStock,
      rating: parseFloat(formData.rating),
      discount: parseInt(formData.discount, 10),
      variants,
      sellerId: sellerId,
    };

    setIsSubmitting(true);
    try {
      if (product) {
        // Updating
        await dispatch(updateProduct({ id: (product._id || product.id) || product._id, ...productData, shopId: product.shopId || sellerId })).unwrap();
        toast.success('Product updated successfully!');
      } else {
        // Adding new -> Must resolve the Shop ID first for visibility features
        try {
            const shopRes = await apiService.getMyShop();
            if (!shopRes.data?._id) {
               throw new Error("Shop ID not returned");
            }
            productData.shopId = shopRes.data._id;
        } catch (shopErr) {
            toast.error("You must Configure your Shop Profile before adding products.");
            setIsSubmitting(false);
            return;
        }
        
        await dispatch(addProduct(productData)).unwrap();
        toast.success('Product added successfully!');
      }
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option>Men</option>
                <option>Women</option>
                <option>Kids</option>
                <option>Accessories</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sub Category *</label>
            <input
              type="text"
              placeholder="e.g. T-Shirts, Jeans, Dresses"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              value={formData.subCategory}
              onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
            />
          </div>

          {/* New Attribute Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pattern</label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.pattern}
                onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              >
                <option>Solid</option>
                <option>Checked</option>
                <option>Striped</option>
                <option>Printed</option>
                <option>Self Design</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Sleeve Length</label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.sleeveLength}
                onChange={(e) => setFormData({ ...formData, sleeveLength: e.target.value })}
              >
                <option>Half Sleeve</option>
                <option>Full Sleeve</option>
                <option>Sleeveless</option>
                <option>3/4 Sleeve</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Neck Type</label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.neckType}
                onChange={(e) => setFormData({ ...formData, neckType: e.target.value })}
              >
                <option>Round Neck</option>
                <option>V-Neck</option>
                <option>Polo</option>
                <option>Collar</option>
                <option>Hooded</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Occasion</label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              >
                <option>Casual</option>
                <option>Formal</option>
                <option>Party</option>
                <option>Beach</option>
                <option>Sports</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Fit</label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.fit}
                onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
              >
                <option>Regular</option>
                <option>Slim</option>
                <option>Oversized</option>
                <option>Loose</option>
              </select>
            </div>
          </div>

          {/* Color-wise Variants: Images + Sizes + Stock */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-3">
              Color-wise Variants * (Images, Sizes & Stock per color)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Add photos for each color (multiple angles), and sizes with stock count.
            </p>

            {formData.variants.map((variant, cIdx) => (
              <div
                key={cIdx}
                className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    required
                    placeholder="Color (e.g. Red, Navy Blue)"
                    className="w-40 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium"
                    value={variant.color}
                    onChange={(e) => updateVariant(cIdx, 'color', e.target.value)}
                  />
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColorVariant(cIdx)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ImagePlus className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Photos (upload from computer, multiple angles)</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(variant.images || ['']).filter(Boolean).map((img, imgIdx) => (
                        <div key={imgIdx} className="relative group">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVariantImage(cIdx, imgIdx)}
                            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <label className={`w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${uploadingSlots.has(`${cIdx}-uploading`) ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          disabled={uploadingSlots.has(`${cIdx}-uploading`)}
                          onChange={(e) => handleImageUpload(e, cIdx)}
                        />
                        {uploadingSlots.has(`${cIdx}-uploading`) ? (
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mb-1" />
                            <span className="text-[10px] text-gray-500">Add</span>
                          </>
                        )}
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">JPG, PNG, WebP. Max 5MB recommended.</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">Sizes & Stock</span>
                    <div className="flex flex-wrap gap-2">
                      {(variant.sizes || [{ size: 'M', stock: '' }]).map((s, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          <select
                            className="bg-transparent border-none text-gray-900 dark:text-white"
                            value={s.size}
                            onChange={(e) => updateVariantSize(cIdx, sIdx, 'size', e.target.value)}
                          >
                            {SIZES.map((sz) => (
                              <option key={sz} value={sz}>{sz}</option>
                            ))}
                          </select>
                          <span className="text-gray-500">:</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            className="w-14 px-1 py-0.5 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            value={s.stock}
                            onChange={(e) => updateVariantSize(cIdx, sIdx, 'stock', e.target.value)}
                          />
                          {(variant.sizes?.length || 1) > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariantSize(cIdx, sIdx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addSizeToVariant(cIdx)}
                        className="text-xs text-primary font-medium flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Size
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addColorVariant}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary text-sm font-medium"
            >
              + Add another color variant
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time</label>
              <input
                type="text"
                placeholder="e.g. 2 hours"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingSlots.size > 0 || isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : uploadingSlots.size > 0 ? 'Uploading images...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
