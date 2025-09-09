import Link from "next/link";
import { H3 } from "components/Typography"; 
// ==============================================================


// ==============================================================
export default function ProductTitle({
  pathname,
  title,
  vendorSlug,
  product_id
}) {
  return <Link href={pathname=="/profile/follow-shop"?`/store/${vendorSlug}`:`/products?id=${product_id}`}>
      <H3 mb={1} ellipsis title={title} fontSize={14} fontWeight={600} className="title" color="text.secondary">
        {title}
      </H3>
    </Link>;
}