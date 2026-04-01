import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  Tooltip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import parse from "html-react-parser";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const VariantSelector = ({
  variant,
  selectedValue,
  onChange,
  onHover,
  onHoverOut,
  error,
  currency,
  filterVariantAttributes = [],
  isAttributeCombinationSoldOut,
  selectedVariants,
  calculateAttributeData,
  productMainImage
}) => {
  const [guideOpen, setGuideOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState(null);
  const scrollRef = useRef(null);
  const itemRef = useRef(null);
  const pageWidthRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);
  // const [totalPages, setTotalPages] = useState(1);
  const resizeObserverRef = useRef(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const hasAutoScrolledRef = useRef(false);
  const triggerRef = useRef(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [hoveredAttrValue, setHoveredAttrValue] = useState(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const hasSetInitialPageRef = useRef(false);
  const textModeContentRef = useRef(null);
  const [showTextModeExpandControls, setShowTextModeExpandControls] = useState(false);
  const TEXT_MODE_COLLAPSED_HEIGHT_XS = 140;
  const TEXT_MODE_COLLAPSED_HEIGHT_MD = 150;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });

  const columns = isMobile ? 3 : 5;
  const rows = isMobile ? 1 : 2;

  const ITEMS_PER_PAGE = columns * rows;
  const pages = useMemo(() => {
    const hasThumbnail = (attr) => {
      const thumbnail = attr?.thumbnail;
      if (thumbnail === null || thumbnail === undefined) return false;
      if (typeof thumbnail === "string") return thumbnail.trim() !== "";
      return Boolean(thumbnail);
    };

    const orderedAttributes = [
      ...variant.attributes.filter((attr) => hasThumbnail(attr)),
      ...variant.attributes.filter((attr) => !hasThumbnail(attr)),
    ];

    const result = [];
    for (let i = 0; i < orderedAttributes.length; i += ITEMS_PER_PAGE) {
      result.push(orderedAttributes.slice(i, i + ITEMS_PER_PAGE));
    }
    return result;
  }, [variant.attributes, ITEMS_PER_PAGE]);
  const totalPages = pages.length;

  useEffect(() => {
    if (hasSetInitialPageRef.current) return;
    if (!pages.length) return;

    const selectedPageIndex = pages.findIndex((page) =>
      page.some(
        (attr) => attr.id === selectedValue || attr.value === selectedValue
      )
    );

    if (selectedPageIndex < 0) {
      hasSetInitialPageRef.current = true;
      return;
    }

    setCurrentPage(selectedPageIndex);

    // Ensure the slider starts on the page containing the selected variant
    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const pageWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: selectedPageIndex * pageWidth,
        behavior: "auto",
      });
    });

    hasSetInitialPageRef.current = true;
  }, [pages, selectedValue]);

  // Check if variant has guide information
  const hasGuide =
    variant.guide_file || variant.guide_name || variant.guide_description;

  // Calculate page width and items per page
  const calculatePageMetrics = useCallback(() => {
    if (!scrollRef.current || !itemRef.current) return;

    try {
      const itemWidth = itemRef.current.offsetWidth;
      if (!itemWidth || itemWidth <= 0) return;

      const gap = 8; // Theme spacing ~8px

      // Calculate items per page based on container width
      const container = scrollRef.current.parentElement;
      const availableWidth = container
        ? container.clientWidth
        : scrollRef.current.clientWidth;

      // Account for padding and margins
      const effectiveWidth = Math.max(availableWidth - 16, 200); // Min 200px
      const itemsPerPage = Math.max(
        2,
        Math.floor(effectiveWidth / (itemWidth + gap))
      );

      // Calculate page width
      const pageWidth = (itemWidth + gap) * itemsPerPage;
      pageWidthRef.current = pageWidth;

      // Calculate total pages
      const scrollWidth = scrollRef.current.scrollWidth;
      const total = Math.max(1, Math.ceil(scrollWidth / pageWidth));

      // Update current page based on current scroll position
      const scrollLeft = scrollRef.current.scrollLeft;
      const newPage = Math.min(Math.round(scrollLeft / pageWidth), total - 1);
      setCurrentPage(newPage);
    } catch (error) {
      console.error("Error calculating page metrics:", error);
    }
  }, []);

  // Initialize and update page metrics
  useEffect(() => {
    // Initial calculation after a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      calculatePageMetrics();
    }, 100);

    // Set up resize observer for container changes
    if (scrollRef.current) {
      const container = scrollRef.current.parentElement;
      if (container && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => {
          calculatePageMetrics();
        });
        resizeObserverRef.current.observe(container);
      }
    }

    return () => {
      clearTimeout(timer);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [variant.attributes.length, calculatePageMetrics]);

  // prevent background scroll when selector open
  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (isViewAllOpen) return;
    const handleOutsideClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);


  const selectedAttr = variant.attributes.find(
    (attr) =>
      attr.id === selectedValue || attr.value === selectedValue
  );

  // auto scroll to selected atrribute effect
  useEffect(() => {
    if (!open) {
      // reset when dropdown closes
      hasAutoScrolledRef.current = false;
      return;
    }

    if (
      hasAutoScrolledRef.current ||
      !menuRef.current ||
      !selectedAttr
    ) {
      return;
    }

    const el = menuRef.current.querySelector(
      `[data-attr-id="${selectedAttr.id}"]`
    );

    if (el) {
      hasAutoScrolledRef.current = true;

      el.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [open, selectedAttr]);

  const handleToggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownLeft(rect.left);
      setDropdownWidth(rect.width);
    }
    setOpen((prev) => !prev);
    setIsViewAllOpen(false);
  };
  useEffect(() => {
    if (!open) return;

    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);


  // Handle window resize
  useEffect(() => {
    const handleResize = debounce(() => {
      calculatePageMetrics();
    }, 150);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculatePageMetrics]);

  useEffect(() => {
    if (guideOpen) {
      setZoom(1);
    }
  }, [guideOpen]);

  useEffect(() => {
    const measureTextModeOverflow = () => {
      if (!textModeContentRef.current) return;
      const contentHeight = textModeContentRef.current.scrollHeight || 0;
      const shouldShowControls = contentHeight > TEXT_MODE_COLLAPSED_HEIGHT_XS;
      setShowTextModeExpandControls(shouldShowControls);
      if (!shouldShowControls) {
        setExpanded(false);
      }
    };

    measureTextModeOverflow();

    let observer;
    if (window.ResizeObserver && textModeContentRef.current) {
      observer = new ResizeObserver(() => {
        measureTextModeOverflow();
      });
      observer.observe(textModeContentRef.current);
    }

    window.addEventListener("resize", measureTextModeOverflow);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", measureTextModeOverflow);
    };
  }, [variant.attributes, isMobile]);

  // Scroll to page function
  // const scrollToPage = useCallback(
  //   (page) => {
  //     if (!scrollRef.current || !pageWidthRef.current) return;

  //     const targetPage = Math.max(0, Math.min(page, totalPages - 1));
  //     const scrollPosition = targetPage * pageWidthRef.current;

  //     scrollRef.current.scrollTo({
  //       left: scrollPosition,
  //       behavior: "smooth",
  //     });

  //     // Update page immediately for better UX
  //     setCurrentPage(targetPage);
  //   },
  //   [totalPages]
  // );
  const scrollToPage = useCallback((page) => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const pageWidth = scrollRef.current.offsetWidth;

    const targetPage = Math.max(0, Math.min(page, totalPages - 1));

    container.scrollTo({
      left: targetPage * pageWidth,
      behavior: "smooth",
    });

    // setCurrentPage(targetPage); no flicker
  }, [totalPages]);

  // Handle scroll with proper debouncing and edge detection
  // const handleScroll = useCallback(
  //   debounce(() => {
  //     if (
  //       !scrollRef.current ||
  //       !pageWidthRef.current ||
  //       pageWidthRef.current <= 0
  //     )
  //       return;

  //     const scrollLeft = scrollRef.current.scrollLeft;
  //     const scrollWidth = scrollRef.current.scrollWidth;
  //     const clientWidth = scrollRef.current.clientWidth;

  //     // Handle edge cases
  //     if (scrollWidth <= clientWidth) {
  //       setCurrentPage(0);
  //       return;
  //     }

  //     // Calculate current page with edge detection
  //     const pageWidth = pageWidthRef.current;
  //     const maxScroll = scrollWidth - clientWidth;

  //     // Check if at the beginning or end
  //     if (scrollLeft <= 0) {
  //       setCurrentPage(0);
  //       return;
  //     }

  //     if (scrollLeft >= maxScroll - 5) {
  //       // 5px tolerance for rounding errors
  //       setCurrentPage(totalPages - 1);
  //       return;
  //     }

  //     // Calculate current page with rounding
  //     const calculatedPage = Math.round(scrollLeft / pageWidth);
  //     const boundedPage = Math.max(0, Math.min(calculatedPage, totalPages - 1));

  //     if (boundedPage !== currentPage) {
  //       setCurrentPage(boundedPage);
  //     }
  //   }, 100),
  //   [totalPages, currentPage]
  // );

  // Enhanced scroll handler that also fires immediately
  // const handleScrollImmediate = useCallback(() => {
  //   if (!scrollRef.current || !pageWidthRef.current) return;

  //   const scrollLeft = scrollRef.current.scrollLeft;
  //   const pageWidth = pageWidthRef.current;

  //   if (pageWidth > 0) {
  //     const calculatedPage = Math.round(scrollLeft / pageWidth);
  //     if (calculatedPage !== currentPage) {
  //       setCurrentPage(calculatedPage);
  //     }
  //   }

  //   // Call the debounced handler
  //   handleScroll();
  // }, [currentPage, handleScroll]);

  const handleScrollImmediate = useCallback(() => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const pageWidth = container.clientWidth;

    const newPage = Math.round(container.scrollLeft / pageWidth);

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentPage]);

  const renderAttributePrice = (attribute) => {
    if (variant.type === "parent") {
      const variantAttr = filterVariantAttributes.find(
        (attr) =>
          attr._id === attribute.id || attr.attribute_value === attribute.value
      );

      if (!variantAttr) return null;

      const {
        minPrice,
        maxPrice,
        minQuantity,
        maxQuantity,
        isCheckedQuantity,
      } = variantAttr;

      if (minQuantity === 0 && maxQuantity === 0 && isCheckedQuantity) {
        return " [Sold Out]";
      }

      if (minPrice !== 0 && !isNaN(minPrice)) {
        if (minPrice === maxPrice) {
          return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)})`;
        }
        return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)} - ${currency?.symbol}${(maxPrice * currency?.rate).toFixed(2)})`;
      }

      return null;
    } else if (variant.type === "internal") {
      let attributeData = {};

      if (calculateAttributeData && selectedVariants) {
        attributeData = calculateAttributeData(attribute.id, selectedVariants);
      } else {
        const variantAttr = filterVariantAttributes.find(
          (attr) =>
            attr._id === attribute.id ||
            attr.attribute_value === attribute.value
        );

        if (variantAttr) {
          attributeData = {
            price: variantAttr.price,
            quantity: variantAttr.quantity,
            priceRange: variantAttr.priceRange,
            quantityRange: variantAttr.quantityRange,
            isSoldOut: variantAttr.isSoldOut,
            isIndependent: variantAttr.isIndependent,
            isVisible: true, // Default to visible
          };
        }
      }

      // Don't show price if attribute is not visible
      if (attributeData.isVisible === false) {
        return "";
      }

      // Only show sold out if attribute is actually sold out AND visible
      if (attributeData.isSoldOut) {
        return " [Sold Out]";
      }

      // Don't show quantity === 0 as sold out here - let the isSoldOut flag handle it
      if (quantity !== null && quantity === 0 && !isSoldOut) {
        // Don't show anything for zero quantity if not sold out
        // (this allows other combinations to have stock)
      }

      let priceText = "";

      // Only show price if attribute has price data
      if (isIndependent) {
        if (price !== null && !isNaN(price)) {
          priceText = ` (${currency?.symbol}${(price * currency?.rate).toFixed(2)})`;
        } else if (priceRange && priceRange.min === priceRange.max) {
          priceText = ` (${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)})`;
        }
      } else if (price !== null && !isNaN(price)) {
        priceText = ` (${currency?.symbol}${(price * currency?.rate).toFixed(2)})`;
      } else if (priceRange) {
        if (priceRange.min === priceRange.max) {
          priceText = ` (${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)})`;
        } else {
          priceText = ` (${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)} - ${currency?.symbol}${(priceRange.max * currency?.rate).toFixed(2)})`;
        }
      }

      // let quantityText = '';
      // Only show quantity if it's not zero or if it's a range
      // if (quantity !== null && quantity !== undefined && quantity > 0) {
      //     quantityText = ` [${quantity} in stock]`;
      // } else if (quantityRange && quantityRange.max > 0) {
      //     if (quantityRange.min === quantityRange.max) {
      //         quantityText = ` [${quantityRange.min} in stock]`;
      //     } else {
      //         quantityText = ` [${quantityRange.min}-${quantityRange.max} in stock]`;
      //     }
      // }

      return priceText;
    }

    return null;
  };

  const isAttributeVisible = useCallback(
    (attribute) => {
      if (variant.type === "internal") {
        let attributeData = {};

        if (calculateAttributeData && selectedVariants) {
          attributeData = calculateAttributeData(
            attribute.id,
            selectedVariants
          );
        } else {
          const variantAttr = filterVariantAttributes.find(
            (attr) =>
              attr._id === attribute.id ||
              attr.attribute_value === attribute.value
          );

          if (variantAttr) {
            attributeData = {
              isSoldOut: variantAttr.isSoldOut,
              quantity: variantAttr.quantity,
              isVisible: variantAttr.isVisible !== false, // Default to true if not set
            };
          }
        }

        return attributeData.isVisible !== false; // Ensure boolean return
      }
      return true; // For parent variants, always visible
    },
    [
      variant.type,
      calculateAttributeData,
      selectedVariants,
      filterVariantAttributes,
    ] // Add all dependencies
  );

  const isAttributeDisabled = (attribute) => {
    if (variant.type === "internal") {
      let attributeData = {};

      if (calculateAttributeData && selectedVariants) {
        attributeData = calculateAttributeData(attribute.id, selectedVariants);
      } else {
        console.log(
          "Product Data not in calculateAttributeData && selectedVariants",
          calculateAttributeData && selectedVariants
        );

        const variantAttr = filterVariantAttributes.find(
          (attr) =>
            attr._id === attribute.id ||
            attr.attribute_value === attribute.value
        );

        console.log(
          "Product Data variant attriibute ",
          variantAttr,
          variantAttr.isSoldOut,
          variantAttr.isVisible
        );

        if (variantAttr) {
          attributeData = {
            isSoldOut: variantAttr.isSoldOut,
            quantity: variantAttr.quantity,
            isVisible: variantAttr.isVisible !== false, // Default to true if not set
          };
        }
      }

      // Check if attribute is not visible
      if (attributeData.isVisible === false) {
        return true;
      }

      // Only disable if specifically marked as sold out
      if (attributeData.isSoldOut) {
        return true;
      }

      // Don't disable just because quantity is 0
      if (attributeData.quantity === 0 && !attributeData.isSoldOut) {
        return false;
      }

      // Use the improved combination sold out logic
      if (isAttributeCombinationSoldOut && selectedVariants) {
        return isAttributeCombinationSoldOut(attribute.id, selectedVariants);
      }

      return false;
    }

    // For parent variants, use existing logic (unchanged)
    if (isAttributeCombinationSoldOut && selectedVariants) {
      const isSoldOut = isAttributeCombinationSoldOut(
        attribute.id,
        selectedVariants
      );
      if (isSoldOut) {
        return true;
      }
    }

    const variantAttr = filterVariantAttributes.find(
      (attr) =>
        attr._id === attribute.id || attr.attribute_value === attribute.value
    );

    return (
      variantAttr?.minQuantity === 0 &&
      variantAttr?.maxQuantity === 0 &&
      variantAttr?.isCheckedQuantity
    );
  };

  const getPreviewImage = (attribute) => {
    if (variant.type === "parent") {
      const variantAttr = filterVariantAttributes.find(
        (attr) =>
          attr._id === attribute.id || attr.attribute_value === attribute.value
      );
      return variantAttr?.preview_image || "";
    }

    return attribute.edit_preview_image || attribute.preview_image || "";
  };

  const handleGuideClick = () => {
    setCurrentGuide({
      name: variant.guide_name,
      file: variant.guide_file,
      type: variant.guide_type,
      description: variant.guide_description,
    });
    setGuideOpen(true);
  };

  const renderGuideModal = () => (
    <Dialog
      open={guideOpen}
      onClose={() => setGuideOpen(false)}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "90vw",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          {currentGuide?.name || `${variant.name} Guide`}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={() => setGuideOpen(false)}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, overflow: "hidden" }}>
        {currentGuide?.description && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" component="div">
              {parse(currentGuide.description)}
            </Typography>
          </Box>
        )}

        {currentGuide?.file && currentGuide?.type === "image" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: zoom === 1 ? "center" : "flex-start",
              height: "60vh",
              overflow: zoom > 1 ? "auto" : "hidden", // 🔥 key fix
              cursor: zoom > 1 ? "grab" : "default",
            }}
          >
            <img
              src={currentGuide.file}
              alt={currentGuide.name || "Guide Image"}
              // onWheel={(e) => {
              //   e.preventDefault();
              //   setZoom((z) => Math.max(1, z + (e.deltaY < 0 ? 0.2 : -0.2)));
              // }}
              style={{
                maxWidth: "100%",   // ✅ always constrained
                maxHeight: "100%",  // ✅ always constrained
                width: "auto",
                height: "auto",
                objectFit: "contain",
                transform: `scale(${zoom})`,
                transformOrigin: "center", // 🔥 important for scrolling
                transition: "transform 0.3s ease",
                borderRadius: "8px",
              }}
            />
          </Box>
        )}

        {currentGuide?.file && currentGuide?.type === "video" && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                borderRadius: "8px",
              }}
            >
              <source src={currentGuide.file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}

        {currentGuide?.file && currentGuide?.type === "document" && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Button
              variant="contained"
              href={currentGuide.file}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 2 }}
            >
              View Guide
            </Button>
          </Box>
        )}

        {!currentGuide?.file && !currentGuide?.description && (
          <Typography color="textSecondary" sx={{ textAlign: "center", py: 4 }}>
            No guide content available
          </Typography>
        )}
      </DialogContent>

      {currentGuide?.file && currentGuide?.type === "image" && (
        <DialogActions sx={{ p: 2 }}>
          {/* Zoom controls */}

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => setZoom((z) => z + 0.5)} variant="outlined" sx={{ color: "GrayText", borderColor: "#d1d1d1" }}>
              Zoom +
            </Button>
            <Button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} variant="outlined" sx={{ color: "GrayText", borderColor: "#d1d1d1" }}>
              Zoom -
            </Button>
            <Button onClick={() => setZoom(1)} variant="outlined" sx={{ color: "GrayText", borderColor: "#d1d1d1" }}>
              Reset
            </Button>
          </Box>
        </DialogActions>)
      }
    </Dialog>
  );


  const renderParentVariantGrid = () => {
    const anyHaveThumbnails = variant.attributes.some(
      (attr) => getPreviewImage(attr) || attr.thumbnail
    );

    return (
      <Box sx={{ mb: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "17px", fontWeight: 600 }}>
            {variant.name}{" "}
            {selectedAttr && (
              <span style={{ fontSize: "15px", fontWeight: 400 }}>
                : {hoveredAttrValue || selectedAttr.value}
              </span>
            )}
          </Typography>

          {hasGuide && (
            <Button
              onClick={handleGuideClick}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "12px",
                padding: "2px 8px",
                minWidth: "auto",
                textTransform: "none",
                borderColor: "#D23F57",
                color: "#D23F57",
                "&:hover": {
                  borderColor: "#b32e44",
                  backgroundColor: "rgba(210, 63, 87, 0.04)",
                },
              }}
            >
              {variant.guide_name}
            </Button>
          )}
        </Box>

        {/* ===== THUMBNAIL MODE (UNCHANGED) ===== */}
        {anyHaveThumbnails ? (
          <>
            <Box
              sx={{ mb: 1, position: "relative" }}
            >

              <Box
                ref={scrollRef}
                onScroll={handleScrollImmediate}
                sx={{
                  display: "flex", // ✅ Step 4 (parent slider)
                  overflowX: "auto",
                  overflowY: "hidden",
                  scrollBehavior: "smooth",
                  scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {pages.map((page, pageIndex) => (
                  <Box
                    key={pageIndex}
                    sx={{
                      display: "grid", // ✅ Step 3 (grid per page)
                      gridTemplateColumns: `repeat(${columns}, 1fr)`,
                      gridTemplateRows: `repeat(${rows}, auto)`,
                      // gap: 1,
                      minWidth: "100%",
                      flexShrink: 0,
                      scrollSnapAlign: "start",
                      p: 0.5,
                    }}
                  >
                    {page.map((attr) => (
                      <Box
                        key={attr.id}
                        sx={{ p: 0.8 }}
                        onMouseEnter={() => {
                          if (!isAttributeDisabled(attr) && onHover) {
                            onHover(attr.id);
                            setHoveredAttrValue(attr.value);
                          }
                        }}
                        onMouseLeave={() => {
                          if (onHoverOut) {
                            onHoverOut();
                            setHoveredAttrValue(null);
                          }
                        }}
                      >
                        <VariantButton
                          attr={attr}
                          isSelected={selectedValue === attr.id}
                          isDisabled={isAttributeDisabled(attr)}
                          onChange={onChange}
                          variantId={variant.id}
                          priceText={renderAttributePrice(attr)}
                          getPreviewImage={getPreviewImage}
                          anyHaveThumbnails={anyHaveThumbnails}
                        />
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>

            </Box>

            {totalPages > 1 && !isMobile && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                  gap: 2,
                }}
              >
                <IconButton
                  onClick={() => scrollToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  size="small"
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>

                <Typography
                  variant="body2"
                  sx={{ minWidth: "60px", textAlign: "center" }}
                >
                  {currentPage + 1} / {totalPages}
                </Typography>

                <IconButton
                  onClick={() => scrollToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  size="small"
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </>
        ) : (
          /* ===== TEXT MODE (NEW AMAZON STYLE) ===== */
          <>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                maxHeight: expanded || !showTextModeExpandControls
                  ? "none"
                  : isMobile ? `${TEXT_MODE_COLLAPSED_HEIGHT_XS}px` : `${TEXT_MODE_COLLAPSED_HEIGHT_MD}px`,
              }}
            >
              <Box
                ref={textModeContentRef}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {variant.attributes.map((attr) => (
                  <Box
                    key={attr.id}
                    sx={{ p: 0.80 }}
                    onMouseEnter={() => {
                      if (!isAttributeDisabled(attr) && onHover) {
                        onHover(attr.id);
                        setHoveredAttrValue(attr.value);
                      }
                    }}
                    onMouseLeave={() => {
                      if (onHoverOut) {
                        onHoverOut();
                        setHoveredAttrValue(null);
                      }
                    }}
                  >
                    <VariantButton
                      attr={attr}
                      isSelected={selectedValue === attr.id}
                      isDisabled={isAttributeDisabled(attr)}
                      onChange={onChange}
                      variantId={variant.id}
                      priceText={renderAttributePrice(attr)}
                      getPreviewImage={getPreviewImage}
                      anyHaveThumbnails={anyHaveThumbnails}
                    />
                  </Box>
                ))}

              </Box>

              {/* Fade overlay */}
              {!expanded && showTextModeExpandControls && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    pt: 3,
                    display: "flex",
                    justifyContent: "center",
                    background:
                      "linear-gradient(to bottom, rgb(255,255,255), rgb(255,255,255))",
                  }}
                >
                  <Button
                    onClick={() => setExpanded(true)}
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontSize: "13px",
                      color: "#323434",
                      backgroundColor: "#fff",
                      border: "grey"
                    }}
                  >
                    See more
                  </Button>
                </Box>
              )}
            </Box>
            {expanded && showTextModeExpandControls && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 1,
                }}
              >
                <Button
                  onClick={() => setExpanded(false)}
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontSize: "13px",
                    color: "#323434",
                  }}
                >
                  See less
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Error */}
        {error && (
          <Typography color="error" sx={{ mt: 1, fontSize: "14px" }}>
            {error}
          </Typography>
        )}

        {renderGuideModal()}
      </Box>
    );
  };


  const renderAttributePriceForDropdown = (attribute) => {
    if (!attribute || variant.type !== "internal") return "";

    let attributeData = {};

    if (calculateAttributeData && selectedVariants) {
      attributeData = calculateAttributeData(attribute.id, selectedVariants);
    } else {
      const variantAttr = filterVariantAttributes.find(
        (attr) =>
          attr._id === attribute.id || attr.attribute_value === attribute.value
      );
      if (variantAttr) {
        attributeData = {
          price: variantAttr.price,
          priceRange: variantAttr.priceRange,
          isSoldOut: variantAttr.isSoldOut,
          isIndependent: variantAttr.isIndependent,
          isVisible: variantAttr.isVisible !== false, // Default to true if not set
        };
      }
    }

    // Don't show price if attribute is not visible
    if (attributeData.isVisible === false) {
      return "";
    }

    // Only show sold out if attribute is actually sold out AND visible
    if (attributeData.isSoldOut) {
      return "";
    }

    const { price, priceRange, isIndependent } = attributeData;

    // Only show price if it exists
    if (price !== null && !isNaN(price)) {
      return `(${currency?.symbol}${(price * currency?.rate).toFixed(2)})`;
    } else if (priceRange) {
      if (priceRange.min === priceRange.max) {
        return `(${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)})`;
      } else {
        return `(${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)} - ${currency?.symbol}${(priceRange.max * currency?.rate).toFixed(2)})`;
      }
    }

    return "";
  };

  const renderInternalVariantDropdown = () => {

    const handleViewAllClick = (e) => {
      e.stopPropagation();
      setIsViewAllOpen(true);
    };

    const handleImageSelect = (attr) => {
      setIsViewAllOpen(false);
      onChange(variant.id, attr.id);
      setOpen(false);
      onHoverOut && onHoverOut();
    };

    return (
      <Grid item xs={12} sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "17px" }}>
            {variant.name}
          </Typography>

          {hasGuide && (
            <Button
              onClick={handleGuideClick}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "12px",
                padding: "2px 8px",
                minWidth: "auto",
                textTransform: "none",
                borderColor: "#D23F57",
                color: "#D23F57",
                "&:hover": {
                  borderColor: "#b32e44",
                  backgroundColor: "rgba(210, 63, 87, 0.04)",
                },
              }}
            >
              {variant.guide_name}
            </Button>
          )}
        </Box>

        <FormControl fullWidth>
          <Box sx={{ position: "relative", width: "100%" }}>
            {/* Selected value box */}
            <Box
              ref={triggerRef}
              onClick={handleToggle}
              sx={{
                m: 0,
                p: 0,
                display: "flex",
                border: "none",
                background: "#fff",
                height: "40px",
                boxShadow: "0 0 3px #000",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
                borderRadius: "4px"
              }}>
              <Box
                sx={{
                  border: "none",
                  background: "#fff",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  borderRadius: "4px"
                }}
              >
                {selectedAttr?.value || "Select an option"}
              </Box>
              <Box sx={{ pr: 2, marginLeft: "auto", color: "grey" }}>{open ? "⏶" : "⏷"}</Box>
            </Box>

            {/* Dropdown menu */}
            {open && (
              <>
                <Box sx={{ position: "fixed", inset: 0, background: "transparent", zIndex: 1100 }} />
                <Box
                  ref={menuRef}
                  sx={{
                    position: "fixed",
                    top: "50%",
                    transform: "translateY(-50%)",
                    left: isViewAllOpen ? "50%" : dropdownLeft,  // Change this line
                    transform: isViewAllOpen ? "translate(-50%, -50%)" : "translateY(-50%)",  // Add this line
                    width: isViewAllOpen ? "calc(100vw - 32px)" : dropdownWidth,
                    maxWidth: isViewAllOpen ? "1200px" : "none",
                    background: "#fff",
                    boxShadow: "0 7px 14px rgba(0,0,0,0.4)",
                    zIndex: 1300,
                    maxHeight: "80vh",
                    overflowY: "auto",
                    borderRadius: "4px",
                    transition: "width 0.3s ease-out",
                  }}
                >
                  {/* Empty option with View All button */}
                  {!isViewAllOpen && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        py: 1,
                        px: 2,
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "#eeeeee",
                        },
                      }}
                    >
                      <Box
                        onClick={() => {
                          onChange(variant.id, "");
                          setOpen(false);
                          onHoverOut && onHoverOut();
                        }}
                        sx={{ flex: 1 }}
                      >
                        Select an option
                      </Box>
                      <Button
                        onClick={handleViewAllClick}
                        size="small"
                        variant="text"
                        sx={{
                          fontSize: "12px",
                          textTransform: "none",
                          color: "#D23F57",
                          fontWeight: "bold",
                        }}
                      >
                        View All
                      </Button>
                    </Box>
                  )}

                  {isViewAllOpen ? (
                    // ViewAllOpen grid view with images
                    <Box sx={{ p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="h6" sx={{ fontSize: "17px" }}>
                          {variant.name}
                        </Typography>
                        <IconButton onClick={() => setIsViewAllOpen(false)} size="small">
                          ✕
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm: "repeat(auto-fill, minmax(180px, 1fr))",
                          },
                          gap: 2,
                          overflowY: "auto",
                        }}
                      >
                        {variant.attributes.map((attr) => {
                          const isDisabled = isAttributeDisabled(attr);
                          const isVisible = isAttributeVisible(attr);
                          const isSelected = selectedAttr && (selectedAttr.id === attr.id || selectedAttr.value === attr.value);

                          if (!isVisible) return null;

                          // Get image source
                          let imageSrc = null;
                          if (attr.images && attr.images.length > 0) {
                            imageSrc = attr.images[0];
                          } else if (attr.preview_image) {
                            imageSrc = attr.preview_image;
                          } else if (productMainImage) {
                            imageSrc = Array.isArray(productMainImage)
                              ? `https://api.agukart.com/uploads/product/${productMainImage[0]}`
                              : `https://api.agukart.com/uploads/product/${productMainImage}`;
                          }

                          // Get thumbnail image
                          const thumbnailSrc = attr.thumbnail;
                          const showThubnail = !(attr.images && attr.images.length > 0) && !attr.preview_image
                          return (
                            <Box
                              key={attr.id}
                              onClick={() => {
                                if (isDisabled) return;
                                handleImageSelect(attr);
                              }}
                              sx={{
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                                position: "relative",
                                border: isSelected ? "2px solid #D23F57" : "1px solid #e0e0e0",
                                borderRadius: "8px",
                                overflow: "hidden",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  transform: isDisabled ? "none" : "translateY(-2px)",
                                  boxShadow: isDisabled ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  paddingTop: "100%", // 1:1 aspect ratio
                                  backgroundColor: "#f5f5f5",
                                }}
                              >
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt={attr.value}
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      width: "100%",
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      backgroundColor: "#f5f5f5",
                                      color: "#999",
                                    }}
                                  >
                                    No Image
                                  </Box>
                                )}

                                {/* Small thumbnail in bottom right */}
                                {showThubnail && thumbnailSrc && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      bottom: "8px",
                                      right: "8px",
                                      width: "48px",
                                      height: "48px",
                                      borderRadius: "4px",
                                      overflow: "hidden",
                                      border: "2px solid white",
                                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                      backgroundColor: "white",
                                    }}
                                  >
                                    <img
                                      src={thumbnailSrc}
                                      alt=""
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </Box>
                                )}
                              </Box>

                              <Box sx={{ p: 1.5, textAlign: "center" }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    fontSize: "13px",
                                    mb: 0.5,
                                    color: isDisabled ? "#999" : "inherit",
                                  }}
                                >
                                  {attr.value}
                                </Typography>
                                {isDisabled && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#d32f2f",
                                      fontSize: "10px",
                                      display: "block",
                                    }}
                                  >
                                    Sold Out
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ) : (
                    // Original list view
                    <>
                      {variant.attributes.map((attr) => {
                        const isDisabled = isAttributeDisabled(attr);
                        const isVisible = isAttributeVisible(attr);
                        const previewImage = getPreviewImage(attr);
                        const priceText = renderAttributePriceForDropdown(attr);
                        const isSelected = selectedAttr && (selectedAttr.id === attr.id || selectedAttr.value === attr.value);

                        // Get quantity info for display
                        let quantityInfo = "";
                        let attributeData = {};

                        if (calculateAttributeData && selectedVariants) {
                          attributeData = calculateAttributeData(
                            attr.id,
                            selectedVariants
                          );
                        } else {
                          const variantAttr = filterVariantAttributes.find(
                            (fAttr) =>
                              fAttr._id === attr.id ||
                              fAttr.attribute_value === attr.value
                          );
                          if (variantAttr) {
                            attributeData = {
                              quantity: variantAttr.quantity,
                              quantityRange: variantAttr.quantityRange,
                              isSoldOut: variantAttr.isSoldOut,
                            };
                          }
                        }

                        if (!isVisible) return null;

                        return (
                          <Box
                            data-attr-id={attr.id}
                            key={attr.id}
                            onMouseEnter={() => !isDisabled && onHover && onHover(attr.id)}
                            onMouseLeave={() => onHoverOut && onHoverOut()}
                            onClick={() => {
                              if (isDisabled) return;
                              onChange(variant.id, attr.id);
                              setOpen(false);
                              onHoverOut && onHoverOut();
                            }}
                            sx={{
                              backgroundColor: isSelected ? "#ffedf3" : isDisabled ? "#eeeeee" : "inherit",
                              py: 0.5,
                              px: 2,
                              cursor: isDisabled ? "not-allowed" : "pointer",
                              "&:hover": {
                                backgroundColor:
                                  isDisabled ? undefined : isSelected ? "#f9e1e1" : "#eeeeee",
                              },
                            }}
                          >
                            <Tooltip
                              title={
                                previewImage ? (
                                  <Box sx={{ p: 1 }}>
                                    <img
                                      src={previewImage}
                                      alt={attr.value}
                                      style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                      }}
                                    />
                                  </Box>
                                ) : null
                              }
                              placement="left-start"
                              arrow
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flex: 1,
                                  }}
                                >
                                  {attr.thumbnail && (
                                    <img
                                      src={attr.thumbnail}
                                      alt=""
                                      style={{
                                        width: "48px",
                                        height: "48px",
                                        marginRight: "12px",
                                        borderRadius: "3px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}

                                  <div
                                    style={{
                                      flex: 1,
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: "2px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: isDisabled ? "#999" : "inherit",
                                        display: "block",
                                        fontSize: "14px",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {attr.value}
                                    </span>

                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "8px",
                                        alignItems: "center",
                                      }}
                                    >
                                      {priceText && (
                                        <span
                                          style={{
                                            fontSize: "12px",
                                            color: isDisabled
                                              ? "#999"
                                              : "#666",
                                          }}
                                        >
                                          {priceText}
                                        </span>
                                      )}

                                      {quantityInfo && !isDisabled && (
                                        <span
                                          style={{
                                            fontSize: "11px",
                                            color: "#2e7d32",
                                            backgroundColor: "#e8f5e9",
                                            padding: "1px 6px",
                                            borderRadius: "3px",
                                            fontWeight: "500",
                                          }}
                                        >
                                          {quantityInfo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isDisabled && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#d32f2f",
                                      fontWeight: "bold",
                                      fontSize: "10px",
                                      backgroundColor: "#ffebee",
                                      padding: "2px 6px",
                                      borderRadius: "3px",
                                    }}
                                  >
                                    Sold Out
                                  </Typography>
                                )}
                              </div>
                            </Tooltip>
                          </Box>
                        );
                      })}
                    </>
                  )}
                </Box>
              </>
            )}
          </Box>

        </FormControl>

        {error && (
          <Typography color="error" sx={{ mt: 1, fontSize: "14px" }}>
            {error}
          </Typography>
        )}

        {renderGuideModal()}
      </Grid>
    );
  };

  if (variant.type === "parent") {
    return renderParentVariantGrid();
  } else {
    return renderInternalVariantDropdown();
  }
};

const VariantButton = ({
  attr,
  isSelected,
  isDisabled,
  onChange,
  onHover,
  onHoverOut,
  variantId,
  priceText,
  getPreviewImage,
  anyHaveThumbnails
}) => {
  const hasThumbnail = anyHaveThumbnails;

  return (
    <Box
      sx={{
        flexShrink: 0,
        width: hasThumbnail ? "75px" : "auto",
        position: "relative"
      }}
    >
      <Tooltip title={isDisabled ? "Sold Out" : null} placement="top" arrow>
        <Button
          onClick={() => {
            if (!isDisabled) {
              onChange(variantId, attr.id);
            }
          }}
          onMouseEnter={() => !isDisabled && onHover && onHover(attr.id)}
          onMouseLeave={() => !isDisabled && onHoverOut && onHoverOut()}
          disabled={isDisabled}
          sx={{
            flexShrink: 0,
            position: "relative",
            width: hasThumbnail ? 75 : "auto",
            minWidth: hasThumbnail ? 75 : "unset",
            maxWidth: "100%",
            height: hasThumbnail ? 75 : 36,
            minHeight: hasThumbnail ? 75 : 36,
            padding: hasThumbnail ? "6px" : "6px 12px",
            borderRadius: "10px",
            overflow: "visible",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isSelected ? "2px solid #D23F57" : "1px solid #ccc",
            backgroundColor: isDisabled ? "#e6e6e6" : isSelected ? "#fff5f7" : "#fff",
            cursor: isDisabled ? "not-allowed" : "pointer",
            outline: isSelected ? "3px solid #D23F57" : "",
            outlineOffset: 2,
            "&:hover:not(:disabled)": {
              borderColor: isSelected ? "#000" : "#d84f66ff",
              boxShadow: "0 0 0 3px rgba(0, 113, 133, 0.1)",
            },
          }}
        >
          {attr.thumbnail ? (
            <img
              src={attr.thumbnail}
              alt={attr.value}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "6px",
                zIndex: 100
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                // whiteSpace: "nowrap",     // ✅ prevents line break
                overflow: "hidden",
                textOverflow: "ellipsis", // optional safety
                backgroundColor: isDisabled ? "#f0f0f0" : "#f8f9fa",
                color: isDisabled ? "#858585" : "#222222",
                fontSize: "12px",
                fontWeight: isSelected ? 600 : 400,
                px: 1, // horizontal padding
              }}
            >
              {attr.value}
            </Box>
          )}
          {isDisabled && (
            <Box
              sx={{
                position: "absolute",
                top: "-9px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#fff",
                color: "#c32e2e",
                fontSize: "9.5px",
                fontWeight: "bold",
                px: "1px",
                py: "1px",
                borderRadius: "4px",
                zIndex: 50,
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              SOLD OUT
            </Box>
          )}
        </Button>
      </Tooltip>

      <Box sx={{ textAlign: "center", mt: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: "12px",
            fontWeight: isDisabled ? 400 : 600,
            color: isDisabled ? "#999" : "inherit",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {attr.thumbnail ? attr.value : null}
        </Typography>
        {priceText && (
          <Typography
            variant="caption"
            sx={{
              fontSize: "10px",
              color: isDisabled ? "#d32f2f" : "#666666",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {priceText}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default VariantSelector;
