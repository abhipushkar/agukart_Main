import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useState } from "react";
import axios from "axios";
import useAuth from "hooks/useAuth";
import { postAPIAuth } from "utils/__api__/ApiServies";

const Checkout = () => {
  const [{ isPending }] = usePayPalScriptReducer();
  const { token } = useAuth();

  return (
    <div>
      {!isPending && (
        <div style={{ marginTop: 20 }}>
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={async () => {
              const res = await postAPIAuth("user/create-order",{},token)
              return res?.data?.data?.orderId;
            }}
            onApprove={async (data) => {
              const res = await postAPIAuth("user/capture-order",{orderID: data.orderID},token)
              alert(`Payment completed by ${res.data.payer.name.given_name}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Checkout;
