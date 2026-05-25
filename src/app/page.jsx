import MarketOnePageView from "pages-sections/market-1/page-view";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

export async function generateMetadata() {
  try {
    const res = await axios.get(
      `${baseURL}/get-deals`
    );

    const data = res?.data?.data || res?.data;

    return {
      title: `Agukart - ${data?.meta_title || "Agukart"}`,
      description: data?.meta_description || "",
      keywords: data?.meta_keywords || [],
      authors: [
        {
          name: "Agukart",
          url: "https://agukart.com",
        },
      ],
      creator: "Agukart",
      publisher: "Agukart",
    };
  } catch (error) {
    console.log(error);

    return {
      title: "Agukart",
    };
  }
}

export default async function MarketOne() {
  return <MarketOnePageView />;
}