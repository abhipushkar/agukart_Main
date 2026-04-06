import React, { useState } from "react";
import { Box, Grid, Typography, Tooltip, tooltipClasses, Rating, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCurrency } from "contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { useToasts } from "react-toast-notifications";
import Product from "./Product";
import useAuth from "hooks/useAuth";
import { postAPIAuth } from "utils/__api__/ApiServies";
import TrackingPopup from "./TrackingPopup";
import Link from "next/link";
import MessagePopup from "./MessagePopup";

const Order = ({ baseUrl, shopBaseUrl, filterOrders, getAllOrders, order }) => {
  const router = useRouter();
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [reviewId, setReviewId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [openPopup, SetOpenPopup] = useState(false);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [itemRating, setItemRating] = useState(0);
  const [openTracking, setOpenTracking] = useState(false);
  const [openMessagePopup, setMessageOpenPopup] = useState(false);

  const { currency } = useCurrency();

  // Get parentSale data (order level data)
  const parentSale = order?.parentSale || order;
  const items = order?.items || [];

  const isoString = parentSale?.createdAt;
  const date = new Date(isoString);

  const handleClosePopup = () => {
    setReviewId("");
    setVendorId("");
    SetOpenPopup(false);
    setOpenTracking(false);
  };

  const handleMessageClosePopup = () => {
    setMessageOpenPopup(false);
  };

  const LightTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: theme.palette.common.white,
      color: "rgba(0, 0, 0, 0.87)",
      boxShadow: theme.shadows[1],
      fontSize: 11,
    },
  }));


  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  function getDateRange(filterOrders) {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setMonth(currentDate.getMonth() - filterOrders);

    return {
      currentDate: formatDate(currentDate),
      pastDate: formatDate(pastDate),
    };
  }

  const formattedDate = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "";
    return parsedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const validationSchema = Yup.object({
    deliveryRating: Yup.number()
      .required("Delivery rating is required")
      .min(1, "Please give a rating"),
    itemRating: Yup.number()
      .required("Item rating is required")
      .min(1, "Please give a rating"),
    comments: Yup.string()
      .required("Comments are required")
      .min(5, "Comment should be at least 5 characters"),
  });

  const submitReviewHandler = async (values) => {
    try {
      const payload = {
        saleDetailId: reviewId,
        vendor_id: vendorId,
        delivery_rating: `${values.deliveryRating}`,
        item_rating: `${values.itemRating}`,
        additional_comment: values.comments,
        recommended: values.recommend,
      };

      const res = await postAPIAuth(
        `user/sendRating`,
        payload,
        token,
        addToast
      );

      if (res.status === 200) {


        setReviewId("");
        setVendorId("");
        const dateRange = getDateRange(filterOrders);
        getAllOrders(dateRange.pastDate, dateRange.currentDate);
        handleClosePopup();
        addToast(res.data.message, {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      setReviewId("");
      setVendorId("");
      console.log(error);
    }
  };

  const deliveryStatus = (items?.[0]?.delivery_status || parentSale?.delivery_status) === "No tracking"
    ? { tracking: false, status: "Shipped" } : { tracking: true, status: (items?.[0]?.delivery_status || parentSale?.delivery_status) };

  const refundStatus = (items?.[0]?.refund_status || parentSale?.refund_status) === "none"
    ? null : (items?.[0]?.refund_status || parentSale?.refund_status)

  return (
    <>
      <Box key={order.sub_order_id || order._id} mb={2}>
        <TrackingPopup
          open={openTracking}
          onClose={handleClosePopup}
          order={order}
        />
        <Box border={"1px solid"} borderRadius={{ xs: "10px", md: "12px" }} borderColor={"#e4e4e484"}>
          <Grid
            container
            p={1}
            pb={2}
            spacing={2}
            sx={{
              background: "#f0f2f2",
              margin: "0",
              width: "100%",
              borderRadius: { xs: "10px 10px 0 0", md: "12px 12px 0 0" },
            }}
          >
            <Grid item lg={8} md={7} xs={12} sx={{ paddingTop: "0" }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", md: "flex-start" },
                    flexWrap: { xs: "wrap", md: "nowrap" },
                    gap: { xs: 1.5, md: 2 },
                    p: 0,
                    m: 0,
                  }}
                >
                  <Stack
                    spacing={2}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 8px)", md: "33.33%" },
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography fontSize={14} fontWeight={500}>
                        Order placed {" "}{formattedDate(date)}
                      </Typography>
                      {(items?.[0]?.shipped_date || parentSale?.shipped_date) && (<Typography fontSize={14} fontWeight={500}>
                        Shipped  {" "}{formattedDate(items?.[0]?.shipped_date || parentSale?.shipped_date) || "—"}
                      </Typography>)}
                      {(items?.[0]?.delivered_date || parentSale?.delivered_date) && (<Typography fontSize={14} fontWeight={500}>
                        Delivered {" "}{formattedDate(items?.[0]?.delivered_date || parentSale?.delivered_date) || "—"}
                      </Typography>)}
                    </Box>
                  </Stack>
                  <Stack
                    spacing={1}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 8px)", md: "33.33%" },
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography fontSize={14} fontWeight={500}>
                        <span>Status :</span> {deliveryStatus.status}
                      </Typography>
                      {deliveryStatus.tracking ? (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            marginTop: "10px",
                            bgcolor: "#404040",
                            "&:hover": {
                              bgcolor: "#515151",
                            },
                            borderRadius: "30px",
                            border: "1px solid #000",
                            width: { xs: "100%", sm: "auto", md: "auto" },
                            maxWidth: { md: "150px" },
                            color: "#eee",

                          }}
                          onClick={() => setOpenTracking(true)}
                        >
                          Track package
                        </Button>
                      ) : (
                        ""
                      )}
                    </Box>
                  </Stack>
                  <Stack
                    spacing={1}
                    sx={{
                      width: { xs: "100%", sm: "calc(50% - 8px)", md: "33.33%" },
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      <Typography fontSize={14} fontWeight={500}>
                        Total (change!) {currency?.symbol}
                        {(order.subtotal * currency?.rate).toFixed(2)}
                        {refundStatus && (<span style={{ color: "red" }}>{refundStatus}</span>)}
                      </Typography>
                      <Typography fontSize={14} fontWeight={500}>
                        Store name : <Link
                          href={`/store/${items[0]?.vendorData?.slug}`}
                          style={{
                            color: "#3b66cb",
                            fontSize: "15px",
                            textDecoration: "none",
                          }}
                        >
                          {items[0]?.vendorData?.shop_name}
                        </Link>
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          setMessageOpenPopup(true);
                        }}
                        variant="contained"
                        sx={{
                          background: "#fff",
                          borderRadius: "30px",
                          border: "1px solid #252525bd",
                          width: { xs: "100%", sm: "auto", md: "auto" },
                          maxWidth: { md: "150px" },
                          marginBottom: "12px",
                        }}
                      >
                        Message to Seller
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Grid>
            <Grid item lg={4} md={5} xs={12} sx={{ paddingTop: "0" }}>
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
                <Box display={"flex"} flexDirection={"column"} gap={1.5} width="100%">
                  <Typography
                    fontSize={14}
                    fontWeight={600}
                    sx={{ textTransform: "uppercase", wordBreak: "break-word" }}
                  >
                    Order # {order.sub_order_id}
                  </Typography>
                  <Box>
                    <LightTooltip
                      title={
                        <Box>
                          <Typography
                            fontSize={"16px"}
                            sx={{ textTransform: "capitalize" }}
                            fontWeight={600}
                          >
                            {parentSale?.userName}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.address_line1}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.address_line2 ? parentSale?.address_line2 : ""}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.city} {parentSale?.state} {parentSale?.pincode}
                          </Typography>
                          <Typography fontSize={"16px"}>
                            {parentSale?.country}
                          </Typography>
                        </Box>
                      }
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                        <span>Ship to :</span>
                        <Typography
                          fontSize={15}
                          fontWeight={500}
                          sx={{
                            color: "#ad1414",
                            cursor: "pointer",
                            textTransform: "capitalize",
                          }}
                        >
                          {" "}{parentSale?.userName}
                        </Typography>
                        <ArrowDropDownIcon />
                      </Box>
                    </LightTooltip>
                  </Box>
                  <Typography
                    component="div"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      rowGap: 1,
                    }}
                  >
                    <Typography
                      onClick={() =>
                        router.push(`/order-details?order-id=${order.order_id}&sub-order-id=${order.sub_order_id}`)
                      }
                      component="span"
                      fontSize={15}
                      pr={{ xs: 0, sm: 2 }}
                      fontWeight={500}
                      sx={{
                        color: "#ad1414",
                        cursor: "pointer",
                        borderRight: { xs: "none", sm: "2px solid #dad9d9" },
                      }}
                    >
                      View order details
                    </Typography>
                    <Typography
                      sx={{
                        marginLeft: { xs: "0px", sm: "10px" },
                        display: "flex",
                        minWidth: { xs: "auto", sm: 100 },
                        alignItems: "center",
                      }}
                      component="div"
                    >
                      <LightTooltip
                        title={
                          <Box>
                            <Button
                              onClick={() => {
                                addToast("Please Wait", {
                                  appearance: "success",
                                  autoDismiss: true,
                                });
                              }}
                            >
                              Printable order summary
                            </Button>
                          </Box>
                        }
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            fontSize={15}
                            fontWeight={500}
                            sx={{
                              color: "#ad1414",
                              cursor: "pointer",
                              textTransform: "capitalize",
                            }}
                          >
                            invoice
                          </Typography>
                          <ArrowDropDownIcon />
                        </Box>
                      </LightTooltip>
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box p={{ xs: 2, sm: 2.5, md: 3 }} sx={{ background: "#fff", borderRadius: "0 0 12px 12px" }}>
            <Typography component="div" mb={2}>
              {/* <H2 fontWeight={600}>Delivered 5 july 2024</H2> */}
              {/* <Typography>Package was handed to resident</Typography> */}
            </Typography>

            {/* Shop section - using items array */}
            {items.length > 0 && (
              <Box>
                {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <H4 sx={{color:'grey'}}>Shop name : { items[0]?.vendorData?.shop_name || 'Unknown'}</H4>
                  <Box
                    sx={{
                      flexGrow: 1,
                      height: '1px',
                      backgroundColor: '#e0e0e0',
                      ml: 2,
                    }}
                  />
                </Box> */}

                {items.map(product => (
                  <Product
                    key={product?._id}
                    baseUrl={baseUrl}
                    shopBaseUrl={shopBaseUrl}
                    SetOpenPopup={SetOpenPopup}
                    setReviewId={setReviewId}
                    setVendorId={setVendorId}
                    order={order}
                    product={product}
                  />
                ))}
              </Box>
            )}

          </Box>
        </Box>
      </Box>
      <Dialog
        open={openPopup}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        onClose={handleClosePopup}
        fullWidth
        maxWidth="md"
        sx={{
          ".MuiPaper-root": {
            width: { xs: "calc(100% - 24px)", sm: "700px" },
            maxWidth: "700px",
            margin: { xs: "12px", sm: "32px" },
          },
          ".MuiDialogContent-root": {
            overflowY: "scroll",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#d23f57",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#f0f0f0",
            },
          },
        }}
      >
        <Box sx={{ background: "#fff", boxShadow: "0 0 3px #000" }}>
          <Typography
            component="div"
            p={2}
            sx={{ borderBottom: "1px solid #000" }}
          >
            <Typography variant="h5">Write a review</Typography>
          </Typography>

          <Formik
            initialValues={{
              deliveryRating: deliveryRating || 0,
              itemRating: itemRating || 0,
              comments: "",
              recommend: false,
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              submitReviewHandler(values);
            }}
          >
            {({ setFieldValue, values }) => (
              <Form>
                <Box p={2}>
                  <Typography component="div" mb={1}>
                    <Typography fontWeight={600} fontSize={16}>
                      Delivery Rating (Ask rating from customer in star pattern
                      format)
                    </Typography>
                    <Box>
                      <Rating
                        size="large"
                        name="deliveryRating"
                        value={values.deliveryRating}
                        onChange={(event, newValue) => {
                          setFieldValue("deliveryRating", newValue);
                        }}
                      />
                      <ErrorMessage
                        name="deliveryRating"
                        component="div"
                        style={{ color: "red" }}
                      />
                    </Box>
                  </Typography>
                  <Typography component="div" mb={1}>
                    <Typography fontWeight={600} fontSize={16}>
                      Item Rating (Ask rating from customer in star pattern
                      format)
                    </Typography>
                    <Box>
                      <Rating
                        size="large"
                        name="itemRating"
                        value={values.itemRating}
                        onChange={(event, newValue) => {
                          setFieldValue("itemRating", newValue);
                        }}
                      />
                      <ErrorMessage
                        name="itemRating"
                        component="div"
                        style={{ color: "red" }}
                      />
                    </Box>
                  </Typography>
                  <Typography component="div" mt={2}>
                    <Typography fontSize={18} fontWeight={500}>
                      Comments
                    </Typography>
                    <Field
                      as={TextField}
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                      name="comments"
                    />
                    <ErrorMessage
                      name="comments"
                      component="div"
                      style={{ color: "red" }}
                    />
                  </Typography>
                  <Typography component="div" mt={1}>
                    <FormControlLabel
                      control={<Field as={Checkbox} name="recommend" />}
                      label="Yes, I would recommend this product"
                      sx={{
                        ".MuiTypography-root": {
                          fontWeight: "bold",
                        },
                      }}
                    />
                    <ErrorMessage
                      name="recommend"
                      component="div"
                      style={{ color: "red" }}
                    />
                  </Typography>
                  <Typography
                    mt={2}
                    component="div"
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1, sm: 0 },
                    }}
                  >
                    <Button
                      type="button"
                      onClick={handleClosePopup}
                      sx={{
                        fontSize: "17px",
                        borderRadius: "4px",
                        padding: "12px",
                        background: "#e87100",
                        color: "#fff",
                        width: "100%",
                        marginRight: { xs: "0px", sm: "10px" },
                        "&:hover": { background: "#fb9331" },
                      }}
                    >
                      Not Now
                    </Button>
                    <Button
                      type="submit"
                      sx={{
                        fontSize: "17px",
                        borderRadius: "4px",
                        padding: "12px",
                        background: "#e87100",
                        color: "#fff",
                        width: "100%",
                        marginLeft: { xs: "0px", sm: "10px" },
                        "&:hover": { background: "#fb9331" },
                      }}
                    >
                      Submit Review
                    </Button>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
        <Button
          onClick={handleClosePopup}
          sx={{
            position: "absolute",
            top: { lg: "17px", md: "20px", xs: "10px" },
            right: { lg: "22px", md: "22px", xs: "6px" },
            minWidth: "auto",
          }}
        >
          <CloseIcon />
        </Button>
      </Dialog>
      <MessagePopup
        vendorName={order.items[0]?.vendor_name}
        shopName={order?.vendorData?.shop_name}
        shopImage={`${shopBaseUrl}/${order?.vendorData?.shop_icon}`}
        openPopup={openMessagePopup}
        receiverid={order?.vendor_id}
        baseUrl={baseUrl}
        // product_image={baseUrl + order?.productData?.items[0].image[0]}
        productID={null}
        productData={null} // start chat at suborder level
        orderId={order?.order_id}
        handleClosePopup={handleMessageClosePopup}
        subOrderId={order.sub_order_id}
        subOrderProducts={order.items || []} //products list in suborder
      />
    </>
  );
};

export default Order;
