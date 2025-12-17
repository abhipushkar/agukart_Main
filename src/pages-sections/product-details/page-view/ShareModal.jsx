import React from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemButton
} from '@mui/material';
import {
    Close as CloseIcon,
    MailOutline as MailOutlineIcon,
    Facebook as FacebookIcon,
    X as XIcon,
    Pinterest as PinterestIcon,
    FileCopy as FileCopyIcon
} from '@mui/icons-material';

const ShareModal = ({ open, onClose, product, usercredentials }) => {
    const shareUrl = usercredentials?.affiliate_code
        ? `${process.env.NEXT_PUBLIC_WEB_URL}/products/${product?._id}&affiliate_code=${usercredentials?.affiliate_code}`
        : `${process.env.NEXT_PUBLIC_WEB_URL}/products/${product?._id}`;

    const shareTitle = encodeURIComponent(product?.product_title || '');
    const encodedShareUrl = encodeURIComponent(shareUrl);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        // You might want to show a toast notification here
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const shareLinks = [
        {
            name: 'Email',
            icon: <MailOutlineIcon />,
            href: `mailto:?subject=${shareTitle}&body=${encodedShareUrl}`,
            onClick: null
        },
        {
            name: 'WhatsApp',
            icon: (
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                    alt="WhatsApp"
                    width="24px"
                    height="24px"
                />
            ),
            href: `https://api.whatsapp.com/send?text=${shareTitle}%20${encodedShareUrl}`,
            onClick: null
        },
        {
            name: 'Facebook',
            icon: <FacebookIcon sx={{ color: "#1877f2" }} />,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}&quote=${shareTitle}`,
            onClick: null
        },
        {
            name: 'Twitter',
            icon: <XIcon />,
            href: `https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${shareTitle}`,
            onClick: null
        },
        {
            name: 'Pinterest',
            icon: <PinterestIcon sx={{ color: "#d11e16" }} />,
            href: `https://pinterest.com/pin/create/button/?url=${encodedShareUrl}&media=${product?.image_url}${product?.image?.[0]}&description=${shareTitle}`,
            onClick: null
        },
        {
            name: 'Copy Link',
            icon: <FileCopyIcon />,
            href: null,
            onClick: copyToClipboard
        }
    ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="share-modal-title"
            aria-describedby="share-modal-description"
        >
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    maxWidth: "800px",
                    width: "90%",
                    maxWidth: { xs: "90%", sm: "600px" },
                    backgroundColor: "background.paper",
                    boxShadow: 24,
                    borderRadius: "8px",
                    p: { xs: 2, sm: 4 },
                    maxHeight: "90vh",
                    overflow: "auto"
                }}
            >
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography id="share-modal-title" variant="h5" fontWeight={600}>
                        Share this with friends and family
                    </Typography>
                    <Button
                        onClick={onClose}
                        sx={{
                            background: "#ededed",
                            minWidth: "auto",
                            padding: "8px",
                            borderRadius: "50%"
                        }}
                    >
                        <CloseIcon />
                    </Button>
                </Box>

                {/* Product Preview */}
                <Box
                    mt={2}
                    p={2}
                    sx={{
                        border: "1px solid #f0f0f0",
                        boxShadow: "0 0 2px #939393",
                        borderRadius: "6px",
                        mb: 3
                    }}
                >
                    <Box
                        sx={{
                            img: {
                                width: "100%",
                                height: { xs: "200px", sm: "300px" },
                                objectFit: "contain",
                            },
                        }}
                    >
                        <img
                            src={`${product?.image_url}${product?.image?.[0]}`}
                            alt={product?.product_title}
                            className="img-fluid"
                        />
                    </Box>
                    <Box sx={{ background: "#f9f9f9", padding: "12px 16px" }}>
                        <Typography
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                color: "#000",
                                fontWeight: 500,
                                mb: 0.5
                            }}
                        >
                            {product?.product_title}
                        </Typography>
                        <Typography
                            sx={{
                                color: "#676767",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                fontSize: "0.875rem"
                            }}
                        >
                            {shareUrl}
                        </Typography>
                    </Box>
                </Box>

                {/* Share Options */}
                <List
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                        padding: 0
                    }}
                >
                    {shareLinks.map((platform, index) => (
                        <ListItem
                            key={platform.name}
                            sx={{
                                padding: "8px",
                                width: { xs: "50%", sm: "33.333%" },
                                flex: "0 0 auto"
                            }}
                        >
                            {platform.href ? (
                                <ListItemButton
                                    component="a"
                                    href={platform.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        width: "100%",
                                        background: "#f3f5f6",
                                        textAlign: "center",
                                        gap: "10px",
                                        justifyContent: "center",
                                        color: "#000",
                                        fontWeight: 500,
                                        p: "12px",
                                        borderRadius: "6px",
                                        flexDirection: "column",
                                        height: "100%",
                                        minHeight: "80px",
                                        "&:hover": {
                                            background: "#e8eaeb",
                                        }
                                    }}
                                >
                                    {platform.icon}
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {platform.name}
                                    </Typography>
                                </ListItemButton>
                            ) : (
                                <ListItemButton
                                    onClick={platform.onClick}
                                    sx={{
                                        width: "100%",
                                        background: "#f3f5f6",
                                        textAlign: "center",
                                        gap: "10px",
                                        justifyContent: "center",
                                        color: "#000",
                                        fontWeight: 500,
                                        p: "12px",
                                        borderRadius: "6px",
                                        flexDirection: "column",
                                        height: "100%",
                                        minHeight: "80px",
                                        "&:hover": {
                                            background: "#e8eaeb",
                                        }
                                    }}
                                >
                                    {platform.icon}
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {platform.name}
                                    </Typography>
                                </ListItemButton>
                            )}
                        </ListItem>
                    ))}
                </List>

                {/* Additional Info */}
                <Box sx={{ mt: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="textSecondary">
                        Share this product with your friends and family
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default ShareModal;
