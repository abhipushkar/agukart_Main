import Link from "next/link";
import MenuItem from "@mui/material/MenuItem"; 
// STYLED COMPONENT

import { SearchResultCard } from "../styles"; 
// ==============================================================


// ==============================================================
export default function SearchResult({
  productList
})
{
  console.log({productList}, "banda jeeta tha");
  return <SearchResultCard elevation={2}>
      {
        productList.map(item => 
          <Link href={item.source == "category"?`/products-categories/search/${item.slug}?title=${item.title}&_id=${item._id}`:`/product?slug=${item.slug}&title=${item.title}&id=${item._id}`}>
            <MenuItem key={item._id}>{   item.title.replace(/<[^>]*>/g, "")  }</MenuItem>
          </Link>
        )
      }
    </SearchResultCard>;
}