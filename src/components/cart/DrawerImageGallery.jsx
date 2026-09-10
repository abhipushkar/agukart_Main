// components/Cart/DrawerImageGallery.jsx
import React, { useState, useEffect, useRef } from "react";
import { Box, Card, IconButton, MobileStepper, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";


const DrawerImageGallery = ({ media, selectedImage, onImageSelect, hoveredImage }) => {
  const [activeStep, setActiveStep] = useState(selectedImage || 0);
  const touchStartX = useRef(0);
  const thumbnailRefs = useRef([]);

  // Sync external selectedImage prop without causing loops
  useEffect(() => {
    if (selectedImage !== undefined && selectedImage !== activeStep) {
      setActiveStep(selectedImage);
    }
  }, [selectedImage, activeStep]);

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[activeStep];

    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeStep]);

  const handleNext = () => {
    const newStep = activeStep === (media.length - 1) ? 0 : (activeStep + 1)
    setActiveStep(newStep);
    if (onImageSelect) onImageSelect(newStep);
  };

  const handleBack = () => {
    const newStep = activeStep === 0 ? (media.length - 1) : (activeStep - 1)
    setActiveStep(newStep);
    if (onImageSelect) onImageSelect(newStep);
  };

  const handleThumbnailClick = (index) => {
    setActiveStep(index);
    if (onImageSelect) onImageSelect(index);
  };

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
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const touchEndX = e.changedTouches[0].clientX;
          const diff = touchStartX.current - touchEndX;
          if (diff > 50 && activeStep < media.length - 1) {
            handleNext(); // swipe left
          }
          if (diff < -50 && activeStep > 0) {
            handleBack(); // swipe right
          }
        }}
      >
        {displayImageUrl && (
          displayImageUrl.endsWith(".mp4")
            ? <video
              src={displayImageUrl}
              autoPlay loop muted playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                cursor: 'pointer',
              }}
            />
            : <img
              src={displayImageUrl}
              alt={displayImageUrl}
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
            p: 0.5,
            '& .MuiMobileStepper-dot': {
              backgroundColor: '#e1e1e1ce',
              width: 8,
              height: 8,
            },
            '& .MuiMobileStepper-dotActive': {
              backgroundColor: '#c9576aa2',
            },
          }}
          in
          nextButton={
            <IconButton
              size="small"
              onClick={handleNext}
            // disabled={activeStep === media.length - 1}
            >
              <ChevronRightIcon />
            </IconButton>
          }
          backButton={
            <IconButton
              size="small"
              onClick={handleBack}
            // disabled={activeStep === 0}
            >
              <ChevronLeftIcon />
            </IconButton>
          }
        />
      )}

      {/* Thumbnail strip for quick navigation */}
      {media.length > 1 && (
        <Box
          sx={(theme) => ({
            display: "flex",
            gap: 1,
            pb: "6px",
            overflowX: "auto",
            overflowY: "hidden",
            "&::-webkit-scrollbar": {
              height: 6,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.grey[400],
              borderRadius: 3,
              cursor: "pointer"
            },
            "&:hover::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.grey[400],
            }
          })}
        >
          {media.map((item, idx) => (
            <Box
              key={idx}
              ref={(el) => {
                thumbnailRefs.current[idx] = el;
              }}
              onClick={() => handleThumbnailClick(idx)}
              sx={{
                width: 50,
                height: 50,
                flexShrink: 0,
                mt: 0.5,
                boxShadow: activeStep === idx ? "0px 1px 6px #5d80bbb5" : "none",
                transform: activeStep === idx ? "scale(1.05)" : "none",
                border: activeStep === idx ? "2px solid #c9576aa2" : "1px solid #e0e0e0",
                borderRadius: 1,
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": { boxShadow: "0px 1px 6px #4e5f7db5", },
                transition: "box-shadow 200ms ease, transform 200ms ease",
              }}
            >
              {item.type === "video" || item.url.endsWith(".mp4") ? (
                <video
                  src={item.url}
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </>
  );
};

export default DrawerImageGallery;