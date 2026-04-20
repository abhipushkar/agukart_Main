import Link from "next/link";
import ChevronRight from "@mui/icons-material/ChevronRight";
import useMyProvider from "hooks/useMyProvider";
// STYLED COMPONENT

import { Wrapper } from "./styles";
// =============================================================

// =============================================================
export default function CategoryListItem(props) {
  const { title, subcategorySlug, _id, originalSlug } = props;
  return (
    <Wrapper>
      <Link
        href={{
          pathname: `/category/${subcategorySlug}`,
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
