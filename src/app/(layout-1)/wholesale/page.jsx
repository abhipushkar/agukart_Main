import WholeSale from "components/wholesale/Wholesale";
import React from "react";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-description`,
      {
        type: "Wholesale",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Wholesale - ${data?.meta_title || "Wholesale"}`,
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
      title: "Wholesale",
    };
  }
}

const page = () => {
  return <WholeSale />;
};

export default page;