import { useEffect, useState, useRef } from "react";
import { FaFilter, FaSpinner } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import FilterSideBar from "../components/Product/FilterSideBar";
import SortOptions from "../components/Product/SortOptions";
import ProductGrid from "../components/Product/ProductGrid";
import { fetchProductsByFilters, setFilters } from "../redux/slices/ProductSlice";

const CollectionPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [searchParams] = useSearchParams();
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen]);

  // Fetch products when search params change
  useEffect(() => {
    const filters = {};
    const sortBy = searchParams.get("sortBy");
    
    if (sortBy) {
      filters.sortBy = sortBy;
    }
    
    dispatch(fetchProductsByFilters(filters));
  }, [dispatch, searchParams]);

  return (
    <div className="flex flex-col lg:flex-row relative min-h-screen">
      {/* Mobile Filter Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden border p-2 w-full flex justify-center items-center mb-4 mx-4"
      >
        <FaFilter className="mr-2" />
        Filters
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white z-50 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:relative lg:translate-x-0 lg:block w-1/2 sm:w-1/2 lg:w-1/4 border-r px-4 py-4`}
      >
        <FilterSideBar />
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4">
        <h2 className="text-2xl uppercase">All Collection</h2>
        <SortOptions />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-2xl" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">
            Error loading products: {error}
          </div>
        ) : products && products.length === 0 ? (
          <div className="text-center p-4">No products found</div>
        ) : (
          <div className="mt-0">
            <ProductGrid products={products} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;