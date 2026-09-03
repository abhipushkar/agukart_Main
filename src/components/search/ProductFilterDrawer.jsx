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

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        xs: "100%",
                        sm: 420,
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
                        px: 3,
                        py: 2.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #e5e5e5",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 22,
                            fontWeight: 600,
                        }}
                    >
                        All Filters
                    </Typography>

                    <CloseIcon
                        onClick={onClose}
                        sx={{
                            cursor: "pointer",
                            fontSize: 26,
                        }}
                    />
                </Box>

                {/* Filters */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: "auto",
                        px: 3,
                    }}
                >
                    {/* PRICE */}
                    {price && (price.min !== undefined || price.max !== undefined) && (
                        <>
                            <Box py={3}>
                                <FlexBetween>
                                    <Typography fontSize={17} fontWeight={600} mb={2}>
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
                                        inputProps={{min: price.min}}
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
                                        inputProps={{max: price.max}}
                                        error={priceError}
                                        helperText={priceError && "max price can't be less than min price."}
                                    />
                                </Box>

                            </Box>

                            <Divider />
                        </>
                    )}

                    {/* RATING */}
                    {ratings?.length > 0 && (
                        <>
                            <Box py={3}>
                                <FormControl fullWidth>
                                    <FormLabel
                                        sx={{
                                            fontSize: 17,
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
                                                            <Typography fontSize={14}>
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
                    )}

                    {/* BRANDS */}
                    {brands?.length > 0 && (
                        <>
                            <Box py={3}>
                                <FormControl fullWidth>
                                    <FlexBetween>
                                        <FormLabel
                                            sx={{
                                                fontSize: 17,
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
                                                        <Typography fontSize={14}>
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
                                    <Box py={3}>
                                        <FormControl fullWidth sx={{ display: "flex", justifyContent: 'space-between' }}>
                                            <FlexBetween>
                                                <FormLabel
                                                    sx={{
                                                        fontSize: 17,
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
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </FlexBetween>


                                            <RadioGroup
                                                value={filterState[field] ?? ""}
                                                onChange={(e) =>
                                                    onFilterChange(field, e.target.value === 'true' || e.target.value === true )
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
                            <Box py={3}>
                                <FormControl fullWidth>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        mb={1}
                                    >
                                        <FormLabel
                                            sx={{
                                                fontSize: 16,
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
                                                    fontSize: 13,
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
                                                        <Typography fontSize={14}>
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
                                    <Box py={3}>
                                        <FormControl fullWidth>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                mb={1}
                                            >
                                                <FormLabel
                                                    sx={{
                                                        fontSize: 17,
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
                                                            fontSize: 13,
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
                                                                        <Typography fontSize={14}>
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
                                                                        <Typography fontSize={14}>
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
                                                        mt: 1,
                                                        p: 0,
                                                        minWidth: "auto",
                                                        width: "fit-content",
                                                        textTransform: "none",
                                                        fontSize: 13,
                                                        fontWeight: 600,
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
                            minHeight: 46,
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
                        onClick={onApplyFilters}
                        sx={{
                            borderRadius: "30px",
                            minHeight: 46,
                            backgroundColor: "#222",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: "#000",
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