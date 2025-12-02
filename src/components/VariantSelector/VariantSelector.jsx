import React, { useState, useRef, useEffect } from 'react';
import {
    FormControl,
    Select,
    MenuItem,
    Grid,
    Typography,
    Box,
    Tooltip,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import parse from 'html-react-parser';

const VariantSelector = ({
    variant,
    selectedValue,
    onChange,
    onHover,
    onHoverOut,
    error,
    currency,
    filterVariantAttributes = [],
    isAttributeCombinationSoldOut,
    selectedVariants,
    calculateAttributeData
}) => {
    const [guideOpen, setGuideOpen] = useState(false);
    const [currentGuide, setCurrentGuide] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const gridContainerRef = useRef(null);

    // Check if variant has guide information
    const hasGuide = variant.guide_file || variant.guide_name || variant.guide_description;

    // Calculate total pages
    const totalPages = Math.ceil(variant.attributes.length / itemsPerPage);

    // Get current page items
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, variant.attributes.length);
    const currentPageItems = variant.attributes.slice(startIndex, endIndex);

    // Calculate items per row
    const itemsPerRow = Math.ceil(itemsPerPage / 2);

    const renderAttributePrice = (attribute) => {
        if (variant.type === 'parent') {
            const variantAttr = filterVariantAttributes.find(attr =>
                attr._id === attribute.id || attr.attribute_value === attribute.value
            );

            if (!variantAttr) return null;

            const { minPrice, maxPrice, minQuantity, maxQuantity, isCheckedQuantity } = variantAttr;

            if (minQuantity === 0 && maxQuantity === 0 && isCheckedQuantity) {
                return " [Sold Out]";
            }

            if (minPrice !== 0) {
                if (minPrice === maxPrice) {
                    return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)})`;
                }
                return ` (${currency?.symbol}${(minPrice * currency?.rate).toFixed(2)} - ${currency?.symbol}${(maxPrice * currency?.rate).toFixed(2)})`;
            }

            return null;
        } else if (variant.type === 'internal') {
            // Use calculateAttributeData if available
            let attributeData = {};

            if (calculateAttributeData && selectedVariants) {
                attributeData = calculateAttributeData(attribute.id, selectedVariants);
            } else {
                // Fallback to filterVariantAttributes
                const variantAttr = filterVariantAttributes.find(attr =>
                    attr._id === attribute.id || attr.attribute_value === attribute.value
                );

                if (variantAttr) {
                    attributeData = {
                        price: variantAttr.price,
                        quantity: variantAttr.quantity,
                        priceRange: variantAttr.priceRange,
                        quantityRange: variantAttr.quantityRange,
                        isSoldOut: variantAttr.isSoldOut
                    };
                }
            }

            const { price, priceRange, quantity, quantityRange, isSoldOut } = attributeData;

            // Check if sold out
            if (isSoldOut || (quantity !== null && quantity === 0)) {
                return " [Sold Out]";
            }

            // Show price info
            let priceText = '';

            if (price !== null && price !== undefined) {
                priceText = ` (${currency?.symbol}${(price * currency?.rate).toFixed(2)})`;
            } else if (priceRange) {
                priceText = ` (${currency?.symbol}${(priceRange.min * currency?.rate).toFixed(2)} - ${currency?.symbol}${(priceRange.max * currency?.rate).toFixed(2)})`;
            }

            // Add quantity info if available
            let quantityText = '';
            if (quantity !== null && quantity !== undefined) {
                quantityText = ` [${quantity} in stock]`;
            } else if (quantityRange) {
                quantityText = ` [${quantityRange.min}-${quantityRange.max} in stock]`;
            }

            return priceText + quantityText;
        }

        return null;
    };

    const isAttributeDisabled = (attribute) => {
        if (variant.type === 'internal') {
            let attributeData = {};

            if (calculateAttributeData && selectedVariants) {
                attributeData = calculateAttributeData(attribute.id, selectedVariants);
            } else {
                const variantAttr = filterVariantAttributes.find(attr =>
                    attr._id === attribute.id || attr.attribute_value === attribute.value
                );

                if (variantAttr) {
                    attributeData = {
                        isSoldOut: variantAttr.isSoldOut,
                        quantity: variantAttr.quantity
                    };
                }
            }

            if (attributeData.isSoldOut) {
                return true;
            }

            if (attributeData.quantity === 0) {
                return true;
            }

            if (isAttributeCombinationSoldOut && selectedVariants) {
                return isAttributeCombinationSoldOut(attribute.id, selectedVariants);
            }

            return false;
        }

        if (isAttributeCombinationSoldOut && selectedVariants) {
            const isSoldOut = isAttributeCombinationSoldOut(attribute.id, selectedVariants);
            if (isSoldOut) {
                return true;
            }
        }

        const variantAttr = filterVariantAttributes.find(attr =>
            attr._id === attribute.id || attr.attribute_value === attribute.value
        );

        return variantAttr?.minQuantity === 0 &&
            variantAttr?.maxQuantity === 0 &&
            variantAttr?.isCheckedQuantity;
    };

    const getPreviewImage = (attribute) => {
        if (variant.type === 'parent') {
            const variantAttr = filterVariantAttributes.find(attr =>
                attr._id === attribute.id || attr.attribute_value === attribute.value
            );
            return variantAttr?.preview_image || '';
        }

        return attribute.edit_preview_image || attribute.preview_image || '';
    };

    const handleGuideClick = () => {
        setCurrentGuide({
            name: variant.guide_name,
            file: variant.guide_file,
            type: variant.guide_type,
            description: variant.guide_description
        });
        setGuideOpen(true);
    };

    const renderGuideModal = () => (
        <Dialog
            open={guideOpen}
            onClose={() => setGuideOpen(false)}
            maxWidth="md"
            fullWidth
            sx={{
                '& .MuiDialog-paper': {
                    maxWidth: '90vw',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div">
                    {currentGuide?.name || `${variant.name} Guide`}
                </Typography>
                <IconButton
                    aria-label="close"
                    onClick={() => setGuideOpen(false)}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                {currentGuide?.description && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" component="div">
                            {parse(currentGuide.description)}
                        </Typography>
                    </Box>
                )}

                {currentGuide?.file && currentGuide?.type === 'image' && (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <img
                            src={currentGuide.file}
                            alt={currentGuide.name || 'Guide Image'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                    </Box>
                )}

                {currentGuide?.file && currentGuide?.type === 'video' && (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <video
                            controls
                            style={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                borderRadius: '8px'
                            }}
                        >
                            <source src={currentGuide.file} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </Box>
                )}

                {currentGuide?.file && currentGuide?.type === 'document' && (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Button
                            variant="contained"
                            href={currentGuide.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 2 }}
                        >
                            Download Guide Document
                        </Button>
                    </Box>
                )}

                {!currentGuide?.file && !currentGuide?.description && (
                    <Typography color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                        No guide content available
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setGuideOpen(false)} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (direction === 'next' && currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const row1Items = currentPageItems.slice(0, itemsPerRow);
    const row2Items = currentPageItems.slice(itemsPerRow);

    const renderParentVariantGrid = () => {
        return (
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: "17px", fontWeight: 600 }}>
                        {variant.name}
                        <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>
                    </Typography>

                    {hasGuide && (
                        <Button
                            startIcon={<HelpOutlineIcon />}
                            onClick={handleGuideClick}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '12px',
                                padding: '2px 8px',
                                minWidth: 'auto',
                                textTransform: 'none',
                                borderColor: '#D23F57',
                                color: '#D23F57',
                                '&:hover': {
                                    borderColor: '#b32e44',
                                    backgroundColor: 'rgba(210, 63, 87, 0.04)'
                                }
                            }}
                        >
                            Show Guide
                        </Button>
                    )}
                </Box>

                <Box sx={{ mb: 1 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        gap: 1.5,
                        mb: 1.5
                    }}>
                        {row1Items.map((attr) => (
                            <VariantButton
                                key={attr.id}
                                attr={attr}
                                isSelected={selectedValue === attr.id}
                                isDisabled={isAttributeDisabled(attr)}
                                onChange={onChange}
                                onHover={onHover}
                                onHoverOut={onHoverOut}
                                variantId={variant.id}
                                priceText={renderAttributePrice(attr)}
                                getPreviewImage={getPreviewImage}
                            />
                        ))}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        gap: 1.5
                    }}>
                        {row2Items.map((attr) => (
                            <VariantButton
                                key={attr.id}
                                attr={attr}
                                isSelected={selectedValue === attr.id}
                                isDisabled={isAttributeDisabled(attr)}
                                onChange={onChange}
                                onHover={onHover}
                                onHoverOut={onHoverOut}
                                variantId={variant.id}
                                priceText={renderAttributePrice(attr)}
                                getPreviewImage={getPreviewImage}
                            />
                        ))}
                    </Box>
                </Box>

                {totalPages > 1 && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: 2,
                        gap: 2
                    }}>
                        <IconButton
                            onClick={() => handlePageChange('prev')}
                            disabled={currentPage === 0}
                            sx={{
                                p: 0.5,
                                backgroundColor: currentPage === 0 ? '#f5f5f5' : 'white',
                                border: '1px solid #ddd',
                                '&:hover:not(:disabled)': {
                                    backgroundColor: '#f8f8f8'
                                },
                                '&:disabled': {
                                    opacity: 0.5,
                                    cursor: 'not-allowed'
                                }
                            }}
                        >
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>

                        <Typography variant="body2" sx={{
                            fontSize: '13px',
                            color: '#666',
                            minWidth: '60px',
                            textAlign: 'center'
                        }}>
                            {currentPage + 1} / {totalPages}
                        </Typography>

                        <IconButton
                            onClick={() => handlePageChange('next')}
                            disabled={currentPage === totalPages - 1}
                            sx={{
                                p: 0.5,
                                backgroundColor: currentPage === totalPages - 1 ? '#f5f5f5' : 'white',
                                border: '1px solid #ddd',
                                '&:hover:not(:disabled)': {
                                    backgroundColor: '#f8f8f8'
                                },
                                '&:disabled': {
                                    opacity: 0.5,
                                    cursor: 'not-allowed'
                                }
                            }}
                        >
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}

                {error && (
                    <Typography color="error" sx={{ mt: 1, fontSize: '14px' }}>
                        {error}
                    </Typography>
                )}

                {renderGuideModal()}
            </Box>
        );
    };

    const renderInternalVariantDropdown = () => {
        return (
            <Grid item xs={12} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: "17px" }}>
                        {variant.name}
                    </Typography>

                    {hasGuide && (
                        <Button
                            startIcon={<HelpOutlineIcon />}
                            onClick={handleGuideClick}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '12px',
                                padding: '2px 8px',
                                minWidth: 'auto',
                                textTransform: 'none',
                                borderColor: '#D23F57',
                                color: '#D23F57',
                                '&:hover': {
                                    borderColor: '#b32e44',
                                    backgroundColor: 'rgba(210, 63, 87, 0.04)'
                                }
                            }}
                        >
                            Show Guide
                        </Button>
                    )}
                </Box>

                <FormControl fullWidth>
                    <Select
                        value={selectedValue || ""}
                        displayEmpty
                        onChange={(e) => {
                            console.log(`Internal variant ${variant.id} changed to:`, e.target.value);
                            onChange(variant.id, e.target.value);
                        }}
                        renderValue={(selected) => {
                            if (!selected) return "Select an option";
                            const selectedAttr = variant.attributes.find(attr =>
                                attr.id === selected || attr.value === selected
                            );
                            return selectedAttr?.value || "Select an option";
                        }}
                        sx={{
                            border: "none",
                            background: "#fff",
                            height: "40px",
                            boxShadow: "0 0 3px #000",
                            ".MuiOutlinedInput-notchedOutline": { border: "none" },
                        }}
                    >
                        <MenuItem value="">Select an option</MenuItem>
                        {variant.attributes.map((attr) => {
                            const isDisabled = isAttributeDisabled(attr);
                            const previewImage = getPreviewImage(attr);
                            const priceText = renderAttributePrice(attr);

                            // Get attribute data for tooltip
                            let attributeData = {};
                            let tooltipContent = attr.value;

                            if (calculateAttributeData && selectedVariants) {
                                attributeData = calculateAttributeData(attr.id, selectedVariants);
                            } else {
                                const variantAttr = filterVariantAttributes.find(fAttr =>
                                    fAttr._id === attr.id || fAttr.attribute_value === attr.value
                                );

                                if (variantAttr) {
                                    attributeData = {
                                        price: variantAttr.price,
                                        priceRange: variantAttr.priceRange,
                                        quantity: variantAttr.quantity,
                                        quantityRange: variantAttr.quantityRange,
                                        isSoldOut: variantAttr.isSoldOut
                                    };
                                }
                            }

                            // Build tooltip content
                            if (attributeData.price !== null) {
                                tooltipContent += `\nPrice: ${currency?.symbol}${(attributeData.price * currency?.rate).toFixed(2)}`;
                            } else if (attributeData.priceRange) {
                                tooltipContent += `\nPrice Range: ${currency?.symbol}${(attributeData.priceRange.min * currency?.rate).toFixed(2)} - ${currency?.symbol}${(attributeData.priceRange.max * currency?.rate).toFixed(2)}`;
                            }

                            if (attributeData.quantity !== null) {
                                tooltipContent += `\nQuantity: ${attributeData.quantity}`;
                            } else if (attributeData.quantityRange) {
                                tooltipContent += `\nQuantity Range: ${attributeData.quantityRange.min}-${attributeData.quantityRange.max}`;
                            }

                            if (isDisabled) {
                                tooltipContent += '\n(Sold Out)';
                            }

                            return (
                                <MenuItem
                                    key={attr.id}
                                    value={attr.id}
                                    disabled={isDisabled}
                                    sx={{
                                        opacity: isDisabled ? 0.5 : 1,
                                        backgroundColor: isDisabled ? '#f5f5f5' : 'inherit',
                                        '&.Mui-disabled': {
                                            opacity: 0.5
                                        }
                                    }}
                                >
                                    <Tooltip
                                        title={
                                            <Box sx={{ p: 1 }}>
                                                {previewImage ? (
                                                    <img
                                                        src={previewImage}
                                                        alt={attr.value}
                                                        style={{
                                                            width: 100,
                                                            height: 100,
                                                            objectFit: 'cover',
                                                            marginBottom: 8,
                                                            borderRadius: 4
                                                        }}
                                                    />
                                                ) : null}
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                    {tooltipContent}
                                                </Typography>
                                            </Box>
                                        }
                                        placement='left-start'
                                        arrow
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            opacity: isDisabled ? 0.6 : 1
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                {attr.thumbnail && (
                                                    <img
                                                        src={attr.thumbnail}
                                                        alt=""
                                                        style={{
                                                            width: '24px',
                                                            height: '24px',
                                                            marginRight: '8px',
                                                            borderRadius: '3px',
                                                            objectFit: 'cover',
                                                            filter: isDisabled ? 'grayscale(100%)' : 'none'
                                                        }}
                                                    />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <span style={{
                                                        color: isDisabled ? '#999' : 'inherit',
                                                        textDecoration: isDisabled ? 'line-through' : 'none',
                                                        display: 'block'
                                                    }}>
                                                        {attr.value}
                                                    </span>
                                                    {priceText && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: isDisabled ? '#d32f2f' : '#666',
                                                                fontSize: '11px',
                                                                display: 'block',
                                                                mt: 0.5
                                                            }}
                                                        >
                                                            {priceText}
                                                        </Typography>
                                                    )}
                                                </div>
                                            </div>
                                            {isDisabled && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#d32f2f',
                                                        fontWeight: 'bold',
                                                        fontSize: '10px',
                                                        marginLeft: '8px',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Sold Out
                                                </Typography>
                                            )}
                                        </div>
                                    </Tooltip>
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                {error && (
                    <Typography color="error" sx={{ mt: 1, fontSize: '14px' }}>
                        {error}
                    </Typography>
                )}

                {renderGuideModal()}
            </Grid>
        );
    };

    if (variant.type === 'parent') {
        return renderParentVariantGrid();
    } else {
        return renderInternalVariantDropdown();
    }
};

const VariantButton = ({
    attr,
    isSelected,
    isDisabled,
    onChange,
    onHover,
    onHoverOut,
    variantId,
    priceText,
    getPreviewImage
}) => {
    return (
        <Box sx={{
            flexShrink: 0,
            width: '69px',
            position: 'relative'
        }}>
            <Tooltip
                title={isDisabled ? "Sold Out" : null}
                placement="top"
                arrow
            >
                <Button
                    onClick={() => {
                        if (!isDisabled) {
                            console.log(`Parent variant ${variantId} changed to:`, attr.id);
                            onChange(variantId, attr.id);
                        }
                    }}
                    onMouseEnter={() => !isDisabled && onHover && onHover(attr.id)}
                    onMouseLeave={() => !isDisabled && onHoverOut && onHoverOut()}
                    disabled={isDisabled}
                    sx={{
                        width: '69px',
                        height: '69px',
                        minWidth: '69px',
                        minHeight: '69px',
                        padding: 0,
                        border: isDisabled ? '1px solid #ccc' : '1px solid #D23F57',
                        borderRadius: '8px',
                        backgroundColor: isDisabled ? '#f5f5f5' : '#ffffff',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        outline: isSelected ? '3px solid #D23F57' : "",
                        outlineOffset: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 0,
                        '&:hover:not(:disabled)': {
                            borderColor: isSelected ? '#000' : '#d84f66ff',
                            boxShadow: '0 0 0 3px rgba(0, 113, 133, 0.1)'
                        },
                        '&:disabled': {
                            opacity: 0.4,
                            cursor: 'not-allowed',
                            '& img': {
                                filter: 'grayscale(100%)'
                            }
                        }
                    }}
                >
                    {attr.thumbnail ? (
                        <img
                            src={attr.thumbnail}
                            alt={attr.value}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '6px'
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isDisabled ? '#f0f0f0' : '#f8f9fa',
                                color: isDisabled ? '#999' : '#6c757d',
                                fontSize: '12px',
                                fontWeight: isSelected ? 600 : 400,
                                textAlign: 'center',
                                padding: '4px',
                                wordBreak: 'break-word'
                            }}
                        >
                            {attr.value}
                        </Box>
                    )}
                    {isDisabled && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                zIndex: 10,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#d32f2f',
                                    fontWeight: 'bold',
                                    fontSize: '10px',
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    padding: '2px 4px',
                                    borderRadius: '3px'
                                }}
                            >
                                Sold Out
                            </Typography>
                        </Box>
                    )}
                </Button>
            </Tooltip>

            <Box sx={{ textAlign: 'center', mt: 0.5 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: '12px',
                        fontWeight: isSelected ? 600 : 400,
                        color: isDisabled ? '#999' : 'inherit',
                        lineHeight: 1.2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {attr.thumbnail ? attr.value : null}
                </Typography>
                {priceText && (
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '10px',
                            color: isDisabled ? '#d32f2f' : '#666666',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {priceText}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default VariantSelector;
