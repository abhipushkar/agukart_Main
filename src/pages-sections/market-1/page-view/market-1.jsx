"use client";
import { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import "../style.css";
// GLOBAL COMPONENTS

import Setting from "components/settings";
import Newsletter from "components/newsletter";
// LOCAL CUSTOM COMPONENTS

import Section1 from "../section-1";
import Section2 from "../section-2";
import Section3 from "../section-3";
import Section4 from "../section-4";
import Section5 from "../section-5";
import Section6 from "../section-6";
import Section7 from "../section-7";
import Section8 from "../section-8";
import Section9 from "../section-9";
import Section10 from "../section-10";
import Section11 from "../section-11";
import Section12 from "../section-12";
import Section13 from "../section-13";
import Section14 from "../section-14";
import Section15 from "../section-15";
import Section16 from "../section-16";
import Section17 from "../section-17";
import Section18 from "../section-18";
import Section19 from "../section-19";
import Section20 from "../section-20";
import Header from "components/header/header";
import Topbar from "components/topbar/top-bar";
import Sticky from "components/sticky/Sticky";
import { Footer1 } from "components/footer";
import { SearchInputWithCategory } from "components/search-box";
import { MobileNavigationBar } from "components/mobile-navigation";
import { Navbar } from "components/navbar";
import ShopSmall from "../ShopSmall/ShopSmall";
import Section22 from "../section-22";
import Section23 from "../section-23";
import Section24 from "../section-24";
import { getAPI, getAPIAuth, postAPI } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import useMyProvider from "hooks/useMyProvider";
import { useToasts } from "react-toast-notifications";
import Section21 from "../section-21";

export default function MarketOnePageView() {
  const router = useRouter();
  const { addToast } = useToasts();
  const [isFixed, setIsFixed] = useState(false);
  const [bigDiscountProduct, setBigDiscountProduct] = useState([]);
  const [recentlyViewd, setRecentlyViewed] = useState([]);
  const [becauseViewed, setBecauseViewed] = useState([]);
  const [dealData, setDealsData] = useState({});
  const { token, setToken } = useAuth();
  const { setUserCredentials } = useMyProvider();
  // console.log("isFixed", isFixed);
  const toggleIsFixed = useCallback((fixed) => setIsFixed(fixed), []);

  const getDiscountsProducts = async () => {
    try {
      const res = await getAPIAuth("bigDiscountProducts");
      if (res.status === 200) {
        const arr = res.data.products.map((item) => {
          return { ...item, base_url: res.data.base_url };
        });
        setBigDiscountProduct(arr);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRecentlyViewd = async () => {
    try {
      const res = await getAPIAuth("user/recently-viewed-products", token);

      if (res.status === 200) {
        const arr = res.data.data.map((item) => {
          return { ...item, base_url: res.data.base_url };
        });
        setRecentlyViewed(arr);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getBecauseOfView = async () => {
    try {
      const res = await getAPIAuth("user/because-viewed-products", token);

      if (res.status === 200) {
        const arr = res.data.productData.map((item) => {
          return { ...item, base_url: res.data.base_url };
        });
        setBecauseViewed(arr);
      }
    } catch (error) {
      console.log(error);
    }
  };


  const getDeals = async () => {
    try {
      const res = await getAPIAuth("get-deals", token);
      console.log("getDealssss", res);
      if (res.status === 200) {
        setDealsData({
          base_url: res.data.base_url,
          box_url: res.data.box_url,
          ...res.data.data,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    getDiscountsProducts();
    getDeals();
  }, [token]);

  useEffect(() => {
    if (token) {
      getRecentlyViewd();
      getBecauseOfView();
    }
  }, [token]);

  const verifyToken = async (token) => {
    try {
      const res = await getAPIAuth("user/verify-token", token);
      if (res.data.success) {
        setToken(token);
        setUserCredentials(res?.data?.user);
        addToast("User Login Sucessfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        router.push("/");
      } else {
        addToast("User Login Failed!", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      setTimeout(() => {
        verifyToken(token);
      }, 2000);
    }
  }, []);

  return (
    <Fragment>
      {/* <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
     
      </Sticky> */}
      <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
      <Navbar elevation={0} border={1} />
      <MobileNavigationBar />

      {/* HERO SLIDER SECTION */}
      <Section1 />

      {/* SPECIAL MOMENT SECTION */}
      <ShopSmall />

      {/* POPULAR GIFTS */}
      <Section24 />

      {/* SHOP CATEGORIES  */}
      <Section14 />

      {/* RECENTLY VIEWED */}

      {/* {token && recentlyViewd.length > 0 && (
        <Section15
          recentlyViewd={recentlyViewd}
          getRecentlyViewd={getRecentlyViewd}
        />
      )} */}

      {/* BECAUSE YOU VIEWED  */}
      {/* {token && becauseViewed.length > 0 && (
        <Section16
          becauseViewed={becauseViewed}
          getBecauseOfView={getBecauseOfView}
        />
      )} */}

      {/* HOME ARRIVALS */}
      <Section17 />

      {/* FEATURED BRANDS */}
      <Section18 />

      {/* BEST SELLERS */}
      {/* <Section19 /> */}

      {/* NEW ARRIVAL LIST */}

      <Section5 />

      {/* BIG DISCOUNTS */}
      <Section12 bigDiscountProduct={bigDiscountProduct} />

      {/* PROMO BANNERS */}
      <Section8 />
      {/* BEST SELLERS KITCHEN */}
      <Section21 />

      {/* FLASH DEALS SECTION */}
      {/* <Section2 /> */}
      {/* BIG DISCOUNTS */}
      {/* <Section12 /> */}

      {/* TOP CATEGORIES */}
      <Section3 />

      {/* TOP RATED PRODUCTS */}
      <Section4 />

      {/* CAR LIST */}
      {/* <Section6 /> */}

      {/* MOBILE PHONES */}
      {/* <Section7 /> */}

      {/* OPTICS / WATCH */}
      {/* <Section13 /> */}

      {/* CATEGORIES */}
      {/* <Section9 /> */}

      {/* MORE FOR YOU */}
      {/* <Section10 /> */}

      {/* SERVICE CARDS */}
      {/* <Section11 /> */}

      {/* POPUP NEWSLETTER FORM */}
      {/* <Newsletter /> */}

      {/* BLOGS */}
      <Section20 />

      {/* WHAT IS ETSY */}
      <Section22 description={dealData?.description || ""} />

      {/* NEWS LATTER */}
      <Section23 />

      {/* SETTINGS IS USED ONLY FOR DEMO, YOU CAN REMOVE THIS */}
      {/* <Setting /> */}
      <MobileNavigationBar />

      <Footer1 />
    </Fragment>
  );
}
