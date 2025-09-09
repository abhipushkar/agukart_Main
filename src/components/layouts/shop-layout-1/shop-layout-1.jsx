"use client";

import { Fragment, useCallback, useState } from "react";
// GLOBAL CUSTOM COMPONENTS

import Sticky from "components/sticky";
import Topbar from "components/topbar";
import { Navbar } from "components/navbar";
import { Footer1 } from "components/footer";
import Header from "components/header/header";
import { SearchInputWithCategory } from "components/search-box";
import { MobileNavigationBar } from "components/mobile-navigation";
import { usePathname } from "next/navigation";

/**
 *  USED IN:
 *  1. MARKET-1, MARKET-2, GADGET, FASHION-1, FASHION-2, FASHION-3, FURNITURE, GROCERY-3, GIFT
 *  2. PRODUCT DETAILS, PRODUCT-SEARCH, ORDER-CONFIRMATION
 *  5. SHOPS, SHOP-DETAILS
 */

export default function ShopLayout1({
  children
}) {
  const [isFixed, setIsFixed] = useState(false);
  const toggleIsFixed = useCallback(fixed => setIsFixed(fixed), []);
  const pathname = usePathname();
  // Check if the current path is '/blocked'
  const isBlockedPage = pathname === '/blocked';
  console.log({isBlockedPage})
  // console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSS")
  return <Fragment>
    {
      /* TOP BAR SECTION */
    }
    {/* <Topbar /> */}

    {
      /* HEADER */
    }
    {/* <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={300}>
      
    </Sticky> */}
    {
      !isBlockedPage && <Header isFixed={isFixed} midSlot={<SearchInputWithCategory />} />
    }

    {
      /* NAVIGATION BAR */
    }
    {
       !isBlockedPage && <Navbar elevation={0} border={1} />
    }

    {
      /* BODY CONTENT */
    }
    {children}

    {
      /* SMALL DEVICE BOTTOM NAVIGATION */
    }
    <MobileNavigationBar />

    {
      /* FOOTER */
    }
    { !isBlockedPage && <Footer1 />}
  </Fragment>;
}