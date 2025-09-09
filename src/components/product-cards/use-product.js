import { useCallback, useState } from "react";
import { useSnackbar } from "notistack";
import useCart from "hooks/useCart";
export default function useProduct(_id) {
  const {
    state,
    dispatch
  } = useCart();
  const {
    enqueueSnackbar
  } = useSnackbar();
  const [openModal, setOpenModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const cartItem = state.cart.find(item => item._id === _id);
  const toggleFavorite = useCallback(() => setIsFavorite(fav => !fav), []);
  const toggleDialog = useCallback(() => setOpenModal(open => !open), []);

  const handleCartAmountChange = (product, type) => {
    // dispatch({
    //   type: "CHANGE_CART_AMOUNT",
    //   payload: product
    // }); 
    dispatch({
      type: "CHANGE_CART_AMOUNT",
      payload: {
        vendor_id: product?.vendor_id?._id,
        vendor_name: product?.vendor_id?.name,
        shop_icon: `${product?.vendor_details?.vendor_shop_icon_url}${product?.vendor_details?.shop_icon}`,
        shop_name: product?.vendor_details?.shop_name,
        slug: product?.vendor_details?.slug,
        products: [
          {
            product_id: product?._id,
            qty: quantity,
            stock:+product?.qty,
            product_name: product?.product_title,
            sale_price: product?.sale_price,
            firstImage: `${product?.image_url}${media[0]}`,
          }
        ]
      },
    });
// SHOW ALERT PRODUCT ADDED OR REMOVE

    if (type === "remove") enqueueSnackbar("Remove from Cart", {
      variant: "error"
    });else enqueueSnackbar("Added to Cart", {
      variant: "success"
    });
  };

  return {
    cartItem,
    openModal,
    isFavorite,
    toggleDialog,
    toggleFavorite,
    handleCartAmountChange
  };
}