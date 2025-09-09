"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box, Typography, IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const NextArrow = ({ onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        top: "50%",
        right: 10,
        transform: "translateY(-50%)",
        zIndex: 2,
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
      }}
    >
      <ArrowForwardIos />
    </IconButton>
  );
};

const PrevArrow = ({ onClick }) => {
  return (
    <IconButton
      onClick={(e) => {
        onclick(e);
      }}
      sx={{
        position: "absolute",
        top: "50%",
        left: 10,
        transform: "translateY(-50%)",
        zIndex: 2,
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
        },
      }}
    >
      <ArrowBackIos />
    </IconButton>
  );
};

const ProductCarousel = () => {
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  const images = [
    {
      src: "https://via.placeholder.com/600x400",
      alt: "Image 1",
      caption: "Caption for Image 1",
    },
    {
      src: "https://via.placeholder.com/600x400",
      alt: "Image 2",
      caption: "Caption for Image 2",
    },
    {
      src: "https://via.placeholder.com/600x400",
      alt: "Image 3",
      caption: "Caption for Image 3",
    },
  ];

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <Box key={index} sx={{ position: "relative" }}>
            <img
              src={image.src}
              alt={image.alt}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default ProductCarousel;
