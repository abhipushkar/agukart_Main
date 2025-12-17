"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
// GLOBAL CUSTOM COMPONENTS

import BazaarCard from "components/BazaarCard";
import { H1, H2, H3, H4, Paragraph, Span } from "components/Typography";
import { AspectRatio } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import { FlexBox, FlexRowCenter } from "components/flex-box";
import { CircularProgress } from "@mui/material";
// STYLED COMPONENT

const Wrapper = styled(BazaarCard)({
  margin: "auto",
  padding: "3rem",
  maxWidth: "630px",
  textAlign: "center",
});
const StyledButton = styled(Button)({
  marginTop: "2rem",
  padding: "11px 24px",
});
export default function OrderConfirmationPageView() {
  const searchParams = useSearchParams();
  const [orderDetail, setOrderDetail] = useState(null);
  console.log(orderDetail, "---------orderdetail")
  const [showError, setShowError] = useState(false);
  const orderIds = searchParams.getAll("order-id");

  const router = useRouter();

  const getOrderDetailsById = async (orderIds) => {
    // try {
    //   const res = await getAPIAuth(`user/getOrderDetailsById/${orderId}`);
    //   if (res.status === 200) {
    //     setShowError(false);
    //     setOrderDetail({ ...res.data.data, base_url: res.data.base_url });
    //   }
    // } catch (error) {
    //   if (error) {
    //     setShowError(true);
    //     setOrderDetail(error);
    //   }
    // }
    try {
      const resArray = await Promise.all(
        orderIds.map((id) =>
          getAPIAuth(`user/getOrderDetailsById/${id}`)
        )
      );

      const validData = resArray
        .filter((res) => res?.status === 200)
        .map((res) => ({ ...res.data.data, base_url: res.data.base_url }));

      setShowError(false);
      setOrderDetail(validData);

    } catch (error) {
      console.error("Error fetching order details:", error);
      setShowError(true);
      setOrderDetail(error);
    }
  };

  useEffect(() => {
    if (orderIds.length > 0) {
      getOrderDetailsById(orderIds);
    }
    // convert to string so dependency compare properly
  }, [orderIds.join(",")]);

  console.log({ orderDetail });

  return showError ? (
    <FlexRowCenter px={2} minHeight="100vh" flexDirection="column">
      <Box maxWidth={320} width="100%" mb={3}>
        <Typography
          color={"#E3364E"}
          fontWeight={600}
          sx={{ textWrap: "nowrap" }}
          textAlign={"center"}
          variant="h3"
          gutterBottom
        >
          {orderDetail?.response?.data?.message}
        </Typography>
      </Box>

      <FlexBox flexWrap="wrap" gap={2}>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.back()}
        >
          Go Back
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push("/")}
        >
          Go to Home
        </Button>
      </FlexBox>
    </FlexRowCenter>
  ) : (
    <Container className="mt-2 mb-2">
      {orderDetail === null ? (
        <Box
          sx={{
            display: "flex ",
            flexDirection: "column",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Typography variant="h6">We are working on your request</Typography>
            <CircularProgress size={20} />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{ background: "#e4e4e4", padding: "12px", borderRadius: "8px" }}
        >
          {
            orderDetail?.map((orderDetail, index) => (
              <Wrapper
                key={index}
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  textAlign: "start",
                  padding: "24px",
                  marginBottom: "5px"
                }}
              >
                <Box py={2}>
                  <H3
                    sx={{ display: "flex", alignItems: "center", color: "#4d8914" }}
                  >
                    <CheckCircleIcon
                      sx={{ fontSize: "30px", paddingRight: "6px" }}
                    />
                    Order Placed, thank you!
                  </H3>
                  <Typography pt={1} fontWeight={500}>
                    Confirmation will be sent to{" "}
                    <Link href="" style={{ color: "#2a82dd" }}>
                      Message center.
                    </Link>
                  </Typography>

                  <Typography pt={2} fontWeight={500}>
                    <Typography component="span" fontWeight={600}>
                      Shipping to{" "}
                      <span style={{ textTransform: "capitalize" }}>
                        {orderDetail?.name}
                      </span>{" "}
                      {", "}
                    </Typography>{" "}
                    {orderDetail?.address_line1}
                    {", "}
                    {orderDetail?.address_line2}
                    {` ${orderDetail?.city}`} {orderDetail?.pincode},{" "}
                    {orderDetail?.state}
                    {` ${orderDetail?.country}`}
                  </Typography>
                </Box>
                <Box py={2} sx={{ borderTop: "1px solid #e7e7e7" }}>
                  {orderDetail?.sales_details.map((product, i) => {
                    return (
                      <Typography
                        key={product._id}
                        component="div"
                        sx={{ display: "flex", gap: "10px", marginBottom: "20px" }}
                      >
                        <Typography
                          sx={{
                            height: "100px",
                            minWidth: "100px",
                          }}
                          border={"1px solid black"}
                          component="div"
                        >
                          <img
                            src={orderDetail?.base_url + product?.productData?.image[0]}
                            style={{
                              height: "100%",
                              width: "100%",
                              objectFit: "cover",
                            }}
                            alt=""
                          />
                        </Typography>
                        <Typography component="div">
                          <Typography mb={1} fontWeight={600} onClick={() => router.push(`/products/${product?.productData?._id}`)}>

                            {product?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                          </Typography>
                          <Typography fontSize={12}>
                            {" "}
                            <Typography
                              fontSize={12}
                              component={Span}
                              fontWeight={600}
                            >
                              Qty
                            </Typography>{" "}
                            : {product.qty}
                          </Typography>
                          {product?.isCombination && (
                            <>
                              {product?.variant_id?.map((variant, index) => (
                                <Typography fontSize={17} color="gray" key={`variant-${index}`}>
                                  {variant?.variant_name}:{" "}
                                  <Typography fontSize={17} component="span">
                                    {product?.variant_attribute_id?.[index]?.attribute_value || "N/A"}
                                  </Typography>
                                </Typography>
                              ))}
                            </>
                          )}
                          {
                            product?.customize == "Yes" && (
                              <>
                                {
                                  product?.customizationData?.map((item, index) => (
                                    <div key={index}>
                                      {Object.entries(item).map(([key, value]) => (
                                        <div key={key}>
                                          {typeof value === 'object' ? (
                                            <div>
                                              {key}:{`${value?.value} ($ ${value?.price})`}
                                            </div>
                                          ) : (
                                            <div>{key}: {value}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ))
                                }
                              </>
                            )
                          }
                        </Typography>
                      </Typography>
                    );
                  })}
                </Box>

                <Typography component="div" mt={4}>
                  <Link
                    href="/profile/orders"
                    style={{
                      color: "#2a82dd",
                      fontSize: "16px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Go to your orders <KeyboardArrowRightIcon />
                  </Link>
                </Typography>
              </Wrapper>
            ))
          }
        </Box>
      )}
    </Container>
  );
}
