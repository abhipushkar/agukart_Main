// components/Cart/DrawerVariantSelector.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Tooltip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  useMediaQuery,
  FormControl,
  Select
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import parse from "html-react-parser";
import { useTheme } from "@mui/material/styles";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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

const DrawerVariantSelector = ({
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
  productMainImage,
  form_values,
}) => {
  const [guideOpen, setGuideOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState(null);
  const scrollRef = useRef(null);
  const itemRef = useRef(null);
  const pageWidthRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);
  const resizeObserverRef = useRef(null);
  const menuRef = useRef(null);
  const hasAutoScrolledRef = useRef(false);
  const triggerRef = useRef(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [hoveredAttrValue, setHoveredAttrValue] = useState(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const hasSetInitialPageRef = useRef(false);
  const textModeContentRef = useRef(null);
  const [showTextModeExpandControls, setShowTextModeExpandControls] = useState(false);
  const TEXT_MODE_COLLAPSED_HEIGHT = 140;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  // Adjust columns for drawer (smaller width)
  const columns = isMobile ? 3 : 4; // Original used 5, but drawer is narrower
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

  // Auto-scroll to selected page on mount
  useEffect(() => {
    if (hasSetInitialPageRef.current) return;
    if (!pages.length) return;
    const selectedPageIndex = pages.findIndex((page) =>
      page.some((attr) => attr.id === selectedValue || attr.value === selectedValue)
    );
    if (selectedPageIndex < 0) {
      hasSetInitialPageRef.current = true;
      return;
    }
    setCurrentPage(selectedPageIndex);
    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const pageWidth = scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({ left: selectedPageIndex * pageWidth, behavior: "auto" });
    });
    hasSetInitialPageRef.current = true;
  }, [pages, selectedValue]);

  const hasGuide = !!(variant.guide_file || variant.guide_name || variant.guide_description);

  const calculatePageMetrics = useCallback(() => {
    if (!scrollRef.current || !itemRef.current) return;
    try {
      const itemWidth = itemRef.current.offsetWidth;
      if (!itemWidth || itemWidth <= 0) return;
      const gap = 8;
      const container = scrollRef.current.parentElement;
      const availableWidth = container ? container.clientWidth : scrollRef.current.clientWidth;
      const effectiveWidth = Math.max(availableWidth - 16, 200);
      const itemsPerPage = Math.max(2, Math.floor(effectiveWidth / (itemWidth + gap)));
      const pageWidth = (itemWidth + gap) * itemsPerPage;
      pageWidthRef.current = pageWidth;
      const scrollWidth = scrollRef.current.scrollWidth;
      const total = Math.max(1, Math.ceil(scrollWidth / pageWidth));
      const scrollLeft = scrollRef.current.scrollLeft;
      const newPage = Math.min(Math.round(scrollLeft / pageWidth), total - 1);
      setCurrentPage(newPage);
    } catch (error) {
      console.error("Error calculating page metrics:", error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => calculatePageMetrics(), 100);
    if (scrollRef.current) {
      const container = scrollRef.current.parentElement;
      if (container && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(() => calculatePageMetrics());
        resizeObserverRef.current.observe(container);
      }
    }
    return () => {
      clearTimeout(timer);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, [variant.attributes.length, calculatePageMetrics]);


  const selectedAttr = variant.attributes.find((attr) => attr.id === selectedValue || attr.value === selectedValue);


  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
    setIsViewAllOpen(false);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    onHoverOut?.();
  };


  useEffect(() => {
    const handleResize = debounce(() => calculatePageMetrics(), 150);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculatePageMetrics]);


  useEffect(() => {
    if (guideOpen) setZoom(1);
  }, [guideOpen]);

  useEffect(() => {
    const measureTextModeOverflow = () => {
      if (!textModeContentRef.current) return;
      const contentHeight = textModeContentRef.current.scrollHeight || 0;
      const shouldShowControls = contentHeight > TEXT_MODE_COLLAPSED_HEIGHT;
      setShowTextModeExpandControls(shouldShowControls);
      if (!shouldShowControls) setExpanded(false);
    };
    measureTextModeOverflow();
    let observer;
    if (window.ResizeObserver && textModeContentRef.current) {
      observer = new ResizeObserver(() => measureTextModeOverflow());
      observer.observe(textModeContentRef.current);
    }
    window.addEventListener("resize", measureTextModeOverflow);
    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", measureTextModeOverflow);
    };
  }, [variant.attributes, isMobile]);

  const scrollToPage = useCallback((page) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const pageWidth = container.offsetWidth;
    const targetPage = Math.max(0, Math.min(page, totalPages - 1));
    container.scrollTo({ left: targetPage * pageWidth, behavior: "smooth" });
  }, [totalPages]);

  const handleScrollImmediate = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const pageWidth = container.clientWidth;
    const newPage = Math.round(container.scrollLeft / pageWidth);
    if (newPage !== currentPage) setCurrentPage(newPage);
  }, [currentPage]);

  // Price rendering (same as original)
  const renderAttributePrice = (attribute) => {
    if (variant.type === "parent") {
      const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
      if (!variantAttr) return null;
      const { minPrice, maxPrice, minQuantity, maxQuantity, isCheckedQuantity } = variantAttr;
      if (minQuantity === 0 && maxQuantity === 0 && isCheckedQuantity) return " [Sold Out]";
      if (minPrice !== 0 && !isNaN(minPrice)) {
        if (minPrice === maxPrice) return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)})`;
        return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)} - ${currency?.symbol}${(maxPrice * currency?.rate).toFixed(2)})`;
      }
      return null;
    } else if (variant.type === "internal") {
      let attributeData = {};
      if (calculateAttributeData && selectedVariants) {
        attributeData = calculateAttributeData(attribute.id, selectedVariants);
      } else {
        const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
        if (variantAttr) {
          attributeData = {
            price: variantAttr.price,
            quantity: variantAttr.quantity,
            priceRange: variantAttr.priceRange,
            quantityRange: variantAttr.quantityRange,
            isSoldOut: variantAttr.isSoldOut,
            isIndependent: variantAttr.isIndependent,
            isVisible: true,
          };
        }
      }
      if (attributeData.isVisible === false) return "";
      if (attributeData.isSoldOut) return " [Sold Out]";
      let priceText = "";
      if (attributeData.isIndependent) {
        if (attributeData.price !== null && !isNaN(attributeData.price)) {
          priceText = ` (${currency?.symbol}${(attributeData.price * currency?.rate).toFixed(2)})`;
        } else if (attributeData.priceRange && attributeData.priceRange.min === attributeData.priceRange.max) {
          priceText = ` (${currency?.symbol}${(attributeData.priceRange.min * currency?.rate).toFixed(2)})`;
        }
      } else if (attributeData.price !== null && !isNaN(attributeData.price)) {
        priceText = ` (${currency?.symbol}${(attributeData.price * currency?.rate).toFixed(2)})`;
      } else if (attributeData.priceRange) {
        if (attributeData.priceRange.min === attributeData.priceRange.max) {
          priceText = ` (${currency?.symbol}${(attributeData.priceRange.min * currency?.rate).toFixed(2)})`;
        } else {
          priceText = ` (${currency?.symbol}${(attributeData.priceRange.min * currency?.rate).toFixed(2)} - ${currency?.symbol}${(attributeData.priceRange.max * currency?.rate).toFixed(2)})`;
        }
      }
      return priceText;
    }
    return null;
  };

  const isAttributeVisible = useCallback((attribute) => {
    if (variant.type === "internal") {
      let attributeData = {};
      if (calculateAttributeData && selectedVariants) {
        attributeData = calculateAttributeData(attribute.id, selectedVariants);
      } else {
        const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
        if (variantAttr) attributeData = { isSoldOut: variantAttr.isSoldOut, quantity: variantAttr.quantity, isVisible: variantAttr.isVisible !== false };
      }
      return attributeData.isVisible !== false;
    }
    return true;
  }, [variant.type, calculateAttributeData, selectedVariants, filterVariantAttributes]);

  const isAttributeDisabled = (attribute) => {
    if (variant.type === "internal") {
      let attributeData = {};
      if (calculateAttributeData && selectedVariants) {
        attributeData = calculateAttributeData(attribute.id, selectedVariants);
      } else {
        const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
        if (variantAttr) attributeData = { isSoldOut: variantAttr.isSoldOut, quantity: variantAttr.quantity, isVisible: variantAttr.isVisible !== false };
      }
      if (attributeData.isVisible === false) return true;
      if (attributeData.isSoldOut) return true;
      if (isAttributeCombinationSoldOut && selectedVariants) return isAttributeCombinationSoldOut(attribute.id, selectedVariants);
      return false;
    }
    if (isAttributeCombinationSoldOut && selectedVariants) return isAttributeCombinationSoldOut(attribute.id, selectedVariants);
    const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
    return variantAttr?.minQuantity === 0 && variantAttr?.maxQuantity === 0 && variantAttr?.isCheckedQuantity;
  };

  const getPreviewImage = (attribute) => {
    if (variant.type === "parent") {
      const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
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

  const transformRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);

  const renderGuideModal = () => (
    <Dialog open={guideOpen} onClose={() => setGuideOpen(false)} maxWidth="md" fullWidth sx={{ "& .MuiDialog-paper": { maxWidth: "90vw", maxHeight: "95vh" } }}>
      <DialogTitle sx={{ m: 0, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">{currentGuide?.name || `${variant.name} Guide`}</Typography>
        <IconButton onClick={() => setGuideOpen(false)}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: "visible" }}>
        {currentGuide?.description && <Box sx={{ p: 3, pb: 0 }}>{parse(currentGuide.description)}</Box>}
        {currentGuide?.file && currentGuide?.type === "image" && (
          <Box sx={{ width: "100%", height: "85vh", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
            <TransformWrapper ref={transformRef} initialScale={1} minScale={1} maxScale={5} wheel={{ step: 0.2 }} doubleClick={{ disabled: false }} pinch={{ step: 10 }} onPanningStart={() => setIsDragging(true)} onPanningStop={() => setIsDragging(false)} onZoomStop={(ref) => setScale(ref.state.scale)}>
              <TransformComponent wrapperStyle={{ display: "inline-block", width: "85vw", height: "fit-content", cursor: isDragging ? "grabbing" : "grab" }} contentStyle={{ display: "inline-block" }}>
                <img src={currentGuide.file} alt="guide" style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", display: "block" }} />
              </TransformComponent>
            </TransformWrapper>
          </Box>
        )}
        {currentGuide?.file && currentGuide?.type === "video" && <Box sx={{ textAlign: "center", mb: 2 }}><video controls style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: "8px" }}><source src={currentGuide.file} type="video/mp4" /></video></Box>}
        {currentGuide?.file && currentGuide?.type === "document" && <Box sx={{ textAlign: "center", mb: 2 }}><Button variant="contained" href={currentGuide.file} target="_blank">View Guide</Button></Box>}
        {!currentGuide?.file && !currentGuide?.description && <Typography color="textSecondary" sx={{ textAlign: "center", py: 4 }}>No guide content available</Typography>}
      </DialogContent>
      {currentGuide?.file && currentGuide?.type === "image" && (
        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => transformRef.current?.zoomIn()} variant="outlined">Zoom +</Button>
            <Button onClick={() => transformRef.current?.zoomOut()} variant="outlined">Zoom -</Button>
            <Button onClick={() => transformRef.current?.resetTransform()} variant="outlined">Reset</Button>
            <Button onClick={() => setGuideOpen(false)} variant="outlined">Close</Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );

  // Parent variant grid (thumbnail mode)
  const renderParentVariantGrid = () => {
    const anyHaveThumbnails = variant.attributes.some(attr => getPreviewImage(attr) || attr.thumbnail);
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ position: "relative", mt: 2, display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "17px", fontWeight: 600, whiteSpace: "nowrap" }}>
            {variant.name}{" "}
            {selectedAttr && <span style={{ fontSize: "15px", fontWeight: 400 }}>: {hoveredAttrValue || selectedAttr.value}</span>}
          </Typography>
          {hasGuide && <Button onClick={handleGuideClick} size="small" variant="outlined" sx={{ fontSize: "12px", padding: "2px 8px", textTransform: "none", borderColor: "#D23F57", color: "#D23F57" }}>{variant.guide_name}</Button>}
        </Box>

        {anyHaveThumbnails ? (
          <>
            <Box sx={{ mb: 1, position: "relative" }}>
              <Box ref={scrollRef} onScroll={handleScrollImmediate} sx={{ display: "flex", overflowX: "auto", overflowY: "hidden", scrollBehavior: "smooth", scrollSnapType: "x mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                {pages.map((page, pageIndex) => (
                  <Box key={pageIndex} sx={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gridTemplateRows: `repeat(${rows}, auto)`, minWidth: "100%", flexShrink: 0, scrollSnapAlign: "start", p: 0.5 }}>
                    {page.map((attr) => (
                      <Box key={attr.id} sx={{ p: 0.8 }} onMouseEnter={() => { if (!isAttributeDisabled(attr) && onHover) { onHover(attr.id); setHoveredAttrValue(attr.value); } }} onMouseLeave={() => { if (onHoverOut) { onHoverOut(); setHoveredAttrValue(null); } }}>
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
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2, gap: 2 }}>
                <IconButton onClick={() => scrollToPage(currentPage - 1)} disabled={currentPage === 0} size="small"><ChevronLeftIcon fontSize="small" /></IconButton>
                <Typography variant="body2" sx={{ minWidth: "60px", textAlign: "center" }}>{currentPage + 1} / {totalPages}</Typography>
                <IconButton onClick={() => scrollToPage(currentPage + 1)} disabled={currentPage >= totalPages - 1} size="small"><ChevronRightIcon fontSize="small" /></IconButton>
              </Box>
            )}
          </>
        ) : (
          // Text mode for parent variants (if no thumbnails)
          <>
            <Box sx={{ position: "relative", overflow: "hidden", maxHeight: expanded || !showTextModeExpandControls ? "none" : isMobile ? "140px" : "150px" }}>
              <Box ref={textModeContentRef} sx={{ display: "flex", flexWrap: "wrap" }}>
                {variant.attributes.map((attr) => (
                  <Box key={attr.id} sx={{ p: 0.8 }} onMouseEnter={() => { if (!isAttributeDisabled(attr) && onHover) { onHover(attr.id); setHoveredAttrValue(attr.value); } }} onMouseLeave={() => { if (onHoverOut) { onHoverOut(); setHoveredAttrValue(null); } }}>
                    <VariantButton attr={attr} isSelected={selectedValue === attr.id} isDisabled={isAttributeDisabled(attr)} onChange={onChange} variantId={variant.id} priceText={renderAttributePrice(attr)} getPreviewImage={getPreviewImage} anyHaveThumbnails={anyHaveThumbnails} />
                  </Box>
                ))}
              </Box>
              {!expanded && showTextModeExpandControls && (
                <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, pt: 3, display: "flex", justifyContent: "center", background: "linear-gradient(to bottom, rgb(255,255,255), rgb(255,255,255))" }}>
                  <Button onClick={() => setExpanded(true)} size="small" sx={{ textTransform: "none", fontSize: "13px", color: "#323434", backgroundColor: "#fff", border: "grey" }}>See more</Button>
                </Box>
              )}
            </Box>
            {expanded && showTextModeExpandControls && <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}><Button onClick={() => setExpanded(false)} size="small" sx={{ textTransform: "none", fontSize: "13px", color: "#323434" }}>See less</Button></Box>}
          </>
        )}
        {error && <Typography color="error" sx={{ mt: 1, fontSize: "14px" }}>{error}</Typography>}
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
      const variantAttr = filterVariantAttributes.find(attr => attr._id === attribute.id || attr.attribute_value === attribute.value);
      if (variantAttr) attributeData = { price: variantAttr.price, priceRange: variantAttr.priceRange, isSoldOut: variantAttr.isSoldOut, isIndependent: variantAttr.isIndependent, isVisible: variantAttr.isVisible !== false };
    }
    if (attributeData.isVisible === false) return "";
    if (attributeData.isSoldOut) return "";
    const { price, priceRange } = attributeData;
    if (price !== null && !isNaN(price)) return `(${currency?.symbol}${(price * currency?.rate).toFixed(2)})`;
    if (priceRange) {
      if (priceRange.min === priceRange.max) return `(${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)})`;
      return `(${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)} - ${currency?.symbol}${(priceRange.max * currency?.rate).toFixed(2)})`;
    }
    return "";
  };

  // Internal variant dropdown (same as original, but with fixed position inside drawer)
  const renderInternalVariantDropdown = () => {
    const handleViewAllClick = (e) => {
      e.stopPropagation();
      handleMenuClose();
      setIsViewAllOpen(true);
    };

    const handleImageSelect = (attr) => {
      setIsViewAllOpen(false);
      onChange(variant.id, attr.id);
      handleMenuClose();
    };

    const showPrice = form_values?.isCheckedPrice && form_values?.prices?.includes(variant.name);

    // Desktop: Use Menu with left-aligned popover
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "17px" }}>{variant.name}</Typography>
          {hasGuide && <Button onClick={handleGuideClick} size="small" variant="outlined" sx={{ fontSize: "12px", padding: "2px 8px", textTransform: "none", borderColor: "#D23F57", color: "#D23F57" }}>{variant.guide_name}</Button>}
        </Box>

        <Box>
          <Box
            ref={triggerRef}
            onClick={handleMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "none",
              background: "#fff",
              height: "40px",
              boxShadow: "0 0 3px #000",
              cursor: "pointer",
              userSelect: "none",
              borderRadius: "4px",
              px: 2,
            }}
          >
            <Typography>{selectedAttr?.value || "Select an option"}</Typography>
            <Box sx={{ color: "grey" }}>{menuOpen ? "⏶" : "⏷"}</Box>
          </Box>

          <Menu
            anchorEl={menuAnchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              sx: {
                maxHeight: "300px",
                width: triggerRef.current?.offsetWidth || 280,
                mt: 1,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: "1px solid #eee", pr: 1 }}>
              <MenuItem onClick={() => { onChange(variant.id, ""); handleMenuClose(); }} sx={{ flex: 1, py: 1 }}>
                <em>Select an option</em>
              </MenuItem>
              {variant.viewAllVisible && (
                <Button onClick={handleViewAllClick} size="small" variant="text" sx={{ fontSize: "12px", textTransform: "none", color: "#D23F57", fontWeight: "bold" }}>
                  View All
                </Button>
              )}
            </Box>

            {variant.attributes.map((attr) => {
              const isDisabled = isAttributeDisabled(attr);
              const isVisible = isAttributeVisible(attr);
              const isSelected = selectedAttr && (selectedAttr.id === attr.id || selectedAttr.value === attr.value);
              const priceText = showPrice ? renderAttributePriceForDropdown(attr) : "";

              if (!isVisible) return null;

              return (
                <MenuItem
                  key={attr.id}
                  onClick={() => {
                    if (isDisabled) return;
                    onChange(variant.id, attr.id);
                    handleMenuClose();
                  }}
                  disabled={isDisabled}
                  selected={isSelected}
                  onMouseEnter={() => !isDisabled && onHover && menuOpen && onHover(attr.id)}
                  onMouseLeave={() => onHoverOut && onHoverOut()}
                  sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}
                >
                  {attr.thumbnail && (
                    <img
                      src={attr.thumbnail}
                      alt=""
                      style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }}
                    />
                  )}
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="body2">{attr.value}</Typography>
                    {priceText && (
                      <Typography variant="caption" sx={{ color: "#666", ml: 1 }}>
                        {priceText}
                      </Typography>
                    )}
                    {isDisabled && (
                      <Typography variant="caption" sx={{ color: "#d32f2f", ml: 1 }}>
                        Sold Out
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
        </Box>

        {error && <Typography color="error" sx={{ mt: 1, fontSize: "14px" }}>{error}</Typography>}
        {renderGuideModal()}

        {/* View All Dialog - separate from Menu */}
        <Dialog
          open={isViewAllOpen}
          onClose={() => setIsViewAllOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: "12px",
              maxHeight: "90vh",
            },
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, pb: 1, borderBottom: "1px solid #eee" }}>
                <Typography variant="h6" sx={{ fontSize: "17px" }}>{variant.name}</Typography>
                <IconButton onClick={() => setIsViewAllOpen(false)} size="small">✕</IconButton>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(auto-fill, minmax(180px, 1fr))" }, gap: 2, overflowY: "auto", maxHeight: "70vh", pr: 1 }}>
                {variant.attributes.map((attr) => {
                  const isDisabled = isAttributeDisabled(attr);
                  const isVisible = isAttributeVisible(attr);
                  const isSelected = selectedAttr && (selectedAttr.id === attr.id || selectedAttr.value === attr.value);
                  if (!isVisible) return null;

                  const cleanImages = (attr.images || []).filter(img => img && typeof img === "string" && img.trim() !== "");
                  let imageSrc = null;
                  if (cleanImages.length) imageSrc = cleanImages[0];
                  else if (attr.preview_image && attr.preview_image !== '__DELETE__') imageSrc = attr.preview_image;
                  else if (productMainImage) imageSrc = Array.isArray(productMainImage) ? `https://api.agukart.com/uploads/product/${productMainImage[0]}` : `https://api.agukart.com/uploads/product/${productMainImage}`;

                  const thumbnailSrc = attr.thumbnail;
                  const showThumbnail = cleanImages.length === 0 && !(attr.preview_image && attr.preview_image !== '__DELETE__');

                  return (
                    <Box
                      key={attr.id}
                      onClick={() => { if (isDisabled) return; handleImageSelect(attr); }}
                      sx={{
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.5 : 1,
                        border: isSelected ? "2px solid #D23F57" : "1px solid #e0e0e0",
                        borderRadius: "8px",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": { transform: isDisabled ? "none" : "translateY(-2px)", boxShadow: isDisabled ? "none" : "0 4px 12px rgba(0,0,0,0.1)" }
                      }}
                    >
                      <Box sx={{ position: "relative", paddingTop: "100%", backgroundColor: "#f5f5f5" }}>
                        {imageSrc ? (
                          <img src={imageSrc} alt={attr.value} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", color: "#999" }}>No Image</Box>
                        )}
                        {showThumbnail && thumbnailSrc && (
                          <Box sx={{ position: "absolute", bottom: "8px", right: "8px", width: "48px", height: "48px", borderRadius: "4px", overflow: "hidden", border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", backgroundColor: "white" }}>
                            <img src={thumbnailSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ p: 1.5, textAlign: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "13px", mb: 0.5, color: isDisabled ? "#999" : "inherit" }}>{attr.value}</Typography>
                        {isDisabled && <Typography variant="caption" sx={{ color: "#d32f2f", fontSize: "10px", display: "block" }}>Sold Out</Typography>}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    );
  };

  if (variant.type === "parent") {
    return renderParentVariantGrid();
  } else {
    return renderInternalVariantDropdown();
  }
};

const VariantButton = ({ attr, isSelected, isDisabled, onChange, onHover, onHoverOut, variantId, priceText, getPreviewImage, anyHaveThumbnails }) => {
  const hasThumbnail = anyHaveThumbnails;
  return (
    <Box sx={{ flexShrink: 0, width: hasThumbnail ? "75px" : "auto", position: "relative" }}>
      <Tooltip title={isDisabled ? "Sold Out" : null} placement="top" arrow>
        <Button
          onClick={() => { if (!isDisabled) onChange(variantId, attr.id); }}
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
            "&:hover:not(:disabled)": { borderColor: isSelected ? "#000" : "#d84f66ff", boxShadow: "0 0 0 3px rgba(0, 113, 133, 0.1)" },
          }}
        >
          {attr.thumbnail ? (
            <img src={attr.thumbnail} alt={attr.value} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", zIndex: 100 }} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", textOverflow: "ellipsis", backgroundColor: isDisabled ? "#f0f0f0" : "#f8f9fa", color: isDisabled ? "#858585" : "#222222", fontSize: "12px", fontWeight: isSelected ? 600 : 400, px: 1 }}>{attr.value}</Box>
          )}
          {isDisabled && <Box sx={{ position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", color: "#c32e2e", fontSize: "9.5px", fontWeight: "bold", px: "1px", py: "1px", borderRadius: "4px", zIndex: 50, whiteSpace: "nowrap", pointerEvents: "none" }}>SOLD OUT</Box>}
        </Button>
      </Tooltip>
      <Box sx={{ textAlign: "center", mt: 0.5 }}>
        <Typography variant="body2" sx={{ fontSize: "12px", fontWeight: isDisabled ? 400 : 600, color: isDisabled ? "#999" : "inherit", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attr.thumbnail ? attr.value : null}</Typography>
        {priceText && <Typography variant="caption" sx={{ fontSize: "10px", color: isDisabled ? "#d32f2f" : "#666666", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{priceText}</Typography>}
      </Box>
    </Box>
  );
};

export default DrawerVariantSelector;