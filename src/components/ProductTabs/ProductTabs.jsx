import React, { useState } from 'react';
import {
    Box,
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
    Avatar,
    Tabs,
    Tab,
    Pagination,
    IconButton,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ChevronRight as ChevronRightIcon,
    ChevronLeft as ChevronLeftIcon,
    ExpandMore as ExpandMoreIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import moment from 'moment';
import { useMediaQuery, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import HtmlRenderer from 'components/HtmlRender/HtmlRenderer';
import DeliveryAndReturnPolicy from '../DeliveryAndReturnPolicy/DeliveryAndReturnPolicy';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Spec helpers (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const formatDynamicFieldValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value.toString();
};
const formatFieldLabel = (key) => {
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/\bis\b/i, 'Is').replace(/\bmm\b/i, 'MM').trim();
};
const getBaseName = (key) => { const p = key.split('.'); return p.length <= 1 ? key : p.slice(0, -1).join('.'); };
const formatBaseName = (b) => b.split('.').map(p => p.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/\bis\b/i, 'Is').replace(/\bmm\b/i, 'MM').trim()).join(' - ');
const groupFieldsByBaseName = (arr) => { const g = {}; arr.forEach(([k, v]) => { const b = getBaseName(k); if (!g[b]) g[b] = []; g[b].push({ key: k, value: v }); }); return g; };
const prepareFieldRows = (grouped) => {
    const rows = [];
    const entries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    entries.forEach(([baseName, fields]) => {
        if (fields.length === 1) {
            const { key, value } = fields[0];
            rows.push({ type: 'single', displayName: formatBaseName(key), fields: [{ label: formatFieldLabel(key), value }] });
        } else {
            rows.push({ type: 'group', groupName: formatBaseName(baseName), fields: fields.map(({ key, value }) => ({ label: formatFieldLabel(key), value })) });
        }
    });
    return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// ProductSpecifications (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
const ProductSpecifications = ({ product }) => {
    const isMobile = useMediaQuery('(max-width:600px)');

    const dynamicFields = { ...(product?.dynamicFields || {}) };

    if (
        product?.form_values?.prices === "Ring Size" &&
        product?.variant_attribute_id?.length
    ) {
        const ringSizes = product.variant_attribute_id
            .map(item => item?.value)
            .filter(Boolean);
        if (ringSizes.length) {
            dynamicFields.ring_size = [...new Set(ringSizes)].join(", ");
        }
    }

    if (dynamicFields) {
        Object.keys(dynamicFields).forEach(key => {
            if (Array.isArray(dynamicFields[key]) && dynamicFields[key].length > 4)
                delete dynamicFields[key];
        });
    }

    const dynamicFieldsArray = Object.entries(dynamicFields);
    if (dynamicFieldsArray.length === 0) return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No specifications available for this product.</Typography>
        </Box>
    );

    const groupedFields = groupFieldsByBaseName(dynamicFieldsArray);
    const allFieldRows = prepareFieldRows(groupedFields);
    const MOBILE_LIMIT = 5;
    const visibleRows = allFieldRows;

    const midPoint = Math.ceil(visibleRows.length / 2);
    const leftColumnRows = visibleRows.slice(0, midPoint);
    const rightColumnRows = visibleRows.slice(midPoint);

    // Show More button: mobile pe hamesha dikhao agar 5 se zyada hain,
    // desktop pe hide rahega (sab dikhta hai)
    const showToggleButton = isMobile && allFieldRows.length > MOBILE_LIMIT;

    const renderSingleField = (row) => (
        <TableRow key={row.displayName} sx={{ borderBottom: '1px solid' }}>
            <TableCell sx={{ background: '#e9e9e9', fontWeight: 500 }}>{row.displayName}</TableCell>
            <TableCell>{formatDynamicFieldValue(row.fields[0].value)}</TableCell>
        </TableRow>
    );

    const renderGroupedField = (row) => (
        <React.Fragment key={row.groupName}>
            <TableRow>
                <TableCell colSpan={2} sx={{ background: '#f5f5f5', fontWeight: 600, borderBottom: 'none', pt: 1, pb: 0.5 }}>
                    {row.groupName}
                </TableCell>
            </TableRow>
            {row.fields.map((field, i) => (
                <TableRow key={`${row.groupName}-${i}`} sx={{ borderBottom: i === row.fields.length - 1 ? '1px solid' : '1px dashed #ddd' }}>
                    <TableCell sx={{ background: '#e9e9e9', fontWeight: 500, pl: 3, borderLeft: '3px solid #bbb' }}>
                        {field.label}
                    </TableCell>
                    <TableCell>{formatDynamicFieldValue(field.value)}</TableCell>
                </TableRow>
            ))}
        </React.Fragment>
    );

    const tableStyles = {
        minWidth: 300,
        '.MuiTableCell-root': {
            borderBottom: '1px solid #bbbbbb !important',
            width: '50%',
            fontSize: { xs: '12px', md: '14px' },
            wordBreak: 'break-word',
            px: { xs: 1, md: 2 },
        },
    };

    return (
        <>
            <Grid container spacing={4}>
                <Grid item lg={6} md={6} xs={12}>
                    <TableContainer sx={{ boxShadow: 'none' }} component={Paper}>
                        <Table size="small" sx={tableStyles}>
                            <TableHead>
                                <TableRow>
                                    <TableCell colSpan={2} sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                                        Product Specifications
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {leftColumnRows.map(row =>
                                    row.type === 'single' ? renderSingleField(row) : renderGroupedField(row)
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                {/* Right column — mobile pe hide karo jab collapsed ho */}
                {true && (
                    <Grid item lg={6} md={6} xs={12}>
                        <TableContainer sx={{ boxShadow: 'none' }} component={Paper}>
                            <Table size="small" sx={tableStyles}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={2} sx={{ fontSize: '18px', fontWeight: 'bold' }}>
                                            Product Specifications
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rightColumnRows.map(row =>
                                        row.type === 'single' ? renderSingleField(row) : renderGroupedField(row)
                                    )}
                                    {rightColumnRows.length === 0 && (
                                        <>
                                            <TableRow><TableCell sx={{ background: '#e9e9e9' }}>&nbsp;</TableCell><TableCell>&nbsp;</TableCell></TableRow>
                                            <TableRow><TableCell sx={{ background: '#e9e9e9' }}>&nbsp;</TableCell><TableCell>&nbsp;</TableCell></TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                )}
            </Grid>
        </>
    );
};


// ─────────────────────────────────────────────────────────────────────────────
// ReviewCard - Etsy style
// ─────────────────────────────────────────────────────────────────────────────
const ReviewCard = ({ review, openImageDialog }) => (
    <Box sx={{ borderBottom: '1px solid #e5e5e5', py: 3 }}>
        {/* Main layout */}
        <Box
            display="flex"
            alignItems="flex-start"
            gap={1.5}
        >

            {/* Left avatar */}
            <Avatar
                src={"https://api.agukart.com/uploads/profileImage/" + review.user_image}
                sx={{ width: 42, height: 42, flexShrink: 0 }}
            />

            {/* Right content */}
            <Box flex={1}>

                {/* Name + date */}
                <Typography fontSize={15} mb={1.5}>
                    <span
                        style={{
                            fontWeight: 600,
                            textDecoration: 'underline',
                            cursor: 'pointer',
                        }}
                    >
                        {review.user_name}
                    </span>

                    <span style={{ color: '#666' }}>
                        {' '}on {moment(review.createdAt).format('MMM DD, YYYY')}
                    </span>
                </Typography>

                {review.recommended && (
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <Typography fontSize={13} sx={{ color: '#2e7d32', fontWeight: 500 }}>
                            ✓ Recommends this item
                        </Typography>
                    </Box>
                )}

                {/* Photos */}
                {review.photos?.length > 0 && (
                    <Box
                        display="flex"
                        gap={1.5}
                        mb={1.5}
                        flexWrap="wrap"
                    >
                        {review.photos.map((photo, i) => (
                            <Box
                                key={i}
                                component="img"
                                src={"https://api.agukart.com/uploads/ratings/" + photo}
                                alt=""
                                onClick={() => openImageDialog(review.photos, i)}
                                sx={{
                                    width: { xs: 90, sm: 120, md: 140 },
                                    height: { xs: 90, sm: 120, md: 140 },
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        opacity: 0.9,
                                    },
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Rating */}
                <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    sx={{ mb: 1 }}
                />

                {/* Comment */}
                <Typography
                    fontSize={14}
                    color="#333"
                    lineHeight={1.7}
                    mb={1.5}
                >
                    {review.additional_comment}
                </Typography>

                {/* Seller reply */}
                {review.seller_reply?.message && (
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1.5,
                            mt: 1.5,
                            mb: 2,
                            background: '#f7f7f7',
                            borderRadius: 1,
                            p: 1.5,
                        }}
                    >
                        <Avatar
                            src={"https://api.agukart.com/uploads/shop-icon/" + review.seller_reply.shop_image}
                            sx={{
                                width: 42,
                                height: 42,
                                bgcolor: "#fff",
                                color: "#000",
                                fontFamily: "Constantia, serif",
                                fontSize: 28,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                border: "2px solid",
                                borderColor: "divider",
                                fontSmooth: "anti-aliased"
                            }}
                        >
                            A
                        </Avatar>

                        <Box>
                            <Typography fontSize={13}>
                                <span
                                    style={{
                                        fontWeight: 600,
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {review.seller_reply.shop_name}
                                </span>

                                <span style={{ color: '#666' }}>
                                    {' '}
                                    responded on{' '}
                                    {moment(
                                        review.seller_reply.replied_on
                                    ).format('MMM DD, YYYY')}
                                </span>
                            </Typography>

                            <Typography
                                fontSize={13}
                                color="#444"
                                mt={0.5}
                            >
                                {review.seller_reply?.message}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Purchased item */}
                {review.purchased_item && (
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={1.5}
                        mt={1}
                        component={Link}
                        href={`/product/${review.purchased_item.slug}/${review.purchased_item.product_code}`}
                        passHref
                        sx={{ '&:hover': { textDecoration: "underline" } }}
                    >
                        <Box
                            component="img"
                            src={"https://api.agukart.com/uploads/product/" + review.purchased_item.image}
                            alt=""
                            sx={{
                                width: { xs: 52, md: 64 },
                                height: { xs: 52, md: 64 },
                                objectFit: 'cover',
                                borderRadius: 1,
                                flexShrink: 0,
                            }}
                        />

                        <Typography
                            fontSize={13}
                            color="#555"
                            sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {review.purchased_item.title.replace(/<[^>]*>/g, '')}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    </Box>
);

// ─────────────────────────────────────────────────────────────────────────────
// Photos From Reviews
// ─────────────────────────────────────────────────────────────────────────────
const PhotosFromReviews = ({ allPhotos, openImageDialog }) => {
    const scrollRef = React.useRef(null);

    if (allPhotos?.length === 0) return null;
    // console.log(typeof allPhotos, allPhotos, "review data")

    return (
        <Box mt={4} sx={{ border: '1px solid #e8e8e8', borderRadius: 2, p: 2 }}>
            <Typography fontSize={15} fontWeight={600} mb={1.5}>Photos from reviews</Typography>
            <Box sx={{ position: 'relative' }}>
                <Box
                    ref={scrollRef}
                    sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}
                >
                    {allPhotos?.map((photo, i) => (
                        <Box
                            key={photo._id}
                            component="img"
                            src={"https://api.agukart.com/uploads/ratings/" + photo.image}
                            alt=""
                            onClick={() => openImageDialog(allPhotos.map(p => p.image), i)}
                            sx={{
                                width: { xs: 100, sm: 130, md: 150 },
                                height: { xs: 100, sm: 130, md: 150 }, objectFit: 'cover', borderRadius: 1, flexShrink: 0, cursor: 'pointer', '&:hover': { opacity: 0.85 }
                            }}
                        />
                    ))}
                </Box>
                {allPhotos?.length > 4 && (
                    <IconButton
                        onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                        sx={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', background: '#fff', border: '1px solid #ddd', width: 32, height: 32, '&:hover': { background: '#f5f5f5' } }}
                    >
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
        </Box>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ProductReviews
// ─────────────────────────────────────────────────────────────────────────────
const ProductReviews = ({ reviewData, page, setPage, reviewType, setReviewType, openImageDialog }) => {
    const currentReviews = reviewData?.reviews || [];
    const totalPages = reviewData?.pagination?.pages;

    const avgRating = reviewType === "shop" ? reviewData?.summary?.shopRatingAvg : reviewData?.summary?.itemRatingAvg;
    const scrollToReviews = () => {
        const el = document.getElementById('reviews');
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 49;
        window.scrollTo({ top, behavior: 'smooth' });
    };
    const handleTabChange = (_, newVal) => { setReviewType(newVal); setPage(1); scrollToReviews(); };

    return (
        <Box>
            {/* Overall rating header */}
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Typography fontSize={21} fontWeight={500}>
                    {reviewData?.pagination?.total} reviews
                </Typography>
                <Rating value={parseFloat(avgRating)} precision={0.1} readOnly size="medium" />
            </Box>

            {/* Shop / Item tabs */}
            <Tabs
                value={reviewType}
                onChange={handleTabChange}
                sx={{
                    borderBottom: '1px solid #e5e5e5',
                    '& .MuiTab-root': { textTransform: 'none', fontSize: '14px', color: '#444', minWidth: 'auto', px: 0, mr: 4 },
                    '& .Mui-selected': { color: '#222', fontWeight: 600 },
                    '& .MuiTabs-indicator': { backgroundColor: '#222', height: '2px' },
                }}
            >
                <Tab
                    label={
                        <Box display="flex" alignItems="center" gap={0.8}>
                            Reviews for this shop
                            <Box component="span" sx={{ background: '#f0f0f0', borderRadius: '12px', px: 1, py: 0.2, fontSize: 13, fontWeight: 400 }}>
                                {reviewData?.summary?.shopReviewCount}
                            </Box>
                        </Box>
                    }
                    value={"shop"}
                />
                <Tab
                    label={
                        <Box display="flex" alignItems="center" gap={0.8}>
                            Reviews for this item
                            <Box component="span" sx={{ background: '#f0f0f0', borderRadius: '12px', px: 1, py: 0.2, fontSize: 13, fontWeight: 400 }}>
                                {reviewData?.summary?.itemReviewCount}
                            </Box>
                        </Box>
                    }
                    value={"item"}
                />
            </Tabs>

            {/* Review cards */}
            <Box>
                {currentReviews?.map(review => (
                    <ReviewCard key={review._id} review={review} openImageDialog={openImageDialog} />
                ))}

                {currentReviews?.length === 0 && (
                    <Box sx={{ py: 6, textAlign: 'center', color: '#888' }}>
                        <Typography fontSize={15}>
                            No reviews yet for this {reviewType}.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3} mb={1}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, val) => {
                            setPage(val);
                            scrollToReviews();
                        }}
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': { fontSize: 14, color: '#333', border: '1px solid transparent' },
                            '& .Mui-selected': { background: 'transparent !important', border: '1px solid #222', fontWeight: 700 },
                        }}
                    />
                </Box>
            )}

            {/* Photos from reviews */}
            <PhotosFromReviews allPhotos={reviewData?.reviewPhotos || []} openImageDialog={openImageDialog} />
        </Box>
    );
};
// ─────────────────────────────────────────────────────────────────────────────
// ExpandableDescription — mobile pe 10 lines, desktop pe full
// ─────────────────────────────────────────────────────────────────────────────
const ExpandableDescription = ({ children }) => {
    const [expanded, setExpanded] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    if (!isMobile) return <>{children}</>;

    return (
        <Box>
            <Box
            >
                {children}
            </Box>
        </Box>
    );
};
// ─────────────────────────────────────────────────────────────────────────────
// ProductTabs
// ─────────────────────────────────────────────────────────────────────────────
const ProductTabs = ({ product, reviewData, reviewType, setReviewType, page, setPage }) => {
    const [openAccordion, setOpenAccordion] = React.useState(null);
    const [activeSection, setActiveSection] = useState("description");
    const [open, setOpen] = useState(false);
    const [dialogImages, setDialogImages] = useState([]);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 49;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    React.useEffect(() => {
        const sections = [
            'description',
            'specifications',
            'reviews',
            'shipping',
            ...(product?.tabs || []).map((_, index) => `custom-tab-${index}`),
        ];
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
            { threshold: 0.4 }
        );
        sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    const tabStyle = (tabName) => ({
        cursor: 'pointer', fontWeight: 400, fontSize: { xs: '13px', md: '15px' },
        color: activeSection === tabName ? '#d32f2f' : '#222',
        borderBottom: activeSection === tabName ? '2px solid #d32f2f' : '2px solid transparent',
        pb: '12px', transition: 'color 0.2s, border-bottom 0.2s', flexShrink: 0,
        '&:hover': {                          // ✅ ADD KARO
            color: '#d32f2f',
        },
    });

    const handleImageDialogOpen = (images, index = 0) => {
        setDialogImages(images);
        setActiveImageIndex(index);
        setOpen(true);
    };

    const handleImageDialogClose = () => {
        setOpen(false);
        setDialogImages([]);
    }

    const handlePrev = () => {
        setActiveImageIndex(prev =>
            prev === 0 ? dialogImages.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setActiveImageIndex(prev =>
            prev === dialogImages.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <Box py={2} sx={{ padding: '0 0', m: 'auto', maxWidth: '1550px' }}>
            <Grid container spacing={4}>
                <Grid item lg={12} xs={12}>
                    <Box>
                        {/* Sticky Tab Nav */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                gap: { xs: 2.5, md: 5 },
                                pt: { xs: 1.5, md: 2.5 },
                                pb: 0,
                                px: { xs: 2, sm: 3, md: 10 },
                                borderBottom: '1px solid #e5e5e5',
                                overflowX: 'auto',
                                overflowY: 'hidden',
                                whiteSpace: 'nowrap',
                                position: 'sticky',
                                top: 0,
                                background: '#fff',
                                zIndex: 10,
                                scrollbarWidth: 'none',
                                '&::-webkit-scrollbar': {
                                    display: 'none',
                                },
                            }}
                        >
                            {[
                                { id: 'description', label: 'Description' },
                                { id: 'specifications', label: 'Product Specification & Details' },
                                { id: 'reviews', label: 'Reviews' },
                                { id: 'shipping', label: 'Shipping And Return Policies' },
                                ...(product?.tabs || []).map((tab, index) => ({
                                    id: `custom-tab-${index}`,
                                    label: tab?.title || 'Custom Tab',
                                })),
                            ].map(tab => (
                                <Typography
                                    key={tab.id}
                                    sx={tabStyle(tab.id)}
                                    onClick={() => scrollToSection(tab.id)}
                                >
                                    {tab.label}
                                </Typography>
                            ))}
                        </Box>
                        {/* Mobile Accordion Tabs */}
                        <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 2 }}>

                            {/* Description */}
                            <Accordion
                                expanded={openAccordion === 'description'}
                                onChange={(_, isExpanded) => setOpenAccordion(isExpanded ? 'description' : null)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Description</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <HtmlRenderer html={product?.description || ''} />
                                    <Box display="flex" justifyContent="center" mt={2}>
                                        <Button variant="outlined" size="small"
                                            onClick={() => setOpenAccordion(null)}
                                            sx={{ textTransform: 'none', borderRadius: '30px', px: 3, fontWeight: 600 }}
                                        >
                                            Show Less
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            {/* Specifications */}
                            <Accordion
                                expanded={openAccordion === 'specifications'}
                                onChange={(_, isExpanded) => setOpenAccordion(isExpanded ? 'specifications' : null)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Product Specifications & Details</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <ProductSpecifications product={product} />
                                    <Box display="flex" justifyContent="center" mt={2}>
                                        <Button variant="outlined" size="small"
                                            onClick={() => setOpenAccordion(null)}
                                            sx={{ textTransform: 'none', borderRadius: '30px', px: 3, fontWeight: 600 }}
                                        >
                                            Show Less
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            {/* Reviews */}
                            <Accordion
                                expanded={openAccordion === 'reviews'}
                                onChange={(_, isExpanded) => setOpenAccordion(isExpanded ? 'reviews' : null)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Reviews</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <ProductReviews
                                        reviews={product?.rating || []}
                                        productTitle={product?.product_title}
                                        shopName={product?.shop_name || 'SilverCraft'}
                                        reviewData={reviewData}
                                        page={page} setPage={setPage}
                                        reviewType={reviewType} setReviewType={setReviewType}
                                        openImageDialog={handleImageDialogOpen}
                                    />
                                    <Box display="flex" justifyContent="center" mt={2}>
                                        <Button variant="outlined" size="small"
                                            onClick={() => setOpenAccordion(null)}
                                            sx={{ textTransform: 'none', borderRadius: '30px', px: 3, fontWeight: 600 }}
                                        >
                                            Show Less
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            {/* Shipping */}
                            <Accordion
                                expanded={openAccordion === 'shipping'}
                                onChange={(_, isExpanded) => setOpenAccordion(isExpanded ? 'shipping' : null)}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontWeight={600}>Shipping and Return Policies</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <DeliveryAndReturnPolicy product={product} />
                                    <Box display="flex" justifyContent="center" mt={2}>
                                        <Button variant="outlined" size="small"
                                            onClick={() => setOpenAccordion(null)}
                                            sx={{ textTransform: 'none', borderRadius: '30px', px: 3, fontWeight: 600 }}
                                        >
                                            Show Less
                                        </Button>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>

                            {/* Custom Tabs */}
                            {(product?.tabs || []).map((tab, index) => (
                                <Accordion
                                    key={index}
                                    expanded={openAccordion === `custom-${index}`}
                                    onChange={(_, isExpanded) => setOpenAccordion(isExpanded ? `custom-${index}` : null)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight={600}>{tab?.title}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <HtmlRenderer html={tab?.description || ''} />
                                        <Box display="flex" justifyContent="center" mt={2}>
                                            <Button variant="outlined" size="small"
                                                onClick={() => setOpenAccordion(null)}
                                                sx={{ textTransform: 'none', borderRadius: '30px', px: 3, fontWeight: 600 }}
                                            >
                                                Show Less
                                            </Button>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                        </Box>

                        {/* Content */}
                        <Box
                            sx={{
                                px: { xs: 2, sm: 3, md: 10 }, // right side kam
                            }}
                        >
                            <Box
                                id="description"
                                mb={6}
                                pt={3}
                                sx={{
                                    display: { xs: 'none', md: 'block' },
                                    pr: { xs: 0, md: 15 },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: { xs: '22px', md: '30px' },
                                        fontWeight: 600,
                                    }}
                                >
                                    Description
                                </Typography>

                                <ExpandableDescription>
                                    <HtmlRenderer html={product?.description || ''} />
                                </ExpandableDescription>
                            </Box>

                            <Box
                                id="specifications"
                                mb={6}
                                sx={{ display: { xs: 'none', md: 'block' } }}
                            >
                                <Typography variant="h5" mb={2}>Product Specifications & Details</Typography>
                                <ProductSpecifications product={product} />
                            </Box>

                            <Box
                                id="reviews"
                                mb={6}
                                sx={{ display: { xs: 'none', md: 'block' } }}
                            >
                                <Typography variant="h5" mb={2} fontWeight={600}>Reviews</Typography>
                                <ProductReviews
                                    reviews={product?.rating || []}
                                    productTitle={product?.product_title}
                                    shopName={product?.shop_name || 'SilverCraft'}
                                    reviewData={reviewData}
                                    page={page} setPage={setPage}
                                    reviewType={reviewType} setReviewType={setReviewType}
                                    openImageDialog={handleImageDialogOpen}
                                />
                            </Box>

                            <Box
                                id="shipping"
                                mb={6}
                                sx={{ display: { xs: 'none', md: 'block' } }}
                            >

                                <Typography variant="h5" mb={2}>Shipping and Return Policies</Typography>
                                <DeliveryAndReturnPolicy product={product} />

                            </Box>
                            {(product?.tabs || []).map((tab, index) => (
                                <Box
                                    key={index}
                                    id={`custom-tab-${index}`}
                                    mb={6}
                                    sx={{ display: { xs: 'none', md: 'block' } }}
                                >
                                    <Typography variant="h5" mb={2}>
                                        {tab?.title}
                                    </Typography>

                                    <HtmlRenderer html={tab?.description || ''} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Dialog
                open={open}
                onClose={handleImageDialogClose}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        width: { xs: "90vw", sm: "80vw", md: "60vw", lg: "50vw" },
                        maxWidth: "900px",
                        height: { xs: "80vh", sm: "85vh", md: "85vh" },
                        maxHeight: "800px",
                        borderRadius: 3,
                        overflow: "hidden",
                        position: "relative",
                        bgcolor: "#f5f0eb",
                        boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
                    },
                }}
            >

                <DialogTitle>
                    {/* Close Button - Top Right */}
                    <IconButton
                        onClick={handleImageDialogClose}
                        sx={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            zIndex: 20,
                            color: "rgba(255,255,255,0.8)",
                            bgcolor: "rgba(0,0,0,0.4)",
                            backdropFilter: "blur(8px)",
                            transition: "all 0.2s",
                            width: 38,
                            height: 38,
                            "&:hover": {
                                bgcolor: "rgba(0,0,0,0.7)",
                                color: "#fff",
                                transform: "scale(1.05)",
                            },
                            "& .MuiSvgIcon-root": {
                                fontSize: 20,
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {/* Counter - Top Left */}
                    <Box
                        sx={{
                            position: "absolute",
                            top: 20,
                            left: 24,
                            zIndex: 20,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "rgba(255,255,255,0.7)",
                                bgcolor: "rgba(0,0,0,0.4)",
                                backdropFilter: "blur(8px)",
                                px: 2,
                                py: 0.75,
                                borderRadius: 20,
                                letterSpacing: "0.3px",
                            }}
                        >
                            {activeImageIndex + 1} of {dialogImages.length}
                        </Typography>
                    </Box>

                </DialogTitle>

                {/* Navigation Buttons */}
                {dialogImages.length > 1 && (
                    <>
                        {/* Previous Button */}
                        <IconButton
                            onClick={handlePrev}
                            sx={{
                                position: "absolute",
                                left: 24,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 20,
                                bgcolor: "rgba(92, 92, 92, 0.18)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
                                width: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                height: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                transition: "all 0.25s ease",
                                border: "1px solid rgba(255,255,255,0.15)",
                                "&:hover": {
                                    bgcolor: "rgba(202, 202, 202, 0.25)",
                                    transform: "translateY(-50%) scale(1.08)",
                                    borderColor: "rgba(255,255,255,0.3)",
                                },
                                "&:active": {
                                    transform: "translateY(-50%) scale(0.95)",
                                },
                            }}
                        >
                            <ChevronLeftIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32, } }} />
                        </IconButton>

                        {/* Next Button */}
                        <IconButton
                            onClick={handleNext}
                            sx={{
                                position: "absolute",
                                right: 24,
                                top: "50%",
                                transform: "translateY(-50%)",
                                zIndex: 20,
                                bgcolor: "rgba(92, 92, 92, 0.18)",
                                backdropFilter: "blur(8px)",
                                color: "#fff",
                                width: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                height: {
                                    xs: 40,
                                    sm: 48,
                                    md: 56,
                                },
                                transition: "all 0.25s ease",
                                border: "1px solid rgba(255,255,255,0.15)",
                                "&:hover": {
                                    bgcolor: "rgba(202,202,202,0.25)",
                                    transform: "translateY(-50%) scale(1.08)",
                                    borderColor: "rgba(255,255,255,0.3)",
                                },
                                "&:active": {
                                    transform: "translateY(-50%) scale(0.95)",
                                },
                            }}
                        >
                            <ChevronRightIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32, } }} />
                        </IconButton>
                    </>
                )}

                {/* Main Image Area */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "calc(90% - 120px)",
                        px: { xs: 2, sm: 4 },
                        pt: { xs: 4, sm: 5 },
                        pb: 2,
                        position: "relative",
                    }}
                >
                    <Box
                        component="img"
                        src={`https://api.agukart.com/uploads/ratings/${dialogImages[activeImageIndex]}`}
                        alt={`Product image ${activeImageIndex + 1}`}
                        sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            width: "auto",
                            height: "auto",
                            objectFit: "contain",
                            borderRadius: 2,
                            boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
                            transition: "all 0.3s ease",
                            userSelect: "none",
                            WebkitUserDrag: "none",
                        }}
                    />
                </Box>

                {/* Thumbnail Strip - Bottom */}
                {dialogImages.length > 1 && (
                    <DialogActions
                        sx={{
                            display: "flex", justifyContent: "center"
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                gap: 1.5,
                                justifyContent: "center",
                                alignItems: "center",
                                px: { xs: 2, sm: 4 },
                                py: 1,
                                overflowX: "auto",
                                overflowY: "hidden",
                                "&::-webkit-scrollbar": {
                                    height: 4,
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    borderRadius: 10,
                                },
                                "&::-webkit-scrollbar-track": {
                                    bgcolor: "transparent",
                                },
                                position: "relative",
                                zIndex: 5,
                            }}
                        >
                            {dialogImages.map((img, index) => (
                                <Box
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        minWidth: 80,
                                        flexShrink: 0,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        position: "relative",
                                        border: index === activeImageIndex
                                            ? "3px solid #cb9090"
                                            : "2px solid rgba(255,255,255,0.15)",
                                        opacity: index === activeImageIndex ? 1 : 0.5,
                                        transition: "all 0.1s ease",
                                        transform: index === activeImageIndex
                                            ? "scale(1.02)"
                                            : "scale(1)",
                                        "&:hover": {
                                            opacity: 1,
                                            transform: "scale(1.02)",
                                            borderColor: "rgba(224, 168, 168, 0.4)",
                                        },
                                        "&:active": {
                                            transform: "scale(0.98)",
                                        },
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={`https://api.agukart.com/uploads/ratings/${img}`}
                                        alt={`Thumbnail ${index + 1}`}
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            display: "block",
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </DialogActions>
                )}

            </Dialog>
        </Box>
    );
};

export default ProductTabs;