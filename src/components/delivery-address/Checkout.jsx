import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import useAuth from "hooks/useAuth";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";

const Checkout = ({ cartData, selectedAddress, currencyCode, cartDetails, orderConfirmation, token: tokenProp, addToast: addToastProp, disabled }) => {

  const [{ isPending }] = usePayPalScriptReducer();
  const { token: authToken } = useAuth();
  const { addToast: toastNotification } = useToasts();
  
  const token = tokenProp || authToken;
  const addToast = addToastProp || toastNotification;

  return (
    <div>
      {!isPending && (
        <div style={{ marginTop: 20 }}>
          <PayPalButtons
            style={{ layout: "vertical" }}
            disabled={disabled}
            createOrder={async () => {

              const items = [];
              let itemTotal = 0;
              let shippingTotal = 0;

              cartData.forEach(vendor => {

                // add vendor total
                itemTotal += Number(vendor.totalAmount || 0);

                // take selected shipping
                if (vendor.previewDelivery?.standardShipping) {
                  shippingTotal += Number(vendor.previewDelivery.standardShipping);
                }

                vendor.products.forEach(product => {
                  items.push({
                    name: product.product_name.replace(/<[^>]*>/g, ""), // remove html
                    description: "",
                    quantity: String(product.qty),
                    unit_amount: {
                      currency_code: currencyCode,
                      value: Number(product.price).toFixed(2)
                    }
                  });
                });

              });

              const total = cartDetails.grandTotal || itemTotal + cartDetails.delivery;
              const payload = {
                currency_code: currencyCode,
                amount: {
                  // item_total: (cartDetails.grandTotal-cartDetails.delivery).toFixed(2),
                  // shipping: cartDetails.delivery.toFixed(2),
                  total: Number(cartDetails.grandTotal).toFixed(2)
                },
                // items,
                // shipping: {
                //   address_line_1: selectedAddress?.address_line1,
                //   address_line_2: selectedAddress?.address_line2,
                //   admin_area_2: selectedAddress?.city,
                //   admin_area_1: selectedAddress?.state,
                //   postal_code: selectedAddress?.pincode,
                //   country_code: selectedAddress?.country === "India" ? "IN" : "US"
                // }
              };

              const res = await postAPIAuth(
                "user/create-order",
                payload,
                token
              );

              return res?.data?.data?.id;
            }}

            onApprove={async (data) => {

              const res = await postAPIAuth(
                "user/capture-order",
                { orderID: data.orderID },
                token,
                addToast
              );
              if (res.status === 200) {
                const paymentStatus = res.data.status === "COMPLETED" ? "completed" : "failed";
                const paypalCaptureId = res.data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
                
                // Call orderConfirmation with PayPal-specific payment details
                await orderConfirmation("paypal", paymentStatus, data.orderID, paypalCaptureId);
              }
            }}

          />
        </div>
      )}
    </div>
  );
};

export default Checkout;