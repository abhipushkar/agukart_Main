import TermsConditon from "components/terms-conditon/TermsConditon";
import React from "react";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-informations`,
      {
        type: "Terms & Conditions",
      }
    );

    const data = res?.data?.information;

    return {
      title: `Terms & Condition - ${data?.meta_title || "Terms & Condition"}`,
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
      title: "Terms & Condition",
    };
  }
}

const page = () => {
  return <TermsConditon />;
};

export default page;