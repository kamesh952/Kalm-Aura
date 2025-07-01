import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaUser,
  FaBoxOpen,
  FaShoppingCart,
  FaCog,
  FaTachometerAlt,
  FaStore,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import { logout } from "../../redux/slices/authSlice"; // Update this path to match your project structure

const AdminSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Dispatch logout action to clear user state and localStorage
    dispatch(logout());
    
    // Navigate to login page or home page
    navigate("/login"); // or navigate("/") for home page
  };

  const linkClasses = ({ isActive }) =>
    isActive
      ? "bg-gray-700 text-white py-3 px-4 rounded flex items-center space-x-2"
      : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2";

  return (
    <div className="p-4">
      <div className="mb-6">
        <NavLink to="/" className="text-3xl flex font-bold text-white">
          KalmKart
        </NavLink>
      </div>

      <nav className="flex flex-col space-y-2">
        <NavLink to="/admin" className={linkClasses}>
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className={linkClasses}>
          <FaUser />
          <span>Users</span>
        </NavLink>
        <NavLink to="/admin/products" className={linkClasses}>
          <FaBoxOpen />
          <span>Products</span>
        </NavLink>
        <NavLink to="/admin/orders" className={linkClasses}>
          <FaClipboardList />
          <span>Orders</span>
        </NavLink>
     
      </nav>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded flex items-center justify-center space-x-2"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;