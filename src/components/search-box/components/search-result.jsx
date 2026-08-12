import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
// STYLED COMPONENT

import { SearchResultCard } from "../styles";
import Typography from '@mui/material/Typography'
// ==============================================================


// ==============================================================
export default function SearchResult({
  productList,
  isSearching
}) {
  const getUrl = (item) => {
    const source = item.source;

    switch (source) {
      case "category":
        return `/category/${item.fullSlug}`;
      case "product":
        return `/product/${item.slug}/${item.product_code}`;
      case "shop":
        return `/store/${item.slug}`;
      case "adminCategory":
        return `/${item.fullSlug}`;
      case "brand":
        return item.link;
      default:
        return "/";
    }
  };
  return <SearchResultCard elevation={2}>
    {isSearching ? (
      <MenuItem >
        <Typography color={'GrayText'} textAlign={'center'}>
          searching...
        </Typography>
      </MenuItem>
    ) : (
      productList.map(item =>
        <Link key={item._id} href={getUrl(item)}>
          <MenuItem key={item._id}><Typography noWrap sx={{ width: "100%" }}>{item.title.replace(/<[^>]*>/g, "").replace("&amp;", "&")}</Typography></MenuItem>
        </Link>
      )
    )
    }
  </SearchResultCard>;
}