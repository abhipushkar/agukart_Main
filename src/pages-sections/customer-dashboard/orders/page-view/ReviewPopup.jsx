import React, { useState, useEffect } from "react";
import { Box, Typography, Rating, Stack, Dialog, DialogActions, TextField, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useToasts } from "react-toast-notifications";
import useAuth from "hooks/useAuth";
import { postAPIAuthFormData, putAPIAuthFormData } from "utils/__api__/ApiServies";

const ReviewPopup = ({
    open,
    onClose,
    baseUrl,
    reviewProduct,
    isEditMode = false,
    initialData = null,
    reviewId = "",
    vendorId = "",
    shopName = "",
    onSuccess = () => { }
}) => {
    const { token } = useAuth();
    const { addToast } = useToasts();
    const [reviewStep, setReviewStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);

    const [reviewData, setReviewData] = useState(
        initialData || {
            rating: 0,
            recommend: null,
            itemQuality: 0,
            delivery: 0,
            customerService: 0,
            review: '',
            photos: [],
            photoUrls: [],
            existingImageNames: []
        }
    );

    useEffect(() => {
        if (open && initialData) {
            setReviewData(initialData);
            setReviewStep(0);
        } else if (open && !initialData) {
            setReviewData({
                rating: 0,
                recommend: null,
                itemQuality: 0,
                delivery: 0,
                customerService: 0,
                review: '',
                photos: [],
                photoUrls: [],
                existingImageNames: []
            });
            setReviewStep(0);
        }
    }, [open, initialData]);

    const handleFollow = async () => {
        try {
            const res = await postAPIAuth(
                "user/follow-vendor",
                { vendorId: vendorId },
                token,
                addToast
            );
            if (res.status === 200) {
                setIsFollowing(prev => !prev);
                addToast(
                    !isFollowing ? "Followed successfully" : "Unfollowed successfully",
                    {
                        appearance: "success",
                        autoDismiss: true,
                    }
                );
            }
        } catch (err) {
            console.log(err);
            addToast("Something went wrong", {
                appearance: "error",
                autoDismiss: true,
            });
        }
    };

    const submitReviewHandler = async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            if (isEditMode) {
                // EDIT MODE
                formData.append("rating_id", reviewId);
                formData.append("rating", reviewData.rating.toString());
                formData.append("customer_service_rating", reviewData.customerService.toString());
                formData.append("delivery_rating", reviewData.delivery.toString());
                formData.append("item_rating", reviewData.itemQuality.toString());
                formData.append("additional_comment", reviewData.review);
                formData.append("recommended", reviewData.recommend ? "true" : "false");

                if (reviewData.existingImageNames && reviewData.existingImageNames.length > 0) {
                    reviewData.existingImageNames.forEach((imgName) => {
                        formData.append("existingImages", imgName);
                    });
                }

                if (reviewData.photos && reviewData.photos.length > 0) {
                    reviewData.photos.forEach((file) => {
                        formData.append("images", file);
                    });
                }

                const res = await putAPIAuthFormData(
                    `user/editRating/${reviewId}`,
                    formData,
                    token,
                    addToast
                );

                if (res.status === 200) {
                    setReviewStep(3);
                    onSuccess();
                    addToast("Review updated successfully", {
                        appearance: "success",
                        autoDismiss: true,
                    });
                }
            } else {
                // CREATE MODE
                formData.append("delivery_rating", reviewData.delivery.toString());
                formData.append("item_rating", reviewData.itemQuality.toString());
                formData.append("additional_comment", reviewData.review);
                formData.append("recommended", reviewData.recommend ? "true" : "false");
                formData.append("saleDetailId", reviewId);
                formData.append("vendor_id", vendorId);
                formData.append("customer_service_rating", reviewData.customerService.toString());
                formData.append("rating", reviewData.rating.toString());

                if (reviewData.photos && reviewData.photos.length > 0) {
                    reviewData.photos.forEach((file) => {
                        formData.append("images", file);
                    });
                }

                const res = await postAPIAuthFormData(
                    "user/sendRating",
                    formData,
                    token,
                    addToast
                );

                if (res.status === 200) {
                    setReviewStep(3);
                    onSuccess();
                    addToast("Review submitted successfully", {
                        appearance: "success",
                        autoDismiss: true,
                    });
                }
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            addToast(error?.response?.data?.message || "Something went wrong", {
                appearance: "error",
                autoDismiss: true
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setReviewStep(0);
        setReviewData(
            initialData || {
                rating: 0,
                recommend: null,
                itemQuality: 0,
                delivery: 0,
                customerService: 0,
                review: '',
                photos: [],
                photoUrls: [],
                existingImageNames: []
            }
        );
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            sx={{
                ".MuiPaper-root": {
                    height: "600px",
                    maxHeight: "80vh",
                    minHeight: "520px",
                    width: { xs: "calc(100% - 24px)", md: "650px" },
                    maxWidth: "500px",
                    margin: { xs: "12px", sm: "32px" },
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column"
                }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
                <Typography variant="h6" fontWeight={500}>
                    {reviewStep === 0 && (isEditMode ? 'Edit Your Review' : 'Leave a Review')}
                    {reviewStep === 1 && 'Great! Tell us more...'}
                    {reviewStep === 2 && 'Extra credit: add a photo!'}
                    {reviewStep === 3 && 'Review Submitted!'}
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{
                p: 2.5,
                flex: 1,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '0px',
                    background: 'transparent',
                    display: 'none'
                },
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {/* STEP 1 */}
                {reviewStep === 0 && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            p: 0.5,
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            mb: 3,
                            height: 200,
                            width: '100%'
                        }}>
                            <Box
                                sx={{
                                    minWidth: 200,
                                    height: '100%',
                                    maxWidth: '40%',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '2.0px solid #e0e0e0',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                    bgcolor: '#fafafa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                        transform: 'scale(1.03)',
                                    }
                                }}
                                component={'img'}
                                src={reviewProduct?.image?.[0]
                                    ? `${baseUrl}/${reviewProduct.edited_image || reviewProduct.image[0]}`
                                    : ""}
                                alt=""
                            />
                            <Box textAlign="left">
                                <Typography fontSize={16} fontWeight={600}>
                                    {reviewProduct?.product_title?.replace(/<\/?[^>]+(>|$)/g, "")}
                                </Typography>
                                <Typography fontSize={13} color="text.secondary">
                                    {shopName}
                                </Typography>
                            </Box>
                        </Box>

                        <Typography fontSize={14} mb={1}>
                            Your review rating<strong>*</strong>
                            {reviewData.rating > 0 && (
                                <Typography component={"span"} mt={1} ml={1} fontSize={14} fontWeight={600}>
                                    {['', 'Disappointed', 'Not a fan', "It's okay", 'Like it', 'Love it'][reviewData.rating]}
                                </Typography>
                            )}
                        </Typography>
                        <Rating
                            size="large"
                            value={reviewData.rating}
                            onChange={(_, v) => setReviewData(p => ({ ...p, rating: v }))}
                            sx={{ fontSize: 40 }}
                        />

                        <Typography mt={3} mb={1} fontSize={14}>
                            Would you recommend this item?
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                            {[true, false].map(val => (
                                <Button
                                    key={String(val)}
                                    onClick={() => setReviewData(p => ({ ...p, recommend: val }))}
                                    sx={{
                                        px: 4,
                                        py: 1.2,
                                        borderRadius: 5,
                                        border: '1px solid',
                                        borderColor: reviewData.recommend === val ? '#000' : 'divider',
                                        bgcolor: reviewData.recommend === val ? '#000' : 'transparent',
                                        color: reviewData.recommend === val ? '#fff' : 'text.primary',
                                        fontSize: 15,
                                        ':hover': {
                                            borderColor: reviewData.recommend === val ? '#000' : 'divider',
                                            bgcolor: reviewData.recommend === val ? '#000' : 'transparent',
                                            color: reviewData.recommend === val ? '#fff' : 'text.primary',
                                        }
                                    }}
                                >
                                    {val ? '✓ Yes' : '✕ No'}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* STEP 2 */}
                {reviewStep === 1 && (
                    <Box>
                        {[
                            { label: 'Item quality', key: 'itemQuality' },
                            { label: 'Delivery', key: 'delivery' },
                            { label: 'Customer service', key: 'customerService' }
                        ].map(({ label, key }) => (
                            <Box key={key} mb={2}>
                                <Typography fontSize={13} color="text.secondary" mb={0.5}>{label}</Typography>
                                <Rating
                                    value={reviewData[key]}
                                    onChange={(_, v) => setReviewData(p => ({ ...p, [key]: v }))}
                                />
                            </Box>
                        ))}
                        <Typography fontSize={13} color="text.secondary" mb={0.5}>
                            Your review <span style={{ color: 'red' }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth multiline rows={5}
                            placeholder="What did you like or dislike?"
                            value={reviewData.review}
                            onChange={e => setReviewData(p => ({ ...p, review: e.target.value }))}
                        />
                        <Typography fontSize={11} color="text.secondary" mt={0.5}>
                            By submitting, you agree to our Review Policy
                        </Typography>
                    </Box>
                )}

                {/* STEP 3 - Photo Upload */}
                {reviewStep === 2 && (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, minHeight: "50px" }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography fontSize={16} fontWeight={600} mb={0.5}>
                                    {reviewData.photos.length + (reviewData.existingImageNames?.length || 0) < 5 ? "Extra credit: add a photo!" : "Great! You've added 5 images."}
                                </Typography>
                                <Typography fontSize={13} color="text.secondary">
                                    Show your appreciation and inspire the community! (optional)
                                </Typography>
                            </Box>

                            {reviewData.photos.length + (reviewData.existingImageNames?.length || 0) < 5 && (
                                <Button
                                    component="label"
                                    sx={{
                                        minWidth: 100,
                                        height: 200,
                                        width: 200,
                                        border: '2px dashed #ddd',
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 0.5,
                                        bgcolor: '#fafafa',
                                        textTransform: 'none',
                                        flexShrink: 0,
                                        '&:hover': {
                                            bgcolor: '#f2f2f2',
                                            borderColor: '#999'
                                        }
                                    }}
                                >
                                    <img
                                        src="/icons/camera.png"
                                        alt="upload"
                                        style={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'contain',
                                            opacity: 0.8
                                        }}
                                    />
                                    <Typography fontSize={11} color="text.secondary">
                                        Upload
                                    </Typography>
                                    <Typography fontSize={10} color="text.secondary">
                                        ({reviewData.photos.length + (reviewData.existingImageNames?.length || 0)}/5)
                                    </Typography>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={e => {
                                            const files = Array.from(e.target.files || []);
                                            const remaining = 5 - (reviewData.photos.length + (reviewData.existingImageNames?.length || 0));
                                            const newFiles = files.slice(0, remaining);
                                            setReviewData(p => ({
                                                ...p,
                                                photos: [...p.photos, ...newFiles]
                                            }));
                                        }}
                                    />
                                </Button>
                            )}
                        </Box>

                        {(reviewData.photoUrls?.length > 0 || reviewData.photos.length > 0) && (
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: 1.5,
                                    gridAutoRows: 'auto'
                                }}>
                                    {reviewData.photoUrls?.map((url, i) => (
                                        <Box key={`old-${i}`} sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const newPhotoUrls = reviewData.photoUrls.filter((_, idx) => idx !== i);
                                                    const newExistingImageNames = reviewData.existingImageNames.filter((_, idx) => idx !== i);
                                                    setReviewData(p => ({
                                                        ...p,
                                                        photoUrls: newPhotoUrls,
                                                        existingImageNames: newExistingImageNames
                                                    }));
                                                }}
                                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', width: 22, height: 22, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                                            >
                                                <CloseIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    {reviewData.photos.map((photo, i) => (
                                        <Box key={`new-${i}`} sx={{ position: 'relative', aspectRatio: '1/1', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                            <img src={URL.createObjectURL(photo)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                            <IconButton
                                                size="small"
                                                onClick={() => setReviewData(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }))}
                                                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', width: 22, height: 22, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                                            >
                                                <CloseIcon sx={{ fontSize: 12 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* STEP 4 - Success */}
                {reviewStep === 3 && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 300,
                        textAlign: 'center'
                    }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            bgcolor: '#E1F5EE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                            fontSize: 40,
                            color: '#2E7D64'
                        }}>
                            ✓
                        </Box>
                        <Typography variant="h6" fontWeight={500} mb={1}>
                            Thanks for your review!
                        </Typography>
                        <Typography fontSize={14} color="text.secondary" mb={3}>
                            Follow <strong>{shopName}</strong> for updates and special offers.
                        </Typography>
                        <Button
                            onClick={handleFollow}
                            variant="outlined"
                            startIcon={
                                <span style={{ color: isFollowing ? '#E91E63' : '#999', fontSize: 16 }}>
                                    ♥
                                </span>
                            }
                            sx={{
                                borderRadius: 20,
                                textTransform: 'none',
                                borderColor: isFollowing ? '#E91E63' : 'divider',
                                px: 3,
                                py: 1
                            }}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            {reviewStep < 3 && (
                <DialogActions sx={{
                    p: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <Button
                        onClick={() => setReviewStep(s => s - 1)}
                        sx={{
                            visibility: reviewStep === 0 ? 'hidden' : 'visible',
                            color: 'text.secondary',
                            textTransform: 'none'
                        }}
                    >
                        Back
                    </Button>

                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                        {[0, 1, 2].map(i => (
                            <Box key={i} sx={{
                                width: 24,
                                height: 3,
                                borderRadius: 1.5,
                                bgcolor: i === reviewStep ? '#000' : '#e0e0e0'
                            }} />
                        ))}
                    </Box>

                    <Button
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            bgcolor: '#000',
                            color: '#fff',
                            borderRadius: 2,
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#333' }
                        }}
                        onClick={() => {
                            if (reviewStep === 0) {
                                if (!reviewData.rating) {
                                    addToast("Please give a rating", { appearance: "error", autoDismiss: true });
                                    return;
                                }
                                setReviewStep(1);
                                return;
                            }
                            if (reviewStep === 1) {
                                if (!reviewData.itemQuality || !reviewData.delivery || !reviewData.review) {
                                    addToast("Please fill all fields", { appearance: "error", autoDismiss: true });
                                    return;
                                }
                                setReviewStep(2);
                                return;
                            }
                            if (reviewStep === 2) {
                                submitReviewHandler();
                                return;
                            }
                            setReviewStep(s => s + 1);
                        }}
                    >
                        {reviewStep === 2 ? (reviewData.photos.length > 0 ? `Submit ${reviewData.photos.length + reviewData.existingImageNames?.length} photo${reviewData.photos.length > 1 ? 's' : ''}` : 'Skip') : 'Next'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ReviewPopup;