import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    Divider,
    IconButton,
    Paper,
    Chip,
    CircularProgress,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormLabel,
    TextField,
    Autocomplete,
    Grid,
    Checkbox,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckIcon from '@mui/icons-material/Check';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ImageIcon from '@mui/icons-material/Image';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { useRouter } from 'next/navigation';
import { useToasts } from 'react-toast-notifications';
import useAuth from 'hooks/useAuth';
import useMyProvider from 'hooks/useMyProvider';
import { useCurrency } from 'contexts/CurrencyContext';
import { getAPI, getAPIAuth, postAPI, postAPIAuth } from 'utils/__api__/ApiServies';

// Move sections outside component - Fix #2
const SECTIONS = [
    { id: 'delivery', label: 'Delivery', icon: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: 'payment', label: 'Payment', icon: <PaymentOutlinedIcon sx={{ fontSize: 16 }} /> },
    { id: 'review', label: 'Review', icon: <CheckIcon sx={{ fontSize: 16 }} /> },
];

// Move validation schema outside component - Fix #3
const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string(),
    address1: Yup.string().required('Address line is required'),
    address2: Yup.string(),
    country: Yup.object().required('Country is required'),
    state: Yup.object().required('State is required'),
    city: Yup.object().required('City is required'),
    pincode: Yup.string().required('Pincode is required'),
    phone: Yup.string()
        .required('Phone number is required')
        .test('is-valid-phone', 'Invalid phone number', (value) => {
            if (!value) return false;

            try {
                const phoneNumber = parsePhoneNumberFromString(
                    value.startsWith('+')
                        ? value
                        : `+${value}`
                );

                return phoneNumber?.isValid() || false;
            } catch {
                return false;
            }
        }),
});

// Move DeliverySection outside component - Fix #1
const DeliverySection = React.memo(({
    showAddressForm,
    setShowAddressForm,
    defaultAddress,
    setDefaultAddress,
    allAddress,
    editAddress,
    setEditAddress,
    getCountry,
    getState,
    getCities,
    countryValue,
    setCountryValue,
    stateValue,
    setStateValue,
    code,
    setCountryCode,
    buttonDisable,
    handleSubmitAddress,
    validationSchema: schema
}) => {
    const stableInitialValues = useMemo(() => ({
        firstName: editAddress?.first_name || '',
        lastName: editAddress?.last_name || '',
        address1: editAddress?.address_line1 || '',
        address2: editAddress?.address_line2 || '',
        country: null,
        state: null,
        city: null,
        pincode: editAddress?.pincode || '',
        phone: (editAddress?.phone_code || '') + (editAddress?.mobile || '') || '',
        setAsDefault: editAddress?.default === '1',
    }), [editAddress?.first_name, editAddress?.last_name, editAddress?.address_line1,
    editAddress?.address_line2, editAddress?.pincode, editAddress?.phone_code,
    editAddress?.mobile, editAddress?.default]);

    if (showAddressForm) {
        return (
            <Box>
                <Box display="flex" alignItems="center" mb={3}>
                    <IconButton onClick={() => setShowAddressForm(false)} size="small">
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" fontWeight={600} sx={{ flex: 1, textAlign: 'center' }}>
                        Add New Address
                    </Typography>
                </Box>
                <Formik
                    key={JSON.stringify(stableInitialValues)}
                    initialValues={stableInitialValues}
                    enableReinitialize={false}
                    validationSchema={schema}
                    context={{ code }}
                    onSubmit={(values, { resetForm }) => handleSubmitAddress(values, resetForm)}
                >
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                        <Form>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        First Name *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="firstName"
                                        size="small"
                                        value={values.firstName}
                                        onChange={handleChange}
                                        error={touched.firstName && !!errors.firstName}
                                        helperText={touched.firstName && errors.firstName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        Last Name
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="lastName"
                                        size="small"
                                        value={values.lastName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        Address *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="address1"
                                        size="small"
                                        value={values.address1}
                                        onChange={handleChange}
                                        error={touched.address1 && !!errors.address1}
                                        helperText={touched.address1 && errors.address1}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        Apartment, Suite, etc. (optional)
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="address2"
                                        size="small"
                                        value={values.address2 || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        Country *
                                    </Typography>
                                    <Autocomplete
                                        options={getCountry}
                                        getOptionLabel={(option) => option?.name || ''}
                                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                        value={values.country}
                                        onChange={(_, value) => {
                                            setFieldValue('country', value);
                                            setFieldValue('state', null);
                                            setFieldValue('city', null);
                                            setCountryValue(value?._id || '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                error={touched.country && !!errors.country}
                                                helperText={touched.country && errors.country}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        State *
                                    </Typography>
                                    <Autocomplete
                                        options={getState}
                                        getOptionLabel={(option) => option?.name || ''}
                                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                        value={values.state}
                                        onChange={(_, value) => {
                                            setFieldValue('state', value);
                                            setFieldValue('city', null);
                                            setStateValue(value?._id || '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                error={touched.state && !!errors.state}
                                                helperText={touched.state && errors.state}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        City *
                                    </Typography>
                                    <Autocomplete
                                        options={getCities}
                                        getOptionLabel={(option) => option?.name || ''}
                                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                        value={values.city}
                                        onChange={(_, value) => setFieldValue('city', value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                error={touched.city && !!errors.city}
                                                helperText={touched.city && errors.city}
                                                disabled={!stateValue}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        Pincode *
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        name="pincode"
                                        size="small"
                                        value={values.pincode}
                                        onChange={handleChange}
                                        error={touched.pincode && !!errors.pincode}
                                        helperText={touched.pincode && errors.pincode}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography fontWeight={600} mb={0.5}>
                                        Phone Number *
                                    </Typography>
                                    <PhoneInput
                                        enableSearch
                                        country="in"
                                        inputStyle={{ width: '100%', height: '40px' }}
                                        value={values.phone || ''}
                                        onChange={(phone, countryData) => {
                                            setFieldValue('phone', phone);
                                            setCountryCode(countryData.countryCode);
                                        }}
                                    />
                                    {touched.phone && errors.phone && (
                                        <Typography color="error" variant="caption">
                                            {errors.phone}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="setAsDefault"
                                                checked={
                                                    (!defaultAddress?._id || allAddress.length === 0)
                                                        ? true
                                                        : values.setAsDefault
                                                }
                                                disabled={!defaultAddress?._id || allAddress.length === 0}
                                                onChange={handleChange}
                                            />
                                        }
                                        label="Set as default address"
                                    />
                                </Grid>
                            </Grid>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                                <Button onClick={() => setShowAddressForm(false)}>Cancel</Button>
                                <Button type="submit" variant="contained" disabled={buttonDisable}>
                                    {buttonDisable ? <CircularProgress size={24} /> : 'Save Address'}
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        );
    }


    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600} sx={{ flex: 1, textAlign: 'center' }}>
                    Select Delivery Address
                </Typography>
            </Box>
            {allAddress.map((address) => (
                <Box display={'flex'} key={address._id}>
                    {/* <Radio
                        checked={defaultAddress?._id === address._id}
                        onChange={() => setDefaultAddress(address)}
                        sx={{ mr: 1 }}
                    /> */}
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 2,
                            mb: 2,
                            flex:1,
                            cursor: 'pointer',
                            borderColor: defaultAddress?._id === address._id ? '#000' : '#e0e0e0',
                            bgcolor: defaultAddress?._id === address._id ? '#fafafa' : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#000' },
                        }}
                    onClick={() => {
                        setDefaultAddress(address);
                    }}
                    >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                                <Typography fontWeight={600}>
                                    {address.first_name} {address.last_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {address.address_line1}, {address.address_line2 && `${address.address_line2}, `}
                                    {address.city}, {address.state}, {address.country} - {address.pincode}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mt={0.5}>
                                    {address.phone_code} {address.mobile}
                                </Typography>
                            </Box>
                            {defaultAddress?._id === address._id && <CheckIcon color="success" fontSize="small" />}
                            {address.default === '1' && (
                                <Chip label="Default" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                            )}
                        </Box>
                    </Paper>
                </Box>
            ))}
            <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1, py: 1.5, borderStyle: 'dashed' }}
                onClick={() => {
                    setEditAddress({});
                    setShowAddressForm(true);
                }}
            >
                + Add New Address
            </Button>
        </Box>
    );

});

// Move PaymentMethodSection outside component - Fix #1
const PaymentMethodSection = React.memo(({ paymentType, setPaymentType }) => (
    <Box>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 2 }}>
            Select Payment Method
        </FormLabel>
        <RadioGroup value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
            <Paper
                variant="outlined"
                sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    borderColor: paymentType === '1' ? '#000' : '#e0e0e0',
                    bgcolor: paymentType === '1' ? '#fafafa' : 'transparent',
                }}
            >
                <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <LocalShippingOutlinedIcon />
                            <Typography fontWeight={500}>Cash on Delivery</Typography>
                        </Box>
                    }
                />
            </Paper>

            <Paper
                variant="outlined"
                sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    borderColor: paymentType === '2' ? '#000' : '#e0e0e0',
                    bgcolor: paymentType === '2' ? '#fafafa' : 'transparent',
                }}
            >
                <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <CreditCardOutlinedIcon />
                            <Typography fontWeight={500}>Credit / Debit Card</Typography>
                        </Box>
                    }
                />
            </Paper>

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: paymentType === '3' ? '#000' : '#e0e0e0',
                    bgcolor: paymentType === '3' ? '#fafafa' : 'transparent',
                }}
            >
                <FormControlLabel
                    value="3"
                    control={<Radio />}
                    label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <AccountBalanceWalletOutlinedIcon />
                            <Typography fontWeight={500}>Digital Wallet</Typography>
                        </Box>
                    }
                />
            </Paper>
        </RadioGroup>
    </Box>
));

// Move OrderSummary outside component - Fix #1
const OrderSummary = React.memo(({
    vendorIcon,
    vendorName,
    savedItems,
    currency,
    couponApplied,
    couponCode,
    couponDiscount,
    couponError,
    couponLoading,
    subtotal,
    totalItems,
    deliveryFee,
    total,
    handleApplyCoupon,
    handleRemoveCoupon,
    setCouponCode,
    setCouponError
}) => (
    <Box>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Avatar src={'https://api.agukart.com/uploads/shop-icon/'+vendorIcon} sx={{ width: 32, height: 32 }}>
                <StorefrontOutlinedIcon />
            </Avatar>
            <Typography fontWeight={600}>{vendorName}</Typography>
        </Box>

        {savedItems.map((item, idx) => {
            const productName = item?.product_id?.product_title.replace(/<\/?[^>]+(>|$)/g, "").replace(/&nbsp;/g, " ").trim().split(/\s+/).filter(Boolean).slice(0, 12).join(" ")|| item?.product_title || 'Saved item';
            const productImage = item?.product_id?.image?.[0]
                ? `https://api.agukart.com/uploads/product/${item.product_id.image[0]}`
                : item?.image || '';
            const price = item?.saved_price || item?.price || 0;
            const quantity = item?.quantity || 1;

            return (
                <Box key={idx} display="flex" gap={1} mb={2}>
                    <Avatar src={productImage} variant="rounded" sx={{ width: 100, height: 100 }}>
                        <ImageIcon />
                    </Avatar>
                    <Box flex={1}>
                        <Typography fontWeight={500}>{productName}</Typography>
                        {item?.variants && (
                            <Typography variant="caption" color="text.secondary">
                                {item.variants.map(v => `${v.variantName}: ${v.attributeName}`).join(', ')}
                            </Typography>
                        )}
                        <Typography variant="body2">
                            Qty: {quantity} × {currency?.symbol}
                            {(price * (currency?.rate || 1)).toFixed(2)}
                        </Typography>
                    </Box>
                    <Typography fontWeight={500}>
                        {currency?.symbol}
                        {(price * quantity * (currency?.rate || 1)).toFixed(2)}
                    </Typography>
                </Box>
            );
        })}

        <Divider sx={{ my: 2 }} />

        <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary sx={{ px: 0, minHeight: 'auto' }}>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                    {couponApplied ? 'Coupon Applied ✓' : 'Apply Store Coupon'}
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
                {couponApplied ? (
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="success.main">
                            Coupon {couponCode} applied (-{currency?.symbol}
                            {(couponDiscount * (currency?.rate || 1)).toFixed(2)})
                        </Typography>
                        <Button size="small" onClick={handleRemoveCoupon}>
                            Remove
                        </Button>
                    </Box>
                ) : (
                    <Box display="flex" gap={1}>
                        <TextField
                            placeholder="Enter code"
                            size="small"
                            fullWidth
                            value={couponCode}
                            onChange={(e) => {
                                setCouponCode(e.target.value);
                                setCouponError('');
                            }}
                            error={!!couponError}
                            helperText={couponError}
                        />
                        <Button variant="outlined" onClick={handleApplyCoupon} disabled={couponLoading}>
                            {couponLoading ? <CircularProgress size={20} /> : 'Apply'}
                        </Button>
                    </Box>
                )}
            </AccordionDetails>
        </Accordion>

        <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal ({totalItems} items)</Typography>
                <Typography>{currency?.symbol}{(subtotal * (currency?.rate || 1)).toFixed(2)}</Typography>
            </Box>
            {couponDiscount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography color="success.main">Coupon Discount</Typography>
                    <Typography color="success.main">
                        -{currency?.symbol}{(couponDiscount * (currency?.rate || 1)).toFixed(2)}
                    </Typography>
                </Box>
            )}
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Delivery</Typography>
                <Typography>{deliveryFee === 0 ? 'FREE' : `${currency?.symbol}${deliveryFee}`}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700}>
                    {currency?.symbol}{(total * (currency?.rate || 1)).toFixed(2)}
                </Typography>
            </Box>
        </Box>
    </Box>
));

// Main Component
const SavedProductCheckout = ({
    open,
    onClose,
    savedItems = [],
    vendorId,
    vendorName = 'Shop',
    vendorIcon = '',
}) => {
    const router = useRouter();
    const { currency } = useCurrency();
    const { token } = useAuth();
    const { usercredentials } = useMyProvider();
    const { addToast } = useToasts();

    // State management
    const [currentSection, setCurrentSection] = useState('delivery');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [defaultAddress, setDefaultAddress] = useState({});
    const [allAddress, setAllAddress] = useState([]);
    const [editAddress, setEditAddress] = useState({});
    const [getCountry, setGetCountry] = useState([]);
    const [getState, setGetState] = useState([]);
    const [getCities, setGetCities] = useState([]);
    const [countryValue, setCountryValue] = useState('');
    const [stateValue, setStateValue] = useState('');
    const [code, setCountryCode] = useState('in');
    const [buttonDisable, setButtonDisable] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentType, setPaymentType] = useState('1');
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');

    // Calculate totals
    const subtotal = savedItems.reduce((sum, item) => {
        const price = item?.saved_price || item?.price || 0;
        const quantity = item?.quantity || 1;
        return sum + (price * quantity);
    }, 0);

    const deliveryFee = 0;
    const total = subtotal - couponDiscount + deliveryFee;
    const totalItems = savedItems.reduce((sum, item) => sum + (item?.quantity || 1), 0);

    const currentIndex = SECTIONS.findIndex(s => s.id === currentSection);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setCurrentSection('delivery');
            setShowAddressForm(false);
        }
    }, [open]);

    // Fetch address data
    const getAddressData = async () => {
        if (!token) return;
        try {
            const res = await getAPIAuth('user/get-address?limit=10&offset=0', token);
            if (res.status === 200) {
                setAllAddress(res?.data?.addresses || []);
                const defaultAddr = res?.data?.addresses?.find((item) => item.default === '1');
                setDefaultAddress(defaultAddr || {});
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    // Fetch country data
    const getCountryData = async () => {
        try {
            const res = await getAPI('get-country');
            if (res.status === 200) {
                setGetCountry(res?.data?.contryList || []);
            }
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    };

    // Fetch states
    const getStateData = async () => {
        if (!countryValue) return;
        try {
            const res = await postAPI('get-states', { country_id: countryValue });
            if (res.status === 200) {
                setGetCities([]);
                setGetState(res?.data?.stateList || []);
            }
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    // Fetch cities
    const getCitiesData = async () => {
        if (!stateValue) return;
        try {
            const res = await postAPI('/get-city-by-id', { state_id: stateValue });
            if (res.status === 200) {
                setGetCities(res?.data?.result || []);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    useEffect(() => {
        getStateData();
    }, [countryValue]);

    useEffect(() => {
        getCitiesData();
    }, [stateValue]);

    useEffect(() => {
        if (token && open) {
            getAddressData();
            getCountryData();
        }
    }, [token, open]);

    console.log(allAddress)

    const splitCountryCode = (number) => {
        if (!number?.startsWith('+')) {
            number = `+${number}`;
        }
        try {
            const phoneNumber = parsePhoneNumberFromString(number);
            if (phoneNumber) {
                return {
                    countryCode: phoneNumber.countryCallingCode,
                    phoneNumber: phoneNumber.nationalNumber,
                };
            }
        } catch (error) {
            console.error('Error parsing phone number:', error);
        }
        return { countryCode: '', phoneNumber: number };
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }
        setCouponLoading(true);
        setCouponError('');
        try {
            const payload = { coupon_code: couponCode, vendor_id: vendorId };
            const res = await postAPIAuth('user/check-coupon-for-product', payload);
            if (res.status === 200) {
                setCouponApplied(true);
                setCouponDiscount(res.data.couponAmount || res.data.discountAmount || 0);
                addToast(res?.data?.message || 'Coupon applied successfully', {
                    appearance: 'success',
                    autoDismiss: true,
                });
            }
        } catch (error) {
            const errorMsg = error?.response?.data?.message || 'Invalid coupon code';
            setCouponError(errorMsg);
            addToast(errorMsg, {
                appearance: 'error',
                autoDismiss: true,
            });
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setCouponApplied(false);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
        addToast('Coupon removed', { appearance: 'success', autoDismiss: true });
    };

    const handleSubmitAddress = async (values, resetForm) => {
        const { countryCode, phoneNumber } = splitCountryCode(values?.phone);
        try {
            setButtonDisable(true);
            const param = {
                _id: editAddress?._id || 'new',
                first_name: values.firstName,
                last_name: values.lastName,
                mobile: phoneNumber,
                email: usercredentials?.email || '',
                phone_code: `+${countryCode}`,
                address_line1: values.address1,
                address_line2: values.address2,
                state: values?.state?.name,
                city: values?.city?.name,
                country: values?.country?.name,
                pincode: values.pincode,
                default: values.setAsDefault ? '1' : '0',
            };
            const res = await postAPIAuth('user/add-address', param, token, addToast);
            if (res.status === 200) {
                addToast(res?.data?.message, { appearance: 'success', autoDismiss: true });
                await getAddressData();
                setShowAddressForm(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error saving address:', error);
        } finally {
            setButtonDisable(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!defaultAddress?._id) {
            addToast('Please select a delivery address', { appearance: 'error', autoDismiss: true });
            setCurrentSection('delivery');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                address_id: defaultAddress._id,
                vendor_id: vendorId,
                saved_items: savedItems.map((item) => ({
                    product_id: item?.product_id?._id || item?.product_id || item?._id,
                    quantity: item?.quantity || 1,
                    saved_price: item?.saved_price || item?.price || 0,
                })),
                coupon_code: couponApplied ? couponCode : null,
                coupon_discount: couponDiscount,
                payment_method: paymentType === '1' ? 'cod' : 'online',
            };
            const res = await postAPIAuth('user/saved-items-checkout', payload, token);
            if (res.status === 200) {
                addToast(res?.data?.message || 'Order placed successfully!', {
                    appearance: 'success',
                    autoDismiss: true,
                });
                if (paymentType === '2') {
                    if (res.data.paymentUrl) {
                        window.location.href = res.data.paymentUrl;
                    }
                } else {
                    router.push(`/order-confirmation?order-id=${res.data.orderId}`);
                    onClose();
                }
            }
        } catch (error) {
            addToast(error?.response?.data?.message || 'Failed to place order', {
                appearance: 'error',
                autoDismiss: true,
            });
        } finally {
            setLoading(false);
        }
    };

    const isNextDisabled = () => {
        if (currentSection === 'delivery' && !defaultAddress?._id) return true;
        return false;
    };

    const handleNext = () => {
        if (currentIndex < SECTIONS.length - 1) {
            setCurrentSection(SECTIONS[currentIndex + 1].id);
        } else {
            handlePlaceOrder();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentSection(SECTIONS[currentIndex - 1].id);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxHeight: '90vh',
                    width: '550px',
                    maxWidth: '550px',
                },
            }}
        >
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#fff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                }}
            >
                <Typography variant="h6" fontWeight={600}>
                    Checkout
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <DialogContent sx={{ px: 3, py: 2 }}>
                {/* Fix #4 - Direct rendering instead of getSectionContent */}
                {currentSection === "delivery" && (
                    <DeliverySection
                        showAddressForm={showAddressForm}
                        setShowAddressForm={setShowAddressForm}
                        defaultAddress={defaultAddress}
                        setDefaultAddress={setDefaultAddress}
                        allAddress={allAddress}
                        editAddress={editAddress}
                        setEditAddress={setEditAddress}
                        getCountry={getCountry}
                        getState={getState}
                        getCities={getCities}
                        countryValue={countryValue}
                        setCountryValue={setCountryValue}
                        stateValue={stateValue}
                        setStateValue={setStateValue}
                        code={code}
                        setCountryCode={setCountryCode}
                        buttonDisable={buttonDisable}
                        handleSubmitAddress={handleSubmitAddress}
                        validationSchema={validationSchema}
                    />
                )}

                {currentSection === "payment" && (
                    <PaymentMethodSection
                        paymentType={paymentType}
                        setPaymentType={setPaymentType}
                    />
                )}

                {currentSection === "review" && (
                    <OrderSummary
                        vendorIcon={vendorIcon}
                        vendorName={vendorName}
                        savedItems={savedItems}
                        currency={currency}
                        couponApplied={couponApplied}
                        couponCode={couponCode}
                        couponDiscount={couponDiscount}
                        couponError={couponError}
                        couponLoading={couponLoading}
                        subtotal={subtotal}
                        totalItems={totalItems}
                        deliveryFee={deliveryFee}
                        total={total}
                        handleApplyCoupon={handleApplyCoupon}
                        handleRemoveCoupon={handleRemoveCoupon}
                        setCouponCode={setCouponCode}
                        setCouponError={setCouponError}
                    />
                )}
            </DialogContent>

            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#fff',
                    position: 'sticky',
                    bottom: 0,
                }}
            >
                <Button
                    onClick={currentIndex === 0 ? onClose : handleBack}
                    disabled={loading}
                    sx={{ color: '#666' }}
                >
                    {currentIndex === 0 ? 'Cancel' : 'Back'}
                </Button>

                <Box display="flex" alignItems="center" gap={1}>
                    {SECTIONS.map((section, idx) => (
                        <React.Fragment key={section.id}>
                            <Box
                                onClick={() => {
                                    if (idx <= currentIndex) {
                                        setCurrentSection(section.id);
                                    }
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    cursor: idx <= currentIndex ? 'pointer' : 'default',
                                    opacity: idx <= currentIndex ? 1 : 0.4,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: idx === currentIndex ? '#000' : idx < currentIndex ? '#4caf50' : '#e0e0e0',
                                        color: '#fff',
                                    }}
                                >
                                    {idx < currentIndex ? <CheckIcon sx={{ fontSize: 16 }} /> : section.icon}
                                </Box>
                                <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {section.label}
                                </Typography>
                            </Box>
                            {idx < SECTIONS.length - 1 && (
                                <ChevronRightIcon sx={{ fontSize: 16, color: '#ccc' }} />
                            )}
                        </React.Fragment>
                    ))}
                </Box>

                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={isNextDisabled() || loading}
                    sx={{
                        color: 'white',
                        borderRadius: 2,
                        px: 3,
                        bgcolor: '#000',
                        '&:hover': { bgcolor: '#333' },
                    }}
                >
                    {loading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : currentSection === 'review' ? (
                        `Pay ${currency?.symbol}${(total * (currency?.rate || 1)).toFixed(2)}`
                    ) : (
                        'Continue'
                    )}
                </Button>
            </Box>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', textAlign: 'center', py: 2, borderTop: '1px solid', borderColor: 'divider' }}
            >
                Secure transaction · Your payment information is encrypted
            </Typography>
        </Dialog>
    );
};

export default SavedProductCheckout;