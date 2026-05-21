import TopStores from "components/topStores/TopStores";
import React from "react";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-description`,
      {
        type: "Our Top Store",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Our Top Stores - ${data?.meta_title || "Our Top Stores"}`,
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
      title: "Our Top Stores",
    };
  }
}

const page = () => {
  return <TopStores />;
};

export default page;