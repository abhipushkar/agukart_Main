"use client";

import Grid from "@mui/material/Grid"; 
// GLOBAL CUSTOM HOOK

import useCart from "hooks/useCart"; 
// LOCAL CUSTOM COMPONENTS

import CartItem from "../cart-item";
import CheckoutForm from "../checkout-form";
export default function CartPageView() {
  const {
    state
  } = useCart();
  console.log(state,"this")
  return <Grid container spacing={3}>
      {
      /* CART PRODUCT LIST */
    }
      <Grid item md={8} xs={12}>
        {state.cart.map(({
        name,
        _id,
        price,
        qty,
        image
      }) => <CartItem id={_id} key={_id} qty={qty} name={name.replace(/<[^>]*>/g, '')} slug={name.replace(/<[^>]*>/g, '')} price={price} imgUrl={image} />)}
      </Grid>



      {
      /* CHECKOUT FORM */
    }
      <Grid item md={4} xs={12}>
        <CheckoutForm />
      </Grid>
    </Grid>;
}