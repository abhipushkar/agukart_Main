import { cache } from "react";
import axios from "../../utils/axiosInstance"; 
import { getAPIAuth } from "./ApiServies";
// CUSTOM DATA MODEL


// get all product slug
const getSlugs = cache(async () => {
  const response = await axios.get("/api/products/slug-list");
  
  return response.data;



  
}); 
// get product based on slug

const getProduct = cache(async slug => {
  const response = await axios.get("/api/products/slug", {
    params: {
      slug
    }
  });
  return response.data;
}); 

const getMyProduct =   async (url) =>{
try {
 const res = await getAPIAuth(url)
 console.log(res,"ressssssssssssssssssssssssssssss")
  
} catch (error) {
  console.log(error)
}
}
// search products



const searchProducts = cache(async (name, category) => {
  const response = await axios.get("/api/products/search", {
    params: {
      name,
      category
    }
  });
  return response.data;
});
export default {
  getSlugs,
  getProduct,
  searchProducts,
  getMyProduct
};