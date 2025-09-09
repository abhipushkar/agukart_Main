import Container from "@mui/material/Container"; 
// LOCAL CUSTOM COMPONENT

import Sidebar from "./sidebar";
import ProductGridList from "../shared/product-grid"; 
// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box"; 
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
export default  function Section7() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchMobileData = async () => {
      try {
        const [mobileList, mobileShops, mobileBrands] = await Promise.all([
          api.getMobileList(),
          api.getMobileShops(),
          api.getMobileBrands()
        ]);
        setProducts(mobileList);
        setShops(mobileShops);
        setBrands(mobileBrands);
      } catch (error) {
        console.error('Error fetching mobile data:', error);
      }
    };

    fetchMobileData();
  }, []);
  return <Container className="mb-5">
      <FlexBox gap="1.75rem">
        <Sidebar brands={brands} shops={shops} />
        <ProductGridList heading="Mobile Phones" products={products} />
      </FlexBox>
    </Container>;
}