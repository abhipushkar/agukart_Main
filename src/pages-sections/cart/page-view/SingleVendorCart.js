import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import {
    Card,
    Typography,
    Button,
    AccordionSummary,
    AccordionDetails, CircularProgress,
} from "@mui/material";
import Link from "next/link";
import NextLink from "next/link";
import { H4 } from "components/Typography";
import parse from "html-react-parser";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Accordion from "@mui/material/Accordion";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";
import { postAPIAuth, getAPIAuth } from "utils/__api__/ApiServies";
import useCart from "hooks/useCart";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";
import { fontSize } from "theme/typography";
import Product from "./Product";
import { useCurrency } from "contexts/CurrencyContext";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckoutPopup from "./CheckoutPopup";
const SingleVendorCart = ({ wallet, cart, defaultAddress, voucherDetails }) => {
  console.log({ cart });
  const router = useRouter();
  const { currency } = useCurrency();
  const [formValues, setFormValues] = useState({
    coupon_code: cart?.vendor_coupon?.coupon_data?.coupon_code || "",
  });
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(cart?.coupon_status === true);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [vendorNote, setVendorNote] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("standardShipping");
  const [isModalOpen, setModalOpen] = useState(false);
  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };
  const totalShopProductQty = cart?.products?.reduce((acc,item)=>{
    return acc + item?.qty
  },0)
  const deliveryOptions = cart?.matchedShippingOptions?.map((item) => {
    const minDays = item?.options?.[0]?.minDays || 0;
    const maxDays = item?.options?.[0]?.maxDays || 0;
    const perItem = item?.options?.[0]?.perItem || 0;
    const perOrder = item?.options?.[0]?.perOrder || 0;
    const currentDate = new Date();

    const minDate = new Date(currentDate);
    minDate.setDate(currentDate.getDate() + minDays);

    const maxDate = new Date(currentDate);
    maxDate.setDate(currentDate.getDate() + maxDays);

    return {
      value: item?.shippingType,
      label: `${item?.shippingType == "standardShipping" ? "Standard Delivery" : item?.shippingType == "expedited" ? "Express Delivery" : item?.shippingType == "twoDays" ? "Two days" : "One day"} (${formatDate(minDate)} - ${formatDate(maxDate)}) [${currency?.symbol}${currency?.rate * ((perItem * totalShopProductQty)+perOrder)}]`,
    };
  });

  const handleNoteAccordionToggle = () => {
    setIsNoteOpen((prev) => !prev);
  };
  const handleAccordionToggle = () => {
    setIsOpen((prev) => !prev);
  };
  const { state, dispatch, getCartDetails, getCartItems } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const [addingNote, setAddingNote] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleSaveNote = async () => {
      try {
      setAddingNote(true);
    console.log({ vendorNote });
    if (!token) {
      return router.push("/login");
    }
    if (!vendorNote) return addToast(
      "Note is required",
      {
        appearance: "error",
        autoDismiss: true,
      }
    );
    const productids = cart?.products?.map((item) => item?.product_id);
      const payload = {
        cart_id: cart?.products?.[0]?.cart_id,
        vendor_id: cart?.vendor_id,
        note: vendorNote
      }
      const res = await postAPIAuth("user/save-note", payload);
      if (res.status === 200) {
        // setIsNoteOpen(false);
        // setVendorNote("");
        return addToast(
          "Add note successfully",
          {
            appearance: "success",
            autoDismiss: true,
          }
        );
      }
    } catch (error) {
      console.log(error);
      return addToast(
        "Failed to add note",
        {
          appearance: "error",
          autoDismiss: true,
        }
      );
    } finally {
        setAddingNote(false);
    }
  };
  const handleApply = async () => {
    if (!token) {
      return router.push("/login");
    }
    try {
      if (!token) {
        return router.push("/login");
      }
      const payload = {
        coupon_code: formValues?.coupon_code,
        vendor_id: cart?.vendor_id,
      };
      setLoading(true);
      const res = await postAPIAuth("user/check-coupon-for-product", payload);
      if (res.status === 200) {
        setLoading(false);
        getCartItems(defaultAddress?._id);
        const data = wallet ? "1" : "0";
        getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
        setError("");
        // addToast(res?.data?.message, {
        //     appearance: "success",
        //     autoDismiss: true,
        // });
      }
    } catch (error) {
      setLoading(false);
      // addToast(error?.response?.data.message || error, {
      //     appearance: "error",
      //     autoDismiss: true,
      // });
      setError(error?.response?.data.message);
      console.log("error", error?.response?.data.message || error);
    }
  };

  const handleRemove = async () => {
    try {
      const payload = {
        coupon_code: formValues?.coupon_code,
        vendor_id: cart?.vendor_id,
      };
      setLoading(true);
      const res = await postAPIAuth("user/remove-coupon-for-product", payload);
      if (res.status === 200) {
        setLoading(false);
        getCartItems(defaultAddress?._id);
        const data = wallet ? "1" : "0";
        getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
        setFormValues({ coupon_code: "" });
        setIsOpen(false);
        // addToast(res?.data?.message, {
        //     appearance: "success",
        //     autoDismiss: true,
        // });
      }
    } catch (error) {
      setLoading(false);
      // addToast(error?.response?.data.message || error, {
      //     appearance: "error",
      //     autoDismiss: true,
      // });
      console.log("error", error?.response?.data.message || error);
    }
  };

  function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  useEffect(() => {
    if (!formValues.coupon_code) {
      setError("");
    }
  }, [formValues.coupon_code]);


  const addParentCart = async () => {
    try {
      const shipping = cart?.matchedShippingOptions?.find((item) => item?.shippingType === deliveryOption)
      console.log({ shipping })
      const currentDate = new Date();

      const minDate = new Date(currentDate);
      minDate.setDate(currentDate.getDate() + shipping?.options?.[0]?.minDays);

      const maxDate = new Date(currentDate);
      maxDate.setDate(currentDate.getDate() + shipping?.options?.[0]?.maxDays);
      const payload = {
        cart_id: cart?.products?.[0]?.cart_id,
        vendor_data: {
          vendor_id: cart?.vendor_id,
          shipping_id: shipping?.options?.[0]?._id,
          shippingName: shipping?.shippingType,
          minDate: minDate,
          maxDate: maxDate,
          perOrder: shipping?.options?.[0]?.perOrder,
          perItem: shipping?.options?.[0]?.perItem
        }
      }
      const res = await postAPIAuth("user/add-parent-cart", payload);
      if (res.status === 200) {
        const data = wallet ? "1" : "0";
        getCartDetails(data, defaultAddress?._id, voucherDetails?.discount);
        console.log(res, "rrrtrffff")
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (deliveryOption && token && cart?.shippingAvailable) {
      addParentCart();
    }
  }, [deliveryOption])

  const handleVendorCheckout = () => {
    if (!token) {
      return router.push("/login");
    }
    setModalOpen(true);
  }
  return (
    <>
      <Card
        sx={{
          marginBottom: "16px",
          borderRadius: "12px",
          border: "1px solid #0e0e0e2e",
          overflow: "hidden",
          padding: "16px",
        }}
      >
        <Typography
          component="div"
          display={{ lg: "flex", md: "flex", xs: "block" }}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            component="div"
            display="flex"
            alignItems="center"
            onClick={() => {
              const slug = cart?.slug;
              const url = `/store/${slug}`;
              if (slug) {
                window.open(url, "_blank");
              } else {
                console.error("Vendor slug is not available");
              }
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            <img
              src={cart?.shop_icon}
              alt=""
              style={{
                height: "32px",
                width: "32px",
                objectFit: "cover",
                borderRadius: "5px",
                border: "3px solid #000",
              }}
            />
            <Typography
              component="div"
              fontSize={17}
              fontWeight={700}
              pl={1}
              sx={{
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              {capitalizeFirstLetter(cart?.shop_name)}
            </Typography>
          </Typography>
          <Typography
            component="div"
            color={"#656464"}
            fontWeight={600}
            sx={{
              "&:hover": {
                textDecoration: "underline !important",
              },
              fontSize: {
                lg: "16px",
                md: "16px",
                xs: "12px",
              },
            }}
          >
            <Link component={NextLink} href="/">
              Contact shop
            </Link>
          </Typography>
        </Typography>
        {cart?.products?.map((product, index) => (
          <Product key={index} cart={cart} product={product} wallet={wallet} defaultAddress={defaultAddress} voucherDetails={voucherDetails} />
        ))}
        <Box>
          {
            token && (
              <>
                <Typography component="div" display={"flex"}>
                  <Typography component="span">
                    <Checkbox inputProps={{ "aria-label": "controlled" }} />
                  </Typography>
                  <Typography component="div">
                    <Typography variant="span" fontSize={17} fontWeight={600}>
                      Mark order as a gift
                    </Typography>
                    <Typography>
                      We'll hide the price on the packing slip. At checkout you can
                      add free personal touches to your gift - a note, a customisable
                      preview, and more!
                    </Typography>
                  </Typography>
                </Typography>
                <Box
                  pt={1}
                  pb={{ lg: 0, md: 0, xs: 2 }}
                  sx={{
                    display: {
                      lg: "flex",
                      md: "flex",
                      xs: "block",
                    },
                    justifyContent: "space-between",
                  }}
                >
                  <Typography component="div">
                    <Typography component="div" pb={2}>
                      <Accordion
                        expanded={isOpen}
                        sx={{
                          boxShadow: "none",
                          borderTop: "none",
                        }}
                      >
                        <AccordionSummary
                          aria-controls="panel1-content"
                          id="panel1-header"
                          onClick={handleAccordionToggle}
                        >
                          <Button
                            sx={{
                              background: "transparent",
                              color: "#000",
                              padding: "10px 18px",
                              fontSize: "13px",
                              borderRadius: "25px",
                            }}
                          >
                            <Typography
                              component="span"
                              mr={1}
                              sx={{
                                background: "#43639f",
                                borderRadius: "50%",
                                height: "24px",
                                width: "24px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <svg
                                stroke="#fff"
                                fill="#fff"
                                xmlns="http://www.w3.org/2000/svg"
                                height="14px"
                                width="14px"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                              >
                                <path d="M11,22a1,1,0,0,1-.707-0.293l-8-8a1,1,0,0,1,0-1.414l10-10A1,1,0,0,1,13,2h8a1,1,0,0,1,1,1v8a1,1,0,0,1-.293.707l-10,10A1,1,0,0,1,11,22ZM4.414,13L11,19.586l9-9V4H13.414Z"></path>
                                <circle cx="16" cy="8" r="2"></circle>
                              </svg>
                            </Typography>
                            Apply Store Coupon Code
                          </Button>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            sx={{
                              height: "50px",
                              padding: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#fff",
                              boxShadow: "0 0 3px #000",
                              borderRadius: "30px",
                            }}
                          >
                            <TextField
                              required
                              id="outlined-required"
                              placeholder="Enter your code"
                              sx={{
                                ".MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                              }}
                              disabled={cart?.coupon_status}
                              value={formValues?.coupon_code}
                              name="coupon_code"
                              onChange={handleChange}
                            />
                            {cart?.coupon_status ? (
                              <Button
                                sx={{
                                  paddingLeft: "18px",
                                  paddingRight: "18px",
                                  background: "none",
                                  border: "none",
                                  borderRadius: "30px",
                                }}
                                onClick={handleRemove}
                              >
                                Remove
                              </Button>
                            ) : (
                              <Button
                                sx={{
                                  paddingLeft: "18px",
                                  paddingRight: "18px",
                                  background: "none",
                                  border: "none",
                                  borderRadius: "30px",
                                }}
                                onClick={handleApply}
                                disabled={loading}
                              >
                                  {loading ? <CircularProgress size={15} /> : "Apply"}
                              </Button>
                            )}
                          </Box>
                        </AccordionDetails>
                        <Typography pl={2}>
                          {cart?.coupon_status && (
                            <Typography component="div">
                              <Typography color={"green"} sx={{ fontSize: "16px" }}>
                                {currency?.symbol}{" "}
                                {(
                                  currency?.rate *
                                  cart?.discountAmount
                                ).toFixed(2)}{" "}
                                Coupon Applied Successfully
                              </Typography>
                            </Typography>
                          )}
                          {error && (
                            <Typography
                              color={"red"}
                              sx={{ fontSize: "16px" }}
                              component="div"
                            >
                              {error}
                            </Typography>
                          )}
                        </Typography>
                      </Accordion>
                      <Accordion
                        expanded={isNoteOpen}
                        sx={{
                          boxShadow: "none",
                          borderTop: "none",
                        }}
                      >
                        <AccordionSummary
                          aria-controls="panel2-content"
                          id="panel2-header"
                          onClick={handleNoteAccordionToggle}
                        >
                          <Button
                            sx={{
                              background: "transparent",
                              color: "#000",
                              padding: "10px 18px",
                              fontSize: "13px",
                              borderRadius: "25px",
                            }}
                          >
                            <Typography
                              component="span"
                              mr={1}
                              sx={{
                                background: "#43639f",
                                borderRadius: "50%",
                                height: "24px",
                                width: "24px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <svg
                                stroke="#fff"
                                fill="#fff"
                                xmlns="http://www.w3.org/2000/svg"
                                height="14px"
                                width="14px"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                focusable="false"
                              >
                                <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 11h10v2H7v-2z"></path>
                              </svg>
                            </Typography>
                            + Add a note to {capitalizeFirstLetter(cart?.shop_name)}
                          </Button>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            sx={{
                              height: "50px",
                              padding: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#fff",
                              boxShadow: "0 0 3px #000",
                              borderRadius: "30px",
                            }}
                          >
                            <TextField
                              required
                              id="outlined-required"
                              placeholder="Enter your note"
                              sx={{
                                ".MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                              }}
                              value={vendorNote}
                              name="vendor_note"
                              onChange={(e) => {
                                setVendorNote(e.target.value);
                              }}
                            />
                            <Button
                              sx={{
                                paddingLeft: "18px",
                                paddingRight: "18px",
                                background: "none",
                                border: "none",
                                borderRadius: "30px",

                              }}
                              onClick={handleSaveNote}
                              disabled={addingNote}
                            >
                                {addingNote ? <CircularProgress size={15} /> : "Save"}
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </Typography>
                  </Typography>
                </Box>
              </>
            )
          }
          {
            token && (
              <>
                {
                  cart?.shippingAvailable ? (
                    <Box
                      pt={2}
                      borderTop="1px solid #d4d4d4"
                      sx={{
                        display: 'flex',
                        flexDirection: {
                          xs: 'column', // mobile
                          md: 'row',    // desktop/tablet
                        },
                        justifyContent: {
                          xs: 'flex-start',
                          md: 'space-between',
                        },
                        alignItems: {
                          xs: 'flex-start',
                          md: 'center',
                        },
                      }}
                    >
                      <Box>
                        <Typography fontSize={17} color={"#000"}>
                          Estimated delivery:
                        </Typography>
                        <Select
                          value={deliveryOption}
                          onChange={(e) => setDeliveryOption(e.target.value)}
                          sx={{
                            borderBottom: "1px dashed gray", width: {
                              xs: "auto",
                              md: "397px",
                            }
                          }}
                        >
                          {deliveryOptions?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Typography fontSize={16}>{option.label}</Typography>
                              {/* <Typography fontSize={12} color={"gray"}>
                                                  {option.info}
                                                  </Typography> */}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Button
                        variant="outlined"
                        sx={{
                          border: "none",
                          color: "#000",
                          fontWeight: "bold",
                          textTransform: "none",
                        }}
                        endIcon={<ArrowForwardIcon />}
                        onClick={handleVendorCheckout}
                      >
                        Checkout for this shop only
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Typography color="error">
                        Oops! We're currently unable to deliver to your location.
                      </Typography>
                    </>
                  )
                }
              </>
            )
          }
        </Box>
      </Card>
      {isModalOpen && (
        <CheckoutPopup
          open={isModalOpen}
          onClose={() => {
            setModalOpen(false);
          }}
          vendor_id={cart?.vendor_id}
        />
      )}
    </>
  );
};

export default SingleVendorCart;
