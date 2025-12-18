import React from 'react';
import {
    Box,
    Tab,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Rating,
} from '@mui/material';
import { TabContext, TabList, TabPanel, } from "@mui/lab";
import { Check as CheckIcon, Star as StarIcon } from '@mui/icons-material';
import moment from 'moment';
import HtmlRenderer from 'components/HtmlRender/HtmlRenderer';
import DeliveryAndReturnPolicy from '../DeliveryAndReturnPolicy/DeliveryAndReturnPolicy';

// Helper function to format dynamic field values
const formatDynamicFieldValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return value.toString();
};

// Helper function to format field labels (extract the last part after dot)
const formatFieldLabel = (key) => {
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];

    // Format the last part (the actual property name)
    return lastPart
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/\bis\b/i, 'Is')
        .replace(/\bmm\b/i, 'MM')
        .trim();
};

// Helper function to extract the base name for grouping (everything before the last dot)
const getBaseName = (key) => {
    const parts = key.split('.');
    if (parts.length <= 1) return key;

    const baseParts = parts.slice(0, -1);
    return baseParts.join('.');
};

// Helper function to format the base name for display
const formatBaseName = (baseName) => {
    return baseName
        .split('.')
        .map(part =>
            part
                .replace(/_/g, ' ')
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .replace(/\bis\b/i, 'Is')
                .replace(/\bmm\b/i, 'MM')
                .trim()
        )
        .join(' - ');
};

// Group fields by their base name
const groupFieldsByBaseName = (fieldsArray) => {
    const grouped = {};

    fieldsArray.forEach(([key, value]) => {
        const baseName = getBaseName(key);

        if (!grouped[baseName]) {
            grouped[baseName] = [];
        }

        grouped[baseName].push({ key, value });
    });

    return grouped;
};

// Flatten grouped fields for two-column layout
const prepareFieldRows = (groupedFields) => {
    const rows = [];
    const fieldEntries = Object.entries(groupedFields);

    // Sort to ensure consistent ordering
    fieldEntries.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    fieldEntries.forEach(([baseName, fields]) => {
        if (fields.length === 1) {
            // Single field, not grouped
            const { key, value } = fields[0];
            rows.push({
                type: 'single',
                displayName: formatBaseName(key), // Use full name for single fields
                fields: [{ label: formatFieldLabel(key), value }]
            });
        } else {
            // Grouped fields
            rows.push({
                type: 'group',
                groupName: formatBaseName(baseName),
                fields: fields.map(({ key, value }) => ({
                    label: formatFieldLabel(key),
                    value
                }))
            });
        }
    });

    return rows;
};

// Product Specifications Component with dynamic fields only
const ProductSpecifications = ({ product }) => {
    const dynamicFields = product?.dynamicFields || {};

    // Convert dynamicFields object into array of key-value pairs
    const dynamicFieldsArray = Object.entries(dynamicFields);

    // If no dynamic fields
    if (dynamicFieldsArray.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No specifications available for this product.</Typography>
            </Box>
        );
    }

    // Group fields by base name
    const groupedFields = groupFieldsByBaseName(dynamicFieldsArray);

    // Prepare rows for display
    const fieldRows = prepareFieldRows(groupedFields);

    // Split rows into two columns
    const midPoint = Math.ceil(fieldRows.length / 2);
    const leftColumnRows = fieldRows.slice(0, midPoint);
    const rightColumnRows = fieldRows.slice(midPoint);

    // Render a single field row
    const renderSingleField = (row) => (
        <TableRow key={row.displayName} sx={{ borderBottom: "1px solid" }}>
            <TableCell sx={{ background: "#e9e9e9", fontWeight: 500 }}>
                {row.displayName}
            </TableCell>
            <TableCell>
                {formatDynamicFieldValue(row.fields[0].value)}
            </TableCell>
        </TableRow>
    );

    // Render a grouped field row
    const renderGroupedField = (row) => (
        <React.Fragment key={row.groupName}>
            <TableRow sx={{ borderBottom: "1px solid" }}>
                <TableCell
                    colSpan={2}
                    sx={{
                        background: "#f5f5f5",
                        fontWeight: 600,
                        borderBottom: "none",
                        pt: 1,
                        pb: 0.5
                    }}
                >
                    {row.groupName}
                </TableCell>
            </TableRow>
            {row.fields.map((field, index) => (
                <TableRow
                    key={`${row.groupName}-${index}`}
                    sx={{
                        borderBottom: index === row.fields.length - 1 ? "1px solid" : "1px dashed #ddd"
                    }}
                >
                    <TableCell
                        sx={{
                            background: "#e9e9e9",
                            fontWeight: 500,
                            pl: 3,
                            borderLeft: "3px solid #bbb"
                        }}
                    >
                        {field.label}
                    </TableCell>
                    <TableCell>
                        {formatDynamicFieldValue(field.value)}
                    </TableCell>
                </TableRow>
            ))}
        </React.Fragment>
    );

    return (
        <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item lg={6} md={6} xs={12}>
                <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
                    <Table
                        size="small"
                        aria-label="product specifications"
                        sx={{
                            minWidth: 300,
                            ".MuiTableCell-root": {
                                borderBottom: "1px solid #bbbbbb !important",
                                width: "50%",
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2} sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                    Product Specifications
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leftColumnRows.map((row) =>
                                row.type === 'single'
                                    ? renderSingleField(row)
                                    : renderGroupedField(row)
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            {/* Right Column */}
            <Grid item lg={6} md={6} xs={12}>
                <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
                    <Table
                        size="small"
                        aria-label="product specifications"
                        sx={{
                            minWidth: 300,
                            ".MuiTableCell-root": {
                                borderBottom: "1px solid #bbbbbb !important",
                                width: "50%",
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell colSpan={2} sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                    Product Specifications
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rightColumnRows.map((row) =>
                                row.type === 'single'
                                    ? renderSingleField(row)
                                    : renderGroupedField(row)
                            )}

                            {/* If right column has no rows, add empty rows for visual balance */}
                            {rightColumnRows.length === 0 && (
                                <>
                                    <TableRow>
                                        <TableCell sx={{ background: "#e9e9e9", fontWeight: 500 }}>
                                            &nbsp;
                                        </TableCell>
                                        <TableCell>
                                            &nbsp;
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell sx={{ background: "#e9e9e9", fontWeight: 500 }}>
                                            &nbsp;
                                        </TableCell>
                                        <TableCell>
                                            &nbsp;
                                        </TableCell>
                                    </TableRow>
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

// Review Item Component
const ReviewItem = ({ review, productTitle }) => (
    <Box
        pb={2}
        mb={2}
        sx={{
            display: { lg: "flex", md: "flex" },
            borderBottom: "1px solid #e8e8e8",
        }}
    >
        <Box sx={{ width: { lg: "60%", md: "50%", xs: "100%" } }}>
            <Rating
                name="size-large"
                value={review?.item_rating}
                readOnly
                size="large"
            />
            <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                {review.additional_comment}
            </Typography>
            <Typography fontSize={14} display={"flex"} alignItems={"center"}>
                <Typography component="span" fontWeight={600} pr={1} whiteSpace={"nowrap"}>
                    Purchased item:{" "}
                </Typography>
                <Typography
                    style={{
                        width: "60%",
                        color: "gray",
                        fontSize: "14px",
                        textDecoration: "underline",
                        display: "-webkit-box",
                        WebkitLineClamp: "1",
                        WebkitBoxOrient: "vertical",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                    }}
                >
                    {productTitle}
                </Typography>
            </Typography>
            <Typography fontSize={14} display={"flex"} pt={1} alignItems={"center"}>
                <Typography component={"span"} overflow={"hidden"}>
                    <img
                        src={review.user_image}
                        style={{
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                        }}
                        alt=""
                    />{" "}
                </Typography>
                <Typography component="span" pl={1}>
                    <Typography
                        style={{
                            color: "gray",
                            fontSize: "14px",
                            textDecoration: "underline",
                        }}
                    >
                        {review.user_name}
                    </Typography>
                </Typography>
                <Typography fontSize={14} color={"gray"} pl={1}>
                    {moment(review.createdAt).format("DD MMM, YYYY")}
                </Typography>
            </Typography>
        </Box>

        <Box sx={{
            width: { lg: "40%", md: "50%", xs: "100%" },
            display: { lg: "flex", md: "flex", xs: "block" },
            flexDirection: "column",
            alignItems: "end",
        }}>
            <Box>
                {review.recommended ? (
                    <Typography display={"flex"} alignItems={"center"}>
                        <CheckIcon sx={{ fontSize: "15px", color: "green", mr: 0.5 }} />
                        Recommends this item
                    </Typography>
                ) : ""}

                <Box
                    sx={{
                        display: { lg: "flex", md: "flex", xs: "block" },
                        flexDirection: "column",
                        alignItems: "end",
                    }}
                    component="div"
                    mt={2}
                >
                    <Typography sx={{ display: "flex", alignItems: "center" }}>
                        Item quality{" "}
                        <Typography component="span" pl={1}>
                            {review.item_rating}
                        </Typography>
                        <Typography component="span">
                            {" "}
                            <StarIcon sx={{ fontSize: "20px" }} />
                        </Typography>
                    </Typography>
                    <Typography sx={{ display: "flex", alignItems: "center" }}>
                        Delivery{" "}
                        <Typography component="span" pl={1}>
                            {review.delivery_rating}
                        </Typography>
                        <Typography component="span">
                            {" "}
                            <StarIcon sx={{ fontSize: "20px" }} />
                        </Typography>
                    </Typography>
                </Box>
            </Box>
        </Box>
    </Box>
);

// Product Reviews Component
const ProductReviews = ({ reviews, productTitle }) => {
    if (!reviews || reviews.length === 0) {
        return <div>Review not found</div>;
    }

    return (
        <Box>
            {reviews.map((review) => (
                <ReviewItem key={review._id} review={review} productTitle={productTitle} />
            ))}
        </Box>
    );
};

// Main Product Tabs Component
const ProductTabs = ({ product }) => {
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box py={2} sx={{ padding: "0 0", m: "auto", maxWidth: "1550px" }}>
            <Grid container spacing={4}>
                <Grid item lg={12} xs={12}>
                    <TabContext value={value}>
                        <Box sx={{ maxWidth: { xs: 320, sm: 900 } }}>
                            <TabList
                                onChange={handleChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="scrollable auto tabs example"
                            >
                                <Tab label="Description" value="1" />
                                <Tab label="Product specification & details" value="2" />
                                <Tab label="Reviews" value="3" />
                                <Tab label="Shipping and return policies" value="4" />
                                {product?.tabs?.map((item, index) => (
                                    <Tab key={index} label={item.title} value={String(index + 5)} />
                                ))}
                            </TabList>
                        </Box>

                        <TabPanel value="1">
                            <Box sx={{ width: "100%" }}>
                                <HtmlRenderer html={product?.description || ""} />
                            </Box>
                        </TabPanel>

                        <TabPanel value="2">
                            <ProductSpecifications product={product} />
                        </TabPanel>

                        <TabPanel value="3">
                            <ProductReviews
                                reviews={product?.rating || []}
                                productTitle={product?.product_title}
                            />
                        </TabPanel>

                        <TabPanel value="4">
                            <DeliveryAndReturnPolicy
                                product={product}
                            />
                        </TabPanel>

                        {product?.tabs?.map((item, index) => (
                            <TabPanel key={index} value={String(index + 5)}>
                                <Box sx={{ width: "100%" }}>
                                    <HtmlRenderer html={item?.description || ""} />
                                </Box>
                            </TabPanel>
                        ))}
                    </TabContext>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductTabs;
