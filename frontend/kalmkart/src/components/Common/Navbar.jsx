import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import SearchBar from "./SearchBar";
import CartDrawer from "../Layout/CarDrawer";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../../redux/slices/ProductSlice";

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth); // Get user from Redux store
  const cartItemCount =
    cart?.products?.reduce((total, product) => total + product.quantity, 0) ||
    0;
  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleCollectionFilter = (collectionType) => {
    let filters = {};

    switch (collectionType) {
      case "MEN":
        filters = { gender: "Men" };
        break;
      case "WOMEN":
        filters = { gender: "Women" };
        break;
      case "TOP WEAR":
        filters = { category: "Top Wear" };
        break;
      case "BOTTOM WEAR":
        filters = { category: "Bottom Wear" };
        break;
      default:
        filters = {};
    }

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      queryParams.set(key, value);
    }

    navigate(`/collection/:collection?${queryParams.toString()}`);
    dispatch(fetchProductsByFilters(filters));
  };

  const CollectionLink = ({ children, collectionType }) => (
    <button
      onClick={() => handleCollectionFilter(collectionType)}
      className="hover:text-gray-700 text-sm font-medium uppercase"
    >
      {children}
    </button>
  );

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-4 md:px-12 relative">
        {/* Left - Logo */}
        <div>
          <Link to="/" className="text-2xl font-medium ">
            KalmAura
          </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <CollectionLink collectionType="MEN">MEN</CollectionLink>
          <CollectionLink collectionType="WOMEN">WOMEN</CollectionLink>
          <CollectionLink collectionType="TOP WEAR">TOP WEAR</CollectionLink>
          <CollectionLink collectionType="BOTTOM WEAR">
            BOTTOM WEAR
          </CollectionLink>
        </div>

        {/* Right – Icons */}
        <div className="flex items-center space-x-4">
          {/* Conditionally render Admin link */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="block bg-black px-2 py-1 rounded text-sm text-white"
            >
              Admin
            </Link>
          )}

          <Link to="/profile" className="hover:text-black-100">
            <HiOutlineUser className="hover:text-black-100 h-6 w-6 text-gray-700" />
          </Link>

          <button
            onClick={toggleCartDrawer}
            className="relative hover:text-black"
          >
            <HiOutlineShoppingBag className="h-6 w-6 text-gray-700" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Search */}
          <div className="overflow-hidden">
            <SearchBar />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleNavDrawer}
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <HiBars3BottomRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Overlay Background */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${
          navDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleNavDrawer}
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold uppercase tracking-wide">Menu</h2>
          <button
            onClick={toggleNavDrawer}
            aria-label="Close navigation menu"
            className="p-2 rounded hover:bg-gray-100"
          >
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Nav Links */}
        <nav className="flex flex-col p-6 space-y-6">
          <button
            onClick={() => {
              handleCollectionFilter("MEN");
              toggleNavDrawer();
            }}
            className="text-lg font-medium hover:text-gray-600 transition-colors text-left"
          >
            Men
          </button>
          <button
            onClick={() => {
              handleCollectionFilter("WOMEN");
              toggleNavDrawer();
            }}
            className="text-lg font-medium hover:text-gray-600 transition-colors text-left"
          >
            Women
          </button>
          <button
            onClick={() => {
              handleCollectionFilter("TOP WEAR");
              toggleNavDrawer();
            }}
            className="text-lg font-medium hover:text-gray-600 transition-colors text-left"
          >
            Top Wear
          </button>
          <button
            onClick={() => {
              handleCollectionFilter("BOTTOM WEAR");
              toggleNavDrawer();
            }}
            className="text-lg font-medium hover:text-gray-600 transition-colors text-left"
          >
            Bottom Wear
          </button>
        </nav>
      </div>

      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />
    </>
  );
};

export default Navbar;
