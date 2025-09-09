import React, { useState } from "react";
import { Box, Grid, Typography, Tooltip, tooltipClasses,Rating } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { H2, H3, H4, H6 } from "components/Typography";
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

const Order = ({baseUrl,shopBaseUrl,filterOrders,getAllOrders,order}) => {
  const router = useRouter();
  const { token } = useAuth();
  const { addToast } = useToasts();
  const [reviewId, setReviewId] = useState("");
  const [vendorId,setVendorId] = useState("");
  const [openPopup, SetOpenPopup] = useState(false);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [itemRating, setItemRating] = useState(0);

  const {currency} = useCurrency();
  const isoString = order.createdAt;
  const date = new Date(isoString);

  const handleClosePopup = () => {
    setReviewId("");
    setVendorId("");
    SetOpenPopup(false);
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
  
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
      // deliveryRating: deliveryRating || 0,
      // itemRating: itemRating || 0,
      // comments: "",
      // recommend: false,

      const payload = {
        saleDetailId: reviewId,
        vendor_id:vendorId,
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
        function getDateRange(filterOrders) {
          const currentDate = new Date();
          const pastDate = new Date();
          pastDate.setMonth(currentDate.getMonth() - filterOrders);

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
  return (
    <>
      <Box key={order._id}>
        <Box>
          <Grid
            container
            p={3}
            spacing={2}
            sx={{ background: "#f0f2f2", margin: "0", width: "100%" }}
          >
            <Grid lg={7} md={6} xs={12} sx={{ paddingTop: "0" }}>
              <Box>
                <List
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0",
                  }}
                >
                  <ListItem
                    sx={{
                      width: "auto",
                      padding: "0",
                      marginRight: "50px",
                    }}
                  >
                    <Typography component="div">
                      <Typography fontSize={14} fontWeight={500}>
                        Order placed
                      </Typography>
                      <Typography fontSize={15} fontWeight={500}>
                        {formattedDate}
                      </Typography>
                    </Typography>
                  </ListItem>
                  <ListItem
                    sx={{
                      width: "auto",
                      padding: "0",
                      marginRight: "50px",
                    }}
                  >
                    <Typography component="div">
                      <Typography fontSize={14} fontWeight={500}>
                        Total
                      </Typography>
                      <Typography fontSize={15} fontWeight={500}>
                        {currency?.symbol}
                        {(order.subtotal * currency?.rate).toFixed(2)}
                      </Typography>
                    </Typography>
                  </ListItem>
                  <ListItem sx={{ width: "auto", padding: "0" }}>
                    <Typography component="div">
                      <Typography fontSize={14} fontWeight={500}>
                        Ship
                      </Typography>

                      <LightTooltip
                        title={
                          <Box>
                            <Typography
                              fontSize={"16x"}
                              sx={{ textTransform: "capitalize" }}
                              fontWeight={600}
                            >
                              {order.userName}
                            </Typography>
                            <Typography fontSize={"16px"}>
                              {order.address_line1}
                            </Typography>
                            <Typography fontSize={"16px"}>
                              {order.address_line2 ? order.address_line2 : ""}
                            </Typography>
                            <Typography fontSize={"16px"}>
                              {order.city} {order.state} {order.pincode}
                            </Typography>
                            <Typography fontSize={"16px"}>
                              {order.country}
                            </Typography>
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
                            {order.userName}
                          </Typography>
                          <ArrowDropDownIcon />
                        </Box>
                      </LightTooltip>

                      {/* <Typography
                                fontSize={15}
                                fontWeight={500}
                                sx={{ color: "#ad1414" }}
                              >
                                {order.userName}
                              </Typography> */}
                    </Typography>
                  </ListItem>
                </List>
              </Box>
            </Grid>
            <Grid lg={5} md={6} xs={12} sx={{ paddingTop: "0" }}>
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
                <Typography component="div">
                  <Typography
                    fontSize={14}
                    fontWeight={500}
                    sx={{ textTransform: "uppercase" }}
                  >
                    Order # {order.order_id}
                  </Typography>
                  <Typography
                    component="div"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Typography
                      onClick={() =>
                        router.push(`/order-details?order-id=${order.order_id}`)
                      }
                      component="span"
                      fontSize={15}
                      pr={2}
                      fontWeight={500}
                      sx={{
                        color: "#ad1414",
                        cursor: "pointer",
                        borderRight: "2px solid #dad9d9",
                      }}
                    >
                      View order details
                    </Typography>
                    <Typography
                      sx={{
                        marginLeft: "10px",
                        display: "flex",
                        minWidth: 100,
                        alignItems: "center",
                      }}
                      component="div"
                    >
                      {/* <span>invoice</span> */}

                      {/* <FormControl fullWidth>
                                  <InputLabel id="demo-simple-select-label">
                                    invoice
                                  </InputLabel>
                                  <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="invoice"
                                  >
                                    <MenuItem value={10}>
                                      Printable order summary
                                    </MenuItem>
                                  </Select>
                                </FormControl> */}

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
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box p={3} sx={{ background: "#fff" }}>
            <Typography component="div" mb={2}>
              {/* <H2 fontWeight={600}>Delivered 5 july 2024</H2> */}
              {/* <Typography>Package was handed to resident</Typography> */}
            </Typography>

            {order?.saleDetaildata?.map((product) => {
              return (
                <Product key = {product?._id} baseUrl = {baseUrl} shopBaseUrl={shopBaseUrl} SetOpenPopup = {SetOpenPopup} setReviewId = {setReviewId} setVendorId={setVendorId} order = {order} product={product}/>
              );
            })}
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openPopup}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          ".MuiPaper-root": {
            maxWidth: "700px",
            width: "700px",
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
          {/* <Box p={2}>
            <Typography component="div" mb={1}>
              <Typography fontWeight={600} fontSize={16}>
                Delivery Rating Ask rating from customer in star pattern format
              </Typography>
              <Typography>
                <Box>
                  <Rating
                    size="large"
                    name="simple-controlled"
                    value={deliveryRating}
                    onChange={(event, newValue) => {
                      setDeliveryRating(newValue);
                    }}
                  />
                </Box>
              </Typography>
            </Typography>
            <Typography component="div" mb={1}>
              <Typography fontWeight={600} fontSize={16}>
                Item Rating Ask rating from customer in star pattern format
              </Typography>
              <Typography>
                <Box>
                  <Rating
                    size="large"
                    name="simple-controlled"
                    value={itemRating}
                    onChange={(event, newValue) => {
                      setItemRating(newValue);
                    }}
                  />
                </Box>
              </Typography>
            </Typography>
            <Typography component="div" mt={2}>
              <Typography fontSize={18} fontWeight={500}>
                Comments
              </Typography>
              <TextField multiline rows={4} fullWidth variant="outlined" />
            </Typography>
            <Typography component="div" mt={1}>
              <FormControlLabel
                required
                control={<Checkbox />}
                label="Yes i would recommend this product"
                sx={{
                  ".MuiTypography-root": {
                    fontWeight: "bold",
                  },
                }}
              />
            </Typography>
            <Typography mt={2} component="div" sx={{ display: "flex" }}>
              <Button
                sx={{
                  fontSize: "17px",
                  borderRadius: "4px",
                  padding: "12px",
                  background: "#e87100",
                  color: "#fff",
                  width: "100%",
                  marginRight: "10px",
                  "&:hover": { background: "#fb9331" },
                }}
              >
                Not Now
              </Button>
              <Button
                sx={{
                  fontSize: "17px",
                  borderRadius: "4px",
                  padding: "12px",
                  background: "#e87100",
                  color: "#fff",
                  width: "100%",
                  marginLeft: "10px",
                  "&:hover": { background: "#fb9331" },
                }}
              >
                Submit Review
              </Button>
            </Typography>
          </Box> */}

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
                  <Typography mt={2} component="div" sx={{ display: "flex" }}>
                    <Button
                      type="button"
                      sx={{
                        fontSize: "17px",
                        borderRadius: "4px",
                        padding: "12px",
                        background: "#e87100",
                        color: "#fff",
                        width: "100%",
                        marginRight: "10px",
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
                        marginLeft: "10px",
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
            right: { lg: "30px", md: "30px", xs: "10px" },
          }}
        >
          <CloseIcon />
        </Button>
      </Dialog>
    </>
  );
};

export default Order;
