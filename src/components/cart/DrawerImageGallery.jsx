// components/Cart/DrawerImageGallery.jsx
import React, { useState, useEffect } from "react";
import { Box, Card, IconButton, MobileStepper, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { normalize } from "path";

const DrawerImageGallery = ({ media, selectedImage, onImageSelect, hoveredImage }) => {
  const [activeStep, setActiveStep] = useState(selectedImage || 0);

  // Sync external selectedImage prop without causing loops
  useEffect(() => {
    if (selectedImage !== undefined && selectedImage !== activeStep) {
      setActiveStep(selectedImage);
    }
  }, [selectedImage, activeStep]);

  const handleNext = () => {
    const newStep = Math.min(activeStep + 1, media.length - 1);
    setActiveStep(newStep);
    if (onImageSelect) onImageSelect(newStep);
  };

  const handleBack = () => {
    const newStep = Math.max(activeStep - 1, 0);
    setActiveStep(newStep);
    if (onImageSelect) onImageSelect(newStep);
  };

  const handleThumbnailClick = (index) => {
    setActiveStep(index);
    if (onImageSelect) onImageSelect(index);
  };

  const normalizeImageUrl = (url) => {
    if (!url) return "";
    return url.startsWith("https://api.agukart.com") ? url : "https://api.agukart.com" + url;
  }

  // Hovered image takes precedence over selected image
  const displayImageUrl = hoveredImage?.url || media[activeStep]?.url;

  if (!media || media.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 250,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
        }}
      >
        <Typography color="textSecondary">No image available</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Main image display */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {displayImageUrl && (
          <img
            src={normalizeImageUrl(displayImageUrl)}
            alt={displayImageUrl.slice(0, 10)}
            style={{
              maxWidth: "100%",
              maxHeight: 280,
              objectFit: "contain",
            }}
          />
        )}
      </Box>

      {/* Mobile-style stepper (dots) */}
      {media.length > 1 && (
        <MobileStepper
          variant="dots"
          steps={media.length}
          position="static"
          activeStep={activeStep}
          sx={{
            bgcolor: "transparent",
            p: 1,
            '& .MuiMobileStepper-dot': {
              backgroundColor: '#ccc',
              width: 8,
              height: 8,
            },
            '& .MuiMobileStepper-dotActive': {
              backgroundColor: '#d98392',
            },
          }}
          nextButton={
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={activeStep === media.length - 1}
            >
              <ChevronRightIcon />
            </IconButton>
          }
          backButton={
            <IconButton
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              <ChevronLeftIcon />
            </IconButton>
          }
        />
      )}

      {/* Thumbnail strip for quick navigation */}
      {media.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            my: 1,
            overflowX: "auto",
            pb: 1,
            scrollbarWidth: "thin", // For Firefox
            "&::-webkit-scrollbar": {
              height: 4,
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
              marginTop: "2px",
              marginBottom: "2px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#eeeeee",
              borderRadius: 2,
            },
            "&:hover::-webkit-scrollbar": {
              height: 6,
              backgroundColor: "#e7e7e7",
            },
            "&:hover::-webkit-scrollbar-thumb": {
              backgroundColor: "#e3e3e39c",
            },
          }}
        >
          {media.map((item, idx) => (
            <Box
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              sx={{
                width: 50,
                height: 50,
                flexShrink: 0,
                border: activeStep === idx ? "2px solid #c9576aa2" : "1px solid #e0e0e0",
                borderRadius: 1,
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": { borderColor: "#ed5f77" },
              }}
            >
              <img
                src={normalizeImageUrl(item.url)}
                alt={item.url.slice(0, 10)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default DrawerImageGallery;