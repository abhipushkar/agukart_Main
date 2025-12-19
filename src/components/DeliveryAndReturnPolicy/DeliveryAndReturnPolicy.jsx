import React, { useMemo } from "react";
import { Box, Typography, Divider, Tooltip, Popper, Autocomplete, TextField } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import parse from "html-react-parser";
import { useLocation } from "contexts/location_context";
import { LocationOn } from "@mui/icons-material";

const DeliveryAndReturnPolicy = ({ product }) => {
    const whiteTooltipProps = {
        tooltip: {
            sx: {
                bgcolor: "#fff",
                color: "#000",
                borderRadius: 2,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                fontSize: 12,
                px: 3,
                py: 2,
                width: 250,
            },
        },
        arrow: {
            sx: {
                color: "#fff",
            },
        },
    };

    console.log(product, "product data");

    const { location, setLocation, countries } = useLocation();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const shipping =
        product?.shipping_templates?.shippingTemplateData?.standardShipping?.[0];

    const exchangePolicy = product?.exchangePolicy;

    const deliveryRange = useMemo(() => {
        if (!shipping?.transitTime) return "—";
        return getDeliveryDateRange(
            shipping.transitTime.minDays,
            shipping.transitTime.maxDays
        );
    }, [shipping]);

    const handleOpenCountryMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseCountryMenu = () => {
        setAnchorEl(null);
    };

    const policyLabel = getPolicyLabel(exchangePolicy);

    return (
        <Box sx={{ maxWidth: "75%", color: "#000", fontSize: 14 }}>
            <Typography fontWeight={600} mb={1}>
                Delivery and Return Policies
            </Typography>

            {/* Estimated Delivery + Tooltip */}
            <Row icon={<LocalShippingOutlinedIcon />}>

                <Typography>
                    Estimated Delivery : Order today to get by {" "}
                    <Tooltip
                        title={
                            <Typography fontSize={12}>
                                Your order should arrive by this date if you buy today. To calculate
                                an estimated delivery date we can count on, we look at things like
                                the carrier's latest transit times, the seller's processing time and
                                dispatch history, and where the order is dispatched from and
                                delivered to.
                            </Typography>
                        }
                        componentsProps={whiteTooltipProps}
                        arrow
                    >
                        <Typography component={"span"} fontWeight={500} sx={{ textDecoration: "underline", cursor: "pointer" }}>{deliveryRange}</Typography>
                    </Tooltip>
                </Typography>
            </Row>

            <Typography sx={{ color: "rgba(0,0,0,0.65)", mt: 0.5 }}>
                Need it faster? Contact the seller or choose a shipping upgrade during checkout.
            </Typography>

            <Box mt={2}>
                {policyLabel && (
                    <Row icon={<AutorenewOutlinedIcon />}>
                        <Tooltip
                            title={
                                <Typography fontSize={12}>
                                    Buyers are responsible for return postage costs. If the item is not
                                    returned in its original condition, the buyer is responsible for any
                                    loss in value.
                                </Typography>
                            }
                            arrow
                            componentsProps={whiteTooltipProps}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                }}
                            >
                                {policyLabel}
                            </Typography>
                        </Tooltip>

                        <Typography component="span">
                            {" "}within {exchangePolicy?.returnExchangeTime} days
                        </Typography>
                    </Row>
                )}

                {shipping?.shippingFee?.perOrder && (
                    <Row icon={<PaidOutlinedIcon />}>
                        <Typography>
                            Delivery cost: ${shipping.shippingFee.perOrder}
                        </Typography>
                    </Row>
                )}

                <Row icon={<LocationOn />}>
                    <Typography>Dispatched from: India</Typography>
                </Row>
                <Box
                    display="inline-flex"
                    alignItems="center"
                    gap={0.5}
                    sx={{ cursor: "pointer", width: "max-content", display: "flex", alignItems: "center", px: 3, py: 1, my: 2, borderRadius: 20, boxShadow: "0px 4px 12px rgba(0,0,0,0.12)", border: "1px solid #ccc" }}
                    onClick={handleOpenCountryMenu}
                >
                    <Row icon={<LocationOn />}>
                        <Box display="flex" alignItems="center" m="auto" gap={0.5}>
                            <Typography>Deliver to</Typography>

                            <Typography
                                sx={{
                                    textDecoration: "underline",
                                    fontWeight: 500,
                                }}
                            >
                                {location?.countryName || "United States"}
                            </Typography>

                            <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                        </Box>
                    </Row>
                </Box>

                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    sx={{ zIndex: 1300 }}
                >
                    <Box
                        sx={{
                            width: 260,
                            p: 1,
                            bgcolor: "#fff",
                            borderRadius: 2,
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                        }}
                    >
                        <Autocomplete
                            autoFocus
                            options={countries}
                            getOptionLabel={(option) => option.name}
                            value={
                                countries.find(
                                    (c) => c.name === location.countryName
                                ) || null
                            }
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    setLocation({
                                        countryName: newValue.name,
                                        countryCode: newValue.code,
                                    });
                                }
                                handleCloseCountryMenu();
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Search country"
                                    size="small"
                                />
                            )}
                            sx={{
                                "& .MuiAutocomplete-listbox": {
                                    maxHeight: 220,
                                },
                            }}
                        />
                    </Box>
                </Popper>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* HTML from backend — DO NOT wrap in Typography */}
            <Box sx={{ "& p": { margin: 0, fontSize: 14 } }}>
                {exchangePolicy?.description && parse(exchangePolicy.description)}
            </Box>

            <Box mt={2}>
                <Typography fontSize={13}>
                    Buyers are responsible for return postage costs. If the item is not
                    returned in its original condition, the buyer is responsible for any
                    loss in value.
                </Typography>
            </Box>
        </Box>
    );
};

export default DeliveryAndReturnPolicy;

// -------- helpers --------
const getDeliveryDateRange = (minDays, maxDays) => {
    const today = new Date();

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + Number(minDays));

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + Number(maxDays));

    return `${minDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    })} – ${maxDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    })}`;
};

const getPolicyLabel = (policy) => {
    if (!policy) return null;

    if (policy.returns && policy.exchange) return "Returns & Exchanges Accepted";
    if (policy.returns) return "Returns Accepted";
    if (policy.exchange) return "Exchanges Accepted";

    return null;
};

const Row = ({ icon, children }) => (
    <Box display="flex" alignItems="center" gap={1.2}>
        <Box sx={{ mt: "2px", color: "primary.main" }}>{icon}</Box>
        <Box>{children}</Box>
    </Box>
);


