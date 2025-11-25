import React from 'react';
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const DeliveryAndReturnPolicy = ({ shippingTemplate, exchangePolicy }) => {
    return (
        <Box>
            {/* Shipping Policy Section */}
            {shippingTemplate && (
                <Accordion defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="bold">
                            Shipping Information
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ShippingPolicy shippingTemplate={shippingTemplate} />
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Return & Exchange Policy Section */}
            {exchangePolicy && (
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" fontWeight="bold">
                            Return & Exchange Policy
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ReturnExchangePolicy exchangePolicy={exchangePolicy} />
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Default message if no policies */}
            {!shippingTemplate && !exchangePolicy && (
                <Typography color="textSecondary" textAlign="center" py={4}>
                    No shipping and return policies available for this product.
                </Typography>
            )}
        </Box>
    );
};

const ShippingPolicy = ({ shippingTemplate }) => {
    if (!shippingTemplate) return null;

    return (
        <Box>
            {/* Shipping Cost Table */}
            {shippingTemplate.shippingCosts?.length > 0 && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>
                                    Shipping Method
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>
                                    Cost
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>
                                    Estimated Delivery
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {shippingTemplate.shippingCosts.map((cost, index) => (
                                <TableRow key={index}>
                                    <TableCell>{cost.shippingMethod || 'Standard Shipping'}</TableCell>
                                    <TableCell>
                                        {cost.cost === 0 ? 'Free' : `$${cost.cost}`}
                                    </TableCell>
                                    <TableCell>
                                        {cost.estimatedDelivery || '5-7 business days'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Shipping Details */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Shipping Details
                </Typography>
                <Typography variant="body2" paragraph>
                    {shippingTemplate.shippingDescription ||
                        'We aim to process and ship all orders within 1-2 business days. You will receive a tracking number once your order has been shipped.'}
                </Typography>

                {shippingTemplate.shipsFrom && (
                    <Typography variant="body2" fontWeight="bold">
                        Ships from: {shippingTemplate.shipsFrom}
                    </Typography>
                )}
            </Box>

            {/* Processing Time */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Processing Time
                </Typography>
                <Typography variant="body2">
                    {shippingTemplate.processingTime ||
                        'The time we need to prepare an order for shipping varies. For details, see individual product descriptions.'}
                </Typography>
            </Box>

            {/* Custom Shipping Information */}
            {shippingTemplate.customShippingInfo && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Additional Information
                    </Typography>
                    <Typography variant="body2">
                        {shippingTemplate.customShippingInfo}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

const ReturnExchangePolicy = ({ exchangePolicy }) => {
    if (!exchangePolicy) return null;

    return (
        <Box>
            {/* Return Policy Summary */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Return Policy
                </Typography>
                <Typography variant="body2" paragraph>
                    {exchangePolicy.returnDescription ||
                        'We want you to be completely satisfied with your purchase. If you\'re not happy with your order, we accept returns within a specified period.'}
                </Typography>
            </Box>

            {/* Return Period */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Return Period
                </Typography>
                <Typography variant="body2">
                    {exchangePolicy.returnDays
                        ? `Items can be returned within ${exchangePolicy.returnDays} days of delivery.`
                        : 'Items can be returned within 30 days of delivery.'
                    }
                </Typography>
            </Box>

            {/* Return Conditions */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Return Conditions
                </Typography>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    <li>
                        <Typography variant="body2">
                            Item must be in original condition with tags attached
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            Item must be unused and in its original packaging
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2">
                            Proof of purchase is required
                        </Typography>
                    </li>
                    {exchangePolicy.returnConditions && (
                        <li>
                            <Typography variant="body2">
                                {exchangePolicy.returnConditions}
                            </Typography>
                        </li>
                    )}
                </ul>
            </Box>

            {/* Non-returnable Items */}
            {(exchangePolicy.nonReturnableItems || exchangePolicy.nonReturnable) && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom color="error">
                        Non-returnable Items
                    </Typography>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        {exchangePolicy.nonReturnableItems?.map((item, index) => (
                            <li key={index}>
                                <Typography variant="body2">{item}</Typography>
                            </li>
                        ))}
                        {exchangePolicy.nonReturnable && (
                            <li>
                                <Typography variant="body2">
                                    {exchangePolicy.nonReturnable}
                                </Typography>
                            </li>
                        )}
                    </ul>
                </Box>
            )}

            {/* Exchange Policy */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Exchange Policy
                </Typography>
                <Typography variant="body2" paragraph>
                    {exchangePolicy.exchangeDescription ||
                        'We offer exchanges for items in the same price range. If you need a different size or color, please contact us.'}
                </Typography>
            </Box>

            {/* Refund Policy */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Refunds
                </Typography>
                <Typography variant="body2" paragraph>
                    {exchangePolicy.refundDescription ||
                        'Once we receive your return, we will inspect it and process your refund. The refund will be issued to your original payment method within 5-10 business days.'}
                </Typography>

                {exchangePolicy.refundProcessingTime && (
                    <Typography variant="body2" fontWeight="bold">
                        Refund processing time: {exchangePolicy.refundProcessingTime}
                    </Typography>
                )}
            </Box>

            {/* Return Shipping */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Return Shipping
                </Typography>
                <Typography variant="body2">
                    {exchangePolicy.returnShipping ||
                        'Customers are responsible for return shipping costs unless the return is due to our error or a defective product.'}
                </Typography>
            </Box>

            {/* Contact Information */}
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Need Help?
                </Typography>
                <Typography variant="body2">
                    If you have any questions about returns or exchanges, please contact our customer service team.
                </Typography>
            </Box>
        </Box>
    );
};

// Helper component for policy sections
const PolicySection = ({ title, children }) => (
    <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
            {title}
        </Typography>
        {children}
    </Box>
);

export default DeliveryAndReturnPolicy;
