import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  clearAdminState,
  clearSuccess,
  selectAllUsers,
  selectAdminLoading,
  selectAdminError,
  selectAdminSuccess,
  selectAdminSuccessMessage,
} from "../../redux/slices/adminSlice"; // Adjust the import path as needed

const UserManagement = () => {
  const dispatch = useDispatch();
  
  // Redux state selectors
  const users = useSelector(selectAllUsers);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const success = useSelector(selectAdminSuccess);
  const successMessage = useSelector(selectAdminSuccessMessage);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
    
    // Cleanup on unmount
    return () => {
      dispatch(clearAdminState());
    };
  }, [dispatch]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(userId));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (userId, newRole) => {
    // Find the user to get current data
    const user = users.find(u => u._id === userId);
    if (user) {
      dispatch(updateUser({
        id: userId,
        name: user.name,
        email: user.email,
        role: newRole
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addUser(formData));
    
    // Reset form only if we expect success (we'll handle this in useEffect)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "customer",
    });
  };

  // Reset form when user is successfully added
  useEffect(() => {
    if (success && successMessage === "User created successfully") {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "customer",
      });
    }
  }, [success, successMessage]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>

      {/* Success Message */}
      {success && successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading...
        </div>
      )}

      {/* Add New User Form */}
      <div className="bg-white shadow-md rounded p-5 mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New User</h3>
        <form onSubmit={handleSubmit} className="grid gap-2">
          <label>
            <span className="block mb-1 font-medium">Name</span>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>

          <label>
            <span className="block mb-1 font-medium">Email</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>

          <label>
            <span className="block mb-1 font-medium">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>

          <label>
            <span className="block mb-1 font-medium">Role</span>
            <select
              name="role"
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>

      {/* User List Table */}
      <div className="mt-5">
        <h3 className="text-lg font-semibold mb-3">
          Existing Users ({users.length})
        </h3>

        {users.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            No users found. Add some users to get started.
          </div>
        ) : (
          <div className="relative shadow-md sm:rounded-lg overflow-hidden">
            <table className="min-w-full text-left text-gray-500">
              <thead className="bg-gray-200 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-bold text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">
                      <select
                        className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        disabled={loading}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loading ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;