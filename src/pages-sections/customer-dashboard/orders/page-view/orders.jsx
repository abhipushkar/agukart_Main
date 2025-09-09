"use client";

import { Fragment, useEffect, useState } from "react";
import ShoppingBag from "@mui/icons-material/ShoppingBag";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import { H2, H3, H4, H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import Button from "@mui/material/Button";
import OrderRow from "../order-row";
import Pagination from "../../pagination";
import DashboardHeader from "../../dashboard-header";
import { getAPIAuth, postAPI, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Order from "./Order";
// CUSTOM DATA MODEL

const invoices = [
  {
    value: "Invoice",
    label: "Invoice",
  },
];

const orderplace = [
  {
    value: -1,
    label: "All",
  },
  {
    value: 12,
    label: "1 year",
  },
  {
    value: 3,
    label: "3 month",
  },
  {
    value: 2,
    label: "2 month",
  },
  {
    value: 1,
    label: "1 month",
  },
];

const Search = styled("span")(({ theme }) => ({
  position: "relative",
  borderRadius: "4px 0px 0 4px",
  border: "1px solid #000",
  height: "35px",
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  left: "0",
  top: "1px",
}));

// ====================================================
export default function OrdersPageView() {
  const { token } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  console.log(allOrders, "--------------allorders");
  const [baseUrl, setBaseUrl] = useState("");
  const [shopBaseUrl,setShopBaseUrl] = useState("");
  const [filterOrders, setFilterOrders] = useState(3);
  const [totalCount, setTotalCount] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [searchTerms, setSearchTerms] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  const getAllOrders = async (startDate, endDate) => {
    try {
      setShowLoading(true);
      let offset = (page - 1) * 10;
      const res = await getAPIAuth(
        `user/orderList?startDate=${startDate}&endDate=${endDate}&offset=${offset}`,
        token
      );
      console.log(res, "my res ponse is this");
      if (res.status === 200) {
        setBaseUrl(res.data.base_url);
        setShopBaseUrl(res.data.shop_base_url);
        setAllOrders(res.data.sales);
        setTotalCount(res.data.salesCount);
        let roundedNum = Math.ceil(res.data.salesCount / 10);
        setTotalPages(roundedNum);
        setShowLoading(false);
      }
    } catch (error) {
      setShowLoading(false);
      console.log(error);
    } finally {
      setShowLoading(false);
    }
  };

  useEffect(() => {
    function getDateRange(filterOrders) {
      const currentDate = new Date();
      const pastDate = new Date();
      if (filterOrders === -1) {
        pastDate.setFullYear(1970);
      } else if (filterOrders === 12) {
        pastDate.setFullYear(currentDate.getFullYear() - 1);
      } else {
        pastDate.setMonth(currentDate.getMonth() - filterOrders);
      }

      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      return {
        currentDate: formatDate(currentDate),
        pastDate: formatDate(pastDate),
      };
    }

    const dateRange = getDateRange(filterOrders);

    console.log({ dateRange });

    getAllOrders(dateRange.pastDate, dateRange.currentDate);
  }, [filterOrders, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const OrderListShimmer = () => {
  return (
    <>
      {[...Array(10)].map((_, index) => (
        <Box key={index} mb={3}>
          <Grid
            container
            p={3}
            spacing={2}
            sx={{ background: "#f0f2f2", margin: "0", width: "100%" }}
          >
            <Grid item lg={7} md={6} xs={12}>
              <Box display="flex" alignItems="center" gap={5}>
                <Box>
                  <Typography fontSize={14} fontWeight={500}>
                    Order placed
                  </Typography>
                  <Skeleton variant="text" width={100} height={20} />
                </Box>
                <Box>
                  <Typography fontSize={14} fontWeight={500}>
                    Total
                  </Typography>
                  <Skeleton variant="text" width={80} height={20} />
                </Box>
                <Box>
                  <Typography fontSize={14} fontWeight={500}>
                    Ship
                  </Typography>
                  <Skeleton variant="text" width={120} height={20} />
                </Box>
              </Box>
            </Grid>

            <Grid item lg={5} md={6} xs={12}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: {
                    lg: "flex-end",
                    md: "flex-end",
                    xs: "flex-start",
                  },
                }}
              >
                <Skeleton variant="text" width={150} height={20} />
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                  <Skeleton variant="rectangular" width={120} height={30} />
                  <Skeleton variant="rectangular" width={100} height={30} />
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box p={3} sx={{ background: "#fff" }}>
            {[...Array(2)].map((__, idx) => (
              <Box
                key={idx}
                display="flex"
                alignItems="center"
                gap={2}
                mb={2}
              >
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={80}
                  sx={{ borderRadius: "8px" }}
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="30%" height={20} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};


  return (
    <Fragment>
      {/* TITLE HEADER AREA */}
      <DashboardHeader Icon={ShoppingBag} title="My Orders" />

      <SectionCreator py={3}>
        <Grid>
          <H3
            mb={2}
            sx={{
              textAlign: {
                lg: "start",
                md: "start",
                xs: "center",
              },
            }}
          >
            Your Orders
          </H3>
          <Grid
            container
            pb={3}
            spacing={3}
            sx={{ margin: "0", width: "100%", alignItems: "center" }}
          >
            <Grid lg={6} md={6} xs={12} sx={{ paddingTop: "0" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: {
                    lg: "0",
                    md: "0",
                    sm: "12px",
                  },
                }}
              >
                <Typography sx={{ fontSize: "14px" }}>
                  {totalCount} order placed in
                </Typography>
                <Typography component="span" ml={1}>
                  <TextField
                    select
                    value={filterOrders}
                    onChange={(e) => setFilterOrders(e.target.value)}
                  >
                    {orderplace.map((option) => (
                      <MenuItem
                        sx={{ color: "#ad1414" }}
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Typography>
              </Box>
            </Grid>
            <Grid lg={6} md={6} xs={12} sx={{ paddingTop: "0" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                }}
              >
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon sx={{ fontSize: "21px" }} />
                  </SearchIconWrapper>
                  <InputBase
                    value={searchTerms}
                    onChange={(e) => setSearchTerms(e.target.value)}
                    placeholder="Search by order id,title..."
                    inputProps={{ "aria-label": "search" }}
                    sx={{
                      paddingLeft: "32px",
                      height: "35px",
                      border: "none",
                      "& input": {
                        height: "35px",
                      },
                    }}
                  />
                </Search>
                <Typography component="span">
                  <Button
                    onClick={() => {
                      if (searchTerms) {
                        router.push(
                          `/search-order-detail?search-terms=${searchTerms}`
                        );
                      }
                    }}
                    variant="contained"
                    sx={{
                      whiteSpace: "nowrap",
                      borderRadius: "0 4px 4px 0",
                      background: "#000",
                      color: "#fff",
                      height: "35px",
                      "&:hover": {
                        background: "#363636",
                      },
                    }}
                  >
                    Search order
                  </Button>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          {showLoading ? (
           <OrderListShimmer/>
          ) : allOrders.length === 0 ? (
            <Box
              sx={{
                marginTop: "20  px",
                display: "flex ",
                alignItems: "center",
                flexDirection: "column",
                height: "100vh",
              }}
            >
              <Box sx={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Typography variant="h4" fontWeight={600}>
                  No Order Found
                </Typography>
              </Box>
            </Box>
          ) : (
            allOrders.map((order) => {
              return (
                <Order key= {order?._id} baseUrl={baseUrl} shopBaseUrl={shopBaseUrl} filterOrders = {filterOrders} getAllOrders= {getAllOrders} order={order}/>
              );
            })
          )}

          {/* {allOrders.length > 0 ? (
            <Box sx={{ borderTop: "1px solid #dfdfdf" }} p={3}>
              <Typography component="div">
                <Link
                  href="#"
                  underline="hover"
                  sx={{ fontSize: "16px", fontWeight: "500" }}
                >
                  Archive order
                </Link>
              </Typography>
            </Box>
          ) : (
            ""
          )} */}
        </Grid>
      </SectionCreator>

      {/* ORDER LIST AREA */}
      {/* {orders.map(order => <OrderRow order={order} key={order.id} />)} */}

      {/* ORDERS PAGINATION */}
      {allOrders.length > 0 ? (
        <Pagination count={totalPages} onChange={handlePageChange} />
      ) : (
        ""
      )}
    </Fragment>
  );
}
