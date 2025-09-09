import IconButton from "@mui/material/IconButton"; 
// MUI ICON COMPONENTS

import Favorite from "@mui/icons-material/Favorite";
import RemoveRedEye from "@mui/icons-material/RemoveRedEye";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder"; 
// STYLED COMPONENTS

import { HoverIconWrapper } from "../styles"; 
import { getAPIAuth } from "utils/__api__/ApiServies";
// ==============================================================


// ==============================================================
export default function HoverActions({
  isFavorite,
  toggleFavorite,
  product_id,
  toggleView,
  getWishlistProduct
}) {
 const  removeWishlist  = async  () =>{
  try {
    const res = await getAPIAuth(`user/add-delete-wishlist/${product_id}`)
    if(res.status === 200){
      getWishlistProduct()
    }
  } catch (error) {
    console.log(error)
  }
 }
  return <HoverIconWrapper className="hover-box">
      <IconButton onClick={toggleView}>
        <RemoveRedEye color="disabled" fontSize="small" />
      </IconButton>

      <IconButton  onClick={ () => removeWishlist(product_id) }  >
         <Favorite color="primary" fontSize="small" /> 
      </IconButton>
{/* 
      <IconButton onClick={toggleFavorite}>
        {isFavorite ? <Favorite color="primary" fontSize="small" /> : <FavoriteBorder fontSize="small" color="disabled" />}
      </IconButton> */}
    </HoverIconWrapper>;
}