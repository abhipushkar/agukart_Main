import About from "components/about/About";
import axios from "axios";
import React from "react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.post(
      `${baseURL}/get-description`,
      {
        type: "About Agukart",
      }
    );

    const data = res?.data?.information;


   return {
  title: `About - ${data?.meta_title || "About"}`,
  description: data?.meta_description || "",
  keywords: data?.meta_keywords || [],
};
  } catch (error) {
    console.log(error);

    return {
      title: "About",
    };
  }
}

const page = () => {
  return <About />;
};

export default page;