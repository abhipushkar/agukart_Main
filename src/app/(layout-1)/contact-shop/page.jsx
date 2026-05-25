import ContactShop from "components/contactShop/ContactShop";
import React from "react";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-description`,
      {
        type: "Contact Shop",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Contact Shop - ${data?.meta_title || "Contact Shop"}`,
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
      title: "Contact Shop",
    };
  }
}

const page = () => {
  return <ContactShop />;
};

export default page;