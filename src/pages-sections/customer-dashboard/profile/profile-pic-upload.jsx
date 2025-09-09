"use client";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CameraEnhance from "@mui/icons-material/CameraEnhance";
import useAuth from "hooks/useAuth";
import CircularProgress from "@mui/material/CircularProgress";

// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box";
export default function ProfilePicUpload({
  setUserProfileImage,
  profiledata,
  loader,
}) {
  console.log("loaderloader", loader);
  console.log("profiledataprofiledataprofiledata", profiledata);

  return (
    <FlexBox alignItems="flex-end" mb={3}>
      {/* <Avatar alt="user" src={`${profiledata.image ?  profiledata?.image : "/assets/images/faces/ralph.png" }`} sx={{
      height: 64,
      width: 64
    }} /> */}
      {
        loader ? (
          <Box sx={{ display: "flex" }}>
            <CircularProgress />
          </Box>
        ) : (
          <img
            src={`${profiledata.image ? profiledata?.image : "/assets/images/faces/dummyuser.jpg"}`}
            alt="user"
            style={{
              height: 170,
              width: 170,
              background: "#f0f0f0",
              borderRadius: "50%",
              objectFit:'cover'
            }}
          />
        )
        // <img  src={`${ "/assets/images/faces/dummyuser.jpg" }`} alt="user" style={{height: 64 , width: 64 , background : "#f0f0f0" , borderRadius : "50%" }} />
      }

      <IconButton
        size="small"
        component="label"
        color="secondary"
        htmlFor="profile-image"
        sx={{
          bgcolor: "grey.300",
          ml: -5.4,
        }}
      >
        <CameraEnhance fontSize="small" />
      </IconButton>

      <Box
        type="file"
        display="none"
        accept="image/*"
        component="input"
        id="profile-image"
        onChange={(e) => setUserProfileImage(e?.target?.files?.[0])}
      />
    </FlexBox>
  );
}
