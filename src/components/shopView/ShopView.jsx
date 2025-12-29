"use client";
import { useCallback, useEffect, useState } from "react";
// import Link from "@mui/material/Link";
import Link from "next/link";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputBase from "@mui/material/InputBase";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import PinterestIcon from "@mui/icons-material/Pinterest";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { FlexBox } from "components/flex-box";

import CollectionTab from "./CollectionTab";
import ReviewsTab from "./ReviewsTab";
import AboutTab from "./AboutTab";
import ShopPolicyTab from "./ShopPolicyTab";
import { usePathname } from "next/navigation";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { CircularProgress, ListItemButton, Modal, Skeleton } from "@mui/material";
import useMyProvider from "hooks/useMyProvider";
import { useRouter } from "next/navigation";
import MessagePopup from "./MessagePopup";
import HomeTab from "./HomeTab";
import { useToasts } from "react-toast-notifications";
import UseScrollToHash from "./UseScrollToHash";
import { Carousel } from "components/carousel";

const ShopView = () => {
  UseScrollToHash();
  const { addToast } = useToasts();
  const [value, setValue] = useState("1");
  const [vendorCategories, setVendorCategories] = useState([]);
  const [announcementShowMore, setAnnouncementShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const { usercredentials } = useMyProvider();

  const [wishListProducts, setWishlistProducts] = useState([]);

  const [vendorDetail, setVendorDetail] = useState(null);
  console.log({ vendorDetail }, "eryeree");
  const [openPopup, SetOpenPopup] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const shareUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_WEB_URL}/store/${vendorDetail?.slug}`);
  const shareTitle = encodeURIComponent(vendorDetail?.shop_name);
  const copyToClipboard = () => {
    const url = `${process.env.NEXT_PUBLIC_WEB_URL}/store/${vendorDetail?.slug}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard!", {
      appearance: "success",
      autoDismiss: true,
    });
  };

  const handleClickPopup = () => {
    if (!token) {
      router.push("/login");
      return;
    }
    SetOpenPopup(true);
  };

  const handleClosePopup = () => {
    SetOpenPopup(false);
  };
  const { token } = useAuth();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const pathname = usePathname();
  const parts = pathname.split("/store/");

  const router = useRouter();

  const getVendorDetail = async () => {
    try {
      setLoading(true);
      let url = `getVendorDetailsBySlug/${parts[1]}`;
      if (token) {
        url = `getVendorDetailsBySlug/${parts[1]}?userId=${usercredentials?._id}`;
      }
      const res = await getAPIAuth(url, token);

      if (res.status === 200) {
        setLoading(false);
        const members = res?.data?.data?.members?.map((member) => ({
          ...member,
          imageUrl: member.images ? `${res?.data?.data?.member_image_url}${member.images}` : "",
        }));
        const shop_photos = res?.data?.data?.shop_photos?.map((shop) => ({
          ...shop,
          imageUrl: shop.image ? `${res?.data?.data?.member_image_url}${shop.image}` : "",
        }));
        console.log({ members }, "dgfgfgfgf")
        setVendorDetail({ ...res.data.data, members, shop_photos });
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getVendorProductCategory = async () => {
    try {
      const res = await getAPIAuth(
        `getVendorCategoryBySlug/${parts[1]}`,
        token
      );
      if (res.status === 200) {
        setVendorCategories(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getWishListProducts = async () => {
    if (!token) {
      return;
    }
    try {
      const res = await getAPIAuth(`user/get-wishlist`, token);

      console.log(res);
      if (res.status === 200) {
        const wishListArr = res.data.wishlist.map((product) => {
          return product.product_id._id;
        });
        setWishlistProducts(wishListArr);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getVendorDetail();
    getVendorProductCategory();
  }, [pathname]);

  useEffect(() => {
    if (token) {
      getWishListProducts();
    }
  }, [pathname]);

  const toggelFollowShopHandler = async () => {
    if (!token) {
      return router.push("/login")
    }
    try {
      const res = await postAPIAuth(`user/follow-vendor`, {
        vendorId: vendorDetail?._id,
      });
      if (res.status === 200) {
        setIsWishlist((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(vendorDetail, "vendorDetialllllllll");

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    if (Object.values(vendorDetail || {}).length > 0) {
      setIsWishlist(vendorDetail?.followStatus);
    }
  }, [vendorDetail])

  const VendorProfileShimmer = () => {
    return (
      <Box>
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Box p={3}>
          <Grid container sx={{
            spacing: {
              md: 1,
              xs: 3,
            }
          }}>
            <Grid item lg={5} md={5} xs={12}>
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }}>
                <Skeleton variant="rectangular" width={130} height={130} />
                <Box ml={2} mt={{ xs: 2, md: 0 }}>
                  <Skeleton variant="text" width={150} height={28} />
                  <Skeleton variant="text" width={184} height={20} />
                  <Skeleton variant="text" sx={{
                    width: {
                      xs: '100%',
                      md: '347px',
                    }
                  }} height={20} />
                  <Box display="flex" gap={1} mt={1}>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} variant="circular" width={20} height={20} />
                    ))}
                  </Box>
                  <Skeleton variant="rectangular" width={130} height={36} sx={{ mt: 2 }} />
                </Box>
              </Box>
            </Grid>
            <Grid item lg={5} md={5} xs={12}>
              <Box textAlign="center">
                <Skeleton variant="text" width="40%" height={28} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width="100%" height={60} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto' }} />
              </Box>
            </Grid>
            <Grid item lg={2} md={2} xs={12}>
              <Box textAlign="center">
                <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width={100} height={24} sx={{ mx: 'auto', mt: 1 }} />
                <Skeleton variant="rectangular" width={120} height={36} sx={{ mx: 'auto', mt: 2 }} />
              </Box>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Skeleton variant="rectangular" width={180} height={36} />
          </Box>
          <Box mt={3}>
            <Skeleton variant="rectangular" height={40} sx={{
              width: {
                xs: '100%',
                md: '500px',
              }
            }} />
          </Box>
          {[...Array(5)].map((_, index) => (
            <Box key={index} mt={4}>
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <>
      {
        loading ? (
          <VendorProfileShimmer />
        ) : (
          Object.values(vendorDetail || {}).length > 0 ? (
            <>
              <Box>
                {vendorDetail?.shop_banner && vendorDetail.shop_banner.length > 0 ? (
                  vendorDetail.shop_banner.length > 1 ? (
                    <Carousel slidesToShow={1} arrows={false} dots autoplay>
                      {vendorDetail.shop_banner.map((item, ind) => (
                        <Box
                          key={ind}
                          component="img"
                          src={item.editedImage || item.image}
                          alt=""
                          sx={{
                            width: "100%",
                            objectFit: "cover",
                            aspectRatio: "4",
                            maxHeight: {
                              xs: "100%",
                              md: "100%"
                            },
                            mt: {
                              xs: 2
                            }
                          }}
                        />
                      ))}
                    </Carousel>
                  ) : (
                    <Box
                      component="img"
                      src={vendorDetail.shop_banner[0]?.editedImage || vendorDetail.shop_banner[0]?.image}
                      alt=""
                      sx={{
                        width: "100%",
                        objectFit: "cover",
                        aspectRatio: "1 / 1",
                        maxHeight: {
                          xs: "200px",
                          md: "400px"
                        },
                        mt: {
                          xs: 2
                        }
                      }}
                    />
                  )
                ) : (
                  <Box
                    component="img"
                    src={vendorDetail?.shop_icon}
                    alt=""
                    sx={{
                      width: "100%",
                      objectFit: "cover",
                      aspectRatio: "1 / 1",
                      maxHeight: {
                        xs: "200px",
                        md: "400px"
                      },
                      mt: {
                        xs: 2
                      }
                    }}
                  />
                )}
              </Box>
              <SectionCreator p={3} mb={0}>
                <Box container pb={3} spacing={3} sx={{
                  margin: "0",
                  width: "100%",
                  display: "flex",
                  justifyContent: { md: "space-between" },
                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },
                  gap: 2,
                }}>
                  <Box
                  // lg={4}
                  // md={4}
                  // xs={12}
                  // mb={{ lg: "0", md: "0", xs: "16px" }}
                  // sx={{ paddingTop: "0" }}

                  >
                    <Box sx={{
                      display: "flex",
                      width: {
                        xs: "100%", // mobile/tablet
                        md: "497px" // desktop and up
                      },
                      flexDirection: {
                        xs: "column", // mobile/tablet
                        md: "row"     // desktop and up
                      },
                      alignItems: {
                        xs: "center", // mobile/tablet
                        md: "flex-start" // desktop and up
                      }
                    }}>
                      <img
                        width={130}
                        height={130}
                        alt="banner"
                        style={{ height: "130px", objectFit: "cover" }}
                        src={vendorDetail?.shop_icon}
                      />
                      <Typography component="div" ml={2}>
                        <Box sx={{
                          display: "flex",

                          gap: "7px",
                          justifyContent: {
                            xs: "center",
                            md: "flex-start"
                          },
                          alignItems: {
                            xs: "center",
                            md: "flex-start"
                          }
                        }}>
                          <Typography
                            variant="h6"
                            fontSize={{ lg: "18px", md: "16px", xs: "15px" }}
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: "1",
                              WebkitBoxOrient: "vertical",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              color: "#000",
                            }}
                          >
                            {vendorDetail?.shop_name}
                          </Typography>
                          <Button
                            onClick={() => setOpenModal(true)}
                            sx={{
                              zIndex: "99",
                              background: "#fff",
                              boxShadow: "0 0 3px #696969",
                              borderRadius: "50%",
                              height: "30px",
                              width: "30px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              "&:hover": {
                                background: "#fff",
                                boxShadow: "0 0 4px #000",
                              },
                            }}
                          >
                            <IosShareIcon sx={{ width: "19px", height: "19px" }} />
                          </Button>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "15px",
                            fontWeight: "500",
                            display: "-webkit-box",
                            // WebkitLineClamp: "1",
                            WebkitBoxOrient: "vertical",
                            // textOverflow: "ellipsis",
                            overflow: "hidden",
                            textAlign: {
                              xs: "center",  // mobile view
                              md: "left"     // desktop view (ya jo current hai)
                            }
                          }}
                        >
                          {vendorDetail?.shop_title}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "14px", color: "gray", fontWeight: "500" }}
                        >
                          {/* {vendorDetail?.vendor_city}, {vendorDetail?.vendor_country} */}
                          {vendorDetail?.shop_address}
                        </Typography>
                        {/* <Typography
                        sx={{ fontSize: "14px", color: "gray", fontWeight: "500" }}
                      >
                        4500 Sales
                      </Typography> */}
                        <Typography
                          component="div"
                          sx={{ display: "flex", alignItems: "center", justifyContent: 'space-between', }}
                        >
                          <Box>
                            <Typography component="span">
                              <StarIcon sx={{ fontSize: "20px" }} />
                            </Typography>
                            <Typography component="span">
                              <StarIcon sx={{ fontSize: "20px" }} />
                            </Typography>
                            <Typography component="span">
                              <StarIcon sx={{ fontSize: "20px" }} />
                            </Typography>
                            <Typography component="span">
                              <StarIcon sx={{ fontSize: "20px" }} />
                            </Typography>
                            <Typography component="span">
                              <StarIcon sx={{ fontSize: "20px" }} />
                            </Typography>
                          </Box>

                          <Button
                            onClick={toggelFollowShopHandler}
                            sx={{
                              background: "#fff",
                              border: "1px solid #000",
                              borderRadius: "30px",
                              padding: "5px 18px",
                              color: "#000",
                              display: {
                                xs: "flex",
                                md: "none",
                              },
                            }}
                          >
                            {vendorDetail?.followStatus ? (
                              <FavoriteIcon sx={{ color: "red" }} />
                            ) : (
                              <FavoriteBorderIcon sx={{ marginRight: "6px" }} />
                            )}
                            {vendorDetail?.followStatus ? "Unfollow Shop" : "Follow Shop"}
                          </Button>
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                  {vendorDetail?.shop_announcement && (<Box
                    // lg={4}
                    // md={4}
                    // xs={12}
                    mb={{ lg: "0", md: "0", xs: "16px" }}
                    sx={{
                      paddingTop: "0", width: {
                        xs: "100%", // mobile/tablet
                        md: "492px" // desktop and up
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "center", }}>
                      <Typography fontWeight={600} fontSize={18}>
                        Announcement
                      </Typography>
                      <Typography>
                        {announcementShowMore
                          ? vendorDetail?.shop_announcement
                          : vendorDetail?.shop_announcement.slice(0, 100)}
                      </Typography>

                      <Typography
                        mt={2}
                        onClick={() => setAnnouncementShowMore((prv) => !prv)}
                        style={{
                          textDecoration: "underline",
                          color: "#000",
                          cursor: "pointer",
                        }}
                      >
                        {announcementShowMore ? "Show less" : "Show more"}
                      </Typography>
                    </Box>
                  </Box>)}

                  <Box
                    sx={{
                      height: "100%",
                      width: {
                        xs: "100%", // mobile/tablet
                        md: "200px" // desktop and up
                      },
                      display: {
                        xs: "block", // mobile: normal block layout
                        md: "flex",  // desktop: flex layout
                      },
                      flexDirection: {
                        md: "column",
                      },
                      justifyContent: {
                        md: "flex-end",
                        xs: "center",
                      },
                      alignItems: {
                        md: "flex-end",
                        xs: "center",
                      },
                      textAlign: {
                        xs: "center", // mobile: center text
                        md: "end",  // desktop: right align text (optional)
                      },
                    }}
                  >
                    <Typography component="div">
                      <img
                        width={80}
                        height={80}
                        alt="banner"
                        style={{
                          height: "80px",
                          width: "80px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                        src={vendorDetail?.vendor_image}
                      />
                    </Typography>
                    <Typography width="100%" fontSize={16} fontWeight={600}>
                      {vendorDetail?.vendor_name}
                    </Typography>
                    <Typography mt={1}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          textDecoration: "none",
                          fontSize: "15px",
                          color: "#000",
                          cursor: "pointer",
                        }}
                        onClick={handleClickPopup}
                      >
                        <MailOutlineIcon
                          sx={{ fontSize: "17px", marginRight: "6px" }}
                        />
                        Contact
                      </Box>
                    </Typography>
                  </Box>

                </Box>
                <Box
                  mb={4}
                  sx={{
                    width: "100%",
                    display: { lg: "flex", md: "flex", xs: "block" },
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    component="div"
                    mb={{ lg: "0", md: "0", xs: "12px" }}
                    textAlign={{ lg: "start", md: "start", xs: "center" }}
                  >
                    <Button
                      onClick={toggelFollowShopHandler}
                      sx={{
                        background: "#fff",
                        border: "1px solid #000",
                        borderRadius: "30px",
                        padding: "5px 18px",
                        color: "#000",
                        display: {
                          xs: "none",
                          md: "flex",
                        },

                      }}
                    >
                      {isWishlist ? (
                        <FavoriteIcon sx={{ color: "red" }} />
                      ) : (
                        <FavoriteBorderIcon sx={{ marginRight: "6px" }} />
                      )}
                      {isWishlist ? "Unfollow Shop" : "Follow Shop"}
                    </Button>
                  </Typography>
                </Box>
                <Box>
                  <Grid
                    container
                    pb={3}
                    spacing={3}
                    sx={{ margin: "0", width: "100%" }}
                  >
                    <Grid container spacing={3}>
                      <Grid item lg={12} md={12} xs={12}>
                        <Grid container pb={3} spacing={3} sx={{ margin: "0", width: "100%" }}>
                          <Grid item lg={8} md={8} xs={9}>
                            <Box sx={{ maxWidth: { xs: 320, sm: 900 } }}>
                              <FlexBox gap={2}>
                                <Typography
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => scrollToSection('home')}
                                >
                                  Home
                                </Typography>
                                <Typography
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => scrollToSection('collection')}
                                >
                                  Collection
                                </Typography>
                                <Typography
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => scrollToSection('reviews')}
                                >
                                  Reviews
                                </Typography>
                                <Typography
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => scrollToSection('about')}
                                >
                                  About
                                </Typography>
                                <Typography
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => scrollToSection('shop-policies')}
                                >
                                  Shop Policies
                                </Typography>
                              </FlexBox>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>

                      {/* All Sections */}
                      <Grid item xs={12} id="home">
                        <HomeTab description={vendorDetail?.description} />
                      </Grid>

                      <Grid item xs={12} id="collection">
                        <CollectionTab
                          getWishListProducts={getWishListProducts}
                          wishListProducts={wishListProducts}
                          vendor_id={vendorDetail?._id}
                          vendorDetail={vendorDetail}
                          vendorCategories={vendorCategories?.[0]}
                          handleClickPopup={handleClickPopup}
                        />
                      </Grid>

                      <Grid item xs={12} id="reviews">
                        <ReviewsTab vendor_id={vendorDetail?._id} />
                      </Grid>

                      <Grid item xs={12} id="about">
                        <AboutTab vendorDetail={vendorDetail} vendorCategories={vendorCategories?.[0]} />
                      </Grid>

                      <Grid item xs={12} id="shop-policies">
                        <ShopPolicyTab shop_policy={vendorDetail?.shop_policy} />
                      </Grid>
                    </Grid>

                  </Grid>
                </Box>
              </SectionCreator>
              <div>
                <MessagePopup
                  vendorName={vendorDetail?.vendor_name}
                  shopSlug={vendorDetail?.slug}
                  shopName={vendorDetail?.shop_name}
                  shopImage={vendorDetail?.shop_icon}
                  shopId={vendorDetail?._id}
                  vendorImage={vendorDetail?.vendor_image}
                  openPopup={openPopup}
                  receiverid={vendorDetail?._id}
                  handleClosePopup={handleClosePopup}
                />
              </div>
              <div>
                <Modal
                  open={openModal}
                  onClose={() => setOpenModal(false)}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      maxWidth: "800px",
                      width: "100%",
                      backgroundColor: "background.paper",
                      boxShadow: "0 0 2px #9a9a9a",
                      boxShadow: 24,
                      borderRadius: "8px",
                      p: 4,
                    }}
                  >
                    <Typography
                      component="div"
                      sx={{ width: "100%", textAlign: "end" }}
                    >
                      <Button
                        sx={{
                          background: "#ededed",
                        }}
                        onClick={() => setOpenModal(false)}
                      >
                        <CloseIcon />
                      </Button>
                    </Typography>
                    <Box mt={2} p={2} sx={{ maxHeight: "500px", overflowY: "auto" }}>
                      <Typography variant="h5" fontWeight={600}>
                        Share this with friends and family
                      </Typography>
                      <Box mt={3}>
                        <List
                          sx={{
                            display: "flex",
                            width: "100%",
                            flexWrap: "wrap",
                            ".MuiButtonBase-root:hover": {
                              background: "#d5d9db",
                            },
                          }}
                        >
                          <ListItem sx={{ padding: "8px", width: "50%" }}>
                            <ListItemButton
                              sx={{
                                width: "100%",
                                background: "#f3f5f6",
                                textAlign: "center",
                                gap: "10px",
                                justifyContent: "center",
                                color: "#000",
                                fontWeight: 500,
                                p: "12px",
                                borderRadius: "6px",
                              }}
                              component="a"
                              href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
                            >
                              <MailOutlineIcon />
                              Email
                            </ListItemButton>
                          </ListItem>
                          <ListItem sx={{ padding: "8px", width: "50%" }}>
                            <ListItemButton
                              sx={{
                                width: "100%",
                                background: "#f3f5f6",
                                textAlign: "center",
                                gap: "10px",
                                justifyContent: "center",
                                color: "#000",
                                fontWeight: 500,
                                p: "12px",
                                borderRadius: "6px",
                              }}
                              component="a"
                              href={`https://api.whatsapp.com/send?text=${shareTitle}${shareUrl}`}
                              target="_blank"
                            >
                              <img
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                alt="WhatsApp"
                                width="24px"
                                height="24px"
                              />
                              WhatsApp
                            </ListItemButton>
                          </ListItem>
                          <ListItem sx={{ padding: "8px", width: "50%" }}>
                            <ListItemButton
                              sx={{
                                width: "100%",
                                background: "#f3f5f6",
                                textAlign: "center",
                                gap: "10px",
                                justifyContent: "center",
                                color: "#000",
                                fontWeight: 500,
                                p: "12px",
                                borderRadius: "6px",
                              }}
                              component="a"
                              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareTitle}`}
                              target="_blank"
                            >
                              <FacebookIcon sx={{ color: "#1877f2" }} />
                              Facebook
                            </ListItemButton>
                          </ListItem>
                          <ListItem sx={{ padding: "8px", width: "50%" }}>
                            <ListItemButton
                              sx={{
                                width: "100%",
                                background: "#f3f5f6",
                                textAlign: "center",
                                gap: "10px",
                                justifyContent: "center",
                                color: "#000",
                                fontWeight: 500,
                                p: "12px",
                                borderRadius: "6px",
                              }}
                              component="a"
                              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                              target="_blank"
                            >
                              <XIcon />
                              Twitter
                            </ListItemButton>
                          </ListItem>
                          <ListItem sx={{ padding: "8px", width: "50%" }}>
                            <ListItemButton
                              sx={{
                                width: "100%",
                                background: "#f3f5f6",
                                textAlign: "center",
                                gap: "10px",
                                justifyContent: "center",
                                color: "#000",
                                fontWeight: 500,
                                p: "12px",
                                borderRadius: "6px",
                              }}
                              component="a"
                              href={`https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${`${vendorDetail?.shop_icon}`}&description=${shareTitle}`}
                              target="_blank"
                            >
                              <PinterestIcon sx={{ color: "#d11e16" }} />
                              Pinterest
                            </ListItemButton>
                          </ListItem>
                          <ListItem sx={{ padding: "8px", width: "50%" }}>
                            <ListItemButton
                              sx={{
                                width: "100%",
                                background: "#f3f5f6",
                                textAlign: "center",
                                gap: "10px",
                                justifyContent: "center",
                                color: "#000",
                                fontWeight: 500,
                                p: "12px",
                                borderRadius: "6px",
                              }}
                              onClick={copyToClipboard}
                            >
                              <FileCopyIcon />
                              Copy Link
                            </ListItemButton>
                          </ListItem>
                        </List>
                      </Box>
                    </Box>
                  </Box>
                </Modal>
              </div>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                textAlign: "center",
                fontSize: "20px",
                textTransform: "uppercase",
                fontWeight: 900,
              }}
            >
              Vendor Not Found
            </Box>
          )
        )
      }
    </>
  );
};

export default ShopView;
