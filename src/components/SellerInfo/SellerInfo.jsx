import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon } from '@mui/icons-material';

const SellerInfo = ({
    product,
    vendorDetail,
    onFollowShop,
    onMessage,
    userDesignation
}) => {
    const [expanded, setExpanded] = useState("panel1");

    const handleChangeAccord = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <Box mt={3}>
            <Accordion
                sx={{ boxShadow: "none", background: "transparent" }}
                expanded={expanded === "panel1"}
                onChange={handleChangeAccord("panel1")}
            >
                <AccordionSummary
                    sx={{
                        ".MuiAccordionSummary-content": {
                            margin: "0 !important",
                        },
                        minHeight: "0 !important",
                        padding: "8px 16px",
                        transition: "all 500ms",
                        "&:hover": {
                            background: "#f0f0f0",
                            borderRadius: "30px",
                        },
                    }}
                    expandIcon={
                        <ExpandMoreIcon
                            sx={{
                                transform:
                                    expanded === "panel1"
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                transition: "transform 0.3s ease",
                            }}
                        />
                    }
                    aria-controls="panel1d-content"
                    id="panel1d-header"
                >
                    <Typography fontSize={18} fontWeight={600}>
                        Meet your seller
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                        <Box>
                            <img
                                src={product?.vendor_base_url + product?.vendor_id?.image}
                                style={{
                                    borderRadius: "4px",
                                    width: "80px",
                                    height: "80px",
                                    objectFit: "cover",
                                }}
                                alt={product?.vendor_id?.name}
                            />
                        </Box>

                        <Box ml={1}>
                            <Box>
                                <Typography variant="h6" fontWeight={500}>
                                    {product?.vendor_id?.name}
                                </Typography>
                            </Box>

                            <Typography sx={{ color: "#000" }} onClick={() => {
                                const slug = product?.vendor_details?.slug;
                                const url = `/store/${slug}`;
                                if (slug) {
                                    window.open(url, "_blank");
                                }
                            }}>
                                Owner of{" "}
                                <span style={{ color: "#000", textDecoration: "underline", cursor: "pointer" }}>
                                    {product?.vendor_details?.shop_name}
                                </span>
                            </Typography>

                            {userDesignation !== "4" && (
                                <Button
                                    onClick={onFollowShop}
                                    sx={{
                                        borderRadius: "30px",
                                        transition: "all 500ms",
                                        mt: 1
                                    }}
                                    startIcon={
                                        vendorDetail?.followStatus ? (
                                            <FavoriteIcon sx={{ color: "red" }} />
                                        ) : (
                                            <FavoriteBorderIcon />
                                        )
                                    }
                                >
                                    {vendorDetail?.followStatus ? "Unfollow Shop" : "Follow Shop"}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Box mt={1}>
                        <Button
                            onClick={onMessage}
                            sx={{
                                fontWeight: "600",
                                fontSize: "16px",
                                textAlign: "center",
                                border: "2px solid #000",
                                width: "100%",
                                background: "#fff",
                                borderRadius: "30px",
                                padding: "8px 18px",
                            }}
                        >
                            Message {product?.vendor_id?.name}
                        </Button>
                    </Box>

                    <Typography pt={1} textAlign={"center"} sx={{ fontSize: "13px" }}>
                        This seller usually responds{" "}
                        <Typography fontWeight={500} component="span">
                            within 24 hours
                        </Typography>
                        .
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default SellerInfo;
