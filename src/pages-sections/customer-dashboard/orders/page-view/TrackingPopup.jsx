import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Divider,
    Paper,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const TrackingPopup = ({ open, onClose, order }) => {
    const [trackingHistory, setTrackingHistory] = useState([]);
    const [selectedShipment, setSelectedShipment] = useState(null);

    // Get shipments from the first item in the order
    const shipments = order?.items?.[0]?.shipments || [];

    // Sort shipments by shipped_date (newest first)
    const sortedShipments = [...shipments].sort((a, b) =>
        new Date(b.shipped_date) - new Date(a.shipped_date)
    );

    useEffect(() => {
        if (sortedShipments.length > 0) {
            setSelectedShipment(sortedShipments[0]);
            // Mock tracking history - replace with actual data from API
            generateMockTrackingHistory(sortedShipments[0]);
        }
    }, [order]);

    const generateMockTrackingHistory = (shipment) => {
        // This should be replaced with actual tracking history from your API
        const mockHistory = [
            {
                date: "2026-03-05T14:41:00",
                location: "CHARLOTTE, NC 28202, US",
                status: "Delivered, In/At Mailbox",
                completed: true
            },
            {
                date: "2026-03-04T06:10:00",
                location: "CHARLOTTE, NC 28202, US",
                status: "Out for Delivery",
                completed: true
            },
            {
                date: "2026-02-25T04:15:00",
                location: "CHARLOTTE, NC 28204, US",
                status: "Arrived at USPS Facility",
                completed: true
            },
            {
                date: "2026-02-18T02:35:00",
                location: "US",
                status: "Picked Up By Shipping Partner, USPS Awaiting Item",
                completed: true
            },
            {
                date: "2026-02-10T15:30:00",
                location: "US",
                status: "Shipping Label Created, USPS Awaiting Item (Shipped)",
                completed: true
            }
        ];
        setTrackingHistory(mockHistory);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleTrackClick = (trackingNumber) => {
        // Open tracking URL if available
        if (selectedShipment?.service?.tracking_url) {
            window.open(selectedShipment.service.tracking_url.replace('{tracking_id}', trackingNumber), '_blank');
        } else {
            // Default tracking URL - replace with actual logic
            window.open(`https://track.shipping.com/${trackingNumber}`, '_blank');
        }
    };

    const getLatestShipment = () => {
        return sortedShipments[0];
    };

    const latestShipment = getLatestShipment();
    
    const deliveryStatus = (order.items?.[0]?.delivery_status || order?.delivery_status) === "No tracking"
        ? { tracking: false, status: "Shipped" } : { tracking: true, status: (order.items?.[0]?.delivery_status || order?.delivery_status) };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh',
                    maxWidth: {
                        md: '60vw'
                    }
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: '#ddd',
                pb: 2
            }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Shipment Details
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
                <Typography fontSize={18} pt={2}>
                    Order Status: <strong>{deliveryStatus.status}</strong>
                </Typography> 
                {shipments.length > 0 ? (
                    <Stack spacing={3} pt={2}>
                        {shipments.map((shipment, index) => (
                            <Box key={shipment._id || index}>
                                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                                    {/* <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                        Shipment {index + 1}
                                    </Typography> */}
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: '0.8fr 1.2fr auto' },
                                            gap: 2,
                                            alignItems: { xs: 'flex-start', md: 'center' }
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            {(shipment.shipped_date && <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Shipped on
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatDate(shipment.shipped_date)}
                                                </Typography>
                                            </Box>)}
                                            {/* <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Delivery Status
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {shipment.delivery_status}
                                                </Typography>
                                            </Box> */}
                                            {shipment.delivered_date && (<Box sx={{ display: 'flex', gap: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Delivered on
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {formatDate(shipment.delivered_date)}
                                                </Typography>
                                            </Box>)}
                                        </Stack>

                                        <Stack spacing={1}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Tracking No.
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {shipment.trackingNumber}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Tracking Service
                                                </Typography>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {shipment.courierName}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Button
                                            size="small"
                                            startIcon={<OpenInNewIcon />}
                                            onClick={() => handleTrackClick(shipment.trackingNumber)}
                                            sx={{
                                                textTransform: "none",
                                                whiteSpace: "nowrap",
                                                px: 2,
                                                borderRadius: "14px",
                                                color: "#222",
                                                background: `
                                                    linear-gradient(rgba(255,255,255,0.6), rgba(240,240,240,0.4)),
                                                    repeating-linear-gradient(0deg,rgba(0,0,0,0.015) 0px,rgba(0,0,0,0.015) 1px,transparent 1px,transparent 2px)`,
                                                backdropFilter: "blur(12px)",
                                                border: "1px solid rgba(0,0,0,0.08)",
                                                boxShadow: "0 4px 12px rgba(46, 46, 46, 0.06)",
                                                transition: "all 0.25s ease",
                                                "&:hover": {
                                                    background: `linear-gradient(rgba(255,255,255,0.8), rgba(240,240,240,0.6)),repeating-linear-gradient(
                                                        0deg,rgba(0,0,0,0.02) 0px,rgba(0,0,0,0.02) 1px,transparent 1px,transparent 2px)`,
                                                    transform: "translateY(-1px)",
                                                },
                                            }}
                                        >
                                            Track it
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <LocalShippingIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography color="text.secondary">
                            No tracking information available
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{
                p: 2,
                borderTop: 1,
                borderColor: "#dddddd",
                justifyContent: 'flex-end'
            }}>
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TrackingPopup;
