"use client";

import Container from "@mui/material/Container";
// Local CUSTOM COMPONENTS

import ProductTabs from "../product-tabs";
import ProductIntro from "../product-intro";
import AvailableShops from "../available-shops";
import RelatedProducts from "../related-products";
import FrequentlyBought from "../frequently-bought";
import axios from "axios";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CircularProgress from '@mui/material/CircularProgress';

// CUSTOM DATA MODEL

// ==============================================================
export default function ProductDetailsPageView(props) {
  const pathName = usePathname()
  const [myproduct,setProduct] = useState(null)
  const fetchProductHandler = async () => {
    const auth_key = localStorage.getItem("auth_key");
    console.log({auth_key})

    const id = pathName.split("id=")
    try {
      const res = await axios.get(
        `http://159.89.164.11:7171/api/get-productById?productId=${id[1]}`,
        {
          headers: {
            Authorization: auth_key,
          },
        }
      );
      setProduct(  { base_url:res.data.base_url ,...res.data.data})
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProductHandler();
  }, [pathName]);

  console.log({myproduct })

  return (
    <Container className="mt-2 mb-2">
      {/* PRODUCT DETAILS INFO AREA */}
      {   !myproduct ? <CircularProgress/> : <ProductIntro product={ myproduct}     />}

      {/* PRODUCT DESCRIPTION AND REVIEW */}
      {    myproduct && <ProductTabs   product  = {myproduct} />}

      

      {/* FREQUENTLY BOUGHT PRODUCTS AREA */}
      <FrequentlyBought products={props.frequentlyBought} />

      {/* AVAILABLE SHOPS AREA */}
      <AvailableShops />

      {/* RELATED PRODUCTS AREA */}
      <RelatedProducts products={props.relatedProducts} />
    </Container>
  );
}
