import GiftBox from "icons/GiftBox";
// GLOBAL CUSTOM COMPONENTS
import { Carousel } from "components/carousel";
import { SectionCreator } from "components/section-header";
// CUSTOM UTILS LIBRARY FUNCTIONS

import { calculateDiscount } from "lib";
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { useCurrency } from "contexts/CurrencyContext";
import Product from "./Product";
export default function Section12({ bigDiscountProduct }) {
  console.log({ bigDiscountProduct });
  const { currency } = useCurrency();
  // const bigDiscountList = await api.getBigDiscountList();
  const [data, setdata] = useState([]);

  const getBigDiscountList = async () => {
    const bigDiscountList = await api.getBigDiscountList();
    setdata(bigDiscountList);
  };

  useEffect(() => {
    getBigDiscountList();
  }, []);
  const responsive = [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 959,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 650,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 370,
      settings: {
        slidesToShow: 1,
      },
    },
  ];

  return (
    <>
      {bigDiscountProduct.length > 0 && (
        <SectionCreator
          icon={<GiftBox />}
          title="Big Discounts"
          seeMoreLink="#"
        >
          {bigDiscountProduct.length <= 5 ? (
            <Grid container spacing={"20px"}>
              {bigDiscountProduct?.map((product,index) => {
                return (
                  <Grid item xs={12} md={4} lg={2} key={index} >
                    <Product product={product} />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Carousel slidesToShow={6} responsive={responsive}>
              {bigDiscountProduct.map((product,index) => {
                return (
                  <Product key={index} product={product} />
                );
              })}
            </Carousel>
          )}
        </SectionCreator>
      )}
    </>
  );
}
