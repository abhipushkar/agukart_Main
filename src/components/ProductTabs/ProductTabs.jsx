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
    Container
} from '@mui/material';
import { TabContext, TabList, TabPanel, } from "@mui/lab";
import { Check as CheckIcon, Star as StarIcon } from '@mui/icons-material';
import moment from 'moment';
import HtmlRenderer from 'components/HtmlRender/HtmlRenderer';
import DeliveryAndReturnPolicy from '../DeliveryAndReturnPolicy/DeliveryAndReturnPolicy';

// Move these components outside the main component and export them
const ProductSpecifications = ({ product }) => (
    <Grid container spacing={4}>
        <Grid item lg={6} md={6} xs={12}>
            <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
                <Table
                    size="small"
                    aria-label="a dense table"
                    sx={{
                        minWidth: 500,
                        ".MuiTableCell-root": {
                            borderBottom: "1px solid #bbbbbb !important",
                            width: "50%",
                        },
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2} sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                Information
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow sx={{ borderBottom: "1px solid" }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Gender</TableCell>
                            <TableCell>{product?.gender?.map(gender => `${gender}, `)}</TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid" }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Size</TableCell>
                            <TableCell>{product?.product_size ? product?.product_size : "-"}</TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Size Map</TableCell>
                            <TableCell>{product?.size_map ? product?.size_map : "-"}</TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Color</TableCell>
                            <TableCell>{product?.color ? product?.color : "-"}</TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Style Name</TableCell>
                            <TableCell>{product?.style_name ? product?.style_name : "-"}</TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Launch Date</TableCell>
                            <TableCell>
                                {moment(product?.launch_date).format("yyyy-MM-D")}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Release Date</TableCell>
                            <TableCell>
                                {moment(product?.release_date).format("yyyy-MM-D")}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Shipping Weight</TableCell>
                            <TableCell>
                                {product?.shipping_weight
                                    ? `${product?.shipping_weight} ${product?.package_weight_unit}`
                                    : "-"}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>

        <Grid item lg={6} md={6} xs={12}>
            <TableContainer sx={{ boxShadow: "none" }} component={Paper}>
                <Table
                    size="small"
                    aria-label="a dense table"
                    sx={{
                        minWidth: 500,
                        ".MuiTableCell-root": {
                            borderBottom: "1px solid #bbbbbb !important",
                            width: "50%",
                        },
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2} sx={{ fontSize: "18px", fontWeight: "bold" }}>
                                Information
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Item Display Dimension</TableCell>
                            <TableCell>
                                {`
                  ${product?.display_dimension_height} * ${product?.display_dimension_length} * ${product?.display_dimension_width} ${product?.display_dimension_unit}`}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Package Dimension</TableCell>
                            <TableCell>
                                {`
                  ${product?.package_dimension_height} *
                  ${product?.package_dimension_length} *
                  ${product?.package_dimension_width}
                  ${product?.package_dimension_unit}`}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Package Weight</TableCell>
                            <TableCell>
                                {product?.package_weight ? product?.package_weight : "-"}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Unit Count</TableCell>
                            <TableCell>
                                {product?.unit_count ? product?.unit_count : "-"}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Unit Count type</TableCell>
                            <TableCell>
                                {product?.unit_count_type ? product?.unit_count_type : "-"}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Design</TableCell>
                            <TableCell>
                                {product?.design ? product?.design : "-"}
                            </TableCell>
                        </TableRow>
                        <TableRow sx={{ borderBottom: "1px solid " }}>
                            <TableCell sx={{ background: "#e9e9e9" }}>Material</TableCell>
                            <TableCell>
                                {product?.material?.map(mat => `${mat}, `)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    </Grid>
);

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

// Main component
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
                            <ProductReviews reviews={product?.rating || []} productTitle={product?.product_title} />
                        </TabPanel>

                        <TabPanel value="4">
                            <DeliveryAndReturnPolicy
                                shippingTemplate={product?.shipping_templates}
                                exchangePolicy={product?.exchangePolicy}
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
