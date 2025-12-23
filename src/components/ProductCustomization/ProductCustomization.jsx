import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Grid,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const ProductCustomization = ({
    customizationData,
    selectedDropdowns,
    customizationText,
    onDropdownChange,
    onTextChange,
    validationErrors,
    currency
}) => {
    if (!customizationData) return null;

    const [isExpanded, setIsExpanded] = useState((customizationData.isExpanded === "true" || customizationData.isExpanded === true) || false);

    return (
        <Box sx={{ my: 1 }}>
            <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: "600", color: "gray", mb: 2 }}>
                {customizationData?.label}
            </Typography>

            <Accordion expanded={isExpanded} onChange={() => setIsExpanded(!isExpanded)} sx={{
                border: "none",
                boxShadow: "none",
                width: "fit-content",
                height: "fit-content",
                minHeight: "fit-content",
                "& .Mui-expanded": {
                    minHeight: "fit-content",
                },
            }}>
                <AccordionSummary component={"button"} expandIcon={<ExpandMore fontSize="inherit" />} sx={{
                    width: "fit-content",
                    height: "fit-content",
                    "& .MuiAccordionSummary-content": {
                        my: 0,
                    },
                    "& .Mui-expanded": {
                        minHeight: "fit-content",
                    },
                    background: "#f6bc3b",
                    fontSize: "17px",
                    borderRadius: "25px",
                    fontWeight: "500",
                }}>
                    Customize
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                    <Box>
                        {customizationData?.customizations?.map((customization, index) => (
                            <CustomizationField
                                key={index}
                                customization={customization}
                                selectedValue={selectedDropdowns[customization.label]}
                                textValue={customizationText[customization.label]}
                                onDropdownChange={onDropdownChange}
                                onTextChange={onTextChange}
                                validationError={validationErrors[customization.label]}
                                currency={currency}
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

const CustomizationField = ({
    customization,
    selectedValue,
    textValue,
    onDropdownChange,
    onTextChange,
    validationError,
    currency
}) => {
    if (customization.optionList) {
        return (
            <DropdownCustomization
                customization={customization}
                selectedValue={selectedValue}
                onChange={onDropdownChange}
                validationError={validationError}
                currency={currency}
            />
        );
    } else {
        return (
            <TextCustomization
                customization={customization}
                textValue={textValue}
                onChange={onTextChange}
                validationError={validationError}
                currency={currency}
            />
        );
    }
};

const DropdownCustomization = ({ customization, selectedValue, onChange, validationError, currency }) => (
    <Grid container spacing={0} sx={{ my: 2 }}>
        <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.5 }}>
                {customization.label}
                {customization.isCompulsory === "true" || customization.isCompulsory === true ? (
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>
                ) : <span style={{ color: "gray", fontSize: "12px", fontWeight: "light", margin: "0 3px" }}>(Optional)</span>}
            </Typography>
            {customization.instructions && (
                <Typography variant="body2" sx={{ color: 'gray', mb: 0.25 }}>
                    [{customization.instructions}]
                </Typography>
            )}
        </Grid>

        <Grid item xs={12}>
            <FormControl fullWidth>
                <Select
                    value={selectedValue?.value || ""}
                    displayEmpty
                    onChange={(e) => {
                        const selectedOption = customization.optionList.find(
                            option => option.priceDifference === e.target.value
                        );
                        onChange(customization.label, {
                            value: selectedOption?.optionName,
                            price: e.target.value,
                        });
                    }}
                    renderValue={(selected) => selected || "Select an option"}
                    sx={{
                        border: "none",
                        background: "#fff",
                        height: "40px",
                        boxShadow: "0 0 3px #000",
                    }}
                >
                    <MenuItem value="">Select an option</MenuItem>
                    {customization.optionList.map((option, index) => (
                        <MenuItem key={index} value={option.priceDifference}>
                            {option.optionName}
                            {option.priceDifference && option.priceDifference !== 0 && (
                                ` (+ ${currency?.symbol}${(option.priceDifference * currency?.rate).toFixed(2)})`
                            )}
                        </MenuItem>
                    ))}
                </Select>
                {validationError && (
                    <Typography color="error" sx={{ mt: 1, fontSize: '14px' }}>
                        {validationError}
                    </Typography>
                )}
            </FormControl>
        </Grid>
    </Grid>
);

const TextCustomization = ({ customization, textValue, onChange, validationError, currency }) => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={9}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {customization.label}
                {customization.isCompulsory ? (
                    <span style={{ color: "red", fontSize: "15px", margin: "0 3px" }}>*</span>
                ) : " (Optional)"}
            </Typography>
            {customization.instructions && (
                <Typography variant="body2" sx={{ color: 'gray' }}>
                    [{customization.instructions}]
                </Typography>
            )}
        </Grid>

        <Grid item xs={3}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                + {currency?.symbol}{(customization.price * currency?.rate).toFixed(2)}
            </Typography>
        </Grid>

        <Grid item xs={12}>
            <TextField
                fullWidth
                value={textValue?.value || ""}
                onChange={(e) => onChange(
                    customization.label,
                    +customization.price,
                    +customization.min,
                    +customization.max,
                    e.target.value
                )}
                placeholder={customization.placeholder}
                variant="outlined"
                InputProps={{
                    sx: { height: "40px" },
                }}
                sx={{
                    background: "#fff",
                    boxShadow: "0 0 3px #000",
                    ".MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
            />
            {validationError && (
                <Typography color="error" sx={{ mt: 1, fontSize: '14px' }}>
                    {validationError}
                </Typography>
            )}
        </Grid>
    </Grid>
);

export default ProductCustomization;
