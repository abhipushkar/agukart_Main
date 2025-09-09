"use client";

import { useState, Fragment, useEffect } from "react";
import Place from "@mui/icons-material/Place";
import { Box } from "@mui/material";
// Local CUSTOM COMPONENT

import Pagination from "../../pagination";
import AddressListItem from "../address-item";
import DashboardHeader from "../../dashboard-header";
import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useMyProvider from "hooks/useMyProvider";
// CUSTOM DATA MODEL
export default function AddressPageView({ addressList }) {
  const [allAddress, setAllAddress] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentlimitPage, setCurrentLimitPage] = useState(1);

  console.log("currentPagecurrentPage", currentPage);
  const [tottalPage, setTottalPage] = useState();
  console.log("tottalPagetottalPagetottalPage", tottalPage);

  const { token } = useAuth();
  const { setAddressCount } = useMyProvider();

  function calculateOffset(currentPage) {
    // console.log({currentPage, limit});
    return currentPage - 1;
  }
  const getProfileData = async () => {
    const offset = calculateOffset(currentPage);

    try {
      const res = await getAPIAuth(
        `user/get-address?limit=${`${5}`}&offset=${offset}`,
        token
      );
      console.log("getprofileres", res);
      if (res.status == 200) {
        setAllAddress(res?.data?.addresses);
        // res?.data?.addresses
        setTottalPage(res?.data?.totalPages);
        setCurrentLimitPage(res?.data?.addressLength);
        setAddressCount(res?.data?.addressLength);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };
  useEffect(() => {
    getProfileData();
  }, [token, currentPage]);

  // PAGINATION FUNCTIONALITY
  const handlePageChange = (event, value) => {
    // console.log("valueeeee" , value);
    setCurrentPage(value);
  };

  console.log({ allAddress });

  return (
    <Fragment>
      {/* TITLE HEADER AREA */}
      <DashboardHeader
        Icon={Place}
        href="/profile/address/addnew"
        title="My Addresses"
        buttonText="Add New Address"
      />

      {/* ALL ADDRESS LIST AREA */}
      {allAddress?.length < 1 ? (
        <>
          <Box
            sx={{
              textAlign: "center",
              fontSize: "20px",
              textTransform: "uppercase",
              fontWeight: 900,
            }}
          >
            NO Data Found
          </Box>
        </>
      ) : (
        allAddress?.map((address) => (
          <>
            <AddressListItem
              key={address.id}
              address={address}
              getProfileData={getProfileData}
            />
          </>
        ))
      )}

      {/* PAGINATION AREA */}
      {allAddress?.length >= 1 ? (
        <Pagination
          count={tottalPage}
          page={currentPage}
          onChange={handlePageChange}
        />
      ) : null}
    </Fragment>
  );
}
