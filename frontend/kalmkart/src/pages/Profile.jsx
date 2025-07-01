import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MyOrdersPage from "./MyOrdersPage";
import { logout } from "../redux/slices/authSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-indigo-200 rounded-full animate-spin"></div>
            <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Loading your profile
            </p>
            <p className="text-gray-500 max-w-md">
              We're preparing your personalized dashboard. This will just take a
              moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-indigo-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-100 rounded-full opacity-30 animate-pulse delay-75"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-100 rounded-full opacity-15 animate-pulse delay-150"></div>
        <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-pink-100 rounded-full opacity-20 animate-pulse delay-200"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Profile Header */}
        <div className="mb-12 text-center px-4 sm:px-0">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full mb-6 shadow-lg transform hover:rotate-6 transition-transform duration-300">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 leading-tight">
            Welcome back, {user.name?.split(" ")[0] || "User"}!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here's everything you need to manage your account and orders in one
            place.
          </p>
          <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mx-auto mt-6 rounded-full opacity-80"></div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left Section - Profile Card */}
          <div className="w-full xl:w-1/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl  border border-gray-100">
              {/* Header with gradient */}
              <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-white bg-gradient-to-r from-indigo-100 to-purple-100 overflow-hidden shadow-2xl">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500
 text-white text-5xl font-bold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-8 px-6 sm:px-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {user.name || "User"}
                </h2>
                <p className="text-gray-600 mb-3 text-lg">{user.email}</p>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 mb-6 transition-colors hover:bg-indigo-200">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full max-w-xs mx-auto py-3 px-6 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white rounded-xl hover:from-red-600 hover:via-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Additional Profile Info */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500
 rounded-full flex items-center justify-center mr-4 shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Account Details
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <svg
                      className="w-6 h-6 text-gray-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium text-lg">
                      Email Status
                    </span>
                  </div>
                  <span className="font-semibold sm:ml-4">
                    {user.isVerified ? (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Pending
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <svg
                      className="w-6 h-6 text-gray-500 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium text-lg">
                      Account Status
                    </span>
                  </div>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 sm:ml-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Orders */}
          <div className="w-full xl:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-0 sm:mr-4 mb-4 sm:mb-0 shadow-md">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      Order History
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Review your purchases and track current orders
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <Link
                      to="/collection/:collection"
                      className="group relative flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm 
               text-sm font-medium text-gray-700 hover:text-indigo-600
               hover:bg-gray-50 hover:shadow-lg hover:scale-[1.03] hover:-translate-y-0.5 
               transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
               overflow-hidden"
                    >
                      {/* Hover background effect */}
                      <span
                        className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 
                     group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                      ></span>

                      {/* Ripple effect container */}
                      <span className="absolute inset-0 overflow-hidden">
                        <span
                          className="absolute top-1/2 left-1/2 w-0 h-0 bg-indigo-100 rounded-full 
                       group-hover:w-64 group-hover:h-64 group-hover:-translate-x-1/2 group-hover:-translate-y-1/2
                       opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out"
                        ></span>
                      </span>

                      {/* Button content with animations */}
                      <span className="relative z-10 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 transition-all duration-500 ease-out 
                   group-hover:rotate-90 group-hover:scale-110 group-hover:text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="transition-all duration-300 group-hover:font-semibold">
                          New Order
                        </span>

                        {/* Animated arrow that appears on hover */}
                        <svg
                          className="w-4 h-4 ml-1 opacity-0 -translate-x-1 
                   group-hover:opacity-100 group-hover:translate-x-0
                   transition-all duration-300 ease-out delay-100"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>

                      {/* Glow effect */}
                      <span
                        className="absolute inset-0 rounded-lg border border-transparent 
                     group-hover:border-indigo-200 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]
                     transition-all duration-300"
                      ></span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 md:p-8">
                <MyOrdersPage />
              </div>
            </div>

            {/* Additional responsive cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
