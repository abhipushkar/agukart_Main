"use client";
import { Fragment, useEffect, useState } from "react";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Skeleton } from "@mui/material";
import Button from "@mui/material/Button";
import { getAPI } from "utils/__api__/ApiServies";
import { useCurrency } from "contexts/CurrencyContext";
import Link from "next/link";

const GiftCard = ({ id }) => {
  const { currency } = useCurrency();
  const [showLoading, setShowLoading] = useState(true);
  const [allGiftCardData, setAllGiftCardData] = useState([]);
  console.log({ allGiftCardData });

  const getGiftCardsDetails = async () => {
    try {
      setShowLoading(true);
      const res = await getAPI(`getGiftCardByCategoryId/${id}`);

      console.log(res, "serach resopoinshhhhhhl");
      if (res.status === 200) {
        setAllGiftCardData(res.data.data);
      }
    } catch (error) {
      setShowLoading(false);
      console.log(error);
    } finally {
      setShowLoading(false);
    }
  };
  useEffect(() => {
    getGiftCardsDetails();
  }, []);

  const GiftCardListShimmer = () => {
    return (
      <Grid container spacing={2}>
        {[...Array(6)].map((_, index) => (
          <Grid item key={index} lg={3} md={4} xs={12}>
            <Card>
              <CardMedia>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  height={160}
                  sx={{ width: "100%" }}
                />
              </CardMedia>

              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={18} />
                    <Skeleton variant="text" width="90%" height={16} />
                    <Skeleton variant="text" width="50%" height={18} />
                  </Box>

                  <Box sx={{ borderLeft: "1px solid #d8d8d8", pl: 2 }}>
                    <Skeleton variant="text" width={40} height={20} />
                    <Skeleton
                      variant="rectangular"
                      width={100}
                      height={30}
                      sx={{ borderRadius: "5px", mt: 1 }}
                    />
                  </Box>
                </Box>

                <Box pt={2} sx={{ borderTop: "1px solid #d8d8d8" }}>
                  <Skeleton variant="text" width="100%" height={20} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <SectionCreator py={4} mb={0}>
        <Box>
          {
            showLoading ? (
              <GiftCardListShimmer/>
            ):(
              allGiftCardData?.length > 0 ? (
                <Grid container spacing={2}>
                  {allGiftCardData?.map((giftcard, index) => (
                    <Grid key={index} item lg={3} md={4} xs={12}>
                      <Card>
                        <CardMedia
                          component="img"
                          alt="giftcard image"
                          height="160"
                          image={giftcard?.image}
                        />
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Typography component="div" pr={1} textAlign={"center"}>
                              <Typography
                                fontWeight={600}
                                sx={{ fontSize: "14px" }}
                                component="div"
                              >
                                E-Commerce
                              </Typography>
                              <Typography sx={{ fontSize: "12px" }}>
                                gift Card
                              </Typography>
                              <Typography sx={{ color: "gray", fontSize: "10px" }}>
                                gift Card code:
                              </Typography>
                              <Typography sx={{ fontSize: "12px" }}>
                                xxxx-xxxxxx-xxx
                              </Typography>
                            </Typography>
                            <Typography
                              component="div"
                              sx={{ borderLeft: "1px solid #d8d8d8" }}
                              pl={1}
                            >
                              <Typography sx={{ fontSize: "14px" }}>
                                {currency?.symbol}0
                              </Typography>
                              <Link
                                href={`/gift-card-detail/${giftcard?._id}`}
                                passHref
                              >
                                <Button
                                  sx={{
                                    whiteSpace: "nowrap",
                                    background: "#deaf48",
                                    color: "#000",
                                    fontSize: "11px",
                                    "&:hover": { background: "#bc933a" },
                                  }}
                                >
                                  Purchase Gift Card
                                  <PlayCircleFilledIcon
                                    sx={{ fontSize: "8px", marginLeft: "3px" }}
                                  />
                                </Button>
                              </Link>
                            </Typography>
                          </Box>
                          <Box pt={2} sx={{ borderTop: "1px solid #d8d8d8" }}>
                            <Typography sx={{ fontSize: "13px" }}>
                              Your personal message will appear here
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <>
                  <Box
                    sx={{
                      textAlign: "center",
                      fontSize: "20px",
                      textTransform: "uppercase",
                      fontWeight: 900,
                    }}
                  >
                    Gift Cards Not Found
                  </Box>
                </>
              )
            )
          }
        </Box>
      </SectionCreator>
    </>
  );
};

export default GiftCard;
