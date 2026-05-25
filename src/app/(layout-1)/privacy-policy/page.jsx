import React from "react";
import PrivacyPolicy from "components/privacy-policy/PrivacyPolicy";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-informations`,
      {
        type: "Privacy Policy",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Privacy Policy - ${data?.meta_title || "Privacy Policy"}`,
      description: data?.meta_description || "",
      keywords: data?.meta_keywords || [],
    };
  } catch (error) {
    console.log(error);

    return {
      title: "Privacy Policy",
    };
  }
}

const page = () => {
  return <PrivacyPolicy />;
};

export default page;