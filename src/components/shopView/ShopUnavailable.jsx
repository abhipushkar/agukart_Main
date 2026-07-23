"use client";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IosShareIcon from "@mui/icons-material/IosShare";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { SectionCreator } from "components/section-header";
import { Alert, Card, Paper, Rating } from "@mui/material";
import useMyProvider from "hooks/useMyProvider";
import useAuth from "hooks/useAuth";
import { postAPIAuth } from "utils/__api__/ApiServies";

const ShopUnavailable = ({ vendorDetail }) => {
    const [_value, setValue] = useState("1");
    const [vendorCategories, setVendorCategories] = useState([]);
    const [announcementShowMore, setAnnouncementShowMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const { usercredentials } = useMyProvider();
    const [followed, setFollowed] = useState(false);
    const { token } = useAuth();
    const [openPopup, SetOpenPopup] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [openAnnouncementModal, setOpenAnnouncementModal] = useState(false);
    const [isWishlist, setIsWishlist] = useState(false);

    const shareUrl = encodeURIComponent(
        `https://agukart.com/store/${vendorDetail?.slug || ""}`
    );
    const shareTitle = encodeURIComponent(vendorDetail?.shop_name || "");

    const handleClickPopup = () => {
        SetOpenPopup(true);
    };

    const handleClosePopup = () => {
        SetOpenPopup(false);
    };

    const getFollowStatus = async (id) => {
        if (!id) return;
        try {
            const res = await getAPIAuth(
                `vendor-follow-status/${id}?userId=${usercredentials?._id}`,
                token
            );
            if (res.status === 200) {
                setFollowed(res.data.followStatus);
                setIsWishlist(res.data.followStatus);
                console.log(res.data, "follow")
            }
        } catch (error) {
            console.error(error.response?.data?.message || "")
        }
    };

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

    useEffect(() => {
        if (!token || !vendorDetail?._id) return;
        getFollowStatus(vendorDetail?._id);
    }, [token, vendorDetail?._id]);

    return (
        <SectionCreator
            px={{ xs: 0, md: 0 }} py={3} mb={0} height={'400px'}>
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
                <Box>
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
                                {/* <Rating value={summary?.shopRatingAvg || 0} size='small' readOnly /> */}
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

                                        {/* <Typography fontSize="12px">
                            {vendorDetail?.followersCount || "0"}
                          </Typography> */}
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
                                </Box>
                            </Box>

                            {/* Desktop stars + follow button (unchanged) */}
                            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, mt: 1 }}>
                                {/* <Rating value={summary?.shopRatingAvg || 0} sx={{ color: '#000' }} readOnly /> */}
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
                            md: "center",
                            xs: "center",
                        },
                        alignItems: {
                            md: "center",
                            xs: "center",
                        },
                        textAlign: {
                            xs: "center", // mobile: center text
                            md: "center", // desktop: right align text (optional)
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
                </Box>
            </Box>

            <Box width={"100%"} display={'flex'} justifyContent={'center'}>
                <Alert severity="info" color='warning' sx={{ width: { xs: '100%', lg: 'fit-content' }, border: '1px solid #ddd', borderRadius: '10px' }}>
                    {vendorDetail?.shop_name} is currently not available to sell on  Agukart.
                </Alert>
            </Box>

        </SectionCreator>
    );
};

export default ShopUnavailable;