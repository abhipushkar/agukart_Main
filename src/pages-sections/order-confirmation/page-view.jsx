"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import styled from "@mui/material/styles/styled";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CircleIcon from "@mui/icons-material/Circle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { useRouter, useSearchParams } from "next/navigation";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { useEffect, useState } from "react";
import { FlexBox, FlexRowCenter } from "components/flex-box";
import { CircularProgress, Divider } from "@mui/material";
import BazaarCard from "components/BazaarCard";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "24px",
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: "16px",
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
}));

export default function OrderConfirmationPageView() {
  const searchParams = useSearchParams();
  const [orderDetail, setOrderDetail] = useState(null);
  const [showError, setShowError] = useState(false);
  const orderIds = searchParams.getAll("order-id");
  const router = useRouter();

  const getOrderDetailsById = async (orderIds) => {
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
  }, [orderIds.join(",")]);

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
    <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
      {orderDetail === null ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6">We are working on your request</Typography>
            <CircularProgress size={20} />
          </Box>
        </Box>
      ) : (
        <Box sx={{ width: "100%", maxWidth: "800px" }}>
          {orderDetail?.map((orderDetail, index) => (
            <BazaarCard
              key={index}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 3,
                p: 4,
                mb: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {/* Celebration Header */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 48,
                    color: "primary.main",
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 1,
                    fontSize: { xs: "1.75rem", md: "2.125rem" },
                  }}
                >
                  Woohoo! Your order is confirmed.
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: "16px",
                    mb: 1,
                  }}
                >
                  The seller starts working on it right away.
                </Typography>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontSize: "16px",
                  }}
                >
                  You'll get a shipping email when it's on its way.
                </Typography>
              </Box>

              {/* Progress Tracker */}
              <Box sx={{ mb: 5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "relative",
                    mb: 2,
                    px: { xs: 1, sm: 4 },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      right: 0,
                      height: "2px",
                      bgcolor: "divider",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                    }}
                  />
                  {["Ordered", "Ready to ship", "Delivery"].map((step, i) => (
                    <Box
                      key={step}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 2,
                        position: "relative",
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: i === 0 ? "primary.main" : "background.paper",
                          border: `2px solid ${i === 0 ? "primary.main" : "divider"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                        }}
                      >
                        {i === 0 ? (
                          <CheckCircleOutlineIcon sx={{ color: "white", fontSize: 18 }} />
                        ) : i === 1 ? (
                          <LocalShippingIcon sx={{ 
                            fontSize: 18,
                            color: i === 0 ? "white" : "text.secondary"
                          }} />
                        ) : (
                          <CircleIcon sx={{ 
                            fontSize: 18,
                            color: "text.secondary"
                          }} />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: i === 0 ? "primary.main" : "text.secondary",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        {step}
                      </Typography>
                      {i === 1 && (
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: "text.secondary",
                            mt: 0.5,
                            textAlign: "center",
                            maxWidth: "120px",
                          }}
                        >
                          Usually ships in 1-2 business days
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Primary CTA */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <StyledButton
                  variant="contained"
                  color="primary"
                  onClick={() => router.push("/profile/orders")}
                  sx={{ 
                    maxWidth: "240px",
                    width: "100%",
                  }}
                >
                  View your order
                </StyledButton>
              </Box>

              {/* Confirmation Number */}
              <Box
                sx={{
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  p: 3,
                  mb: 4,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "text.secondary",
                    fontSize: "14px",
                    mb: 1,
                  }}
                >
                  Confirmation number
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    fontSize: "20px",
                    letterSpacing: "0.5px",
                  }}
                >
                  {`#${orderDetail?.order_id}` || "N/A"}
                </Typography>
              </Box>

              {/* Order Details List */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 3,
                  }}
                >
                  Order details
                </Typography>
                {orderDetail?.sales_details?.map((product, i) => (
                  <Box key={product._id}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 3,
                        pb: 3,
                      }}
                    >
                      {/* Product Image */}
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          minWidth: 100,
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: "background.default",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={orderDetail?.base_url + product?.productData?.image[0]}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          alt="Product"
                        />
                      </Box>

                      {/* Product Info */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            fontSize: "16px",
                            mb: 1,
                            cursor: "pointer",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                          onClick={() => router.push(`/products/${product?.productData?._id}`)}
                        >
                          {product?.productData?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                        </Typography>
                        
                        <Typography
                          sx={{
                            fontSize: "14px",
                            color: "text.secondary",
                            mb: 0.5,
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              fontWeight: 600,
                              fontSize: "14px",
                            }}
                          >
                            Qty:
                          </Typography>{" "}
                          {product.qty}
                        </Typography>

                        {product?.isCombination && (
                          <Box sx={{ mt: 1 }}>
                            {product?.variant_id?.map((variant, idx) => (
                              <Typography
                                key={`variant-${idx}`}
                                sx={{
                                  fontSize: "14px",
                                  color: "text.secondary",
                                }}
                              >
                                {variant?.variant_name}:{" "}
                                <Typography
                                  component="span"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {product?.variant_attribute_id?.[idx]?.attribute_value || "N/A"}
                                </Typography>
                              </Typography>
                            ))}
                          </Box>
                        )}

                        {product?.customize === "Yes" && (
                          <Box sx={{ mt: 1 }}>
                            {product?.customizationData?.map((item, idx) => (
                              <Box key={idx}>
                                {Object.entries(item).map(([key, value]) => (
                                  <Typography
                                    key={key}
                                    sx={{
                                      fontSize: "14px",
                                      color: "text.secondary",
                                    }}
                                  >
                                    {typeof value === 'object' ? (
                                      <span>
                                        {key}: {value?.value} (${value?.price})
                                      </span>
                                    ) : (
                                      <span>
                                        {key}: {value}
                                      </span>
                                    )}
                                  </Typography>
                                ))}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    {i < orderDetail.sales_details.length - 1 && (
                      <Divider sx={{ my: 3 }} />
                    )}
                  </Box>
                ))}
              </Box>

              {/* Footer Link */}
              <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid`, borderColor: "divider" }}>
                <Link
                  href="/profile/orders"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: "16px",
                    textDecoration: "none",
                  }}
                >
                  <Typography
                    sx={{
                      color: "primary.main",
                      fontWeight: 600,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Go to your orders
                  </Typography>
                  <KeyboardArrowRightIcon sx={{ color: "primary.main", ml: 0.5 }} />
                </Link>
              </Box>
            </BazaarCard>
          ))}
        </Box>
      )}
    </Container>
  );
}
