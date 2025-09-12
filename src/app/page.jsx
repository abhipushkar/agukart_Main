import MarketOnePageView from "pages-sections/market-1/page-view";
export const metadata = {
  title: "Agukart",
  description: `Agukart is a Online store, delivery app and Multi vendor store platform`,
  authors: [
    {
      name: "Agukart",
      url: "https://agukart.com",
    },
  ],
  creator: "Agukart",
  publisher: "Agukart",
  keywords: ["agukart", "jewellery", "ecommerce", "cheap jewellery", "online store"],
};
export default async function MarketOne() {
  return <MarketOnePageView />;
}
