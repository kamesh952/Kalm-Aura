import React from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";

const PayPalButton = ({ amount, onSuccess, onError }) => {
  return (
    <PayPalScriptProvider
      options={{
        // ✅ Replace this with your actual **SANDBOX** client ID
        "client-id": "ARpiWucGnDB9BNuMgQCqoFNANP3HqvJB2OCy0PBXnp1hHZ3ry8A_uVUmHjpplfr89tPKT72HwPf2MUAi",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value: amount.toString() },
              },
            ],
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            console.log("Transaction completed by:", details.payer.name.given_name);
            onSuccess(details);
          });
        }}
        onError={(err) => {
          console.error("PayPal Checkout Error:", err);
          onError(err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
