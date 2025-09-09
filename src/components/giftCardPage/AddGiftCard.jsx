"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "@mui/material/Link";
// Local CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import { H2, H3, H4, H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ErrorIcon from '@mui/icons-material/Error';

// LOCAL CUSTOM COMPONENT

// CUSTOM DATA MODEL
import {
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    Tooltip,
    tooltipClasses,
} from "@mui/material";
import { Carousel } from "components/carousel";
import { fontSize } from "theme/typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import useMyProvider from "hooks/useMyProvider";
import { getAPI, postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/navigation";
import { useCurrency } from "contexts/CurrencyContext";


const AddGiftCard = () => {
    const {currency} = useCurrency();
    const { setUserCredentials, usercredentials,getUserDetail } = useMyProvider();
    console.log(usercredentials, "usercredentials");
    const { addToast } = useToasts();
    const router = useRouter();
    const [formValues, setFormValues] = useState({ gift_code: "" });
    const [errors, setErrors] = useState({ gift_code: "" });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        setErrors((prv) => ({ ...prv, [name]: "" }));
    };

    const handleAddGiftCard = async () => {
        const newErrors = {};
        if (!formValues.gift_code) newErrors.gift_code = "Gift code is required";
        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            try {
                const payload = {
                    gift_code: formValues?.gift_code,
                };
                setLoading(true);
                const res = await postAPIAuth("user/redeem-gift-card", payload);
                if (res.status === 200) {
                    setLoading(false);
                    addToast(res?.data?.message, {
                        appearance: "success",
                        autoDismiss: true,
                    });
                    setUserCredentials(res?.data?.user);
                    router.push("/profile/transaction-history");
                }
            } catch (error) {
                setLoading(false);
                addToast(error?.response?.data.message || error, {
                    appearance: "error",
                    autoDismiss: true,
                });
                console.log("error", error?.response?.data.message || error);
            }
        }
    }
    useEffect(() => {
        getUserDetail();
    }, [])
    return (
        <>
            <SectionCreator py={4}>
                <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item lg={8} md={10} xs={12}>
                        <Typography variant="h5" fontWeight={600} mb={3}>E-Commerce Gift card</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 0 3px #a2a2a2', borderRadius: '5px', padding: '15px' }}>
                            <Typography component="div" sx={{ display: "flex", alignItems: 'center' }}>
                                <Typography component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', border: '1px solid #000', padding: '10px' }}>
                                    <img src="https://m.media-amazon.com/images/G/31/gc/claim/add-gift-card-logo.png" style={{ width: '100%' }} alt="" />
                                </Typography>
                                <Typography component="div" pl={1}>
                                    <Typography sx={{ color: '#000', fontSize: '16px' }}>Gift Cards</Typography>
                                    <Typography sx={{ color: '#000', fontSize: '14px' }}>Available balance: <Typography component="span" color={"green"}>{currency?.symbol}{(usercredentials?.wallet_balance*currency?.rate).toFixed(2)}</Typography></Typography>
                                </Typography>
                            </Typography>
                            <Typography component="div">
                                <Button>
                                    <AccountBalanceWalletIcon />
                                </Button>
                            </Typography>
                        </Box>
                        <Box mt={2} sx={{ background: '#fff', boxShadow: '0 0 3px #a2a2a2', borderRadius: '5px', padding: '15px' }}>
                            <Typography variant="h6" pb={1}>Add gift card to balance</Typography>
                            <TextField
                                placeholder="Enter gift card code"
                                variant="outlined"
                                sx={{ width: { lg: '60%', md: '60%', xs: '100%' } }}
                                value={formValues?.gift_code}
                                name="gift_code"
                                onChange={handleChange}
                                error={Boolean(errors.gift_code)}
                                helperText={errors.gift_code}
                                onBlur={() => {
                                    if (!formValues.gift_code) {
                                        setErrors((prv) => ({ ...prv, gift_code: "Gift code is required" }));
                                    }
                                }}
                            />
                            <Typography sx={{ color: 'gray', fontSize: '12px' }}>e.g. 8U95-Y3E8CQ-39MPQ</Typography>
                            <Typography mt={2} component="div" sx={{ width: { lg: '40%', md: '50%', xs: '100%' } }}>
                                <Button endIcon={loading ? <CircularProgress size={15} /> : ""}
                                    disabled={loading ? true : false} sx={{ width: '100%', background: '#ffd852', borderRadius: '30px', fontSize: '18px', fontWeight: '600', padding: '9px 18px', whiteSpace: 'nowrap', '&:hover': { background: '#dab534' } }} onClick={handleAddGiftCard}>Add gift card to balance</Button>
                            </Typography>
                            <Typography mt={2} sx={{ display: 'flex', alignItems: 'center' }}><ErrorIcon sx={{ marginRight: '5px' }} /> For optimal utilisation, balance expiring the earliest will be redeemed first.</Typography>
                            <Typography mt={2}><Link href="#" sx={{ color: '#008296', textDecoration: 'none', fontWeight: '600' }}>Need more Help?</Link></Typography>
                        </Box>

                    </Grid>
                </Grid>
            </SectionCreator>
        </>
    )
}

export default AddGiftCard