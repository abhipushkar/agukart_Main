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
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
import PinterestIcon from "@mui/icons-material/Pinterest";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import IosShareIcon from "@mui/icons-material/IosShare";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { FlexBox } from "components/flex-box";

import CollectionTab from "./CollectionTab";
import ReviewsTab from "./ReviewsTab";
import AboutTab from "./AboutTab";
import ShopPolicyTab from "./ShopPolicyTab";
import { usePathname } from "next/navigation";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { ListItemButton, Modal, Skeleton } from "@mui/material";
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
  const [_value, setValue] = useState("1");
  const [vendorCategories, setVendorCategories] = useState([]);
  const [announcementShowMore, setAnnouncementShowMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const { usercredentials } = useMyProvider();

  const [vendorDetail, setVendorDetail] = useState(null);
  const [followed, setFollowed] = useState(false);
  console.log({ vendorDetail }, "eryeree");
  const [openPopup, SetOpenPopup] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openAnnouncementModal, setOpenAnnouncementModal] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const shareUrl = encodeURIComponent(
    `${process.env.NEXT_PUBLIC_WEB_URL}/store/${vendorDetail?.slug}`
  );
  const shareTitle = encodeURIComponent(vendorDetail?.shop_name);
  const copyToClipboard = () => {
    const url = `${process.env.NEXT_PUBLIC_WEB_URL}/store/${vendorDetail?.slug}`;
    navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard!", {
      appearance: "success",
      autoDismiss: true,
    });
  };
  const { token } = useAuth();
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
          imageUrl: member.images
            ? `${res?.data?.data?.member_image_url}${member.images}`
            : "",
        }));
        const shop_photos = res?.data?.data?.shop_photos?.map((shop) => ({
          ...shop,
          imageUrl: shop.image
            ? `${res?.data?.data?.member_image_url}${shop.image}`
            : "",
        }));
        console.log({ members }, "dgfgfgfgf");
        setVendorDetail({ ...res.data.data, members, shop_photos });
        setFollowed(res.data.data.followStatus);
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
  useEffect(() => {
    getVendorDetail();
    getVendorProductCategory();
  }, [pathname]);

  const toggelFollowShopHandler = async () => {
    if (!token) {
      return router.push("/login");
    }
    try {
      const res = await postAPIAuth(`user/follow-vendor`, {
        vendorId: vendorDetail?._id,
      });
      if (res.status === 200) {
        setIsWishlist((prev) => !prev);
        setFollowed(prev => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };

  console.log(vendorDetail, "vendorDetialllllllll");

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    if (Object.values(vendorDetail || {}).length > 0) {
      setIsWishlist(vendorDetail?.followStatus);
    }
  }, [vendorDetail]);

  const VendorProfileShimmer = () => {
    return (
      <Box>
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Box p={3}>
          <Grid
            container
            sx={{
              spacing: {
                md: 1,
                xs: 3,
              },
            }}
          >
            <Grid item lg={5} md={5} xs={12}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                alignItems={{ xs: "center", md: "flex-start" }}
              >
                <Skeleton variant="rectangular" width={130} height={130} />
                <Box ml={2} mt={{ xs: 2, md: 0 }}>
                  <Skeleton variant="text" width={150} height={28} />
                  <Skeleton variant="text" width={184} height={20} />
                  <Skeleton
                    variant="text"
                    sx={{
                      width: {
                        xs: "100%",
                        md: "347px",
                      },
                    }}
                    height={20}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    {[...Array(5)].map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="circular"
                        width={20}
                        height={20}
                      />
                    ))}
                  </Box>
                  <Skeleton
                    variant="rectangular"
                    width={130}
                    height={36}
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item lg={5} md={5} xs={12}>
              <Box textAlign="center">
                <Skeleton
                  variant="text"
                  width="40%"
                  height={28}
                  sx={{ mx: "auto" }}
                />
                <Skeleton variant="text" width="100%" height={60} />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ mx: "auto" }}
                />
              </Box>
            </Grid>
            <Grid item lg={2} md={2} xs={12}>
              <Box textAlign="center">
                <Skeleton
                  variant="circular"
                  width={80}
                  height={80}
                  sx={{ mx: "auto" }}
                />
                <Skeleton
                  variant="text"
                  width={100}
                  height={24}
                  sx={{ mx: "auto", mt: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={120}
                  height={36}
                  sx={{ mx: "auto", mt: 2 }}
                />
              </Box>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="space-between" mt={4}>
            <Skeleton variant="rectangular" width={180} height={36} />
          </Box>
          <Box mt={3}>
            <Skeleton
              variant="rectangular"
              height={40}
              sx={{
                width: {
                  xs: "100%",
                  md: "500px",
                },
              }}
            />
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
      {loading ? (
        <VendorProfileShimmer />
      ) : Object.values(vendorDetail || {}).length > 0 ? (
        <Box sx={{overflowX:"hidden"}}>
          <Box
            sx={{
              position: "relative",
              top: vendorDetail?.shop_banner && vendorDetail.shop_banner.length > 1 ? -10
                : vendorDetail?.shop_banner && vendorDetail.shop_banner.length === 1 ? +1 : -14 // to adjust space between navbar and banner
            }}
          >
            {vendorDetail?.shop_banner &&
              vendorDetail.shop_banner.length > 0 ? (
              vendorDetail.shop_banner.length > 1 ? (
                <Carousel
                  slidesToShow={1}
                  arrows={false}
                  dots
                  autoplay
                  dotStyles={{ mt: 0.5 }}
                  spaceBetween={0}
                >
                  {vendorDetail.shop_banner.map((item, ind) => {
                    const imgSrc = item.editedImage || item.image;

                    return (
                      <Box
                        key={ind}
                        sx={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4", // keep your container ratio
                          overflow: "hidden",
                        }}
                      >
                        {/* Blurred background */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url(${imgSrc})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: "blur(20px)",
                            transform: "scale(1.1)",
                          }}
                        />

                        {/* Foreground image */}
                        <Box
                          component="img"
                          src={imgSrc}
                          alt=""
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            zIndex: 1,
                          }}
                        />
                      </Box>
                    );
                  })}
                </Carousel>
              ) : (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxHeight: {
                      xs: "200px",
                      md: "400px",
                    },
                    overflow: "hidden",
                  }}
                >
                  {/* Blurred background */}
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `url(${vendorDetail.shop_banner[0]?.editedImage ||
                        vendorDetail.shop_banner[0]?.image
                        })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: "blur(20px)",
                      transform: "scale(1.1)", // prevents blur edges from showing
                    }}
                  />

                  {/* Foreground image */}
                  <Box
                    component="img"
                    src={
                      vendorDetail.shop_banner[0]?.editedImage ||
                      vendorDetail.shop_banner[0]?.image
                    }
                    alt=""
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "auto",
                      display: "block",
                      objectFit: "contain",
                      zIndex: 1,
                    }}
                  />
                </Box>
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
                    md: "400px",
                  },
                  mt: {
                    xs: 2,
                  },
                }}
              />
            )}
          </Box>
         <SectionCreator
  px={{ xs: 0, md: 0 }} py={vendorDetail.shop_banner.length > 1 ? 0: 1} mb={0}>
            <Box
              container
              pb={3}
              spacing={3}
              sx={{
                margin: "0",
                width: "100%",
                display: "flex",
                justifyContent: { md: "space-between" },
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
                gap: 2,
              }}
            >
              <Box
              // lg={4}
              // md={4}
              // xs={12}
              // mb={{ lg: "0", md: "0", xs: "16px" }}
              // sx={{ paddingTop: "0" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: {
                      xs: "100%", // mobile/tablet
                      md: "full", // desktop and up
                    },
                    maxWidth: {
                      xs: "100%", // mobile/tablet
                      md: "800px", // desktop and up
                    },
                    flexDirection: "row",
alignItems: "flex-start",
gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
  <img
  alt="banner"
  style={{ 
  height: "92px", 
  width: "92px",
  minWidth: "92px",
  objectFit: "cover",
  borderRadius: "14px",
  border: "1px solid #e5e5e5",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
}}
  src={vendorDetail?.shop_icon}
/>
  {/* Stars below icon - mobile only */}
  <Box sx={{ 
    display: { xs: "flex", md: "none" }, 
    mt: 0.5 
  }}>
    <StarIcon sx={{ fontSize: "14px", color: "#f5a623" }} />
    <StarIcon sx={{ fontSize: "14px", color: "#f5a623" }} />
    <StarIcon sx={{ fontSize: "14px", color: "#f5a623" }} />
    <StarIcon sx={{ fontSize: "14px", color: "#f5a623" }} />
    <StarIcon sx={{ fontSize: "14px", color: "#f5a623" }} />
  </Box>
</Box>
                  <Typography
  component="div"
  sx={{
    width: "100%",
    ml: { xs: 1, md: 2 },
    flex: 1,
    minWidth: 0,
  }}
>
  {/* Top row: name + stars */}
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
    <Typography
  variant="h6"
  sx={{
    fontSize: { lg: "22px", md: "20px", xs: "18px" },
    fontWeight: 700,
    letterSpacing: "0.2px",
    lineHeight: 1.3,
    color: "#222",

    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    wordBreak: "break-word",
  }}
>
  {vendorDetail?.shop_name}
</Typography>
  </Box>

  {/* Shop title */}
  <Typography
  sx={{
    fontSize: "14px",
    fontWeight: 600,
    color: "#444",
    mt: 0.3,
  }}
>
  {vendorDetail?.shop_title}
</Typography>

  {/* Address */}
  <Typography
  sx={{
    fontSize: "13px",
    color: "#777",
    mt: 0.4,
    lineHeight: 1.4,
  }}
>
    {vendorDetail?.shop_address}
  </Typography>

  {/* Icons row - only mobile */}
  {/* Icons + Announcement row - mobile */}
<Box
  sx={{
    mt: 0,
    mb: 0,
    display: { xs: "flex", md: "none" },
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    mt: 0.5,
    width: "100%",
  }}
>

{vendorDetail?.shop_announcement?.trim() && (
      <Box
        onClick={() => {
  if (window.innerWidth < 900) {
    setOpenAnnouncementModal(true);
  } else {
    setAnnouncementShowMore((prev) => !prev);
  }
}}
        sx={{
          background: "#fff",
          borderRadius: "20px",
          px: 1.5,
          py: 0.3,
          cursor: "pointer",
          flexShrink: 0,
          border: "1px solid #e0e0e0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <Typography fontSize="12px">
          Announcement
        </Typography>
      </Box>
    )}

  {/* RIGHT SIDE ICONS */}
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
    }}
  >
    {/* Heart + count */}
    <Box
      onClick={toggelFollowShopHandler}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.3,
        background: followed ? "#fff0f0" : "#fff",
        borderRadius: "20px",
        px: 1,
        py: 0.3,
        cursor: "pointer",
        border: followed
          ? "1px solid #ffcdd2"
          : "1px solid #e0e0e0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {followed ? (
        <FavoriteIcon
          sx={{ fontSize: "16px", color: "red" }}
        />
      ) : (
        <FavoriteBorderIcon sx={{ fontSize: "16px" }} />
      )}

      <Typography fontSize="12px">
        {vendorDetail?.followersCount || "0"}
      </Typography>
    </Box>

    {/* Share */}
    <Box
      onClick={() => setOpenModal(true)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        borderRadius: "50%",
        width: "34px",
        height: "34px",
        cursor: "pointer",
        border: "1px solid #e0e0e0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <IosShareIcon sx={{ fontSize: "16px" }} />
    </Box>

    {/* Mail */}
    <Box
      onClick={handleClickPopup}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        borderRadius: "50%",
        width: "34px",
        height: "34px",
        cursor: "pointer",
        border: "1px solid #e0e0e0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <MailOutlineIcon sx={{ fontSize: "16px" }} />
    </Box>
  </Box>
</Box>

  {/* Desktop stars + follow button (unchanged) */}
  <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, mt: 1 }}>
    <StarIcon sx={{ fontSize: "20px" }} />
    <StarIcon sx={{ fontSize: "20px" }} />
    <StarIcon sx={{ fontSize: "20px" }} />
    <StarIcon sx={{ fontSize: "20px" }} />
    <StarIcon sx={{ fontSize: "20px" }} />
  </Box>
  <Box mt={1.5} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
    <Button
      onClick={toggelFollowShopHandler}
      sx={{
        background: "#222",
border: "1px solid #222",
borderRadius: "999px",
padding: "8px 22px",
color: "#fff",
fontWeight: 600,
textTransform: "none",
boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
"&:hover": {
  background: "#000",
}
      }}
    >
      {isWishlist ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon sx={{ marginRight: "6px" }} />}
      {isWishlist ? "Following" : "Follow"}
    </Button>
    <Button onClick={() => setOpenModal(true)} sx={{
      zIndex: "99", background: "#fff", boxShadow: "0 0 3px #696969",
      borderRadius: "50%", height: "30px", width: "30px",
      alignItems: "center", justifyContent: "center",
      "&:hover": { background: "#fff", boxShadow: "0 0 4px #000" },
    }}>
      <IosShareIcon sx={{ width: "19px", height: "19px" }} />
    </Button>
  </Box>
</Typography>
                </Box>
              </Box>
              {vendorDetail?.shop_announcement && (
  <Box
    mb={{ lg: "0", md: "0", xs: "16px" }}
    sx={{
      paddingTop: "0",
      width: {
        xs: "100%",
        md: "492px",
      },
      display: {
        xs: "none", // 👈 mobile pe hide, desktop pe dikhega
        md: "block",
      },
    }}
  >
                  <Box sx={{ textAlign: "center" }}>
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
                </Box>
              )}

              <Box
                sx={{
                  height: "100%",
                  width: {
                    xs: "100%", // mobile/tablet
                    md: "10%", // desktop and up
                  },
                  display: {
  xs: "none", // 👈 block se none karo
  md: "flex",
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
                    md: "end", // desktop: right align text (optional)
                  },
                }}
              >
                <Typography component="div">
                  <img
                    width={60}
                    height={60}
                    alt="banner"
                    style={{
                      height: "92px",
width: "92px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "1px solid #ddd",
boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    }}
                    src={vendorDetail?.vendor_image}
                  />
                </Typography>
                <Typography width="100%" fontSize={16} fontWeight={600}>
                  {vendorDetail?.vendor_name}
                </Typography>
                <Box
                  mt={1}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: {
                      xs: "center",
                      md: "flex-end",
                    },
                    cursor: "pointer",
                  }}
                  onClick={handleClickPopup}
                >
                  <MailOutlineIcon sx={{ fontSize: "17px", mr: "6px" }} />
                  <Typography fontSize={15} color="#000">
                    Contact
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              mb={0}
              sx={{
                position: "sticky",
top: 0,
zIndex: 99,
background: "#fff",
py: 0.3,
                width: "100%",
                display: { lg: "flex", md: "flex", xs: "block" },
                alignItems: "center",
                marginTop: {
                  xs: 0,
                  md: announcementShowMore ? "8px" : "-30px", //adjustment made to push tabs in same row as follow button but below See More 
                },
                marginLeft: {
                  xs: 0,
                  md: "24%",
                },
                gap: {
                  xs: 0,
                  md: 3,
                  lg: 3,
                },
              }}
            >
              <Grid item lg={12} md={12} xs={12}>
                <Grid
                  container
                  spacing={3}
                  sx={{ margin: "0", width: "100%" }}
                >
                  <Grid item xs={12} sx={{ padding: "0 !important" }}>
                    <Box sx={{ width: "100%" }}>
                      <FlexBox
  gap={{ xs: 0, md: 2 }}
  sx={{
    flexWrap: "wrap",
    justifyContent: {
      xs: "space-between",
      sm: "space-around",
      md: "flex-start",
    },
  }}
>
  {["home", "collection", "reviews", "about", "shop-policies"].map((id) => (
    <Typography
      key={id}
      onClick={() => scrollToSection(id)}
      sx={{
        cursor: "pointer",
        fontWeight: 600,
fontSize: "15px",
pb: 0.4,
color: "#555",
transition: "all .2s ease",
position: "relative",
borderBottom:
  id === "home"
    ? "2px solid #000"
    : "2px solid transparent",
"&:hover": { borderBottom: "2px solid #000" },
"&::after": {
  content: '""',
  position: "absolute",
  left: 0,
  bottom: 0,
  width: id === "home" ? "100%" : "0%",
  height: "2px",
  background: "#000",
  transition: "0.3s",
},
"&:hover::after": {
  width: "100%",
},
        borderBottom: "2px solid transparent",
        "&:hover": { borderBottom: "2px solid #000" },
        textTransform: "capitalize",
      }}
    >
      {id === "shop-policies" ? "Policies" : id.charAt(0).toUpperCase() + id.slice(1)}
    </Typography>
  ))}
</FlexBox>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box //divider
              sx={{
                flexGrow: 1,
                height: '1px',
backgroundColor: '#ececec',
                position: "relative",
                top: -22
              }}
            />
            <Box>
              <Grid
                container
                pb={3}
                spacing={3}
                sx={{ margin: "0", width: "100%", paddingTop: "14px", }}
              >
                <Grid container spacing={3}>

                  {/* All Sections */}
                  <Grid item xs={12} id="home">
                    <HomeTab description={vendorDetail?.description} />
                  </Grid>

                  <Grid item xs={12} id="collection">
                    <CollectionTab
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
                    <AboutTab
                      vendorDetail={vendorDetail}
                      vendorCategories={vendorCategories?.[0]}
                    />
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
    open={openAnnouncementModal}
    onClose={() => setOpenAnnouncementModal(false)}
  >
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "92%",
        maxWidth: "430px",
        bgcolor: "#fff",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f1f1f1",
          background:
            "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#111",
              letterSpacing: "0.2px",
            }}
          >
            📢 Announcement
          </Typography>

          <Typography
            sx={{
              fontSize: "12px",
              color: "#777",
              mt: 0.3,
            }}
          >
            Latest update from this shop
          </Typography>
        </Box>

        <Button
          onClick={() => setOpenAnnouncementModal(false)}
          sx={{
            minWidth: "unset",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #e5e5e5",
            color: "#222",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            "&:hover": {
              background: "#f7f7f7",
            },
          }}
        >
          <CloseIcon sx={{ fontSize: "18px" }} />
        </Button>
      </Box>

      {/* Content */}
      <Box
        sx={{
          px: 3,
          py: 3,
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: "14px",
            color: "#444",
            lineHeight: 1.9,
            whiteSpace: "pre-line",
          }}
        >
          {vendorDetail?.shop_announcement}
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #f1f1f1",
          display: "flex",
          justifyContent: "flex-end",
          background: "#fafafa",
        }}
      >
        <Button
          onClick={() => setOpenAnnouncementModal(false)}
          sx={{
            textTransform: "none",
            background: "#111",
            color: "#fff",
            px: 3,
            py: 0.3,
            borderRadius: "999px",
            fontWeight: 600,
            "&:hover": {
              background: "#000",
            },
          }}
        >
          Got it
        </Button>
      </Box>
    </Box>
  </Modal>
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
                <Box
                  mt={2}
                  p={2}
                  sx={{ maxHeight: "500px", overflowY: "auto" }}
                >
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
        </Box>
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
      )}
    </>
  );
};

export default ShopView;
