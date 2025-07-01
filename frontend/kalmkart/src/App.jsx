import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLayout from "./components/Layout/UserLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registor from "./pages/Registor";
import Profile from "./pages/Profile";
import { Toaster } from "sonner";
import CollectionPage from "./pages/CollectionPage";
import ProductDetails from "./components/Product/ProductDetails";
import CheckOut from "./components/Cart/Checkout";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetails from "./pages/OrderDetails";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminHomePage from "./pages/AdminHomePage";
import UserManagement from "./components/Admin/UserManagement";
import ProductsManagement from "./components/Admin/ProductsManagement";
import EditProducts from "./components/Admin/EditProducts";
import OrderManagement from "./components/Admin/OrderManagement";
import ScrollToTop from "./components/Common/Scroll"; // ✅ Scroll handler

import { Provider } from "react-redux";
import store from "./redux/store";
import CreateProduct from "./components/Admin/createproduct";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        {/* ✅ Scrolls to top on route change */}
        <ScrollToTop />

        {/* ✅ Toast notifications */}
        <Toaster position="top-right" richColors closeButton duration={3000} />

        {/* ✅ App routes */}
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="Registor" element={<Registor />} />
            <Route path="profile" element={<Profile />} />
            <Route path="collection/:collection" element={<CollectionPage />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="checkout" element={<CheckOut />} />
            <Route path="order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="order/:id" element={<OrderDetails />} />
            <Route path="my-orders" element={<MyOrdersPage />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductsManagement />} />
            <Route path="products/:id/edit" element={<EditProducts />} />
            <Route path="products/create" element={<CreateProduct />} />
            <Route path="orders" element={<OrderManagement />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
