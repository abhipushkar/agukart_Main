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
import MenuItem from "@mui/material/MenuItem";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';

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
import { useRouter } from "next/navigation";



const GiftCardPurchase = () => {
    const router = useRouter();
    return (
        <>
            <Box
                sx={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 4,
                }}
            >
                <Grid container spacing={2} justifyContent="center">
                    <Grid item lg={6} md={8} xs={12}>
                        <Box
                            sx={{
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                                borderRadius: "16px",
                                padding: "32px",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                                textAlign: "center",
                                mx: 2,
                            }}
                        >
                            <Typography component="div" mb={2}>
                                <svg
                                    width="100px"
                                    height="100px"
                                    viewBox="-2.4 -2.4 28.80 28.80"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    stroke="#3bc115"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </Typography>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{
                                    color: "#3bc115",
                                    mb: 1,
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                                Congratulations!
                            </Typography>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{ mb: 2, color: "#000" }}
                            >
                                Enjoy Your Gift Card
                            </Typography>
                            <Typography
                                fontSize={16}
                                sx={{
                                    mb: 3,
                                    color: "#555",
                                    lineHeight: "1.6",
                                    fontFamily: "'Roboto', sans-serif",
                                }}
                            >
                                Woohoo! Your gift card is waiting - use it anytime on Agukart 😊
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#3bc115",
                                    color: "#fff",
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    textTransform: "none",
                                    padding: "10px 24px",
                                    borderRadius: "24px",
                                    ":hover": {
                                        backgroundColor: "#34a10e",
                                    },
                                }}
                                onClick={()=>{router.push("/profile/transaction-history")}}
                            >
                                Ok
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

export default GiftCardPurchase