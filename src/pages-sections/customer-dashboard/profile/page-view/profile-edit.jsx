"use client";

import { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Person from "@mui/icons-material/Person";
// Local CUSTOM COMPONENT

import ProfileEditForm from "../edit-form";
import ProfilePicUpload from "../profile-pic-upload";
import DashboardHeader from "../../dashboard-header";
import useAuth from "hooks/useAuth";
import {
  getAPIAuth,
  postAPIAuth,
  postAPIFormData,
} from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
// import { parsePhoneNumber } from "libphonenumber-js";
import parsePhoneNumberFromString, {
  parsePhoneNumber,
} from "libphonenumber-js";
import { useRouter } from "next/navigation";

// CUSTOM DATA MODEL

// ===========================================================
export default function ProfileEditPageView({ user }) {
  const { token } = useAuth();
  const router = useRouter();
  const [profiledata, SetProfileData] = useState([]);
  const [userProfileImage, setUserProfileImage] = useState("");
  const [loader, setLoader] = useState(false);
  const { addToast } = useToasts();
  // console.log("profiledataprofiledata", profiledata);
  const getProfileData = async () => {
    try {
      const res = await getAPIAuth("user/get-profile", token);
      // console.log("getprofileres", res);
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
  const splitCountryCode = (number) => {
    // Ensure the number includes a '+'
    if (!number.startsWith("+")) {
      number = `+${number}`;
    }
    console.log("Input number:", number); // Log the input number

    try {
      const phoneNumber = parsePhoneNumberFromString(number);
      console.log("Parsed phone number:", phoneNumber); // Log the parsed phone number
      if (phoneNumber) {
        return {
          countryCode: phoneNumber.countryCallingCode,
          phoneNumber: phoneNumber.nationalNumber,
        };
      }
    } catch (error) {
      console.error("Error parsing phone number:", error.message);
    }

    return {
      countryCode: "",
      phoneNumber: number,
    };
  };
  const handleFormSubmit = async (values, resetForm) => {
    // console.log(values , "valuesvaluesvaluesvalues");
    const { countryCode, phoneNumber } = splitCountryCode(values.number);
    console.log(countryCode, phoneNumber);



    try {
      const param = {
        dob: `${values.birth_date}`,
        name: `${values.first_name}`,
        email: `${values.email}`,
        mobile: `${phoneNumber}`,
        phone_code: `+${countryCode}`,
        profession: `${values.profession}`,
        gender: values.gender,
        country_id: values.country._id,
        state_id: values.state._id,
        city_id: values.city._id,
      };

      const res = await postAPIAuth("user/update-profile", param, token);
      // console.log("sjjssjjsjsress", res);
      if ((res.status = 200)) {
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
        resetForm();
        router.push("/profile");
      }
    } catch (error) {
      console.log("errorr", error);
      addToast(error?.response?.data?.message, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  //

  useEffect(() => {
    const uploadProfileImage = async () => {
      if (userProfileImage) {
        const formData = new FormData();
        formData.append("profileImage", userProfileImage);

        try {
          setLoader(true);
          const res = await postAPIFormData(
            "user/upload-profile-image",
            formData,
            token
          );

          console.log("resresresres", res);
          if (res.status === 200) {
            addToast(res?.data?.message, {
              appearance: "success",
              autoDismiss: true,
            });
            getProfileData();
            // Handle success actions
          }
        } catch (error) {
          console.log("Error uploading image", error);
          setLoader(false);
          // Handle error actions
        } finally {
          setLoader(false);
        }
      }
    };

    uploadProfileImage();
  }, [userProfileImage]);
  //
  return (
    <Fragment>
      {/* TITLE HEADER AREA */}
      <DashboardHeader
        Icon={Person}
        href="/profile"
        title="Edit Profile"
        buttonText="Back to Profile"
      />

      <Card
        sx={{
          p: 3,
          overflow: "visible",
        }}
      >
        {/* USER PROFILE PIC */}
        <ProfilePicUpload
          setUserProfileImage={setUserProfileImage}
          profiledata={profiledata}
          loader={loader}
        />

        {/* PROFILE EDITOR FORM */}
        <ProfileEditForm
          user={profiledata}
          handleFormSubmit={handleFormSubmit}
        />
      </Card>
    </Fragment>
  );
}
