import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  fetchProductsByFilters, 
  setFilters, 
  clearFilters 
} from "../../redux/slices/ProductSlice";

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filters: reduxFilters, loading } = useSelector((state) => state.products);

  // Local state for UI controls
  const [localFilters, setLocalFilters] = useState({
    category: "",
    gender: "",
    color: "",
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 100,
    isBestSeller: false,
    isNewArrival: false,
    onSale: false
  });

  const [priceRange, setPriceRange] = useState([0, 100]);

  // Filter options
  const filterOptions = {
    categories: ["Top Wear", "Bottom Wear", "Footwear", "Accessories"],
    colors: ["Red", "Blue", "Black", "Green", "Yellow", "White", "Gray", "Pink"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    materials: ["Cotton", "Wool", "Denim", "Polyester", "Silk", "Leather"],
    brands: ["Urban Threads", "Modern Fit", "Street Style", "Fashionista", "Elite Wear"],
    genders: ["Men", "Women", "Unisex"],
    specialFilters: ["Best Seller", "New Arrivals", "On Sale"]
  };

  // Initialize filters from URL params
  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    const initialFilters = {
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: params.minPrice ? Number(params.minPrice) : 0,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : 100,
      isBestSeller: params.isBestSeller === "true",
      isNewArrival: params.isNewArrival === "true",
      onSale: params.onSale === "true"
    };

    setLocalFilters(initialFilters);
    setPriceRange([initialFilters.minPrice, initialFilters.maxPrice]);
    dispatch(setFilters(initialFilters));
  }, [searchParams, dispatch]);

  // Update URL and fetch products when filters change
  const applyFilters = (newFilters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (typeof value === "boolean" && value) {
        params.set(key, value);
      } else if (value && value !== "") {
        params.set(key, value);
      }
    });

    navigate(`?${params.toString()}`);
    dispatch(fetchProductsByFilters(newFilters));
  };

  const handlePriceChange = (newRange) => {
    const newFilters = { 
      ...localFilters, 
      minPrice: newRange[0], 
      maxPrice: newRange[1] 
    };
    setLocalFilters(newFilters);
    setPriceRange(newRange);
    applyFilters(newFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...localFilters };

    if (type === "checkbox") {
      if (name === "isBestSeller" || name === "isNewArrival" || name === "onSale") {
        newFilters[name] = checked;
      } else {
        newFilters[name] = checked
          ? [...newFilters[name], value]
          : newFilters[name].filter(item => item !== value);
      }
    } else {
      newFilters[name] = value;
    }

    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleColorSelect = (color) => {
    const newColor = localFilters.color === color ? "" : color;
    const newFilters = { ...localFilters, color: newColor };
    setLocalFilters(newFilters);
    applyFilters(newFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      category: "",
      gender: "",
      color: "",
      size: [],
      material: [],
      brand: [],
      minPrice: 0,
      maxPrice: 100,
      isBestSeller: false,
      isNewArrival: false,
      onSale: false
    };
    
    setLocalFilters(resetFilters);
    setPriceRange([0, 100]);
    dispatch(clearFilters());
    navigate(""); // Reset URL
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button 
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:underline"
        >
          Reset All
        </button>
      </div>

      {/* Special Filters */}
      <FilterSection title="Special Offers">
        <div className="space-y-3">
          <CheckboxOption
            name="isBestSeller"
            label="Best Sellers"
            checked={localFilters.isBestSeller}
            onChange={handleFilterChange}
          />
          <CheckboxOption
            name="isNewArrival"
            label="New Arrivals"
            checked={localFilters.isNewArrival}
            onChange={handleFilterChange}
          />
          <CheckboxOption
            name="onSale"
            label="On Sale"
            checked={localFilters.onSale}
            onChange={handleFilterChange}
          />
        </div>
      </FilterSection>

      {/* Category Filter */}
      <FilterSection title="Category">
        {filterOptions.categories.map(category => (
          <RadioOption
            key={category}
            name="category"
            value={category}
            checked={localFilters.category === category}
            onChange={handleFilterChange}
            label={category}
          />
        ))}
      </FilterSection>

      {/* Gender Filter */}
      <FilterSection title="Gender">
        {filterOptions.genders.map(gender => (
          <RadioOption
            key={gender}
            name="gender"
            value={gender}
            checked={localFilters.gender === gender}
            onChange={handleFilterChange}
            label={gender}
          />
        ))}
      </FilterSection>

      {/* Color Filter */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {filterOptions.colors.map(color => (
            <ColorButton
              key={color}
              color={color}
              active={localFilters.color === color}
              onClick={() => handleColorSelect(color)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection title="Size">
        <div className="grid grid-cols-3 gap-2">
          {filterOptions.sizes.map(size => (
            <CheckboxOption
              key={size}
              name="size"
              value={size}
              checked={localFilters.size.includes(size)}
              onChange={handleFilterChange}
              label={size}
            />
          ))}
        </div>
      </FilterSection>

      {/* Material Filter */}
      <FilterSection title="Material">
        {filterOptions.materials.map(material => (
          <CheckboxOption
            key={material}
            name="material"
            value={material}
            checked={localFilters.material.includes(material)}
            onChange={handleFilterChange}
            label={material}
          />
        ))}
      </FilterSection>

      {/* Brand Filter */}
      <FilterSection title="Brand">
        {filterOptions.brands.map(brand => (
          <CheckboxOption
            key={brand}
            name="brand"
            value={brand}
            checked={localFilters.brand.includes(brand)}
            onChange={handleFilterChange}
            label={brand}
          />
        ))}
      </FilterSection>

      {/* Price Filter */}
      <FilterSection title="Price Range">
        <div className="px-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange([Number(e.target.value), priceRange[1]])}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </div>
      </FilterSection>

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Applying filters...
        </div>
      )}
    </div>
  );
};

// Reusable sub-components
const FilterSection = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="text-md font-medium text-gray-700 mb-3">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

const RadioOption = ({ name, value, checked, onChange, label }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
    />
    <span className="text-gray-700">{label}</span>
  </label>
);

const CheckboxOption = ({ name, value, label, checked, onChange }) => (
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <span className="text-gray-700">{label}</span>
  </label>
);

const ColorButton = ({ color, active, onClick }) => {
  const colorMap = {
    Red: "bg-red-500",
    Blue: "bg-blue-500",
    Black: "bg-black",
    Green: "bg-green-500",
    Yellow: "bg-yellow-400",
    White: "bg-white border border-gray-300",
    Gray: "bg-gray-400",
    Pink: "bg-pink-400"
  };

  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 rounded-full ${colorMap[color]} ${active ? "ring-2 ring-offset-1 ring-blue-500" : ""}`}
      aria-label={`Filter by ${color} color`}
    />
  );
};

export default FilterSidebar;