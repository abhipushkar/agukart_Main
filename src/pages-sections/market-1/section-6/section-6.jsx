import Container from "@mui/material/Container"; 
// LOCAL CUSTOM COMPONENTS

import Sidebar from "./sidebar";
import ProductGridList from "../shared/product-grid"; 
// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box"; 
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
export default function Section6() {
  // const [products, brands] = await Promise.all([api.getCarList(), api.getCarBrands()]);
  // const [data , setdata] = useState([])

  // const carouselDatafuction = async() => {

  //   const flashDeals = await api.getFlashDeals();
  //   setdata(flashDeals)
    
  // }
  
  // useEffec(() => {
  //   carouselDatafuction()
  // }, []);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const [carList, carBrands] = await Promise.all([
          api.getCarList(),
          api.getCarBrands()
        ]);
        setProducts(carList);
        setBrands(carBrands);
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    fetchCarData();
  }, []);
  return <Container className="mb-5">
        {/* <Sidebar brands={brands} /> */}
        <ProductGridList heading="Cars" products={products} />
      </Container>;
}