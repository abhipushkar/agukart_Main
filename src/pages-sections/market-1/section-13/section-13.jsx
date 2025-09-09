import Container from "@mui/material/Container"; 
// LOCAL CUSTOM COMPONENT

import Sidebar from "../section-7/sidebar";
import ProductGridList from "../shared/product-grid"; 
// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box"; 
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
export default  function Section13() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchOpticsData = async () => {
      try {
        const [opticsList, opticsShops, opticsBrands] = await Promise.all([
          api.getOpticsList(),
          api.getOpticsShops(),
          api.getOpticsBrands()
        ]);
        setProducts(opticsList);
        setShops(opticsShops);
        setBrands(opticsBrands);
      } catch (error) {
        console.error('Error fetching optics data:', error);
      }
    };

    fetchOpticsData();
  }, []);
  return <Container className="mb-5">
      <FlexBox gap="1.75rem">
        <Sidebar brands={brands} shops={shops} />
        <ProductGridList heading="Optics / Watch" products={products} />
      </FlexBox>
    </Container>;
}