import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createProduct } from "../../redux/slices/adminProductSlice";
import { uploadImage, resetUpload } from "../../redux/slices/uploadslice";

const CreateProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: productLoading, error: productError } = useSelector((state) => state.adminProducts);
  const { loading: uploadLoading, error: uploadError, imageUrl, success: uploadSuccess } = useSelector((state) => state.upload);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    countInStock: "",
    featured: false,
    sku: "",
    collections: []
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [errors, setErrors] = useState({});
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
    "Beauty",
    "Automotive",
    "Food",
    "Other"
  ];

  const availableCollections = [
    "New Arrivals",
    "Best Sellers",
    "Sale",
    "Featured",
    "Seasonal"
  ];

  // Handle successful image uploads
  useEffect(() => {
    if (uploadSuccess && imageUrl) {
      setUploadedImageUrls(prev => [...prev, imageUrl]);
      dispatch(resetUpload());
      
      // Move to next image if there are more to upload
      if (currentUploadIndex < images.length - 1) {
        setCurrentUploadIndex(currentUploadIndex + 1);
      }
    }
  }, [uploadSuccess, imageUrl, dispatch, currentUploadIndex, images.length]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCollectionChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          collections: [...prev.collections, value]
        };
      } else {
        return {
          ...prev,
          collections: prev.collections.filter(item => item !== value)
        };
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push({
          file,
          url: e.target.result
        });

        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // Also remove from uploaded URLs if exists
    if (index < uploadedImageUrls.length) {
      setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.countInStock || parseInt(formData.countInStock) < 0) {
      newErrors.countInStock = "Stock count must be 0 or greater";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (formData.collections.length === 0) {
      newErrors.collections = "At least one collection is required";
    }

    if (images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadAllImages = async () => {
    if (images.length === 0) return [];
    
    // Reset uploaded URLs before starting new uploads
    setUploadedImageUrls([]);
    
    // Start with first image
    setCurrentUploadIndex(0);
    
    // Return a promise that resolves when all images are uploaded
    return new Promise((resolve) => {
      const checkCompletion = () => {
        if (uploadedImageUrls.length === images.length) {
          resolve(uploadedImageUrls);
        } else {
          setTimeout(checkCompletion, 100);
        }
      };
      checkCompletion();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // First upload all images
      const imageUrls = await uploadAllImages();
      
      // Then create the product with the image URLs
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock),
        images: imageUrls
      };

      await dispatch(createProduct(productData)).unwrap();
      
      alert("Product created successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  // Trigger upload when currentUploadIndex changes
  useEffect(() => {
    if (images.length > 0 && currentUploadIndex < images.length) {
      dispatch(uploadImage(images[currentUploadIndex]));
    }
  }, [currentUploadIndex, dispatch, images]);

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      countInStock: "",
      featured: false,
      sku: "",
      collections: []
    });
    setImages([]);
    setImagePreviews([]);
    setUploadedImageUrls([]);
    setErrors({});
    dispatch(resetUpload());
  };

  const isLoading = productLoading || uploadLoading || (images.length > 0 && uploadedImageUrls.length < images.length);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Create New Product</h2>
        <Link
          to="/admin/products"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Back to Products
        </Link>
      </div>

      {(productError || uploadError) && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {productError || uploadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          {/* Stock Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Count *
            </label>
            <input
              type="number"
              name="countInStock"
              value={formData.countInStock}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.countInStock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.countInStock && <p className="mt-1 text-sm text-red-600">{errors.countInStock}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.brand ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter brand name"
            />
            {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU (Stock Keeping Unit) *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sku ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product SKU"
            />
            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          </div>

          {/* Featured Checkbox */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Featured Product
              </span>
            </label>
          </div>

          {/* Collections */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collections *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableCollections.map(collection => (
                <label key={collection} className="flex items-center">
                  <input
                    type="checkbox"
                    name="collections"
                    value={collection}
                    checked={formData.collections.includes(collection)}
                    onChange={handleCollectionChange}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{collection}</span>
                </label>
              ))}
            </div>
            {errors.collections && <p className="mt-1 text-sm text-red-600">{errors.collections}</p>}
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Max 5 images, 5MB each) *
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
            
            {/* Upload Progress */}
            {isLoading && images.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Uploading {uploadedImageUrls.length + 1} of {images.length} images...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${((uploadedImageUrls.length + (uploadSuccess ? 1 : 0)) / images.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      {index < uploadedImageUrls.length ? (
                        <span className="text-white text-xs bg-green-500 rounded-full px-2 py-1">
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-white text-xs bg-blue-500 rounded-full px-2 py-1">
                          {index === currentUploadIndex ? 'Uploading...' : 'Pending'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t md:col-span-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              disabled={isLoading}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;