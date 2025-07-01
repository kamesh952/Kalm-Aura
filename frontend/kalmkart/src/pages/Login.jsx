import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import login from "../assets/login.webp";
import { loginUser } from "../redux/slices/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, loading, user, isAuthenticated } = useSelector((state) => state.auth);

  // Debug logging
  useEffect(() => {
    console.log('Auth state updated:', { 
      isAuthenticated, 
      user: !!user, 
      error, 
      loading 
    });
  }, [isAuthenticated, user, error, loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Submitting login...');
    
    try {
      const resultAction = await dispatch(loginUser({ 
        email: email.trim(), 
        password: password.trim() 
      }));
      
      console.log('Login result:', resultAction);
      
      // Check if the action was fulfilled
      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login successful, navigating...');
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        navigate("/");
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Keep the useEffect as backup
  useEffect(() => {
    if (isAuthenticated) {
      console.log('isAuthenticated changed to true, navigating...');
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-[600px]">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:p-12 mt-8">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm mx-auto"
        >
          <div className="flex justify-center mb-6">
            <h2 className="text-xl font-medium">Rabbit</h2>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">Hey there!</h2>
          <p className="text-center mb-6">
            Enter your email and password to login
          </p>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded-lg hover:bg-gray-600 transition"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>

          <p className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/registor" className="text-blue-500">
              Register
            </Link>
          </p>
        </form>
      </div>

      <div className="hidden md:block w-1/2 bg-gray-800">
        <div className="h-full flex justify-center items-center">
          <img
            src={login}
            alt="Login illustration"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;