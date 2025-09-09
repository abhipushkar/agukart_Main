"use client";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TabPanel from "@mui/lab/TabPanel";
import { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const AboutTab = ({ vendorDetail,vendorCategories }) => {
  console.log({vendorCategories});
  const [newVendorShopReadMore, setNewVendorShop] = useState(false);
  console.log({ vendorDetail });

   const mediaItems = [
    ...(vendorDetail?.shop_photos || []).map((shop) => ({
      type: "image",
      url: shop?.imageUrl,
    })),
    ...(vendorDetail?.shop_video ? [{
      type: "video",
      url: vendorDetail?.shop_video,
    }] : []),
  ];
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 959,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 650,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 370,
        settings: { slidesToShow: 1 },
      },
    ],
  };
  return (
    <>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          About
        </Typography>
        <Grid
          container
          pb={3}
          spacing={3}
          sx={{
            margin: "0",
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Grid
            lg={8}
            md={8}
            xs={12}
            sx={{
              paddingRight: { lg: "16px", md: "16px", xs: "0" },
            }}
          >
            <Typography component="div" mt={3}>
              <Typography
                component="div"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box textAlign={"center"}>
                  <Typography>Sales</Typography>
                  <Typography fontSize={20} fontWeight={600}>
                    {vendorCategories?.sale_count}
                  </Typography>
                </Box>
                <Box ml={3} textAlign={"center"}>
                  <Typography>On Agukart Since</Typography>
                  <Typography fontSize={20} fontWeight={600}>
                    {new Date(vendorDetail?.vendor_created_at).getFullYear()}
                  </Typography>
                </Box>
              </Typography>
              {
                mediaItems?.length > 0 && <Typography component="div" mt={3} sx={{
                  maxWidth: "100%",
                  "& .slick-prev, & .slick-next": {
                    zIndex: 2,
                    width: { xs: "30px", sm: "35px", md: "40px", lg: "40px" },
                    height: { xs: "40px", sm: "40px", md: "60px", lg: "78px" },
                    background: "rgb(255 255 255 / 17%)",
                    borderRadius: "2px",
                    boxShadow: "0px 0px 3px #434242",
                    display: "flex !important",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  "& .slick-prev": {
                    left: "0px",
                  },
                  "& .slick-prev::before, & .slick-next::before": {
                    fontSize: { xs: "16px", sm: "16px", md: "19px", lg: "21px" },
                    fontWeight: "bold",
                    color: "#333",
                    opacity: 1,
                  },
                  "& .slick-prev::before": {
                    content: '"❮"',
                  },
                  "& .slick-next": {
                    right: "0px",
                  },
                  "& .slick-next::before": {
                    content: '"❯"',
                  },
                }}>
                <Slider {...settings}>
                  {mediaItems?.map((item, index) => (
                    <div key={index}>
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`shop-media-${index}`}
                          style={{
                            width: "100%",
                            height: "530px",
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <video
                          controls
                            style={{
                              width: "100%",
                              height: "530px",
                              objectFit: "contain",
                              borderRadius: "8px",
                            }}
                        >
                          <source src={item.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ))}
                </Slider>
              </Typography>
              }
              <Typography component="div" mt={5}>
                <Typography variant="h5">
                  Welcome to {vendorDetail?.shop_name}
                </Typography>
                <Typography variant="h6">
                  {vendorDetail?.story_headline}
                </Typography>
                <Typography>
                  {newVendorShopReadMore
                    ?  <HtmlRenderer html={ vendorDetail?.story_description || ""} />
                    : <HtmlRenderer html={ vendorDetail?.story_description.slice(0, 100) || ""} />}
                </Typography>
                <Typography
                  mt={2}
                  textAlign={"center"}
                  sx={{
                    textDecoration: "none",
                    cursor: "pointer",
                    color: "#000",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => setNewVendorShop((prv) => !prv)}
                >
                  {newVendorShopReadMore ? "Read less" : "Read more"}
                </Typography>
              </Typography>
              <Box mt={5}>
                <Typography fontWeight={600} fontSize={16}>
                  Shop members
                </Typography>
                <Typography component="div" mt={2}>
                  <Typography
                    mb={2}
                    component="div"
                    sx={{
                      display: {
                        lg: "flex",
                        md: "flex",
                        xs: "block",
                      },
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {vendorDetail?.members.map((member, i) => {
                      return (
                        <Box
                          key={i}
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Typography component="span">
                            <img
                              src={member.imageUrl}
                              style={{
                                borderRadius: "50%",
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                              }}
                              alt=""
                            />
                          </Typography>
                          <Typography component="span" pl={1}>
                            <Typography fontWeight={600} fontSize={16}>
                              {member.name}
                            </Typography>
                            <Typography>
                              {member.roles.map((role) => {
                                return role;
                              })}
                              , customer services
                            </Typography>
                          </Typography>
                        </Box>
                      );
                    })}
                  </Typography>
                </Typography>

                <Typography
                  mt={5}
                  textAlign={"center"}
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "#000",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {/* More */}
                </Typography>
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AboutTab;
