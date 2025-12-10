import React, { useRef } from 'react';
import {
    Box,
    Button,
    Grid,
    List,
    ListItem,
    styled,
    Tooltip,
    Typography
} from '@mui/material';
import Slider from 'react-slick';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IosShareIcon from '@mui/icons-material/IosShare';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/styles.css';

const ProductImageGallery = ({
    product,
    media,
    selectedImage,
    onImageSelect,
    onWishlistToggle,
    onShareClick,
    isInWishlist,
    userDesignation,
    hoveredImage
}) => {
    const sliderRef = useRef(null);
    const [isOpen, setIsOpen] = React.useState(false);

    // Helper to get current media item
    const getCurrentMediaItem = () => {
        if (hoveredImage && hoveredImage.mediaItem) {
            return hoveredImage.mediaItem;
        }

        if (media && media.length > 0 && selectedImage >= 0 && selectedImage < media.length) {
            return media[selectedImage];
        }

        return null;
    };

    // Improved video detection
    const isVideo = (mediaItem) => {
        if (!mediaItem) return false;
        
        // Check if it's a video by type
        if (mediaItem.type === 'video') return true;
        
        // Check if it has video source structure
        if (mediaItem.sources && Array.isArray(mediaItem.sources)) return true;
        
        // Check by URL extension
        const url = mediaItem.url || mediaItem;
        if (typeof url === 'string') {
            return url.includes(".mp4") || 
                   url.includes(".webm") || 
                   url.includes(".mov") || 
                   url.includes(".avi");
        }
        
        // Check if mediaItem is a direct video URL string
        if (typeof mediaItem === 'string') {
            return mediaItem.includes(".mp4") || 
                   mediaItem.includes(".webm") || 
                   mediaItem.includes(".mov") || 
                   mediaItem.includes(".avi");
        }
        
        return false;
    };

    // Get current display URL
    const getCurrentDisplayImage = () => {
        if (hoveredImage) {
            // hoveredImage could be a URL string or object
            if (typeof hoveredImage === 'string') {
                return hoveredImage;
            }
            if (hoveredImage.url) {
                return hoveredImage.url;
            }
            return hoveredImage;
        }

        const mediaItem = getCurrentMediaItem();
        if (!mediaItem) return null;

        // Handle different media structures
        if (mediaItem.url) {
            return mediaItem.url;
        }
        
        // If mediaItem is a string URL
        if (typeof mediaItem === 'string') {
            return mediaItem;
        }
        
        return null;
    };

    const settings = {
        vertical: true,
        slidesToShow: media?.length >= 8 ? 8 : media?.length || 0,
        slidesToScroll: 1,
        infinite: false,
        speed: 500,
        focusOnSelect: true,
        arrows: false,
    };

    const handleWheel = (e) => {
        e.preventDefault();
        if (sliderRef.current) {
            if (e.deltaY > 0) {
                sliderRef.current.slickNext();
            } else {
                sliderRef.current.slickPrev();
            }
        }
    };

    const disableScroll = (e) => e.preventDefault();

    const handleMouseEnter = () => {
        window.addEventListener("scroll", disableScroll, { passive: true });
        window.addEventListener("wheel", disableScroll, { passive: true });
        window.addEventListener("touchmove", disableScroll, { passive: true });
    };

    const handleMouseLeave = () => {
        window.removeEventListener("scroll", disableScroll);
        window.removeEventListener("wheel", disableScroll);
        window.removeEventListener("touchmove", disableScroll);
    };

    // Update the sliderImages for lightbox with proper video handling
    const sliderImages = media?.map((mediaItem) => {
        if (isVideo(mediaItem)) {
            // If it already has video structure, use it
            if (mediaItem.type === 'video' && mediaItem.sources) {
                return mediaItem;
            }
            
            // Create proper video structure for lightbox
            return {
                type: "video",
                width: 1280,
                height: 720,
                poster: mediaItem.thumbnail || mediaItem.poster || undefined,
                sources: [
                    {
                        src: mediaItem.url || mediaItem,
                        type: "video/mp4",
                    },
                ],
            };
        } else {
            return {
                src: mediaItem.url || mediaItem,
                description: mediaItem.displayText || mediaItem.description || undefined
            };
        }
    });

    const currentMediaItem = getCurrentMediaItem();
    const currentDisplayUrl = getCurrentDisplayImage();
    const isCurrentVideo = isVideo(currentMediaItem);

    console.log("ProductImageGallery Debug:", {
        media,
        selectedImage,
        currentMediaItem,
        isCurrentVideo,
        currentDisplayUrl,
        hoveredImage
    });

    return (
        <Grid container spacing={2} m={0} width={"100%"} sx={{
            position: "sticky",
            top: 0,
            marginBottom: { xs: "10px" },
            height: { xs: "auto", md: "559px" }
        }}>
            {/* Thumbnail Slider */}
            <Grid lg={1} md={2} xs={2} sx={{
                display: { xs: "none", md: "block" },
                height: "559px",
                overflow: "hidden"
            }}>
                <Box
                    sx={{
                        position: "relative",
                        height: "100%",
                        overflow: "hidden",
                        display: { xs: "none", md: "block" },
                    }}
                    onWheel={handleWheel}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <List sx={{
                        height: "559px",
                        padding: "0",
                        margin: "0"
                    }}>
                        <Slider ref={sliderRef} {...settings} sx={{
                            overflow: "auto",
                            height: "100%"
                        }}>
                            {media?.map((mediaItem, i) => {
                                const isSelected = selectedImage === i;
                                const isVariantImage = mediaItem.isVariantImage;
                                const mediaUrl = mediaItem.url || mediaItem;
                                const isThumbnailVideo = isVideo(mediaItem);

                                return (
                                    <ListItem
                                        key={mediaItem.id || i}
                                        sx={{
                                            marginBottom: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: 'relative',
                                            padding: "0 !important",
                                            height: "60px !important",
                                            minHeight: "60px !important"
                                        }}
                                        disablePadding
                                    >
                                        {/* Variant image badge */}
                                        {isVariantImage && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '-2px',
                                                    left: '-2px',
                                                    backgroundColor: '#D23F57',
                                                    color: 'white',
                                                    fontSize: '8px',
                                                    fontWeight: 'bold',
                                                    padding: '1px 3px',
                                                    borderRadius: '2px',
                                                    zIndex: 2,
                                                    lineHeight: 1
                                                }}
                                            >
                                                V
                                            </Box>
                                        )}

                                        <Button
                                            onClick={() => onImageSelect(i)}
                                            sx={{
                                                border: isSelected ? "2px solid #000" : "none",
                                                borderColor: isVariantImage ? '#D23F57' : 'inherit',
                                                opacity: isSelected ? 1 : 0.5,
                                                transition: "opacity 0.3s ease-in-out",
                                                overflow: "hidden",
                                                padding: "0",
                                                height: "60px",
                                                width: "60px",
                                                minWidth: "60px",
                                                minHeight: "60px",
                                                boxShadow: "0 0 3px #848282",
                                                position: 'relative',
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center"
                                            }}
                                        >
                                            {isThumbnailVideo ? (
                                                <VideoAvatarContainer>
                                                    <VideoAvatar
                                                        src={mediaUrl}
                                                        loop
                                                        muted
                                                        playsInline
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                    <PlayCircleOutlineIcon
                                                        sx={{
                                                            position: "absolute",
                                                            width: "24px",
                                                            height: "24px",
                                                            color: "white",
                                                            backgroundColor: "rgba(0,0,0,0.5)",
                                                            borderRadius: "50%",
                                                            padding: "2px"
                                                        }}
                                                    />
                                                </VideoAvatarContainer>
                                            ) : (
                                                <img
                                                    height={"60px"}
                                                    width={"60px"}
                                                    alt={mediaItem.displayText || "Product thumbnail"}
                                                    src={mediaUrl}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        filter: isVariantImage ? 'none' : 'inherit'
                                                    }}
                                                />
                                            )}
                                        </Button>

                                        {/* Tooltip for variant images */}
                                        {isVariantImage && (
                                            <Tooltip
                                                title={
                                                    <Box sx={{ p: 1 }}>
                                                        <Typography variant="body2">
                                                            {mediaItem.displayText || 'Variant Image'}
                                                        </Typography>
                                                    </Box>
                                                }
                                                placement="right"
                                                arrow
                                            >
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        cursor: 'help',
                                                        zIndex: 1
                                                    }}
                                                />
                                            </Tooltip>
                                        )}
                                    </ListItem>
                                );
                            })}
                        </Slider>
                    </List>
                </Box>
            </Grid>

            {/* Main Image Display */}
            <Grid item lg={11} md={10} xs={12} sx={{
                textAlign: "center",
                margin: "0",
                paddingLeft: "0 !important",
                height: { xs: "auto", md: "559px" }
            }}>
                <Box sx={{
                    position: "relative",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {currentDisplayUrl && isCurrentVideo ? (
                        <Box sx={{
                            width: "100%",
                            maxWidth: "100%",
                            height: "auto",
                            aspectRatio: "1/1",
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <VideoShow
                                onClick={() => setIsOpen(true)}
                                src={currentDisplayUrl}
                                controls={false}
                                loop
                                muted
                                autoPlay
                                playsInline
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    maxHeight: "559px",
                                    aspectRatio: "1/1",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                            />
                        </Box>
                    ) : currentDisplayUrl ? (
                        <Box sx={{
                            width: "100%",
                            maxWidth: "100%",
                            height: "559px",
                            aspectRatio: "1/1",
                            position: "relative",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}>
                            <img
                                alt="Product main image"
                                onClick={() => setIsOpen(true)}
                                src={currentDisplayUrl}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    maxHeight: "559px",
                                    aspectRatio: "1/1",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    position: "relative",
                                }}
                            />

                            {/* Variant image indicator on main display */}
                            {currentMediaItem?.isVariantImage && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '8px',
                                        left: '8px',
                                        background: 'rgba(210, 63, 87, 0.9)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        zIndex: 10,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        maxWidth: '80%',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    <Typography variant="caption">
                                        {currentMediaItem?.displayText || 'Variant Image'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                maxHeight: "559px",
                                aspectRatio: "1/1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "6px",
                            }}
                        >
                            <Typography color="textSecondary">
                                No image available
                            </Typography>
                        </Box>
                    )}

                    {/* Show hover indicator when hovered image is displayed */}
                    {hoveredImage && (
                        <Box
                            sx={{
                                position: "absolute",
                                top: "8px",
                                left: "8px",
                                background: "rgba(0, 113, 133, 0.9)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                zIndex: 10,
                            }}
                        >
                            Preview
                        </Box>
                    )}

                    {/* Product Badge */}
                    {product?.product_bedge && (
                        <ProductBadge badge={product.product_bedge} />
                    )}

                    {/* Action Buttons */}
                    <Button
                        onClick={onShareClick}
                        sx={{
                            zIndex: "99",
                            position: "absolute",
                            top: "12px",
                            right: "64px",
                            background: "#fff",
                            boxShadow: "0 0 3px #696969",
                            borderRadius: "50%",
                            height: "40px",
                            width: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": {
                                background: "#fff",
                                boxShadow: "0 0 4px #000",
                            },
                        }}
                    >
                        <IosShareIcon />
                    </Button>

                    {userDesignation !== "4" && (
                        <Button
                            onClick={onWishlistToggle}
                            sx={{
                                zIndex: "99",
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "#fff",
                                boxShadow: "0 0 3px #696969",
                                borderRadius: "50%",
                                height: "40px",
                                width: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                "&:hover": {
                                    background: "#fff",
                                    boxShadow: "0 0 4px #000",
                                },
                            }}
                        >
                            {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </Button>
                    )}

                    {/* Navigation Arrows */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: "0",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            width: "100%",
                            pointerEvents: "none",
                        }}
                    >
                        <Button
                            onClick={() => {
                                let totalImages = media.length;
                                onImageSelect((prev) => (prev - 1 + totalImages) % totalImages);
                            }}
                            sx={{
                                background: "#fff",
                                boxShadow: "0 0 3px #000",
                                borderRadius: "50%",
                                width: { xs: "40px", md: "50px" },
                                height: { xs: "40px", md: "50px" },
                                zIndex: 3,
                                pointerEvents: "auto",
                                ml: { xs: 1, md: 2 }
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: "32px" }} />
                        </Button>
                        <Button
                            onClick={() => {
                                let totalImages = media.length;
                                onImageSelect((prev) => (prev + 1) % totalImages);
                            }}
                            sx={{
                                background: "#fff",
                                boxShadow: "0 0 3px #000",
                                borderRadius: "50%",
                                width: { xs: "40px", md: "50px" },
                                height: { xs: "40px", md: "50px" },
                                zIndex: 3,
                                pointerEvents: "auto",
                                mr: { xs: 1, md: 2 }
                            }}
                        >
                            <ChevronRightIcon sx={{ fontSize: "32px" }} />
                        </Button>
                    </Box>
                </Box>
            </Grid>

            {/* Lightbox */}
            {isOpen && (
                <Lightbox
                    open={isOpen}
                    close={() => setIsOpen(false)}
                    slides={sliderImages}
                    index={selectedImage}
                    plugins={[Zoom, Video]}
                    zoom={{
                        maxZoomPixelRatio: 3,
                        zoomInMultiplier: 2,
                    }}
                />
            )}
        </Grid>
    );
};

// Styled components
const VideoAvatarContainer = styled("div")(({ theme }) => ({
    position: "relative",
    width: "80px",
    height: "80px",
    overflow: "hidden",
}));

const VideoAvatar = styled("video")(({ theme }) => ({
    width: "100%",
    height: "100%",
    objectFit: "cover",
}));

const VideoShow = styled("video")(({ theme }) => ({
    width: "100%",
    height: "100%",
    maxHeight: "559px",
    objectFit: "contain",
    aspectRatio: "1/1"
}));

const ProductBadge = ({ badge }) => (
    <Typography
        sx={{
            zIndex: "9",
            position: "absolute",
            top: "12px",
            left: "12px",
            background:
                badge === "Popular Now"
                    ? "#fed9c9"
                    : badge === "Best Seller"
                        ? "#e9d8a6"
                        : "#c1f1c1",
            boxShadow: "0 0 3px #696969",
            borderRadius: "30px",
            padding: "5px 10px",
            color: "#000",
            textDecoration: "underline dashed",
            display: "flex",
            alignItems: "center",
            textUnderlineOffset: "2px",
        }}
    >
        {badge === "Popular Now" && <FireIcon />}
        {badge === "Best Seller" && <BestSellerIcon />}
        {badge}
    </Typography>
);

// Icon components
const FireIcon = () => (
    <svg height="20px" width="20px" viewBox="-33 0 255 255" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000"><defs><linearGradient id="linear-gradient-1" gradientUnits="userSpaceOnUse" x1="94.141" y1="255" x2="94.141" y2="0.188"><stop offset="0" stop-color="#ff4c0d"></stop><stop offset="1" stop-color="#fc9502"></stop></linearGradient></defs><g id="fire"><path d="M187.899,164.809 C185.803,214.868 144.574,254.812 94.000,254.812 C42.085,254.812 -0.000,211.312 -0.000,160.812 C-0.000,154.062 -0.121,140.572 10.000,117.812 C16.057,104.191 19.856,95.634 22.000,87.812 C23.178,83.513 25.469,76.683 32.000,87.812 C35.851,94.374 36.000,103.812 36.000,103.812 C36.000,103.812 50.328,92.817 60.000,71.812 C74.179,41.019 62.866,22.612 59.000,9.812 C57.662,5.384 56.822,-2.574 66.000,0.812 C75.352,4.263 100.076,21.570 113.000,39.812 C131.445,65.847 138.000,90.812 138.000,90.812 C138.000,90.812 143.906,83.482 146.000,75.812 C148.365,67.151 148.400,58.573 155.999,67.813 C163.226,76.600 173.959,93.113 180.000,108.812 C190.969,137.321 187.899,164.809 187.899,164.809 Z" fill="url(#linear-gradient-1)" fillRule="evenodd"></path><path d="M94.000,254.812 C58.101,254.812 29.000,225.711 29.000,189.812 C29.000,168.151 37.729,155.000 55.896,137.166 C67.528,125.747 78.415,111.722 83.042,102.172 C83.953,100.292 86.026,90.495 94.019,101.966 C98.212,107.982 104.785,118.681 109.000,127.812 C116.266,143.555 118.000,158.812 118.000,158.812 C118.000,158.812 125.121,154.616 130.000,143.812 C131.573,140.330 134.753,127.148 143.643,140.328 C150.166,150.000 159.127,167.390 159.000,189.812 C159.000,225.711 129.898,254.812 94.000,254.812 Z" fill="#fc9502" fillRule="evenodd"></path><path d="M95.000,183.812 C104.250,183.812 104.250,200.941 116.000,223.812 C123.824,239.041 112.121,254.812 95.000,254.812 C77.879,254.812 69.000,240.933 69.000,223.812 C69.000,206.692 85.750,183.812 95.000,183.812 Z" fill="#fce202" fillRule="evenodd"></path></g></svg>
);

const BestSellerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="20px" width="20px" aria-hidden="true" focusable="false"><path fillRule="evenodd" clipRule="evenodd" d="M12 18a8 8 0 0 0 7.021-4.163q.008-.012.013-.024A8 8 0 1 0 12 18m4.5-8.8c.2-.1.2-.4.2-.6s-.3-.3-.5-.3h-2.8l-.9-2.7c-.1-.4-.8-.4-1 0l-.9 2.7H7.8c-.2 0-.4.1-.5.3s0 .4.2.6l2.3 1.7-.9 2.7c-.1.2 0 .4.2.6q.3.15.6 0l2.3-1.7 2.3 1.7c.1.1.2.1.3.1s.2 0 .3-.1c.2-.1.2-.4.2-.6l-.9-2.7z"></path><path d="M4.405 14.831a9 9 0 0 0 6.833 4.137L8.9 23l-2.7-3.3L2 19zm15.19 0a9 9 0 0 1-6.833 4.137L15.1 23l2.7-3.3L22 19z"></path></svg>
);

export default ProductImageGallery;
