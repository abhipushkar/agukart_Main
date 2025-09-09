import { Fragment } from "react"; 
// GLOBAL CUSTOM COMPONENTS

import Setting from "components/settings"; 
// LOCAL CUSTOM COMPONENTS

import Section2 from "../section-2"; 
// API FUNCTIONS

import api from "utils/__api__/gadget-3"; 
// ==============================================================


// ==============================================================
export default async function GadgetThreeCategoriesPageView({
  slug
}) {
  const [products, breadcrumb] = await Promise.all([api.getAllProductsBySlug(), api.getBreadcrumb(slug)]);
  return <Fragment>
      {
      /* ALL PRODUCTS */
    }
      <Section2 products={products} breadcrumb={breadcrumb} />

      {
      /* SETTINGS IS USED ONLY FOR DEMO, YOU CAN REMOVE THIS */
    }
      <Setting />
    </Fragment>;
}