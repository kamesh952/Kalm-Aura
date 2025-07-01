import React, { useEffect } from "react";

const RazorpayButton = ({ amount, onSuccess, onError, shippingAddress }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    const options = {
      key: "rzp_test_ClDfN9bSkKPpj8", // ✅ Replace with your actual Razorpay key
      amount: amount * 100, // in paise
      currency: "INR",
      name: "My Store",
      description: "Test Transaction",
      image: "https://your-logo-url.com/logo.png", // optional
      handler: function (response) {
        onSuccess(response);
      },
      prefill: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        email: "user@example.com",
        contact: shippingAddress.phone,
      },
      theme: {
        color: "#000000",
      },
    };

    const razor = new window.Razorpay(options);
    razor.on("payment.failed", function (response) {
      onError(response.error);
    });

    razor.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
    >
      Pay ₹{amount}
    </button>
  );
};

export default RazorpayButton;
