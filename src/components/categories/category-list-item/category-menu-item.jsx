import Link from "next/link";
import ChevronRight from "@mui/icons-material/ChevronRight";
import useMyProvider from "hooks/useMyProvider";
// STYLED COMPONENT

import { Wrapper } from "./styles";
// =============================================================

// =============================================================
export default function CategoryListItem(props) {
  const { title, subcategorySlug, _id } = props;
  return (
    <Wrapper>
      <Link
        href={{
          pathname: `/products-categories/search/${subcategorySlug}`,
          query: { title: title, _id: _id },
        }}
      >
        <div className="category-dropdown-link">
          <span className="title">{title}</span>
        </div>
      </Link>

      {/* {render ? <div className="mega-menu">{render}</div> : null} */}
    </Wrapper>
  );
}
