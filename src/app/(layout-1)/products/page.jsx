
import axios from "axios";
import { notFound } from "next/navigation";
import Link from "next/link";
import MenuItem from '@mui/material/MenuItem';
import { H4, Small } from "components/Typography";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { CardContent, CardMedia, Typography, Button } from '@mui/material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import NextLink from 'next/link';




// PAGE VIEW COMPONENT

import { ProductDetailsPageView } from "pages-sections/product-details/page-view";
import { getAPI } from "utils/__api__/ApiServies";
// API FUNCTIONS

import api from "utils/__api__/products";
import { getFrequentlyBought, getRelatedProducts } from "utils/__api__/related-products";
import { WidthFull } from "@mui/icons-material";
import MyproductDetails from "pages-sections/product-details/page-view/MyproductDetails";
export const metadata = {
  title: "Product Details - Agukart Next.js E-commerce Template",
  description: `Agukart is a React Next.js E-commerce template. Build SEO friendly Online store, delivery app and Multi vendor store`,
  authors: [{
    name: "UI-LIB",
    url: "https://ui-lib.com"
  }],
  keywords: ["e-commerce", "e-commerce template", "next.js", "react"]
};
export default async function ProductDetails() {
  try {
    // const product = await api.getProduct(params.slug);
    // const product = await api.getMyProduct(`get-productById?productId=${params.slug}`);
    const relatedProducts = await getRelatedProducts();
    const frequentlyBought = await getFrequentlyBought();
    return (
      // <>
      //   <Breadcrumbs pt={2} sx={{display:'flex',justifyContent:'center'}}
      //     separator={<ChevronRightIcon fontSize="small" />}
      //     aria-label="breadcrumb"
      //   >
      //     <Link  component={NextLink} href="/" color="inherit">
      //       Homepage
      //     </Link>
      //     <Link  component={NextLink} href="/category" color="inherit">
      //       jewelry
      //     </Link>
      //     <Typography  color="text.primary">Neckless</Typography>
      //   </Breadcrumbs>
      //   <Container py={5} sx={{ padding: '30px 0' }}>
      //     <Grid container spacing={4}>
      //       <Grid item lg={6} xs={12}>
      //         <img
      //           alt="Remy Sharp"
      //           src="https://i.etsystatic.com/ij/2c2290/6058155340/ij_300x300.6058155340_7k4scq0k.jpg?version=0"
      //           style={{ width: '100%' }}
      //         />
      //       </Grid>
      //       <Grid item lg={6} xs={12}>
      //         <CardContent>
      //           <Typography variant="span" sx={{ color: '#5454f5', fontSize: '15px', borderBottom: '2px dashed #5454f5' }}>Visit the Boho-Magic Store</Typography>
      //           <Typography variant="h5" pt={1} sx={{ color: '#8b8b8b', fontWeight: '500' }}>Coquette Halloween Velveteen Plush Blanket | Pink Pumpkin Fall Home Decor | Cozy Autumn Dorm Room Bedding | Cute Halloween Throw Blanket</Typography>
      //           <Typography component="div" pt={1} sx={{ display: 'flex', alignItems: 'center' }}>
      //             <Typography variant="span" pr={1} sx={{ fontSize: '18px', color: '#000' }}>
      //               4.1
      //             </Typography>
      //             <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
      //               <svg stroke="currentColor" fill="#ecbf2c" stroke-width="0" viewBox="0 0 576 512" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
      //               <svg stroke="currentColor" fill="#ecbf2c" stroke-width="0" viewBox="0 0 576 512" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
      //               <svg stroke="currentColor" fill="#ecbf2c" stroke-width="0" viewBox="0 0 576 512" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
      //               <svg stroke="currentColor" fill="#ecbf2c" stroke-width="0" viewBox="0 0 576 512" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
      //               <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 576 512" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z"></path></svg>
      //             </Typography>
      //             <Typography variant="span" pl={2} sx={{ fontSize: '18px', fontWeight: '600', color: '#32888a' }}>
      //               167 ratings
      //             </Typography>
      //           </Typography>
      //           <Typography component="div" pt={1} pb={2} sx={{ display: 'flex', alignItems: 'center' }}>
      //             <svg stroke="currentColor" fill="#0f3460" stroke-width="0" viewBox="0 0 512 512" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M256 32c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128S326.7 32 256 32zm0 208c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80zM193.7 307.4c-19.1-8.1-36.2-19.6-50.8-34.3-1.4-1.4-2.8-2.8-4.1-4.3L64 400h96l48 80 48-105.8 25.5-56.2c-8.4 1.3-16.9 2-25.5 2-21.6 0-42.5-4.2-62.3-12.6zM373.3 268.9c-1.3 1.4-2.7 2.9-4.1 4.3-14.6 14.6-31.7 26.2-50.7 34.2L294 361.2l-21.9 48.4L304 480l48-80h96l-74.7-131.1z"></path></svg>
      //             <Typography variant="span" ml={1} sx={{ fontSize: '15px', fontWeight: '600', color: '#32888a', borderBottom: '2px dashed #5454f5' }}>
      //               Bestsellers in Brands
      //             </Typography>
      //           </Typography>
      //           <Typography component="div">
      //             <Typography variant="span" sx={{ fontSize: '17px', fontWeight: '600', color: '#32888a' }}>
      //               <Typography variant="span" mr={1} sx={{ fontSize: '16px', background: '#6cc26c', borderRadius: '25px', color: '#000', padding: '6px 12px', fontWeight: '500' }}>60% off</Typography>    for the next 8 hours
      //             </Typography>
      //           </Typography>
      //           <Typography component="div" pt={2} sx={{ display: 'flex', alignItems: 'center' }}>
      //             <Typography component="div" sx={{ fontSize: '31px', fontWeight: '600', color: '#20538f' }}>$34.99+   <Small sx={{ fontSize: '17px', fontWeight: '600', color: 'gray' }} component="del" >$69.67+</Small></Typography>
      //             <Typography component="div" ml={3} sx={{ fontSize: '17px', fontWeight: '600', color: '#bc1111' }}>Only 2 left in stock</Typography>
      //           </Typography>

      //           <Typography pt={2} container spacing={2} component="div" sx={{ display: 'flex', alignItems: 'center' }}>
      //             <Grid item lg={2} md={3} xs={12} variant="span" mr={2} sx={{ color: '#827979', fontSize: '18px' }}>
      //               Color:
      //             </Grid>
      //             <Grid item lg={10} md={9} xs={12}>
      //               <FormControl sx={{ width: '150px' }}>
      //                 <Select sx={{ border: 'none', background: '#dedddd', height: '35px' }}>
      //                   <MenuItem value={10}>Rainbow Monster</MenuItem>
      //                   <MenuItem value={20}>Twenty</MenuItem>
      //                   <MenuItem value={30}>Thirty</MenuItem>
      //                 </Select>
      //               </FormControl>
      //             </Grid>
      //           </Typography>
      //           <Typography pt={2} container spacing={2} component="div" sx={{ display: 'flex', alignItems: 'center' }}>
      //             <Grid item lg={2} md={3} xs={12} variant="span" mr={2} sx={{ color: '#827979', fontSize: '18px' }}>
      //               Gem Type:
      //             </Grid>
      //             <Grid item lg={10} md={9} xs={12}>
      //               <FormControl sx={{ width: '150px' }}>
      //                 <Select sx={{ border: 'none', background: '#dedddd', height: '35px' }}>
      //                   <MenuItem value={10}>Rainbow Monster</MenuItem>
      //                   <MenuItem value={20}>Twenty</MenuItem>
      //                   <MenuItem value={30}>Thirty</MenuItem>
      //                 </Select>
      //               </FormControl>
      //             </Grid>
      //           </Typography>
      //           <Typography pt={2} container spacing={2} component="div" sx={{ display: 'flex', alignItems: 'center' }}>
      //             <Grid item lg={2} md={3} xs={12} variant="span" mr={2} sx={{ color: '#827979', fontSize: '18px' }}>
      //               Ring Size:
      //             </Grid>
      //             <Grid item lg={10} md={9} xs={12}>
      //               <FormControl sx={{ width: '150px' }}>
      //                 <Select sx={{ border: 'none', background: '#dedddd', height: '35px' }}>
      //                   <MenuItem value={10}>Rainbow Monster</MenuItem>
      //                   <MenuItem value={20}>Twenty</MenuItem>
      //                   <MenuItem value={30}>Thirty</MenuItem>
      //                 </Select>
      //               </FormControl>
      //             </Grid>
      //           </Typography>
      //           <Typography pt={2} component="div">
      //             <Typography component="div" pb={1} sx={{ fontSize: '18px', fontWeight: '600', color: 'gray' }}>Customizable</Typography>
      //             <Button variant="contained" sx={{ background: '#f6bc3b', fontSize: '17px', borderRadius: '25px' }}>Customize</Button>
      //           </Typography>

      //           <Typography pt={2} component="div">
      //             <FormControl sx={{ width: '300px' }}>
      //               <Select sx={{ border: 'none', background: '#dedddd', height: '35px' }}>
      //                 <MenuItem value={10}>Rainbow Monster</MenuItem>
      //                 <MenuItem value={20}>Twenty</MenuItem>
      //                 <MenuItem value={30}>Thirty</MenuItem>
      //               </Select>
      //             </FormControl>
      //           </Typography>
      //           <Typography pt={3} component="div">
      //             <Button variant="contained" sx={{ background: '#f6bc3b', padding: '6px 50px', marginRight: '8px', fontSize: '15px', borderRadius: '25px' }}>Add to Cart</Button>
      //             <Button variant="contained" sx={{ background: '#ffdc4d', padding: '6px 50px', fontSize: '15px', borderRadius: '25px' }}>Buy Now</Button>
      //           </Typography>
      //         </CardContent>
      //       </Grid>
      //     </Grid>
      //   </Container>



      // </>
        <MyproductDetails/>
    )
    // <ProductDetailsPageView  slug = {params.slug} relatedProducts={relatedProducts} frequentlyBought={frequentlyBought} />;
  } catch (error) {
    // notFound();
  }





}