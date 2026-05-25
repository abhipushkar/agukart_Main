import Affiliate from "components/affiliate/Affiliate";
import React from "react";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-description`,
      {
        type: "Affiliate",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Become a Affiliate - ${data?.meta_title || "Become a Affiliate"}`,
      description: data?.meta_description || "",
      keywords: data?.meta_keywords || [],
      authors: [
        {
          name: "UI-LIB",
          url: "https://ui-lib.com",
        },
      ],
    };
  } catch (error) {
    console.log(error);

    return {
      title: "Become a Affiliate",
    };
  }
}

const page = () => {
  return <Affiliate />;
};

export default page;