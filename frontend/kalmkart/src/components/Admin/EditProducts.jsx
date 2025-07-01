import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, updateProduct } from "../../redux/slices/adminProductSlice";

const EditProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { currentProduct, loading, error } = useSelector((state) => state.adminProducts);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    gender: "",
    sizes: [],
    colors: [],
    featured: false,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

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

  // Fetch product data on component mount
  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
    }
  }, [dispatch, id]);

  // Populate form when product data is loaded
  useEffect(() => {
    if (currentProduct) {
      setProductData({
        name: currentProduct.name || "",
        description: currentProduct.description || "",
        price: currentProduct.price || 0,
        countInStock: currentProduct.countInStock || 0,
        sku: currentProduct.sku || "",
        category: currentProduct.category || "",
        brand: currentProduct.brand || "",
        gender: currentProduct.gender || "",
        sizes: currentProduct.sizes || [],
        colors: currentProduct.colors || [],
        featured: currentProduct.featured || false,
      });
      setExistingImages(currentProduct.images || []);
    }
  }, [currentProduct]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + newImages.length + existingImages.length > 5) {
      alert("You can only have up to 5 images total");
      return;
    }

    const validFiles = [];
    const previews = [];

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
        previews.push({
          file,
          url: e.target.result,
          name: file.name
        });

        if (previews.length === validFiles.length) {
          setNewImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setNewImages(prev => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "sizes" || name === "colors") {
      setProductData((prev) => ({
        ...prev,
        [name]: value.split(",").map((item) => item.trim()).filter(item => item),
      }));
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!productData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!productData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!productData.price || parseFloat(productData.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!productData.category) {
      newErrors.category = "Category is required";
    }

    if (!productData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (productData.countInStock < 0) {
      newErrors.countInStock = "Stock count must be 0 or greater";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formData = new FormData();
      
      // Append form data
      Object.keys(productData).forEach(key => {
        if (key === 'sizes' || key === 'colors') {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      // Append existing images (keep them)
      formData.append('existingImages', JSON.stringify(existingImages));

      // Append new images
      newImages.forEach(image => {
        formData.append('images', image);
      });

      await dispatch(updateProduct({ id, productData: formData })).unwrap();
      
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product. Please try again.");
    }
  };

  if (loading && !currentProduct) {
    return (
      <div className="max-w-5xl mx-auto p-6 flex justify-center items-center">
        <div className="text-lg">Loading product...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-700">Edit Product</h2>
        <Link
          to="/admin/products"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Back to Products
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={productData.name}
                onChange={handleChange}
                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                value={productData.description}
                onChange={handleChange}
                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Price */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                min={0}
                step="0.01"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Count in Stock */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="countInStock"
                value={productData.countInStock}
                onChange={handleChange}
                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.countInStock ? 'border-red-500' : 'border-gray-300'
                }`}
                min={0}
              />
              {errors.countInStock && <p className="mt-1 text-sm text-red-600">{errors.countInStock}</p>}
            </div>

            {/* SKU */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">SKU</label>
              <input
                type="text"
                name="sku"
                value={productData.sku}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Category *
              </label>
              <select
                name="category"
                value={productData.category}
                onChange={handleChange}
                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={productData.brand}
                onChange={handleChange}
                className={`w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">Gender</label>
              <select
                name="gender"
                value={productData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            {/* Sizes */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Sizes (comma separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={productData.sizes.join(", ")}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="S, M, L, XL"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block font-semibold mb-1 text-sm text-gray-700">
                Colors (comma separated)
              </label>
              <input
                type="text"
                name="colors"
                value={productData.colors.join(", ")}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Red, Blue, Green"
              />
            </div>

            {/* Featured */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={productData.featured}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Featured Product
                </span>
              </label>
            </div>
          </div>

          {/* Image Management */}
          <div className="border-t pt-6">
            <label className="block mb-2 font-semibold text-sm text-gray-700">
              Product Images (Max 5 total)
            </label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Current Images:</h4>
                <div className="flex gap-4 flex-wrap">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <img
                        src={image.url}
                        alt={image.altText || "Product Image"}
                        className="w-20 h-20 object-cover rounded-md shadow-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <input 
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* New Image Previews */}
            {newImagePreviews.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">New Images:</h4>
                <div className="flex gap-4 flex-wrap">
                  {newImagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative">
                      <img
                        src={preview.url}
                        alt={preview.name}
                        className="w-20 h-20 object-cover rounded-md shadow-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="border-t pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 w-full text-white px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;