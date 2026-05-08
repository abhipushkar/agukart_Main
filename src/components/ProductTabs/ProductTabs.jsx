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
} from '@mui/material';
import {
    ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import moment from 'moment';
import HtmlRenderer from 'components/HtmlRender/HtmlRenderer';
import DeliveryAndReturnPolicy from '../DeliveryAndReturnPolicy/DeliveryAndReturnPolicy';

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
  const dynamicFields = product?.dynamicFields || {};

// Add Ring Size from form_values
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
        if (
            Array.isArray(dynamicFields[key]) &&
            dynamicFields[key].length > 4
        ) {
            delete dynamicFields[key];
        }
    });
}
    if (dynamicFields) {
        Object.keys(dynamicFields).forEach(key => {
            if (Array.isArray(dynamicFields[key]) && dynamicFields[key].length > 4) delete dynamicFields[key];
        });
    }
    const dynamicFieldsArray = Object.entries(dynamicFields);
    if (dynamicFieldsArray.length === 0) return <Box sx={{ p: 3, textAlign: 'center' }}><Typography>No specifications available for this product.</Typography></Box>;

    const groupedFields = groupFieldsByBaseName(dynamicFieldsArray);
    const fieldRows = prepareFieldRows(groupedFields);
    const midPoint = Math.ceil(fieldRows.length / 2);
    const leftColumnRows = fieldRows.slice(0, midPoint);
    const rightColumnRows = fieldRows.slice(midPoint);

    const renderSingleField = (row) => (
        <TableRow key={row.displayName} sx={{ borderBottom: '1px solid' }}>
            <TableCell sx={{ background: '#e9e9e9', fontWeight: 500 }}>{row.displayName}</TableCell>
            <TableCell>{formatDynamicFieldValue(row.fields[0].value)}</TableCell>
        </TableRow>
    );
    const renderGroupedField = (row) => (
        <React.Fragment key={row.groupName}>
            <TableRow><TableCell colSpan={2} sx={{ background: '#f5f5f5', fontWeight: 600, borderBottom: 'none', pt: 1, pb: 0.5 }}>{row.groupName}</TableCell></TableRow>
            {row.fields.map((field, i) => (
                <TableRow key={`${row.groupName}-${i}`} sx={{ borderBottom: i === row.fields.length - 1 ? '1px solid' : '1px dashed #ddd' }}>
                    <TableCell sx={{ background: '#e9e9e9', fontWeight: 500, pl: 3, borderLeft: '3px solid #bbb' }}>{field.label}</TableCell>
                    <TableCell>{formatDynamicFieldValue(field.value)}</TableCell>
                </TableRow>
            ))}
        </React.Fragment>
    );
    const tableStyles = { minWidth: 300, '.MuiTableCell-root': { borderBottom: '1px solid #bbbbbb !important', width: '50%' } };

    return (
        <Grid container spacing={4}>
            <Grid item lg={6} md={6} xs={12}>
                <TableContainer sx={{ boxShadow: 'none' }} component={Paper}>
                    <Table size="small" sx={tableStyles}>
                        <TableHead><TableRow><TableCell colSpan={2} sx={{ fontSize: '18px', fontWeight: 'bold' }}>Product Specifications</TableCell></TableRow></TableHead>
                        <TableBody>{leftColumnRows.map(row => row.type === 'single' ? renderSingleField(row) : renderGroupedField(row))}</TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item lg={6} md={6} xs={12}>
                <TableContainer sx={{ boxShadow: 'none' }} component={Paper}>
                    <Table size="small" sx={tableStyles}>
                        <TableHead><TableRow><TableCell colSpan={2} sx={{ fontSize: '18px', fontWeight: 'bold' }}>Product Specifications</TableCell></TableRow></TableHead>
                        <TableBody>
                            {rightColumnRows.map(row => row.type === 'single' ? renderSingleField(row) : renderGroupedField(row))}
                            {rightColumnRows.length === 0 && (<><TableRow><TableCell sx={{ background: '#e9e9e9' }}>&nbsp;</TableCell><TableCell>&nbsp;</TableCell></TableRow><TableRow><TableCell sx={{ background: '#e9e9e9' }}>&nbsp;</TableCell><TableCell>&nbsp;</TableCell></TableRow></>)}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Dummy Data
// ─────────────────────────────────────────────────────────────────────────────
const dummyShopReviews = [
    {
        _id: 's1', user_name: 'Priya S.', user_image: 'https://i.pravatar.cc/40?img=1',
        item_rating: 5, additional_comment: 'Absolutely gorgeous ring! The moonstone shimmers beautifully in the light. Packaging was also very nice and the delivery was super fast.',
        recommended: true, createdAt: '2023-11-23T10:00:00Z',
        photos: ['https://picsum.photos/seed/r1/120/120', 'https://picsum.photos/seed/r2/120/120', 'https://picsum.photos/seed/r3/120/120'],
        seller_reply: { shop_name: 'SilverCraft', shop_image: 'https://i.pravatar.cc/40?img=50', replied_on: '2023-11-24T10:00:00Z', message: 'Thank you Priya, so happy you liked it.' },
        purchased_item: { title: 'Wildflower print, botanical print, Wild flowers print, Nature print of meadow of wild flowers in watercolor, Flower picture, instant download', image: 'https://picsum.photos/seed/p1/80/80' },
    },
    {
        _id: 's2', user_name: 'Neha V.', user_image: 'https://i.pravatar.cc/40?img=5',
        item_rating: 4, additional_comment: 'Loved the ring! Quality is great. Delivery took a bit longer than expected but worth it.',
        recommended: true, createdAt: '2023-11-23T08:30:00Z',
        photos: [],
        seller_reply: null,
        purchased_item: { title: 'Rainbow Moonstone Ring, 925 Sterling Silver, Gemstone Ring, Oval Moonstone Jewlery', image: 'https://picsum.photos/seed/p2/80/80' },
    },
    {
        _id: 's3', user_name: 'Rohit M.', user_image: 'https://i.pravatar.cc/40?img=12',
        item_rating: 3, additional_comment: 'Ring is okay but the stone color was slightly different from photos. Overall decent quality.',
        recommended: false, createdAt: '2023-10-15T14:20:00Z',
        photos: ['https://picsum.photos/seed/r4/120/120'],
        seller_reply: { shop_name: 'SilverCraft', shop_image: 'https://i.pravatar.cc/40?img=50', replied_on: '2023-10-16T09:00:00Z', message: 'We are sorry to hear that. Please reach out and we will make it right!' },
        purchased_item: { title: 'Silver Moonstone Pendant Necklace, Handmade Jewelry', image: 'https://picsum.photos/seed/p3/80/80' },
    },
    {
        _id: 's4', user_name: 'Anjali S.', user_image: 'https://i.pravatar.cc/40?img=9',
        item_rating: 5, additional_comment: 'Perfect gift for my sister! She absolutely loved it. The craftsmanship is excellent.',
        recommended: true, createdAt: '2023-09-28T11:00:00Z',
        photos: ['https://picsum.photos/seed/r5/120/120', 'https://picsum.photos/seed/r6/120/120'],
        seller_reply: null,
        purchased_item: { title: 'Rainbow Moonstone Ring, 925 Sterling Silver', image: 'https://picsum.photos/seed/p4/80/80' },
    },
    {
        _id: 's5', user_name: 'Kavita J.', user_image: 'https://i.pravatar.cc/40?img=20',
        item_rating: 4, additional_comment: 'Beautiful ring, good quality silver. Delivery was a bit slow but product is great.',
        recommended: true, createdAt: '2023-09-10T09:15:00Z',
        photos: [],
        seller_reply: null,
        purchased_item: { title: 'Moonstone Earrings, 925 Sterling Silver, Handmade Jewelry', image: 'https://picsum.photos/seed/p5/80/80' },
    },
];

const dummyItemReviews = [
    {
        _id: 'i1', user_name: 'Simran K.', user_image: 'https://i.pravatar.cc/40?img=25',
        item_rating: 5, additional_comment: 'The ring is even more beautiful in person. Fits perfectly, love the moonstone!',
        recommended: true, createdAt: '2024-01-05T10:00:00Z',
        photos: ['https://picsum.photos/seed/ir1/120/120'],
        seller_reply: null,
        purchased_item: { title: 'Rainbow Moonstone Ring, 925 Sterling Silver', image: 'https://picsum.photos/seed/ip1/80/80' },
    },
    {
        _id: 'i2', user_name: 'Divya R.', user_image: 'https://i.pravatar.cc/40?img=30',
        item_rating: 4, additional_comment: 'Great quality, fast shipping. Would recommend to anyone looking for a moonstone ring.',
        recommended: true, createdAt: '2023-12-20T08:00:00Z',
        photos: [],
        seller_reply: { shop_name: 'SilverCraft', shop_image: 'https://i.pravatar.cc/40?img=50', replied_on: '2023-12-21T10:00:00Z', message: 'Thank you so much Divya! We appreciate your kind words.' },
        purchased_item: { title: 'Rainbow Moonstone Ring, 925 Sterling Silver', image: 'https://picsum.photos/seed/ip2/80/80' },
    },
];

const REVIEWS_PER_PAGE = 2;

// ─────────────────────────────────────────────────────────────────────────────
// ReviewCard - Etsy style
// ─────────────────────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
    <Box sx={{ borderBottom: '1px solid #e5e5e5', py: 3 }}>
        {/* Main layout */}
        <Box display="flex" alignItems="flex-start" gap={2}>
            
            {/* Left avatar */}
            <Avatar
                src={review.user_image}
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
                                src={photo}
                                alt=""
                                sx={{
                                    width: 140,
                                    height: 140,
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
                    value={review.item_rating}
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
                {review.seller_reply && (
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
                            src={review.seller_reply.shop_image}
                            sx={{ width: 32, height: 32 }}
                        />

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
                                {review.seller_reply.message}
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
                    >
                        <Box
                            component="img"
                            src={review.purchased_item.image}
                            alt=""
                            sx={{
                                width: 64,
                                height: 64,
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
                            {review.purchased_item.title}
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
const PhotosFromReviews = ({ reviews }) => {
    const allPhotos = reviews.flatMap(r => r.photos || []);
    const scrollRef = React.useRef(null);

    if (allPhotos.length === 0) return null;

    return (
        <Box mt={4} sx={{ border: '1px solid #e8e8e8', borderRadius: 2, p: 2 }}>
            <Typography fontSize={15} fontWeight={600} mb={1.5}>Photos from reviews</Typography>
            <Box sx={{ position: 'relative' }}>
                <Box
                    ref={scrollRef}
                    sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, '&::-webkit-scrollbar': { display: 'none' } }}
                >
                    {allPhotos.map((photo, i) => (
                        <Box
                            key={i}
                            component="img"
                            src={photo}
                            alt=""
                            sx={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 1, flexShrink: 0, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
                        />
                    ))}
                </Box>
                {allPhotos.length > 4 && (
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
const ProductReviews = ({ reviews: propReviews, productTitle, shopName = 'SilverCraft' }) => {
    const itemReviews = propReviews?.length > 0 ? propReviews : dummyItemReviews;
    const shopReviews = dummyShopReviews;

    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(1);

    const currentReviews = activeTab === 0 ? shopReviews : itemReviews;
    const totalPages = Math.ceil(currentReviews.length / REVIEWS_PER_PAGE);
    const paginatedReviews = currentReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

    const avgRating = currentReviews.length > 0
        ? (currentReviews.reduce((s, r) => s + r.item_rating, 0) / currentReviews.length).toFixed(1)
        : 0;

    const handleTabChange = (_, newVal) => { setActiveTab(newVal); setPage(1); };

    return (
        <Box>
            {/* Overall rating header */}
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Typography fontSize={22} fontWeight={600}>
                    {currentReviews.length.toLocaleString()} reviews
                </Typography>
                <Rating value={parseFloat(avgRating)} precision={0.1} readOnly size="medium" />
            </Box>

            {/* Shop / Item tabs */}
            <Tabs
                value={activeTab}
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
                                {shopReviews.length}
                            </Box>
                        </Box>
                    }
                />
                <Tab
                    label={
                        <Box display="flex" alignItems="center" gap={0.8}>
                            Reviews for this item
                            <Box component="span" sx={{ background: '#f0f0f0', borderRadius: '12px', px: 1, py: 0.2, fontSize: 13, fontWeight: 400 }}>
                                {itemReviews.length}
                            </Box>
                        </Box>
                    }
                />
            </Tabs>

            {/* Review cards */}
            <Box>
                {paginatedReviews.map(review => (
                    <ReviewCard key={review._id} review={review} />
                ))}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3} mb={1}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, val) => setPage(val)}
                        shape="rounded"
                        sx={{
                            '& .MuiPaginationItem-root': { fontSize: 14, color: '#333', border: '1px solid transparent' },
                            '& .Mui-selected': { background: 'transparent !important', border: '1px solid #222', fontWeight: 700 },
                        }}
                    />
                </Box>
            )}

            {/* Photos from reviews */}
            <PhotosFromReviews reviews={currentReviews} />
        </Box>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ProductTabs
// ─────────────────────────────────────────────────────────────────────────────
const ProductTabs = ({ product }) => {
    const [activeTab, setActiveTab] = React.useState('description');

    React.useEffect(() => {
        const sections = [
    'description',
    'specifications',
    'reviews',
    'shipping',
    ...(product?.tabs || []).map((_, index) => `custom-tab-${index}`),
];
        const observer = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) setActiveTab(e.target.id); }),
            { threshold: 0.4 }
        );
        sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, []);

    const tabStyle = (tabName) => ({
        cursor: 'pointer', fontWeight: 400, fontSize: '15px',
        color: activeTab === tabName ? '#d32f2f' : '#222',
        borderBottom: activeTab === tabName ? '2px solid #d32f2f' : '2px solid transparent',
        pb: '12px', transition: 'color 0.2s', flexShrink: 0,
    });

    return (
        <Box py={2} sx={{ padding: '0 0', m: 'auto', maxWidth: '1550px' }}>
            <Grid container spacing={4}>
                <Grid item lg={12} xs={12}>
                    <Box>
                        {/* Sticky Tab Nav */}
                        <Box
    sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '40px',

        pl: { xs: '25px', md: '100px' },
        pr: { xs: '10px', md: '40px' },

        borderBottom: '1px solid #e5e5e5',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        position: 'sticky',
        top: 0,
        background: '#fff',
        zIndex: 10,

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
                                    onClick={() => document.getElementById(tab.id)?.scrollIntoView({ behavior: 'smooth' })}
                                >
                                    {tab.label}
                                </Typography>
                            ))}
                        </Box>

                        {/* Content */}
                        <Box
  sx={{
    pl: { xs: '25px', md: '100px' },
    pr: { xs: '25px', md: '100px' }, // right side kam
  }}
>
                            <Box
    id="description"
    mb={6}
    pt={3}
    sx={{
        pr: { xs: '10px', md: '120px' }, // right side se content andar aa jayega
    }}
>
    <Typography variant="h5" mb={2}>
        Description
    </Typography>

    <HtmlRenderer html={product?.description || ''} />
</Box>

                            <Box id="specifications" mb={6}>
                                <Typography variant="h5" mb={2}>Product Specifications & Details</Typography>
                                <ProductSpecifications product={product} />
                            </Box>

                            <Box id="reviews" mb={6}>
                                <Typography variant="h5" mb={2}>Reviews</Typography>
                                <ProductReviews
                                    reviews={product?.rating || []}
                                    productTitle={product?.product_title}
                                    shopName={product?.shop_name || 'SilverCraft'}
                                />
                            </Box>

                            <Box id="shipping" mb={6}>
                                
                                <Typography variant="h5" mb={2}>Shipping and Return Policies</Typography>
                                <DeliveryAndReturnPolicy product={product} />

                            </Box>
                            {(product?.tabs || []).map((tab, index) => (
    <Box
        key={index}
        id={`custom-tab-${index}`}
        mb={6}
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
        </Box>
    );
};

export default ProductTabs;