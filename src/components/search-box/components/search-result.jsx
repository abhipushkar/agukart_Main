import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";

import { SearchResultCard } from "../styles";

export default function SearchResult({
  productList = [],
  isSearching,
  searchTerm,
}) {

  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const normalizeSearch = (value = "") => value.trim().replace(/\s+/g, " ").toLowerCase();
  const isSameAsUrlQuery = normalizeSearch(searchTerm) === normalizeSearch(urlQuery);

  const getUrl = (item) => {
    switch (item.source) {
      case "category":
        return `/category/${item.fullSlug}`;
      case "product":
        return `/product/${item.slug}/${item.product_code}`;
      case "shop":
        return `/store/${item.slug}`;
      case "adminCategory":
        return `/${item.fullSlug}`;
      case "brand":
        return item.link;
      default:
        return "/";
    }
  };

  // ------------------------------------------------------------
  // REMOVE HTML FROM TITLE
  // ------------------------------------------------------------

  const cleanTitle = (title = "") => {
    return title
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&");
  };

  // ------------------------------------------------------------
  // HIGHLIGHT SEARCH TERM
  // ------------------------------------------------------------

  const highlightMatch = (title = "") => {
    const cleanedTitle = cleanTitle(title);
    const query = searchTerm?.trim();

    if (!query) {
      return cleanedTitle;
    }

    const queryWords = query
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      );

    if (!queryWords.length) {
      return cleanedTitle;
    }

    const regex = new RegExp(
      `(${queryWords.join("|")})`,
      "gi"
    );

    return cleanedTitle.split(regex).map((part, index) => {
      const isMatch = queryWords.some((word) =>
        part.toLowerCase().includes(word.toLowerCase())
      );

      if (isMatch) {
        return (
          <strong key={index}>
            {part}
          </strong>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    });
  };


  // ------------------------------------------------------------
  // NO RESULTS
  // ------------------------------------------------------------

  if (!productList.length) {
    return !isSameAsUrlQuery ? (
      <SearchResultCard elevation={2}>
        <MenuItem>
          <Typography
            color="GrayText"
            textAlign="center"
            width="100%"
          >
            No results found for "{searchTerm}"
          </Typography>
        </MenuItem>
      </SearchResultCard>
    ) : null;
  }

  // ------------------------------------------------------------
  // RESULTS
  // ------------------------------------------------------------

  return (
    <SearchResultCard elevation={2}>
      {productList.map((item) => (
        <Link
          key={item._id}
          href={getUrl(item)}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <MenuItem>
            <Typography
              noWrap
              sx={{
                width: "100%",
              }}
            >
              {highlightMatch(item.title)}
            </Typography>
          </MenuItem>
        </Link>
      ))}
    </SearchResultCard>
  );
}