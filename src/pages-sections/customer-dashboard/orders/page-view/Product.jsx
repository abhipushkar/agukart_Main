import { Box, Button, Grid, Typography } from "@mui/material";
import { H2, H3, H4, H6 } from "components/Typography";
import { useCurrency } from "contexts/CurrencyContext";
import React, { useState } from "react";
import MessagePopup from "./MessagePopup";
import { useRouter } from "next/navigation";
import { useToasts } from "react-toast-notifications";

const Product = ({ baseUrl,shopBaseUrl, setReviewId,setVendorId, SetOpenPopup,order,product }) => {
  console.log({order,product,shopBaseUrl},"DFhrtfyhrthjrthrt");
  const router = useRouter();
  const { addToast } = useToasts();
  const { currency } = useCurrency();
  const [openMessagePopup, SetMessageOpenPopup] = useState(false);

  const handleClickPopup = () => {
    SetOpenPopup(true);
  };
  const handleMessageClickPopup = () => {
    SetMessageOpenPopup(true);
  };

  const handleMessageClosePopup = () => {
    SetMessageOpenPopup(false);
  };

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ margin: "0", width: "100%", mb: "20px" }}
      >
        <Grid lg={9} md={6} xs={12} sx={{ paddingTop: "0" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                height: "80px",
                minWidth: "80px",
              }}
              border={"1px solid gray"}
            >
              <img
                alt="banner"
                style={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
                src={baseUrl + product?.productData?.image[0]}
              />
            </Box>

            <Typography component="div" ml={2}>
              <H3
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
                fontWeight={600}
              >
                {product?.productData?.product_title?.replace(
                  /<\/?[^>]+(>|$)/g,
                  ""
                )}
              </H3>
              {product?.isCombination && (
                <>
                  {product?.variantData?.map((variant, index) => (
                    <Typography
                      fontSize={17}
                      color="gray"
                      key={`variant-${index}`}
                    >
                      {variant?.variant_name}:{" "}
                      <Typography fontSize={17} component="span">
                        {product?.variantAttributeData?.[index]
                          ?.attribute_value || "N/A"}
                      </Typography>
                    </Typography>
                  ))}
                </>
              )}
              {product?.customize == "Yes" && (
                <>
                  {product?.customizationData?.map((item, index) => (
                    <div key={index}>
                      {Object.entries(item).map(([key, value]) => (
                        <div key={key}>
                          {typeof value === "object" ? (
                            <div>
                              {key}:
                              {`${value?.value} (${currency?.symbol} ${(value?.price * currency?.rate).toFixed(2)})`}
                            </div>
                          ) : (
                            <div>
                              {key}: {value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
              <Typography fontSize={15}>
                <span style={{ fontWeight: "600" }}>Qty :</span>
                <span> {product.qty}</span>
              </Typography>
              <Typography component="div" mt={1}>
                <Button
                  onClick={() =>
                    router.push(`/products?id=${product.product_id}`)
                  }
                  variant="contained"
                  sx={{
                    background: "yellow",
                    borderRadius: "30px",
                  }}
                >
                  Buy it again
                </Button>
                {/* <Button
                                      variant="contained"
                                      sx={{
                                        background: "#fff",
                                        borderRadius: "30px",
                                        border: "1px solid #000",
                                        marginTop: {
                                          lg: "0",
                                          md: "0",
                                          xs: "12px",
                                        },
                                        marginLeft: {
                                          lg: "12px",
                                          md: "12px",
                                          xs: "0",
                                        },
                                      }}
                                    >
                                      view Your item
                                    </Button> */}
                <Button
                  onClick={handleMessageClickPopup}
                  variant="contained"
                  sx={{
                    background: "yellow",
                    borderRadius: "30px",
                  }}
                >
                  Help with order
                </Button>
              </Typography>
            </Typography>
          </Box>
        </Grid>
        <Grid lg={3} md={6} xs={12} sx={{ paddingTop: "0" }}>
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
            <Typography
              component="div"
              sx={{
                marginTop: {
                  lg: "0",
                  md: "0",
                  xs: "12px",
                },
              }}
            >
              {/* <Button
                                    variant="contained"
                                    sx={{
                                      background: "#fff",
                                      borderRadius: "30px",
                                      border: "1px solid #000",
                                      width: "100%",
                                    }}
                                  >
                                    Contact to us
                                  </Button> */}

              {product.order_status == "completed" &&
                product.delivery_status == "Delivered" && (
                  <Button
                    onClick={() => {
                      if (product.ratingStatus) {
                        addToast("Product review have already given", {
                          appearance: "error",
                          autoDismiss: true,
                        });
                        return;
                      }
                      setReviewId(product?._id);
                      setVendorId(product?.vendor_id);
                      handleClickPopup();
                    }}
                    variant="contained"
                    sx={{
                      background: "#fff",
                      borderRadius: "30px",
                      border: "1px solid #000",
                      width: "100%",
                      marginBottom: "12px",
                    }}
                  >
                    write a product review
                  </Button>
                )}

              {product.delivery_status !== "No tracking" ? (
                <Button
                  variant="contained"
                  sx={{
                    marginBottom: "16px",
                    background: "#fff",
                    borderRadius: "30px",
                    border: "1px solid #000",
                    width: "100%",
                  }}
                >
                  Track package
                </Button>
              ) : (
                ""
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <MessagePopup
        vendorName={product?.vendor_name}
        shopName={product?.vendorData?.shop_name}
        shopImage={`${shopBaseUrl}/${product?.vendorData?.shop_icon}`}
        openPopup={openMessagePopup}
        receiverid={product?.vendor_id}
        productID={product?.productData?._id}
        productData={product}
        product_image={baseUrl + product?.productData?.image[0]}
        orderId = {order?.order_id}
        handleClosePopup={handleMessageClosePopup}
      />
    </>
  );
};

export default Product;
