import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState } from "react";
import axios from "axios";
import useAuth from "hooks/useAuth";
import { postAPIAuth } from "utils/__api__/ApiServies";

const Checkout = ({ currencyCode, vendorTotal, disabled, handlePlaceOrder }) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { token } = useAuth();

  return (
    <div>
      {!isPending && (
        <div style={{ marginTop: 20 }}>
          <PayPalButtons
            style={{ layout: "vertical" }}
            disabled={disabled}
            createOrder={async () => {
              const res = await postAPIAuth("user/create-order",
                {
                  currency_code: currencyCode,
                  amount: {total: vendorTotal}
                },
                token)
              return res?.data?.data?.id;
            }}
            onApprove={async (data) => {
              const res = await postAPIAuth("user/capture-order",{orderID: data.orderID},token);
              if (res.status === 200) {
                const paymentStatus = res.data.status === "COMPLETED" ? "completed" : "failed";
                const paypalCaptureId = res.data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
                
                // Call handlePlaceOrder with PayPal-specific payment details
                await handlePlaceOrder("paypal", paymentStatus, data.orderID, paypalCaptureId);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;
