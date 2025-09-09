"use client";

import { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Place from "@mui/icons-material/Place";
// Local CUSTOM COMPONENT

import AddressForm from "../address-form";
import DashboardHeader from "../../dashboard-header";
import useAuth from "hooks/useAuth";
import { getAPIAuth } from "utils/__api__/ApiServies";
// CUSTOM DATA MODEL

// =============================================================
export default function AddressDetailsPageView({ param }) {
  const {id} = param
  const { token } = useAuth();
  const [Addressdata, SetAddressData] = useState([]);
  // console.log("profiledataprofiledata", profiledata);
  const getProfileData = async () => {
    try {
      const res = await getAPIAuth("user/get-address", token);
      // console.log("getprofileres", res);
      if (res.status == 200) {
        SetAddressData(res?.data?.data);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };
  useEffect(() => {
    getProfileData();
  }, [token]);
  return (
    <Fragment>
      {/* TITLE HEADER AREA */}
      <DashboardHeader
        Icon={Place}
        href="/profile/address"
        title="Edit Address"
        buttonText="Back to Address"
      />

      {/* FORM AREA */}
      <Card
        sx={{
          p: 3,
          pt: 4,
        }}
      >
        <AddressForm address={Addressdata} id={id} />
      </Card>
    </Fragment>
  );
}
