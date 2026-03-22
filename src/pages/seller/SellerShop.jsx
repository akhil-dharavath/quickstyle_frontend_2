import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Store, MapPin, Clock, Truck, Plus } from 'lucide-react';
import apiService from '../../services/api';

const SellerShop = () => {
  const { user } = useSelector(state => state.auth);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    lat: '17.44', // Default Hyderabad coordinates
    lng: '78.37',
    address: '',
    deliveryRadiusKm: 10,
    preparationTimeMin: 30,
    isActive: true
  });

  useEffect(() => {
    fetchMyShop();
  }, []);

  const fetchMyShop = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMyShop();
      if (res.data) {
        setShop(res.data);
        setFormData({
          name: res.data.name || '',
          lat: res.data.location?.coordinates?.[1]?.toString() || '17.44',
          lng: res.data.location?.coordinates?.[0]?.toString() || '78.37',
          address: res.data.location?.address || '',
          deliveryRadiusKm: res.data.deliveryRadiusKm || 10,
          preparationTimeMin: res.data.preparationTimeMin || 30,
          isActive: res.data.isActive !== false
        });
      }
    } catch (error) {
       // Ignore 404 because seller might not have created one yet.
       if (error.status !== 404) {
           toast.error('Failed to load shop settings');
       }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
       toast.error('Shop name is required');
       return;
    }
    if (!formData.lat || !formData.lng) {
        toast.error('Coordinates are required for local delivery discovery');
        return;
    }

    try {
      setSaving(true);
      
      const payload = {
          name: formData.name,
          owner: user._id || user.id, // Ensure ownership
          location: {
              type: 'Point',
              coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
              address: formData.address
          },
          deliveryRadiusKm: parseFloat(formData.deliveryRadiusKm),
          preparationTimeMin: parseInt(formData.preparationTimeMin, 10),
          isActive: formData.isActive
      };

      if (shop) {
          // Update existing shop
          const res = await apiService.updateMyShop(payload);
          setShop(res.data);
          toast.success('Shop profile updated successfully');
      } else {
          // Create newly configured shop
          const res = await apiService.createShop(payload);
          setShop(res.data);
          toast.success('Shop Profile successfully established! Customers can now discover your products.');
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to save shop settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Shop Profile
        </h2>
        {shop && !isEditing && (
            <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-medium"
            >
                Edit Details
            </button>
        )}
      </div>

      {!shop && !isEditing ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-8 rounded-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center mb-4">
                <Store className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-blue-900 dark:text-white mb-2">No Shop Configured Yet</h3>
            <p className="text-blue-700 dark:text-blue-200 max-w-lg mx-auto mb-6">
                Your products will not be visible to nearby customers until you establish your Shop Profile and operating coordinates.
            </p>
            <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all font-semibold flex items-center justify-center mx-auto gap-2"
            >
               <Plus className="h-5 w-5" /> Let's Setup Your Shop
            </button>
        </div>
      ) : (
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
             {!isEditing ? (
                  <div className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                             <Store className="h-8 w-8" />
                          </div>
                          <div>
                              <div className="flex items-center gap-3">
                                  <h3 className="text-2xl font-bold dark:text-white">{shop.name}</h3>
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${shop.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                      {shop.isActive ? 'Live' : 'Hidden'}
                                  </span>
                              </div>
                              <p className="text-gray-500 flex items-center gap-1 mt-1 text-sm">
                                  <MapPin className="h-4 w-4" /> {shop.location?.address || 'No visual address'}
                              </p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                              <MapPin className="h-6 w-6 text-indigo-500 mt-1" />
                              <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">Geo-Coordinates</p>
                                  <p className="text-sm text-gray-500 mt-1">Lat: {shop.location?.coordinates[1]}</p>
                                  <p className="text-sm text-gray-500">Lng: {shop.location?.coordinates[0]}</p>
                              </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                              <Truck className="h-6 w-6 text-green-500 mt-1" />
                              <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">Delivery Reach</p>
                                  <p className="text-sm text-gray-500 mt-1">{shop.deliveryRadiusKm} km radius from location.</p>
                                  <p className="text-xs text-gray-400 mt-1">Customers within this radius can order your items.</p>
                              </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-4">
                              <Clock className="h-6 w-6 text-orange-500 mt-1" />
                              <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">Preparation Time</p>
                                  <p className="text-sm text-gray-500 mt-1">{shop.preparationTimeMin} Minutes</p>
                              </div>
                          </div>
                      </div>
                  </div>
             ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Shop Name *</label>
                        <input
                            required
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            placeholder="e.g. Urban Style Boutique"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Physical Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            placeholder="Full formatted address for reference"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                        <div className="md:col-span-2">
                             <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1 flex items-center gap-1"><MapPin className="w-4 h-4"/> Geolocation Coordinates *</h4>
                             <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">Required for customers to discover you within their radius search.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">Latitude</label>
                            <input
                                required
                                type="text"
                                name="lat"
                                value={formData.lat}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-indigo-500 text-sm dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-indigo-800 dark:text-indigo-300 mb-1">Longitude</label>
                            <input
                                required
                                type="text"
                                name="lng"
                                value={formData.lng}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-lg focus:ring-indigo-500 text-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Delivery Radius (km) *</label>
                            <input
                                required
                                type="number"
                                name="deliveryRadiusKm"
                                min="1"
                                max="100"
                                value={formData.deliveryRadiusKm}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Prep Time (minutes) *</label>
                            <input
                                required
                                type="number"
                                name="preparationTimeMin"
                                min="1"
                                value={formData.preparationTimeMin}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                            Shop is active and currently accepting orders
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {shop && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    // Reset form data to current shop state
                                    setFormData({
                                        name: shop.name || '',
                                        lat: shop.location?.coordinates?.[1]?.toString() || '17.44',
                                        lng: shop.location?.coordinates?.[0]?.toString() || '78.37',
                                        address: shop.location?.address || '',
                                        deliveryRadiusKm: shop.deliveryRadiusKm || 10,
                                        preparationTimeMin: shop.preparationTimeMin || 30,
                                        isActive: shop.isActive !== false
                                    });
                                }}
                                className="px-5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-lg"
                        >
                            {saving ? 'Saving...' : shop ? 'Update Shop' : 'Launch Shop'}
                        </button>
                    </div>
                </form>
             )}
          </div>
      )}
    </div>
  );
};

export default SellerShop;
