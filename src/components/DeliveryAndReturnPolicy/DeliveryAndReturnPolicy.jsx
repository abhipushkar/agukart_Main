import React, { useMemo, useState, useEffect } from "react";
import { Box, Typography, Divider, Tooltip, Popper, Autocomplete, TextField, Chip, ClickAwayListener } from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import parse from "html-react-parser";
import { useLocation } from "contexts/location_context";
import { LocationOn } from "@mui/icons-material";
import WarningIcon from "@mui/icons-material/Warning";

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

    const { location, setLocation, countries } = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [shippingError, setShippingError] = useState(null);
    const [availableShippingData, setAvailableShippingData] = useState(null);
    const [pendingCountry, setPendingCountry] = useState(null);
    const open = Boolean(anchorEl);

    const shippingTemplate = product?.shipping_templates?.shippingTemplateData;
    const exchangePolicy = product?.exchangePolicy;

    // Find shipping data for selected country
    useEffect(() => {
        if (!shippingTemplate || !location?.countryName) {
            setAvailableShippingData(null);
            setShippingError(null);
            return;
        }

        const allShippingMethods = [
            ...(shippingTemplate.standardShipping || []),
            ...(shippingTemplate.expedited || []),
            ...(shippingTemplate.twoDays || []),
            ...(shippingTemplate.oneDay || [])
        ];

        // Find shipping methods for the selected country
        const countryShipping = allShippingMethods.find(method =>
            method.region?.some(region =>
                region.toLowerCase() === location.countryName.toLowerCase()
            )
        );

        // Check standard shipping first (as fallback)
        const standardShippingForCountry = shippingTemplate.standardShipping?.find(method =>
            method.region?.some(region =>
                region.toLowerCase() === location.countryName.toLowerCase()
            )
        );

        if (standardShippingForCountry) {
            setAvailableShippingData(standardShippingForCountry);
            setShippingError(null);
        } else if (countryShipping) {
            setAvailableShippingData(countryShipping);
            setShippingError(null);
        } else {
            setAvailableShippingData(null);
            setShippingError(`Shipping is not available to ${location.countryName}. Please select a different country.`);
        }
    }, [location, shippingTemplate]);

    const deliveryRange = useMemo(() => {
        if (!availableShippingData?.transitTime) return "—";
        return getDeliveryDateRange(
            availableShippingData.transitTime.minDays,
            availableShippingData.transitTime.maxDays
        );
    }, [availableShippingData]);

    const handleOpenCountryMenu = (event) => {
        setAnchorEl(event.currentTarget);
        // Initialize pendingCountry with current selection
        const current = countries.find(
            (c) => c.name === location?.countryName
        ) || null;
        setPendingCountry(current);
    };

    const handleCloseCountryMenu = () => {
        setAnchorEl(null);
        setPendingCountry(null);
    };

    const handleCountryChange = (event, newValue) => {
        setPendingCountry(newValue);
        if (newValue) {
            setLocation({
                countryName: newValue.name,
                countryCode: newValue.code,
            });
            setShippingError(null);
            handleCloseCountryMenu();
        }
    };

    const policyLabel = getPolicyLabel(exchangePolicy);

    // Get shipping fee - check perOrder first, then perItem
    const shippingFee = availableShippingData?.shippingFee?.perOrder ||
        availableShippingData?.shippingFee?.perItem ||
        "Free";

    return (
        <Box sx={{ maxWidth: "75%", color: "#000", fontSize: 14 }}>
            <Typography fontWeight={600} mb={1}>
                Delivery and Return Policies
            </Typography>

            {/* Estimated Delivery + Tooltip */}
            {!shippingError && availableShippingData && (
                <>
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
                                <Typography component={"span"} fontWeight={500} sx={{ textDecoration: "underline", cursor: "pointer" }}>
                                    {deliveryRange}
                                </Typography>
                            </Tooltip>
                        </Typography>
                    </Row>

                    <Typography sx={{ color: "rgba(0,0,0,0.65)", mt: 0.5, fontSize: 13 }}>
                        Need it faster? Contact the seller or choose a shipping upgrade during checkout.
                    </Typography>
                </>
            )}

            <Box mt={2}>
                {policyLabel && !shippingError && (
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

                {!shippingError && shippingFee && shippingFee !== "Free" && (
                    <Row icon={<PaidOutlinedIcon />}>
                        <Typography>
                            Delivery cost: ${shippingFee}
                        </Typography>
                    </Row>
                )}

                {shippingFee === "Free" && !shippingError && (
                    <Row icon={<PaidOutlinedIcon />}>
                        <Typography color="success.main" fontWeight={500}>
                            Free Delivery
                        </Typography>
                    </Row>
                )}

                <Row icon={<LocationOn />}>
                    <Typography>Dispatched from: India</Typography>
                </Row>

                {/* Country Selection with improved UX */}
                <Box mt={2}>
                    <Typography fontWeight={500} mb={1} color="text.secondary">
                        Select Delivery Country
                    </Typography>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{
                            cursor: "pointer",
                            width: "fit-content",
                            px: 2,
                            py: 1.5,
                            borderRadius: 20,
                            boxShadow: "0px 2px 8px rgba(0,0,0,0.08)",
                            border: "1px solid #e0e0e0",
                            "&:hover": {
                                borderColor: "primary.main",
                                boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                            },
                            transition: "all 0.2s ease"
                        }}
                        onClick={handleOpenCountryMenu}
                    >
                        <LocationOn sx={{ color: "primary.main", fontSize: 20 }} />
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} width="100%">
                            <Typography variant="caption" color="text.secondary">
                                Deliver to
                            </Typography>
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    color: shippingError ? "error.main" : "text.primary",
                                }}
                            >
                                {location?.countryName || "Select a country"}
                            </Typography>
                            <KeyboardArrowDownIcon
                                sx={{
                                    fontSize: 20,
                                    color: "text.secondary",
                                    transform: open ? "rotate(180deg)" : "rotate(0)",
                                    transition: "transform 0.2s ease"
                                }}
                            />
                        </Box>
                    </Box>

                    {shippingError && (
                        <Box display="flex" alignItems="center" gap={1} mt={1} p={1.5} borderRadius={1}>
                            <WarningIcon sx={{ color: "error.main", fontSize: 18 }} />
                            <Typography fontSize={13} color="error.main" fontWeight={500}>
                                {shippingError}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    placement="bottom-start"
                    sx={{ zIndex: 1300 }}
                >
                    <ClickAwayListener onClickAway={handleCloseCountryMenu}>
                        <Box
                            sx={{
                                width: 350,
                                maxHeight: 300,
                                overflow: "auto",
                                p: 2,
                                bgcolor: "#fff",
                                borderRadius: 2,
                                boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
                                border: "1px solid #e0e0e0",
                            }}
                        >
                            <Autocomplete
                                autoFocus
                                openOnFocus
                                options={countries}
                                getOptionLabel={(option) => option.name}
                                value={pendingCountry}
                                onChange={handleCountryChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search country..."
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 1.5,
                                            }
                                        }}
                                        autoComplete="off"
                                    />
                                )}
                                renderOption={(props, option) => {
                                    // Check if shipping is available for this country
                                    const isShippingAvailable = shippingTemplate && (
                                        shippingTemplate.standardShipping?.some(method =>
                                            method.region?.some(region =>
                                                region.toLowerCase() === option.name.toLowerCase()
                                            )
                                        ) ||
                                        shippingTemplate.expedited?.some(method =>
                                            method.region?.some(region =>
                                                region.toLowerCase() === option.name.toLowerCase()
                                            )
                                        ) ||
                                        shippingTemplate.twoDays?.some(method =>
                                            method.region?.some(region =>
                                                region.toLowerCase() === option.name.toLowerCase()
                                            )
                                        ) ||
                                        shippingTemplate.oneDay?.some(method =>
                                            method.region?.some(region =>
                                                region.toLowerCase() === option.name.toLowerCase()
                                            )
                                        )
                                    );

                                    return (
                                        <Box
                                            component="li"
                                            {...props}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: 1,
                                                py: 1,
                                                borderBottom: "1px solid #f5f5f5",
                                                "&:hover": {
                                                    bgcolor: "action.hover",
                                                }
                                            }}
                                        >
                                            <Box>
                                                <Typography>{option.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.code}
                                                </Typography>
                                            </Box>
                                            {isShippingAvailable ? (
                                                <Chip
                                                    label="Available"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: 11 }}
                                                />
                                            ) : (
                                                <Chip
                                                    label="Unavailable"
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: 11 }}
                                                />
                                            )}
                                        </Box>
                                    );
                                }}
                                sx={{
                                    "& .MuiAutocomplete-listbox": {
                                        maxHeight: 220,
                                        "&::-webkit-scrollbar": {
                                            width: 6,
                                        },
                                        "&::-webkit-scrollbar-track": {
                                            background: "#f1f1f1",
                                            borderRadius: 3,
                                        },
                                        "&::-webkit-scrollbar-thumb": {
                                            background: "#888",
                                            borderRadius: 3,
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </ClickAwayListener>
                </Popper>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* HTML from backend — DO NOT wrap in Typography */}
            {exchangePolicy?.description && (
                <Box sx={{ "& p": { margin: 0, fontSize: 14, lineHeight: 1.6 } }}>
                    {parse(exchangePolicy.description)}
                </Box>
            )}

            <Box mt={2}>
                <Typography fontSize={13} color="text.secondary" lineHeight={1.6}>
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
    <Box display="flex" alignItems="center" gap={1.2} mb={1}>
        <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Box>{children}</Box>
    </Box>
);
