import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// LOCAL CUSTOM COMPONENTS
import SearchResult from "./components/search-result";
import CategoryDropdown from "./components/category-dropdown";

// LOCAL CUSTOM HOOKS
import useSearch from "./hooks/use-search";

// CUSTOM ICON COMPONENT
import Search from "icons/Search";

import { getAPIAuth } from "utils/__api__/ApiServies";

export default function SearchInputWithCategory() {
  const {
    categoryTitle,
    parentRef,
    resultList,
    handleCategoryChange,
    handleSearch,
    catId,
  } = useSearch();

  const searchParams = useSearchParams();
  const search = searchParams.get("q");

  const pathname = usePathname();
  const router = useRouter();

  const [cat, setCat] = useState([]);
  const [productList, setProductList] = useState([]);
  const [searchTerms, setSearchTerms] = useState(search || "");
  const [isFocused, setIsFocused] = useState(false);

  // Search states
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);


  const getCategories = async () => {
    try {
      const res = await getAPIAuth("get-category");

      if (res.status === 200) {
        setCat([
          { title: "All Categories" },
          ...(res?.data?.category || []),
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);



  useEffect(() => {
    setSearchTerms(search || "");
  }, [search]);

  const searchProduct = async (query) => {
    try {
      const res = await getAPIAuth(
        `search-product?q=${encodeURIComponent(query)}`
      );

      if (res.status === 200) {
        setProductList(res?.data?.data || []);
      } else {
        setProductList([]);
      }
    } catch (error) {
      console.log(error);
      setProductList([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };


  const debouncedSearch = useRef(
    debounce((query) => {
      searchProduct(query);
    }, 400)
  );

  // Cleanup debounce when component unmounts
  useEffect(() => {
    return () => {
      debouncedSearch.current.cancel();
    };
  }, []);


  useEffect(() => {
    const trimmed = searchTerms.trim();

    // Don't search for empty or very short queries
    if (!trimmed || trimmed.length < 2) {
      debouncedSearch.current.cancel();

      setProductList([]);
      setIsSearching(false);
      setHasSearched(false);

      return;
    }

    // User has entered a valid search query
    setIsSearching(true);
    setHasSearched(false);

    // Wait 300ms before calling API
    debouncedSearch.current(trimmed);

    return () => {
      debouncedSearch.current.cancel();
    };
  }, [searchTerms]);


  const navigateSearch = () => {
    const trimmed = searchTerms?.trim();

    // Empty search
    if (!trimmed) {
      setProductList([]);
      setIsFocused(false);
      router.push("/");
      return;
    }

    // Prevent extremely short searches
    if (trimmed.length < 2) {
      return;
    }
    setIsFocused(false);

    router.push(
      `/search-product-list?q=${encodeURIComponent(trimmed)}`
    );
  };

  const handleKeyDown = (event) => {
    // Escape → close suggestions
    if (event.key === "Escape") {
      setIsFocused(false);
      return;
    }

    // Enter → full search
    if (event.key === "Enter") {
      event.preventDefault();

      setIsFocused(false);
      navigateSearch();
    }
  };

  const handleClick = () => {
    navigateSearch();
  };

  const INPUT_PROPS = {
    sx: {
      border: 0,
      height: { xs: 30, md: 36 },
      padding: 0,
      overflow: "hidden",
      backgroundColor: "grey.200",

      "& .MuiOutlinedInput-notchedOutline": {
        border: 0,
      },
    },

    // If you want the category dropdown back later:
    //
    // startAdornment: (
    //   <Box display="flex" alignItems="center">
    //     <CategoryDropdown
    //       cat={cat}
    //       title={categoryTitle}
    //       handleChange={handleCategoryChange}
    //     />
    //   </Box>
    // ),

    endAdornment: (
      <Box
        px={2}
        display="grid"
        alignItems="center"
        justifyContent="center"
        backgroundColor="#2b3445"
        height="100%"
        sx={{ cursor: "pointer" }}
        onClick={handleClick}
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


  useEffect(() => {
    const trimmed = search?.trim();

    // If user manually clears query from URL
    if (
      pathname === "/search-product-list" &&
      (!trimmed || trimmed.length < 2)
    ) {
      router.replace("/");
    }
  }, [search, pathname, router]);


  const trimmedSearch = searchTerms.trim();

  const shouldShowDropdown = isFocused && trimmedSearch.length >= 2;

  return (
    <Box
      position="relative"
      flex="1 1 0"
      maxWidth="670px"
      mx="auto"
      ref={parentRef}
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={(e) => {
        // Hide only when focus leaves the entire search component
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
        }
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Searching for..."
        value={searchTerms}
        onChange={(e) => {
          setSearchTerms(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onClick={() => setIsFocused(true)}
        InputProps={INPUT_PROPS}
      />


      {shouldShowDropdown && (
        <>

          {/* RESULTS */}
          {productList.length > 0 && (
            <SearchResult productList={productList} isSearching={isSearching} />
          )}


        </>
      )}
    </Box>
  );
}