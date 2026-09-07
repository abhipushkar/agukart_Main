"use client";

import {
    Box,
    Button,
    Checkbox,
    Divider,
    Drawer,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
    Typography,
    Slider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { FlexBetween } from "components/flex-box";

const ProductFilterDrawer = ({
    open,
    onClose,
    filters = {},
    filterState = {},
    onFilterChange,
    onDynamicFieldChange,
    onClearField,
    onClearFilters,
    onApplyFilters,
}) => {
    const {
        price = {},
        brands = [],
        ratings = [],
        badges = [],
        dynamicFields = {},
        ...remainingFilters
    } = filters;
    const [expandedFields, setExpandedFields] = useState({});
    const priceError = (filterState.maxPrice && filterState.minPrice) && +filterState.maxPrice < +filterState.minPrice;
    delete remainingFilters.bestseller
    delete remainingFilters.popularGifts
    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        xs: "90%",
                        sm: 320,
                    },
                    maxWidth: "100%",
                },
            }}
        >
            <Box
                sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        px: 2.5,
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #e5e5e5",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 19,
                            fontWeight: 600,
                        }}
                    >
                        All Filters
                    </Typography>

                    <CloseIcon
                        onClick={onClose}
                        sx={{
                            cursor: "pointer",
                            fontSize: 24,
                        }}
                    />
                </Box>

                {/* Filters */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        pl: 2.5, pr: 2,
                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                            background: "#f1f1f1",
                            borderRadius: "10px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            background: "#c1c1c1",
                            borderRadius: "10px",
                            "&:hover": {
                                background: "#a8a8a8",
                            },
                        },
                    }}
                >
                    {/* PRICE */}
                    {price && (price.min !== undefined || price.max !== undefined) && (
                        <>
                            <Box py={2}>
                                <FlexBetween>
                                    <Typography fontSize={16} fontWeight={600} mb={2}>
                                        Price
                                    </Typography>
                                    {onClearField && (
                                        <Button
                                            size="small"
                                            onClick={() => onClearField("price")}
                                            sx={{
                                                mb: 2, p: 0,
                                                minWidth: "auto",
                                                textTransform: "none",
                                                fontSize: 12, color: "grey.700"
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </FlexBetween>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        placeholder={`Min ${price.min ?? ""}`}
                                        value={filterState.minPrice || ""}
                                        onChange={(e) =>
                                            onFilterChange("minPrice", e.target.value)
                                        }
                                        inputProps={{ min: price.min }}
                                        error={priceError}
                                        helperText={priceError && "Please fix prices to apply filter."}
                                    />

                                    <Typography color="grey.600">to</Typography>

                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="number"
                                        placeholder={`Max ${price.max ?? ""}`}
                                        value={filterState.maxPrice || ""}
                                        onChange={(e) =>
                                            onFilterChange("maxPrice", e.target.value)
                                        }
                                        inputProps={{ max: price.max }}
                                        error={priceError}
                                        helperText={priceError && "max price can't be less than min price."}
                                    />
                                </Box>

                                <Box px={1}>
                                    <Slider
                                        value={[
                                            Number(filterState.minPrice || price.min || 0),
                                            Number(filterState.maxPrice || price.max || 0),
                                        ]}
                                        onChange={(_, newValue) => {
                                            onFilterChange("priceRange", newValue);
                                        }}
                                        min={Number(price.min || 0)}
                                        max={Number(price.max || 0)}
                                        valueLabelDisplay="off"
                                        disableSwap
                                        sx={{
                                            mt: 1,
                                            "& .MuiSlider-thumb": {
                                                width: 18,
                                                height: 18,
                                                backgroundColor: "#fff",
                                                border: "2px solid #f0f0f0",
                                                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                                                transition: "box-shadow 200ms ease, transform 150ms ease",
                                                "&::after": {
                                                    content: '""',
                                                    position: "absolute",
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: "50%",
                                                    opacity: 0,
                                                    transition: "opacity 200ms ease, transform 200ms ease",
                                                },
                                                "&:hover": {
                                                    boxShadow: "0 2px 8px rgba(43,52,69,0.45)",
                                                    "&::after": {
                                                        opacity: 1,
                                                    },
                                                },
                                                "&.Mui-focusVisible": {
                                                    boxShadow: "0 0 0 6px rgba(74,89,117,0.22)",

                                                    "&::after": {
                                                        opacity: 1,
                                                        transform: "scale(1)",
                                                    },
                                                },
                                            },
                                            "& .MuiSlider-track": {
                                                height: 5,
                                                backgroundColor: "#4a5975ee",
                                                border: "none",
                                            },
                                            "& .MuiSlider-rail": {
                                                height: 5,
                                                backgroundColor: "#4e5f7db5",
                                                opacity: 1,
                                            },
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Divider />
                        </>
                    )}

                    {/* RATING */}
                    {/* {ratings?.length > 0 && (
                        <>
                            <Box py={2}>
                                <FormControl fullWidth>
                                    <FormLabel
                                        sx={{
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: "#222",
                                            mb: 1,
                                            "&.Mui-focused": {
                                                color: "#222",
                                            },
                                        }}
                                    >
                                        Customer rating
                                    </FormLabel>

                                    <RadioGroup
                                        value={String(filterState.ratings || 0)}
                                        onChange={(e) =>
                                            onFilterChange("ratings", Number(e.target.value))
                                        }
                                    >
                                        <FormControlLabel
                                            value="0"
                                            control={<Radio size="small" />}
                                            label="Any rating"
                                        />

                                        {[...ratings]
                                            .filter((item) => item.rating > 0)
                                            .sort((a, b) => b.rating - a.rating)
                                            .map((item) => (
                                                <FormControlLabel
                                                    key={item.rating}
                                                    value={String(item.rating)}
                                                    control={<Radio size="small" />}
                                                    label={
                                                        <Box display="flex" gap={0.5}>
                                                            <Typography fontSize={13}>
                                                                {item.rating} stars
                                                            </Typography>

                                                            <Typography
                                                                fontSize={12}
                                                                color="grey.600"
                                                            >
                                                                ({item.count})
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            ))}
                                    </RadioGroup>
                                </FormControl>
                            </Box>

                            <Divider />
                        </>
                    )} */}

                    {/* BRANDS */}
                    {brands?.length > 0 && (
                        <>
                            <Box py={2}>
                                <FormControl fullWidth>
                                    <FlexBetween>
                                        <FormLabel
                                            sx={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color: "#222",
                                                mb: 1,
                                                "&.Mui-focused": {
                                                    color: "#222",
                                                },
                                            }}
                                        >
                                            Brand
                                        </FormLabel>

                                        {onClearField && (
                                            <Button
                                                size="small"
                                                onClick={() => onClearField("brands")}
                                                sx={{
                                                    mb: 1,
                                                    p: 0,
                                                    minWidth: "auto",
                                                    textTransform: "none",
                                                    fontSize: 12, color: "grey.700"
                                                }}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </FlexBetween>

                                    <FormGroup>
                                        {brands.map((brand) => (
                                            <FormControlLabel
                                                key={brand.id}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={
                                                            filterState.brands?.includes(brand.id) ||
                                                            false
                                                        }
                                                        onChange={() =>
                                                            onFilterChange("brands", brand.id, true)
                                                        }
                                                    />
                                                }
                                                label={
                                                    <Box display="flex" gap={1}>
                                                        <Typography fontSize={13}>
                                                            {brand.title}
                                                        </Typography>

                                                        <Typography
                                                            fontSize={12}
                                                            color="grey.600"
                                                        >
                                                            ({brand.count})
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        ))}
                                    </FormGroup>
                                </FormControl>

                            </Box>

                            <Divider />
                        </>
                    )}

                    {Object.entries(remainingFilters).map(([field, value]) => {
                        return (
                            value?.length > 0 && (
                                <>
                                    <Box py={2}>
                                        <FormControl fullWidth sx={{ display: "flex", justifyContent: 'space-between' }}>
                                            <FlexBetween>
                                                <FormLabel
                                                    sx={{
                                                        fontSize: 15,
                                                        fontWeight: 600,
                                                        color: "#222",
                                                        mb: 1,
                                                        "&.Mui-focused": {
                                                            color: "#222",
                                                        },
                                                    }}
                                                >
                                                    {field}
                                                </FormLabel>
                                                {onClearField && (
                                                    <Button
                                                        size="small"
                                                        onClick={() => onClearField(field)}
                                                        sx={{
                                                            p: 0,
                                                            minWidth: "auto",
                                                            textTransform: "none",
                                                            fontSize: 12, color: "grey.700"
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </FlexBetween>


                                            <RadioGroup
                                                value={filterState[field] ?? ""}
                                                onChange={(e) =>
                                                    onFilterChange(field, e.target.value === 'true' || e.target.value === true)
                                                }
                                            >
                                                <FormControlLabel
                                                    value={true}
                                                    control={<Radio size="small" />}
                                                    label="Yes"
                                                />
                                                <FormControlLabel
                                                    value={false}
                                                    control={<Radio size="small" />}
                                                    label="No"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    </Box>

                                    <Divider />
                                </>
                            )
                        )
                    })
                    }


                    {/* BADGES */}
                    {badges?.length > 0 && (
                        <>
                            <Box py={2}>
                                <FormControl fullWidth>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1}
                                    >
                                        <FormLabel
                                            sx={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color: "#222",
                                                m: 0,
                                                "&.Mui-focused": {
                                                    color: "#222",
                                                },
                                            }}
                                        >
                                            Badges
                                        </FormLabel>

                                        {onClearField && (
                                            <Button
                                                size="small"
                                                onClick={() => onClearField("badges")}
                                                sx={{
                                                    p: 0,
                                                    minWidth: "auto",
                                                    textTransform: "none",
                                                    fontSize: 12, color: "grey.700"
                                                }}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </Box>

                                    <FormGroup>
                                        {badges.map((badge) => (
                                            <FormControlLabel
                                                key={badge.value}
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        checked={
                                                            filterState.badges?.includes(
                                                                badge.value
                                                            ) || false
                                                        }
                                                        onChange={() =>
                                                            onFilterChange(
                                                                "badges",
                                                                badge.value,
                                                                true
                                                            )
                                                        }
                                                    />
                                                }
                                                label={
                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        gap={1}
                                                    >
                                                        <Typography fontSize={13}>
                                                            {badge.value}
                                                        </Typography>

                                                        <Typography
                                                            fontSize={12}
                                                            color="grey.600"
                                                        >
                                                            ({badge.count})
                                                        </Typography>
                                                    </Box>
                                                }
                                                sx={{
                                                    m: 0,
                                                    minHeight: 32,
                                                }}
                                            />
                                        ))}
                                    </FormGroup>
                                </FormControl>
                            </Box>

                            <Divider />
                        </>
                    )}

                    {/* DYNAMIC FIELDS */}
                    {Object.entries(dynamicFields).map(
                        ([fieldName, fieldData]) => {
                            const values = fieldData?.values || [];

                            if (!values.length) return null;

                            const selectedValues =
                                filterState.dynamicFields?.[fieldName] || [];

                            const isYesNo = fieldData?.type === "Yes/No";
                            const isExpanded = expandedFields[fieldName] || false;

                            const visibleValues = isExpanded ? values : values.slice(0, 6);

                            const hasMoreValues = values.length > 6;

                            return (
                                <Box key={fieldName}>
                                    <Box py={2}>
                                        <FormControl fullWidth>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mb={1}
                                            >
                                                <FormLabel
                                                    sx={{
                                                        fontSize: 15,
                                                        fontWeight: 600,
                                                        color: "#222",
                                                        m: 0,
                                                        "&.Mui-focused": {
                                                            color: "#222",
                                                        },
                                                    }}
                                                >
                                                    {fieldName}
                                                </FormLabel>

                                                {onClearField && (
                                                    <Button
                                                        size="small"
                                                        onClick={() =>
                                                            onClearField("dynamicField", fieldName)
                                                        }
                                                        sx={{
                                                            p: 0,
                                                            minWidth: "auto",
                                                            textTransform: "none",
                                                            fontSize: 12, color: "grey.700"
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </Box>

                                            {isYesNo ? (
                                                <RadioGroup
                                                    value={selectedValues[0] || ""}
                                                    onChange={(e) =>
                                                        onDynamicFieldChange(
                                                            fieldName,
                                                            e.target.value,
                                                            true
                                                        )
                                                    }
                                                >
                                                    {visibleValues.map((item) => {
                                                        const value = item.value;

                                                        return (
                                                            <FormControlLabel
                                                                key={value}
                                                                value={value}
                                                                control={<Radio size="small" />}
                                                                label={
                                                                    <Box
                                                                        display="flex"
                                                                        alignItems="center"
                                                                        gap={1}
                                                                    >
                                                                        <Typography fontSize={13}>
                                                                            {value}
                                                                        </Typography>

                                                                        <Typography
                                                                            fontSize={12}
                                                                            color="grey.600"
                                                                        >
                                                                            ({item.count})
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                sx={{
                                                                    m: 0,
                                                                    minHeight: 32,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </RadioGroup>
                                            ) : (
                                                <FormGroup>
                                                    {visibleValues.map((item) => {
                                                        const value = item.value;

                                                        return (
                                                            <FormControlLabel
                                                                key={value}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={selectedValues.includes(value)}
                                                                        onChange={() =>
                                                                            onDynamicFieldChange(
                                                                                fieldName,
                                                                                value
                                                                            )
                                                                        }
                                                                    />
                                                                }
                                                                label={
                                                                    <Box
                                                                        display="flex"
                                                                        alignItems="center"
                                                                        gap={1}
                                                                    >
                                                                        <Typography fontSize={13}>
                                                                            {value}
                                                                        </Typography>

                                                                        <Typography
                                                                            fontSize={12}
                                                                            color="grey.600"
                                                                        >
                                                                            ({item.count})
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                sx={{
                                                                    m: 0,
                                                                    minHeight: 32,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </FormGroup>
                                            )}

                                            {hasMoreValues && (
                                                <Button
                                                    size="small"
                                                    sx={{
                                                        mt: 0.5, ml: 1.5,
                                                        p: 0,
                                                        minWidth: "auto",
                                                        width: "fit-content",
                                                        textTransform: "none",
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                    }}
                                                    onClick={() =>
                                                        setExpandedFields((prev) => ({
                                                            ...prev,
                                                            [fieldName]: !prev[fieldName],
                                                        }))
                                                    }
                                                >
                                                    <u>{isExpanded ? "Show less" : "Show more"}</u>
                                                </Button>
                                            )}
                                        </FormControl>
                                    </Box>

                                    <Divider />
                                </Box>
                            );
                        }
                    )}
                </Box>

                {/* Footer */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: "1px solid #e5e5e5",
                        backgroundColor: "#fff",
                        display: "flex",
                        gap: 1.5,
                    }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={onClearFilters}
                        sx={{
                            borderRadius: "30px",
                            minHeight: 40,
                            borderColor: "#222",
                            color: "#222",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Clear all
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={() => onApplyFilters(filterState)}
                        sx={{
                            borderRadius: "30px",
                            minHeight: 40,
                            backgroundColor: "#2b3445",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: "#222",
                            },
                        }}
                        disabled={priceError}
                    >
                        Show results
                    </Button>
                </Box>
            </Box>
        </Drawer >
    );
};

export default ProductFilterDrawer;