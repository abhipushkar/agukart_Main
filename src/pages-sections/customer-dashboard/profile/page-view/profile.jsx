"use client";

import { Fragment } from "react";
import Person from "@mui/icons-material/Person";
// Local CUSTOM COMPONENT

import UserInfo from "../user-info";
import UserAnalytics from "../user-analytics";
import DashboardHeader from "../../dashboard-header";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import useAuth from "hooks/useAuth";
// CUSTOM DATA MODEL

// ============================================================
export default function ProfilePageView({ user }) {
  const [profiledata, SetProfileData] = useState([]);
  console.log("profiledata", profiledata);
  const { token } = useAuth();
  // console.log("tokentoken" , token);
  const getProfileData = async () => {
    try {
      const res = await getAPIAuth("user/get-profile", token);
      console.log("getprofileresssssssssssssssssssss", res);
      if (res.status == 200) {
        SetProfileData(res?.data?.data);
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
        Icon={Person}
        title="My Profile"
        buttonText="Edit Profile"
        href={`/profile/${profiledata?._id}`}
      />

      {/* USER PROFILE INFO */}
      <UserAnalytics sx user={user} data={profiledata} />

      {/* USER PROFILE INFO */}
      <UserInfo  user={user} data={profiledata} />
    </Fragment>
  );
}
