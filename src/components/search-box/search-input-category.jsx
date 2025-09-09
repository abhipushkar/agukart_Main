import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
// LOCAL CUSTOM COMPONENTS

import SearchResult from "./components/search-result";
import CategoryDropdown from "./components/category-dropdown";
// LOCAL CUSTOM HOOKS

import useSearch from "./hooks/use-search";
// CUSTOM ICON COMPONENT

import Search from "icons/Search";
import { useEffect, useState } from "react";
import { getAPI, getAPIAuth } from "utils/__api__/ApiServies";
import { round } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchInputWithCategory() {
  const {
    categoryTitle,
    parentRef,
    resultList,
    handleCategoryChange,
    handleSearch,
    catId,
  } = useSearch();
  const searchPrams = useSearchParams();
  const search = searchPrams.get("search");
  const router = useRouter();
  const [cat, setCat] = useState([]);
  const [productList, setProductList] = useState([]);
  const [searchTerms, setSearchTerms] = useState(search || "");

  const getCategories = async () => {
    try {
      const res = await getAPIAuth("get-category");
      if (res.status === 200) {
        setCat([{ title: "All Categories" }, ...res?.data?.category]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const searchProduct = async () => {
    try {
      const res = await getAPIAuth(
        `search-product?q=${searchTerms}`
      );
      if (res.status === 200) {
        setProductList(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      router.push(`/search-product-list?q=${searchTerms}`);
    }
  };

  const handleClick = () => {
    router.push(`/search-product-list?q=${searchTerms}`);
  }

  const INPUT_PROPS = {
    sx: {
      border: 0,
      height: 44,
      padding: 0,
      overflow: "hidden",
      backgroundColor: "grey.200",
      "& .MuiOutlinedInput-notchedOutline": {
        border: 0,
      },
    },
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
        onClick={()=>{
          router.push(`/search-product-list?q=${searchTerms}`);
        }}
      >
        <Search sx={{ fontSize: 17, color: "#fff", cursor: "pointer" }} onClick={handleClick}/>
      </Box>
    ),
  };

  useEffect(() => {
    if (searchTerms) {
      searchProduct();
    }else{
      setProductList([])
    }
  }, [searchTerms]);
  return (
    <Box
      position="relative"
      flex="1 1 0"
      maxWidth="670px"
      mx="auto"
      ref={parentRef}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Searching for..."
        value={searchTerms}
        onChange={(e) => setSearchTerms(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={INPUT_PROPS}
      />

      {/* SHOW SEARCH RESULT LIST */}
      {productList.length > 0 ? (
        <SearchResult productList={productList}/>
      ) : null}
    </Box>
  );
}
