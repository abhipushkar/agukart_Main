"use client";

import { useState, useRef, useEffect } from "react";
import {
    Box,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    useMediaQuery,
    useTheme,
    TextField,
    InputAdornment,
    Divider
} from "@mui/material";
import {
    LocationOn,
    ExpandMore,
    ExpandLess,
    Public,
    Search
} from "@mui/icons-material";
import { useLocation } from "../../../contexts/location_context";
import { getAPI } from "../../../utils/__api__/ApiServies";

const LocationSelector = () => {
    const { location, setLocation, countries, isLoading, isLoadingCountries } = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const menuRef = useRef(null);
    const selectedItemRef = useRef(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        setFilteredCountries(countries);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSearchQuery("");
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        if (query === "") {
            setFilteredCountries(countries);
        } else {
            const filtered = countries.filter(country =>
                country.name.toLowerCase().includes(query) ||
                (country.sortname && country.sortname.toLowerCase().includes(query)) ||
                (country.code && country.code.toLowerCase().includes(query))
            );
            setFilteredCountries(filtered);
        }
    };

    const handleCountrySelect = (country) => {
        setLocation({
            countryName: country.name,
            countryCode: country.sortname || country.code || ""
        });
        handleClose();
    };

    const open = Boolean(anchorEl);

    // Scroll to selected country when menu opens
    useEffect(() => {
        if (open && selectedItemRef.current) {
            setTimeout(() => {
                selectedItemRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }, [open, filteredCountries]);


    if (isLoading) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Loading location...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }} ref={menuRef}>
            {/* Mobile view - icon only */}
            {isMobile ? (
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" }
                    }}
                >
                    <LocationOn fontSize="small" />
                </IconButton>
            ) : (
                // Desktop view - full text
                <Box
                    onClick={handleClick}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "8px 12px",
                        borderRadius: 1,
                        "&:hover": {
                            backgroundColor: "action.hover"
                        }
                    }}
                >
                    <LocationOn sx={{ fontSize: 18, color: "text.secondary", mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Deliver to {location.countryName}
                    </Typography>
                    {open ? (
                        <ExpandLess sx={{ fontSize: 16, color: "text.secondary", ml: 0.5 }} />
                    ) : (
                        <ExpandMore sx={{ fontSize: 16, color: "text.secondary", ml: 0.5 }} />
                    )}
                </Box>
            )}

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        maxHeight: 400,
                        width: 320,
                        mt: 1,
                        backgroundColor: "white",
                        "& .MuiList-root": {
                            backgroundColor: "white",
                            padding: 0
                        }
                    }
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
                {/* Search Bar */}
                <Box sx={{ p: 1, backgroundColor: "white" }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search countries..."
                        value={searchQuery}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            backgroundColor: "white",
                            "& .MuiOutlinedInput-root": {
                                backgroundColor: "white",
                                "&:hover fieldset": {
                                    borderColor: "primary.main",
                                },
                            }
                        }}
                    />
                </Box>

                <Divider />

                <Box sx={{
                    maxHeight: 300,
                    overflow: "auto",
                    backgroundColor: "white",
                    "&::-webkit-scrollbar": {
                        width: 8,
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "grey.100",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "grey.400",
                        borderRadius: 2,
                    }
                }}>
                    {isLoadingCountries ? (
                        <MenuItem sx={{ backgroundColor: "white" }}>
                            <Typography variant="body2">Loading countries...</Typography>
                        </MenuItem>
                    ) : filteredCountries.length === 0 ? (
                        <MenuItem sx={{ backgroundColor: "white" }}>
                            <Typography variant="body2" color="text.secondary">
                                No countries found
                            </Typography>
                        </MenuItem>
                    ) : (
                        filteredCountries.map((country) => {
                            const countryCode = country.sortname || country.code || "";
                            const isSelected = location.countryCode === countryCode;

                            return (
                                <MenuItem
                                    key={country._id || countryCode}
                                    onClick={() => handleCountrySelect(country)}
                                    selected={isSelected}
                                    ref={isSelected ? selectedItemRef : null}
                                    sx={{
                                        backgroundColor: "white",
                                        "&:hover": {
                                            backgroundColor: "action.hover"
                                        },
                                        "&.Mui-selected": {
                                            backgroundColor: "primary.light",
                                            color: "primary.main",
                                            fontWeight: 600,
                                            "&:hover": {
                                                backgroundColor: "primary.light"
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Public sx={{
                                            fontSize: 18,
                                            color: isSelected ? "primary.main" : "inherit"
                                        }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={country.name}
                                        primaryTypographyProps={{
                                            variant: "body2",
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? "primary.main" : "inherit"
                                        }}
                                    />
                                </MenuItem>
                            );
                        })
                    )}
                </Box>
            </Menu>
        </Box>
    );
};

export default LocationSelector;