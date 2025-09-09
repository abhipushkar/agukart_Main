"use client";

import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
import { H3 } from "components/Typography";
export default function ProductDescription({product}) {
  return <div>
      <H3 mb={2}>Specification:</H3>
        <HtmlRenderer html={ product?.description || ""} />
    </div>;
}