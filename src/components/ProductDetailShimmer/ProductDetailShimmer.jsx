import React from 'react';
import {
    Container,
    Grid,
    Box,
    Skeleton,
    Typography,
    CardContent,
    Divider
} from '@mui/material';

const ProductDetailShimmer = () => {
    return (
        <Container sx={{ py: 2 }}>
            {/* Breadcrumb Skeleton */}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Skeleton variant="text" width="60%" height={30} />
            </Box>

            <Grid container spacing={4}>
                {/* Image Gallery Section */}
                <Grid item xs={12} md={7}>
                    <Grid container spacing={2}>
                        {/* Thumbnail Sidebar */}
                        <Grid item xs={2} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[...Array(6)].map((_, index) => (
                                    <Skeleton
                                        key={index}
                                        variant="rectangular"
                                        width="100%"
                                        height={60}
                                        sx={{ borderRadius: 1 }}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        {/* Main Image */}
                        <Grid item xs={12} md={10}>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={400}
                                sx={{
                                    borderRadius: 2,
                                    height: { xs: 300, md: 450 }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Product Details Section */}
                <Grid item xs={12} md={5}>
                    <CardContent>
                        {/* Store Link */}
                        <Skeleton variant="text" width="40%" height={25} sx={{ mb: 1 }} />

                        {/* Product Title */}
                        <Skeleton variant="text" width="90%" height={30} sx={{ mb: 1 }} />
                        <Skeleton variant="text" width="70%" height={25} sx={{ mb: 2 }} />

                        {/* Rating */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Skeleton variant="text" width={60} height={25} />
                            <Skeleton variant="circular" width={20} height={20} sx={{ mx: 1 }} />
                            <Skeleton variant="text" width={80} height={25} />
                        </Box>

                        {/* Promotion Info */}
                        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />

                        {/* Stock Info */}
                        <Skeleton variant="text" width="60%" height={25} sx={{ mb: 2 }} />

                        {/* Pricing */}
                        <Box sx={{ mb: 3 }}>
                            <Skeleton variant="text" width="40%" height={35} />
                            <Skeleton variant="text" width="30%" height={25} />
                        </Box>

                        {/* Variants */}
                        {[...Array(2)].map((_, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Skeleton variant="text" width="30%" height={25} sx={{ mb: 1 }} />
                                <Skeleton
                                    variant="rectangular"
                                    width="100%"
                                    height={40}
                                    sx={{ borderRadius: 1 }}
                                />
                            </Box>
                        ))}

                        {/* Customization Button */}
                        <Skeleton
                            variant="rectangular"
                            width={120}
                            height={36}
                            sx={{ borderRadius: 6, mb: 3 }}
                        />

                        {/* Quantity Selector */}
                        <Box sx={{ mb: 3 }}>
                            <Skeleton variant="text" width="20%" height={25} sx={{ mb: 1 }} />
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={40}
                                sx={{ borderRadius: 1 }}
                            />
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ mb: 3 }}>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={45}
                                sx={{ borderRadius: 6, mb: 1.5 }}
                            />
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={45}
                                sx={{ borderRadius: 6, mb: 1.5 }}
                            />
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={45}
                                sx={{ borderRadius: 6 }}
                            />
                        </Box>

                        {/* Seller Info */}
                        <Box>
                            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
                                <Box sx={{ flex: 1 }}>
                                    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                                    <Skeleton variant="text" width="40%" height={18} />
                                </Box>
                            </Box>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={40}
                                sx={{ borderRadius: 6, mb: 1 }}
                            />
                            <Skeleton variant="text" width="80%" height={18} />
                        </Box>
                    </CardContent>
                </Grid>
            </Grid>

            {/* Product Tabs Section */}
            <Box sx={{ mt: 4 }}>
                {/* Tab Headers */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {['Description', 'Specifications', 'Reviews', 'Shipping'].map((tab, index) => (
                        <Skeleton
                            key={index}
                            variant="rectangular"
                            width={120}
                            height={40}
                            sx={{ borderRadius: 1 }}
                        />
                    ))}
                </Box>

                {/* Tab Content */}
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="100%" height={25} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={25} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="80%" height={25} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={25} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="70%" height={25} />
                </Box>

                {/* Specification Tables */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={200}
                            sx={{ borderRadius: 1 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height={200}
                            sx={{ borderRadius: 1 }}
                        />
                    </Grid>
                </Grid>

                {/* Reviews Section */}
                <Box sx={{ mt: 4 }}>
                    {[...Array(2)].map((_, index) => (
                        <Box key={index} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e8e8e8' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Skeleton variant="circular" width={20} height={20} sx={{ mr: 1 }} />
                                        <Skeleton variant="text" width={100} height={20} />
                                    </Box>
                                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
                                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
                                        <Skeleton variant="text" width={80} height={20} sx={{ mr: 2 }} />
                                        <Skeleton variant="text" width={100} height={20} />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                                    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                                    <Skeleton variant="text" width="70%" height={20} />
                                </Grid>
                            </Grid>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Related Products Section */}
            <Box sx={{ mt: 4 }}>
                <Skeleton variant="text" width="30%" height={35} sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                    {[...Array(4)].map((_, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={200}
                                sx={{ borderRadius: 2, mb: 1 }}
                            />
                            <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
                            <Skeleton variant="text" width="40%" height={25} />
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Shop Products Section */}
            <Box sx={{ mt: 4 }}>
                <Skeleton variant="text" width="25%" height={35} sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                    {[...Array(4)].map((_, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Skeleton
                                variant="rectangular"
                                width="100%"
                                height={180}
                                sx={{ borderRadius: 2, mb: 1 }}
                            />
                            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
                            <Skeleton variant="text" width="50%" height={20} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default ProductDetailShimmer;
