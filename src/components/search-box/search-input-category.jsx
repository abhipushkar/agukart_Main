"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// LOCAL CUSTOM COMPONENTS
import SearchResult from "./components/search-result";

// CUSTOM ICON COMPONENT
import Search from "icons/Search";

import { getAPIAuth } from "utils/__api__/ApiServies";

const normalizeSearch = (value = "") => value.trim().replace(/\s+/g, " ").toLowerCase();

const getSearchResultUrl = (item) => {
  switch (item.source) {
    case "category": return `/category/${item.fullSlug}`;
    case "adminCategory": return `/${item.fullSlug}`;
    case "product": return `/product/${item.slug}/${item.product_code}`;
    case "shop": return `/store/${item.slug}`;
    case "brand": return item.link;
    default: return "/";
  }
};

const getExactCategoryMatch = (query, results = []) => {
  const normalizedQuery = normalizeSearch(query);

  return results.find(
    (item) =>
      (item.source === "category" ||
        item.source === "adminCategory") &&
      normalizeSearch(item.title) === normalizedQuery
  );
};

export default function SearchInputWithCategory() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q");

  const pathname = usePathname();
  const router = useRouter();

  const parentRef = useRef(null);

  // ------------------------------------------------------------
  // STATE
  // ------------------------------------------------------------

  const [productList, setProductList] = useState([]);
  const [searchTerms, setSearchTerms] = useState(search || "");

  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Used to invalidate old API requests
  const searchRequestId = useRef(0);

  // Used to prevent reopening dropdown during navigation
  const isNavigating = useRef(false);

  // ------------------------------------------------------------
  // KEEP INPUT IN SYNC WITH URL
  // ------------------------------------------------------------

  useEffect(() => {
    setSearchTerms(search || "");
  }, [search]);

  // ------------------------------------------------------------
  // SEARCH API
  // ------------------------------------------------------------

  const searchProduct = useCallback(async (query) => {
    const requestId = ++searchRequestId.current;

    try {
      const res = await getAPIAuth(
        `search-product?q=${encodeURIComponent(query)}`
      );

      // Ignore response from an old request
      if (requestId !== searchRequestId.current) {
        return;
      }

      if (res.status === 200) {
        setProductList(res?.data?.data || []);
      } else {
        setProductList([]);
      }
    } catch (error) {
      // Ignore stale request errors
      if (requestId !== searchRequestId.current) {
        return;
      }

      console.error("Search error:", error);
      setProductList([]);
    } finally {
      if (requestId === searchRequestId.current) {
        setIsSearching(false);
      }
    }
  }, []);

  // ------------------------------------------------------------
  // DEBOUNCED SEARCH
  // ------------------------------------------------------------

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        searchProduct(query);
      }, 300),
    [searchProduct]
  );

  // Cleanup debounce
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      searchRequestId.current++;
    };
  }, [debouncedSearch]);

  // ------------------------------------------------------------
  // SEARCH WHEN USER TYPES
  // ------------------------------------------------------------

  useEffect(() => {
    const trimmed = searchTerms.trim();

    // Cancel previous debounce
    debouncedSearch.cancel();

    // Empty / too short
    if (!trimmed || trimmed.length < 2) {
      searchRequestId.current++;

      setProductList([]);
      setIsSearching(false);

      return;
    }

    // If we're currently navigating, don't start another search
    if (isNavigating.current) {
      return;
    }

    // Start loading state immediately
    setIsSearching(true);

    // Debounce API request
    debouncedSearch(trimmed);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerms, debouncedSearch]);

  // ------------------------------------------------------------
  // CLOSE DROPDOWN
  // ------------------------------------------------------------

  const closeDropdown = useCallback(() => {
    // Cancel debounce
    debouncedSearch.cancel();

    // Invalidate currently running request
    searchRequestId.current++;

    setIsFocused(false);
    setProductList([]);
    setIsSearching(false);
  }, [debouncedSearch]);

  // ------------------------------------------------------------
  // NAVIGATE TO FULL SEARCH
  // ------------------------------------------------------------

  const navigateSearch = useCallback(() => {
    const trimmed = searchTerms.trim();

    if (!trimmed) {
      closeDropdown();
      router.push("/");
      return;
    }

    if (trimmed.length < 2) {
      return;
    }

    const matchedCategory = getExactCategoryMatch(
      trimmed,
      productList
    );

    isNavigating.current = true;
    closeDropdown();

    if (matchedCategory) {
      router.push(getSearchResultUrl(matchedCategory));
      return;
    }

    // change this section as only common query should be carried forward
    if (pathname === "/search-product-list") {
      const currentSearch = searchParams.get("q") || "";
      const currentSort = searchParams.get("sortBy");
      if (normalizeSearch(currentSearch) !== normalizeSearch(trimmed)) {
        router.push(
          `/search-product-list?q=${encodeURIComponent(trimmed)}${currentSort ? ("&sortBy="+currentSort) : ""}`
        );
      } else {
        router.push(`/search-product-list?${searchParams.toString()}`);
      }

      return;
    }
    router.push(`/search-product-list?q=${encodeURIComponent(trimmed)}`);

  }, [
    searchTerms,
    productList,
    closeDropdown,
    router,
    searchParams,
    pathname,
  ]);

  // ------------------------------------------------------------
  // KEYBOARD HANDLING
  // ------------------------------------------------------------

  const handleKeyDown = (event) => {
    // ESC
    if (event.key === "Escape") {
      event.preventDefault();

      closeDropdown();

      return;
    }

    // ENTER
    if (event.key === "Enter") {
      event.preventDefault();

      navigateSearch();
    }
  };

  // ------------------------------------------------------------
  // SEARCH BUTTON
  // ------------------------------------------------------------

  const handleSearchClick = (event) => {
    event.preventDefault();

    navigateSearch();
  };

  // ------------------------------------------------------------
  // FOCUS HANDLING
  // ------------------------------------------------------------

  const handleFocus = () => {
    // If navigation just happened, allow URL/state updates
    // to finish before allowing dropdown again.
    if (isNavigating.current) {
      return;
    }

    setIsFocused(true);
  };

  // ------------------------------------------------------------
  // BLUR HANDLING
  // ------------------------------------------------------------

  const handleBlur = (event) => {
    const nextFocusedElement = event.relatedTarget;

    // If focus moved somewhere inside the search component,
    // don't close the dropdown.
    if (
      nextFocusedElement &&
      parentRef.current?.contains(nextFocusedElement)
    ) {
      return;
    }

    setIsFocused(false);
  };

  // ------------------------------------------------------------
  // RESET NAVIGATION LOCK AFTER ROUTE CHANGES
  // ------------------------------------------------------------

  useEffect(() => {
    // Route has changed.
    // Allow the navbar search to work normally again.
    isNavigating.current = false;
  }, [pathname, search]);

  // ------------------------------------------------------------
  // CLEAR SEARCH RESULTS WHEN INPUT IS CLEARED
  // ------------------------------------------------------------

  const trimmedSearch = searchTerms.trim();

  const hasValidSearch = trimmedSearch.length >= 2;


  const shouldShowDropdown = isFocused && hasValidSearch && !isNavigating.current;


  const INPUT_PROPS = {
    sx: {
      border: 0,
      height: {
        xs: 30,
        md: 36,
      },
      padding: 0,
      overflow: "hidden",
      backgroundColor: "grey.200",

      "& .MuiOutlinedInput-notchedOutline": {
        border: 0,
      },
    },

    endAdornment: (
      <Box
        px={2}
        display="grid"
        alignItems="center"
        justifyContent="center"
        backgroundColor="#2b3445"
        height="100%"
        sx={{
          cursor: "pointer",
          flexShrink: 0,
        }}
        onMouseDown={(event) => {
          // Prevent TextField blur from firing before
          // our click handler gets a chance to navigate.
          event.preventDefault();
        }}
        onClick={handleSearchClick}
      >
        <Search
          sx={{
            fontSize: 17,
            color: "#fff",
            cursor: "pointer",
          }}
        />
      </Box>
    ),
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <Box
      position="relative"
      flex="1 1 0"
      maxWidth="670px"
      mx="auto"
      ref={parentRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Searching for..."
        value={searchTerms}
        onChange={(event) => {
          const value = event.target.value;

          // User started typing again, so allow dropdown
          // even if a previous navigation happened.
          isNavigating.current = false;

          setSearchTerms(value);
        }}
        onKeyDown={handleKeyDown}
        onClick={() => {
          if (!isNavigating.current) {
            setIsFocused(true);
          }
        }}
        InputProps={INPUT_PROPS}
      />

      {/* -------------------------------------------------------
          SEARCH SUGGESTIONS
      -------------------------------------------------------- */}

      {shouldShowDropdown && (
        <SearchResult
          productList={productList}
          isSearching={isSearching}
          searchTerm={trimmedSearch}
        />
      )}
    </Box>
  );
}