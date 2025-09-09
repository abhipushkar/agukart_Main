"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "@mui/material/Link";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { Radio, RadioGroup, Skeleton } from "@mui/material";
import {
  Box,
  CircularProgress,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useRouter, useSearchParams } from "next/navigation";
import { getAPI, postAPIAuth } from "utils/__api__/ApiServies";
import useMyProvider from "hooks/useMyProvider";
import { useCurrency } from "contexts/CurrencyContext";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const HiddenRadio = styled(Radio)({
  display: "none",
});

const GiftCardDetail = ({ id }) => {
  const { currency } = useCurrency();
  const router = useRouter();
  const { usercredentials } = useMyProvider();
  const [showLoading, setShowLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [giftCardData, setGiftCardData] = useState({});
  const [selectedPay, setSelectedPay] = useState("");
  const [formValues, setFormValues] = useState({
    amount: "",
    email: "",
    name: usercredentials?.name,
    message: "Hope you enjoy this gift card!",
    qty: "1",
    delivery_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({
    amount: "",
    email: "",
    name: "",
    message: "",
    qty: "",
    delivery_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prv) => ({ ...prv, [name]: "" }));
  };
  const handleSelectPay = (value) => {
    setSelectedPay(value);
  };
  const getGiftCardDetail = async () => {
    try {
      setShowLoading(true);
      const res = await getAPI(`get-gift-card/${id}`);

      console.log(res, "serach resopoinshhhhhhl");
      if (res.status === 200) {
        setGiftCardData(res.data.data);
      }
    } catch (error) {
      setShowLoading(false);
      console.log(error);
    } finally {
      setShowLoading(false);
    }
  };
  useEffect(() => {
    getGiftCardDetail();
  }, [id]);

  const handleBuyNow = async () => {
    const newErrors = {};
    if (!formValues.amount) newErrors.amount = "Amount is required";
    if (!formValues.email) newErrors.email = "Email is required";
    if (formValues.email?.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formValues.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    if (!formValues.name) newErrors.name = "Name is required";
    if (!formValues.message) newErrors.message = "Message is required";
    if (!formValues.qty) newErrors.qty = "Quantity is required";
    if (!formValues.delivery_date)
      newErrors.delivery_date = "Delivery Date is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (!usercredentials) {
        return router.push("/login");
      }
      try {
        const payload = {
          amount: formValues?.amount,
          email: formValues?.email,
          name: formValues?.name,
          message: formValues?.message,
          qty: formValues?.qty,
          gift_card_id: giftCardData?._id,
          delivery_date: formValues?.delivery_date,
        };
        setLoading(true);
        const res = await postAPIAuth("user/purchase-gift-card", payload);
        if (res.status === 200) {
          setLoading(false);
          router.push("/gift-card-purchase");
        }
      } catch (error) {
        setLoading(false);
        console.log("error", error?.response?.data || error);
      }
    }
  };

  const handleVisitCount = async () => {
    try {
      const res = await postAPIAuth("increase-gift-card-visit-count", {
        gift_card_id: id,
      });
      if (res.status === 201) {
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleVisitCount();
  }, []);

  const GiftCardDetailShimmer = () => {
    return (
      <Grid container spacing={2} py={4}>
        {/* Left Column (Image + Card info) */}
        <Grid item lg={4} md={4} xs={12}>
          <Card>
            <CardMedia>
              <Skeleton
                variant="rectangular"
                height={250}
                animation="wave"
                sx={{ width: "100%" }}
              />
            </CardMedia>
            <CardContent>
              <Box
                pb={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={2}
              >
                <Box textAlign="center" width="50%">
                  <Skeleton variant="text" width="80%" height={28} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={60} height={28} />
                </Box>
              </Box>
              <Box pt={2} borderTop="1px solid #d8d8d8">
                <Skeleton variant="text" width="90%" height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Middle Column (Form Fields) */}
        <Grid item lg={6} md={5} xs={12}>
          <Box>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />

            <Box mt={3}>
              <Skeleton variant="text" width="60%" height={24} />
              <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={100}
                    height={40}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Box>

              <Box mt={3}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Box>

              <Box mt={3}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Box>

              <Box mt={3}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={40} />
              </Box>

              <Box mt={3}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton
                  variant="text"
                  width="70%"
                  height={16}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box mt={3}>
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={40} />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={16}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right Column (Summary) */}
        <Grid item lg={2} md={3} xs={12}>
          <Box
            p={2}
            sx={{
              textAlign: "center",
              borderRadius: "5px",
              border: "1px solid #000",
              background: "#fff",
            }}
          >
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="50%" height={24} sx={{ mt: 1 }} />
            <Skeleton
              variant="rectangular"
              width="100%"
              height={36}
              sx={{ borderRadius: "30px", mt: 2 }}
            />
          </Box>
        </Grid>

        {/* Description Placeholder */}
        <Grid item xs={12} mt={2}>
          <Skeleton variant="rectangular" height={150} width="100%" />
        </Grid>
      </Grid>
    );
  };

  return (
    <SectionCreator py={4}>
      {showLoading ? (
        <GiftCardDetailShimmer />
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid item lg={4} md={4} xs={12}>
              <Card>
                <CardMedia
                  component="img"
                  alt="green iguana"
                  height="250"
                  image={giftCardData?.image}
                />
                <CardContent>
                  <Box
                    pb={2}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      component="div"
                      pr={2}
                      sx={{ borderRight: "1px solid #d8d8d8" }}
                      textAlign={"center"}
                    >
                      <Typography variant="h6">Agukart</Typography>
                      <Typography sx={{ fontSize: "18px", fontWeight: "500" }}>
                        gift Card
                      </Typography>
                    </Typography>
                    <Typography component="div" pl={2}>
                      <Typography sx={{ fontSize: "20px", fontWeight: "500" }}>
                        {formValues?.amount &&
                          `${currency?.symbol}${(currency?.rate * formValues?.amount).toFixed(2)}`}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box pt={2} sx={{ borderTop: "1px solid #d8d8d8" }}>
                    <Typography sx={{ fontSize: "18px" }}>
                      Your personal message will appear here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item lg={6} md={5} xs={12}>
              <Box>
                <Typography component="div" pb={3}>
                  <Typography variant="h5" fontWeight={500}>
                    {giftCardData?.title}
                  </Typography>
                  <Typography sx={{ fontSize: "16px" }}>
                    by{" "}
                    <Link
                      href=""
                      sx={{
                        textDecoration: "none",
                        color: "#007185",
                        "&:hover": {
                          textDecoration: "underline",
                          color: "#c7511f",
                        },
                      }}
                    >
                      Agukart
                    </Link>
                  </Typography>
                </Typography>
                <Typography
                  component="div"
                  pt={3}
                  sx={{ borderTop: "1px solid #eeeeee" }}
                >
                  <Typography variant="h6">
                    Enter your Gift Card details
                  </Typography>
                  <Box mt={3} sx={{ display: "block" }}>
                    <Typography
                      component="label"
                      fontWeight={600}
                      color={"#000"}
                      fontSize={"15px"}
                    >
                      Amount
                    </Typography>
                    <RadioGroup
                      defaultValue="payment1"
                      name="radio-buttons-group"
                      sx={{ display: "block" }}
                    >
                      <Button
                        onClick={() => {
                          handleSelectPay("payment1");
                          setFormValues((prev) => ({ ...prev, amount: "25" }));
                        }}
                        sx={{
                          border: "1px solid #000",
                          borderRadius: "8px",
                          border:
                            selectedPay === "payment1"
                              ? "3px solid #1976d2"
                              : "2px solid #000",
                          background: "none !important",
                          display: "inline-block",
                          margin: "10px",
                        }}
                      >
                        <FormControlLabel
                          sx={{ margin: "0" }}
                          value="payment1"
                          control={
                            <HiddenRadio checked={selectedPay === "payment1"} />
                          }
                          label={
                            <Typography
                              sx={{
                                color: "#000",
                                fontWeight:
                                  selectedPay === "payment1" ? 600 : 500,
                              }}
                            >
                              {currency?.symbol}
                              {(currency?.rate * 25).toFixed(2)}
                            </Typography>
                          }
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          handleSelectPay("payment2");
                          setFormValues((prev) => ({ ...prev, amount: "50" }));
                        }}
                        sx={{
                          border: "1px solid #000",
                          borderRadius: "8px",
                          border:
                            selectedPay === "payment2"
                              ? "3px solid #1976d2"
                              : "2px solid #000",
                          background: "none !important",
                          display: "inline-block",
                          margin: "10px",
                        }}
                      >
                        <FormControlLabel
                          sx={{ margin: "0" }}
                          value="payment2"
                          control={
                            <HiddenRadio checked={selectedPay === "payment2"} />
                          }
                          label={
                            <Typography
                              sx={{
                                color: "#000",
                                fontWeight:
                                  selectedPay === "payment2" ? 600 : 500,
                              }}
                            >
                              {currency?.symbol}
                              {(currency?.rate * 50).toFixed(2)}
                            </Typography>
                          }
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          handleSelectPay("payment3");
                          setFormValues((prev) => ({ ...prev, amount: "100" }));
                        }}
                        sx={{
                          border: "1px solid #000",
                          borderRadius: "8px",
                          border:
                            selectedPay === "payment3"
                              ? "3px solid #1976d2"
                              : "2px solid #000",
                          background: "none !important",
                          display: "inline-block",
                          margin: "10px",
                        }}
                      >
                        <FormControlLabel
                          sx={{ margin: "0" }}
                          value="payment3"
                          control={
                            <HiddenRadio checked={selectedPay === "payment3"} />
                          }
                          label={
                            <Typography
                              sx={{
                                color: "#000",
                                fontWeight:
                                  selectedPay === "payment3" ? 600 : 500,
                              }}
                            >
                              {currency?.symbol}
                              {(currency?.rate * 100).toFixed(2)}
                            </Typography>
                          }
                        />
                      </Button>
                      <Button
                        onClick={() => {
                          handleSelectPay("payment4");
                          setFormValues((prev) => ({ ...prev, amount: "250" }));
                        }}
                        sx={{
                          border: "1px solid #000",
                          borderRadius: "8px",
                          border:
                            selectedPay === "payment4"
                              ? "3px solid #1976d2"
                              : "2px solid #000",
                          background: "none !important",
                          display: "inline-block",
                          margin: "10px",
                        }}
                      >
                        <FormControlLabel
                          sx={{ margin: "0" }}
                          value="payment4"
                          control={
                            <HiddenRadio checked={selectedPay === "payment4"} />
                          }
                          label={
                            <Typography
                              sx={{
                                color: "#000",
                                fontWeight:
                                  selectedPay === "payment4" ? 600 : 500,
                              }}
                            >
                              {currency?.symbol}
                              {(currency?.rate * 250).toFixed(2)}
                            </Typography>
                          }
                        />
                      </Button>
                    </RadioGroup>
                  </Box>
                  <Typography
                    component="div"
                    mt={2}
                    sx={{
                      width: { lg: "285px", md: "285px", xs: "100%" },
                      border: "1px solid #c3c3c3",
                      borderRadius: "7px",
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography
                        component="span"
                        sx={{ background: "#e2e2e2", padding: "8px" }}
                      >
                        {currency?.symbol}
                      </Typography>
                      <TextField
                        sx={{
                          width: "100%",
                          ".MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                        id="outlined-basic"
                        placeholder="Enter Amount"
                        variant="outlined"
                        value={formValues?.amount}
                        name="amount"
                        onChange={handleChange}
                        error={Boolean(errors.amount)}
                        // helperText={errors.amount}
                        onBlur={() => {
                          if (!formValues.amount) {
                            setErrors((prv) => ({
                              ...prv,
                              amount: "Amount is required",
                            }));
                          }
                        }}
                      />
                    </Typography>
                  </Typography>
                  {errors.amount && (
                    <p style={{ color: "#e94560", fontSize: "12px" }}>
                      {errors.amount}
                    </p>
                  )}
                  <Box mt={2}>
                    <Typography component="div" sx={{ display: "block" }}>
                      <Typography
                        component="label"
                        fontWeight={600}
                        color={"#000"}
                        fontSize={"15px"}
                      >
                        Delivery
                      </Typography>
                      <Typography component="div">
                        <Button
                          sx={{
                            borderRadius: "8px",
                            border: "3px solid #1976d2",
                            background: "none !important",
                            display: "inline-block",
                            marginRight: "10px",
                          }}
                        >
                          Email
                        </Button>
                      </Typography>
                    </Typography>
                    <Typography component="div" mt={3}>
                      <Typography component="div" sx={{ display: "block" }}>
                        <Typography
                          component="label"
                          fontWeight={600}
                          color={"#000"}
                          fontSize={"15px"}
                        >
                          Recipient Email Address (required):
                        </Typography>
                        <Typography component="div">
                          <TextField
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                            onBlur={() => {
                              if (!formValues.email) {
                                setErrors((prv) => ({
                                  ...prv,
                                  email: "Email is required",
                                }));
                              }
                            }}
                            placeholder="recipient email Address (required):"
                            value={formValues?.email}
                            name="email"
                            onChange={handleChange}
                            multiline
                            minRows={1}
                            sx={{ width: { lg: "70%", md: "70%", xs: "100%" } }}
                          />
                          {/* <Typography component="div">
                      <Typography sx={{ fontSize: '11px', color: 'gray' }}>You can add up to 10 recipients. Each recipient will receive their own personalized gift card.</Typography>
                    </Typography> */}
                        </Typography>
                      </Typography>
                      <Typography
                        component="div"
                        mt={2}
                        sx={{ display: "block" }}
                      >
                        <Typography
                          component="label"
                          fontWeight={600}
                          color={"#000"}
                          fontSize={"15px"}
                        >
                          From
                        </Typography>
                        <Typography component="div">
                          <TextField
                            placeholder="Your name"
                            sx={{ width: { lg: "70%", md: "70%", xs: "100%" } }}
                            value={formValues?.name}
                            name="name"
                            onChange={handleChange}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                            onBlur={() => {
                              if (!formValues.name) {
                                setErrors((prv) => ({
                                  ...prv,
                                  name: "Name is Required",
                                }));
                              }
                            }}
                          />
                        </Typography>
                      </Typography>
                      <Typography component="div" sx={{ display: "block" }}>
                        <Typography
                          component="label"
                          fontWeight={600}
                          color={"#000"}
                          fontSize={"15px"}
                        >
                          Gift Message
                        </Typography>
                        <Typography component="div">
                          <TextField
                            placeholder="write a message"
                            multiline
                            minRows={1}
                            sx={{ width: { lg: "70%", md: "70%", xs: "100%" } }}
                            value={formValues?.message}
                            name="message"
                            onChange={handleChange}
                            error={Boolean(errors.message)}
                            helperText={errors.message}
                            onBlur={() => {
                              if (!formValues.message) {
                                setErrors((prv) => ({
                                  ...prv,
                                  message: "Message is Required",
                                }));
                              }
                            }}
                          />
                          <Typography component="div">
                            <Typography
                              sx={{ fontSize: "11px", color: "gray" }}
                            >
                              459 characters remaining
                            </Typography>
                          </Typography>
                        </Typography>
                      </Typography>
                      <Typography
                        component="div"
                        mt={2}
                        sx={{ display: "block" }}
                      >
                        <Typography
                          component="label"
                          fontWeight={600}
                          color={"#000"}
                          fontSize={"15px"}
                        >
                          Quantity:
                        </Typography>
                        <Typography component="div">
                          <TextField
                            sx={{ width: { lg: "70%", md: "70%", xs: "100%" } }}
                            value={formValues?.qty}
                            name="qty"
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^\d*$/.test(value)) {
                                handleChange(e);
                              }
                            }}
                            error={Boolean(errors.qty)}
                            helperText={errors.qty}
                            onBlur={() => {
                              if (!formValues.qty) {
                                setErrors((prv) => ({
                                  ...prv,
                                  qty: "Quantity is Required",
                                }));
                              }
                            }}
                          />
                        </Typography>
                      </Typography>
                      <Typography
                        component="div"
                        mt={2}
                        sx={{ display: "block" }}
                      >
                        <Typography
                          component="label"
                          fontWeight={600}
                          color={"#000"}
                          fontSize={"15px"}
                        >
                          Delivery Date:
                        </Typography>
                        <Typography component="div">
                          <TextField
                            type="date"
                            sx={{ width: { lg: "70%", md: "70%", xs: "100%" } }}
                            value={formValues?.delivery_date}
                            name="delivery_date"
                            onChange={handleChange}
                            error={Boolean(errors.delivery_date)}
                            helperText={errors.delivery_date}
                            onBlur={() => {
                              if (!formValues.delivery_date) {
                                setErrors((prv) => ({
                                  ...prv,
                                  delivery_date: "Delivery Date is Required",
                                }));
                              }
                            }}
                          />
                          <Typography component="div">
                            <Typography
                              sx={{ fontSize: "11px", color: "gray" }}
                            >
                              You can schedule a gift card for up to 3 months
                              from today.
                            </Typography>
                          </Typography>
                        </Typography>
                      </Typography>
                    </Typography>
                  </Box>
                </Typography>
              </Box>
            </Grid>
            <Grid item lg={2} md={3} xs={12}>
              <Box
                p={2}
                sx={{
                  textAlign: "center",
                  borderRadius: "5px",
                  border: "1px solid #000",
                  background: "#fff",
                }}
              >
                <Typography>Qty: {formValues?.qty} gift card</Typography>
                <Typography sx={{ color: "#b12704", fontWeight: "600" }}>
                  {currency?.symbol}
                  {(
                    currency?.rate *
                    +formValues?.amount *
                    +formValues?.qty
                  ).toFixed(2)}
                </Typography>
                <Typography component="div" mt={1}>
                  {/* <Button sx={{fontSize:'12px',width:'100%',background:'#ffd814',borderRadius:'30px',padding:'4px 18px','&:hover':{background:'#ffe836'}}}>Add to cart</Button>
              <Typography my={1}><Typography component="span" sx={{position:'relative','&:before':{content:'""',position:'absolute',top:'12px',left:'-82px',width:'76px',height:'1px',background:'#f3f3f3'},'&:after':{content:'""',position:'absolute',top:'12px',right:'-82px',width:'76px',height:'1px',background:'#f3f3f3'}}}>or </Typography></Typography> */}
                  <Button
                    endIcon={loading ? <CircularProgress size={15} /> : ""}
                    disabled={loading ? true : false}
                    sx={{
                      fontSize: "12px",
                      width: "100%",
                      background: "#ffa41c",
                      borderRadius: "30px",
                      padding: "4px 18px",
                      "&:hover": { background: "#fbb64f" },
                    }}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <HtmlRenderer html={giftCardData?.description || ""} />
        </>
      )}
    </SectionCreator>
  );
};

export default GiftCardDetail;
