import Grid from "@mui/material/Grid"; 
// GLOBAL CUSTOM COMPONENTS

import { Paragraph } from "components/Typography";
import ProductCard15 from "components/product-cards/product-card-15"; 
// CUSTOM DATA MODEL


// ==============================================================
export default async function Section2({
  products,
  breadcrumb = "All Products"
}) {
  return <div className="mb-4">
      <Paragraph fontSize={18} fontWeight={600} mb={3}>
        {breadcrumb}
      </Paragraph>

      <Grid container spacing={4}>
        {products.map(product => <Grid item lg={4} sm={6} xs={12} key={product.id}>
            <ProductCard15 product={product} />
          </Grid>)}
      </Grid>
    </div>;
}