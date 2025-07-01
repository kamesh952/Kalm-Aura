import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStoreSettings,
  updateStoreSettings,
  updateStoreLogo,
  updateStoreStatus,
  clearError
} from '../../redux/slices/'; // Adjust import path as needed

const StoreManagement = () => {
  const dispatch = useDispatch();
  const {
    storeSettings,
    loading,
    error,
    isStoreOpen
  } = useSelector(state => state.store);

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    paymentMethods: {
      creditCard: true,
      debitCard: true,
      paypal: true,
      bankTransfer: false,
      cashOnDelivery: true
    },
    shippingSettings: {
      freeShippingThreshold: 50,
      standardShippingCost: 5.99,
      expressShippingCost: 12.99,
      internationalShipping: false
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    dispatch(fetchStoreSettings());
  }, [dispatch]);

  useEffect(() => {
    if (storeSettings) {
      setFormData(prev => ({
        ...prev,
        ...storeSettings
      }));
    }
  }, [storeSettings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStoreToggle = async () => {
    try {
      await dispatch(updateStoreStatus(!isStoreOpen)).unwrap();
    } catch (error) {
      console.error('Failed to update store status:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateStoreSettings(formData)).unwrap();
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        await dispatch(updateStoreLogo(logoFormData)).unwrap();
      }
      alert('Store settings updated successfully!');
    } catch (error) {
      console.error('Failed to update store settings:', error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General Info' },
    { id: 'hours', label: 'Business Hours' },
    { id: 'social', label: 'Social Media' },
    { id: 'payment', label: 'Payments' },
    { id: 'shipping', label: 'Shipping' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Store Management
              </h1>
              <p className="text-gray-600">Manage your store settings and configuration</p>
            </div>
            
            {/* Store Status Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Store Status:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStoreOpen}
                  onChange={handleStoreToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className={`text-sm font-medium ${isStoreOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isStoreOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            {/* General Info Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">General Information</h3>
                
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {(logoPreview || storeSettings?.logo) && (
                      <img
                        src={logoPreview || storeSettings?.logo}
                        alt="Store Logo"
                        className="h-16 w-16 object-cover rounded-lg border"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Email
                    </label>
                    <input
                      type="email"
                      name="storeEmail"
                      value={formData.storeEmail}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Phone
                    </label>
                    <input
                      type="tel"
                      name="storePhone"
                      value={formData.storePhone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Address
                    </label>
                    <textarea
                      name="storeAddress"
                      value={formData.storeAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description
                  </label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Business Hours Tab */}
            {activeTab === 'hours' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
                <div className="space-y-4">
                  {Object.entries(formData.businessHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </span>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => handleBusinessHoursChange(day, 'isOpen', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Open</span>
                      </label>
                      {hours.isOpen && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                          <span className="text-sm text-gray-500">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="socialMedia.facebook"
                      value={formData.socialMedia?.facebook || ''}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/yourstore"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="socialMedia.instagram"
                      value={formData.socialMedia?.instagram || ''}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/yourstore"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="socialMedia.twitter"
                      value={formData.socialMedia?.twitter || ''}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/yourstore"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="socialMedia.linkedin"
                      value={formData.socialMedia?.linkedin || ''}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/company/yourstore"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
                <div className="space-y-4">
                  {Object.entries(formData.paymentMethods).map(([method, enabled]) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        name={`paymentMethods.${method}`}
                        checked={enabled}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 capitalize">
                        {method.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Settings Tab */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Shipping Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Free Shipping Threshold ($)
                    </label>
                    <input
                      type="number"
                      name="shippingSettings.freeShippingThreshold"
                      value={formData.shippingSettings?.freeShippingThreshold || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Shipping Cost ($)
                    </label>
                    <input
                      type="number"
                      name="shippingSettings.standardShippingCost"
                      value={formData.shippingSettings?.standardShippingCost || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Express Shipping Cost ($)
                    </label>
                    <input
                      type="number"
                      name="shippingSettings.expressShippingCost"
                      value={formData.shippingSettings?.expressShippingCost || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="shippingSettings.internationalShipping"
                        checked={formData.shippingSettings?.internationalShipping || false}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        Enable International Shipping
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreManagement;