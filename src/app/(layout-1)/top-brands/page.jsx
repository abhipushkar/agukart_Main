import TopBrands from "components/topBrands/TopBrands";
import React from "react";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-description`,
      {
        type: "Our Top Brands",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Our Top Brands - ${data?.meta_title || "Our Top Brands"}`,
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
      title: "Our Top Brands",
    };
  }
}

const page = () => {
  return <TopBrands />;
};

export default page;