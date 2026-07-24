"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
// CUSTOM GLOBAL COMPONENTS

import { FlexBox, FlexRowCenter } from "components/flex-box";
import { TextField, Typography } from "@mui/material";
import { TextFields } from "@mui/icons-material";
import Link from "next/link";
import { H2 } from "components/Typography";
export default function NotFound() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  return (
    <Box minHeight={'100vh'} minWidth={'100vw'}>
      <Box component={Link} href='/' width={'130px'} p={1}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 50" width="150" height="50">
          <rect width="150" height="50" fill="transparent" />

          <text
            x="75"
            y="30"
            fontFamily="'Constania', 'Playfair Display', Georgia, serif"
            fontSize="30"
            fontWeight="700"
            fill="#3a3949"
            letterSpacing="1.5"
            textAnchor="middle"
            dominantBaseline="middle"
            shapeRendering="geometricPrecision"
            style={{
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
              fontVariantNumeric: 'proportional-nums',
            }}
          >
            Agukart
          </text>
        </svg>
      </Box>
      <FlexRowCenter px={{xs: 0, md: 22}} justifyContent={{xs:'center', md:'start'}} mt={'35vh'}>
        <Box display={'flex'} gap={2} flexDirection={'column'}>
          <H2>Oops! couldn't find it.</H2>
          <Box
            sx={{
              height: "50px",
              padding: "0px 8px !important",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#fff",
              boxShadow: "0 0 1px #000",
              borderRadius: "25px",
              gap: "8px",
              margin: "0 !important",
              width: { xs: '100%', md: '580px' }

            }}
          >
            <TextField
              required
              id="outlined-required"
              placeholder="Try Searching..."
              value={search}
              onChange={e=>setSearch(e.target.value)}
              sx={{
                flex: 1,
                ".MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                ".MuiInputBase-root": {
                  height: "40px !important",
                  fontSize: "14px !important",
                  padding: "0 !important",
                  margin: "0 !important",
                },
                ".MuiInputBase-input": {
                  padding: "4px 8px !important",
                  margin: "0 !important",
                },
                "&.MuiTextField-root": {
                  margin: "0 !important",
                  padding: "0 !important",
                }
              }}

            />

            <Button
              sx={{
                padding: "2px 8px !important",
                background: "none !important",
                border: "none !important",
                borderRadius: "12px !important",
                fontSize: "11px !important",
                minWidth: "auto !important",
                whiteSpace: "nowrap !important",
                minHeight: "24px !important",
                margin: "0 !important",
                "&.MuiButton-root": {
                  padding: "2px 8px !important",
                  margin: "0 !important",
                  minHeight: "24px !important",
                }
              }}
              onClick={()=>router.replace(`/search-product-list?q=${encodeURIComponent(search)}`)}
            >
              <SearchIcon />
            </Button>
          </Box>

          <FlexBox component={Link} href='/' flexWrap="wrap" gap={1} cursor={'pointer'}>
            <Typography alignItems={'center'} alignContent={'center'}>← go back to </Typography>
            <Typography variant="body1" color="initial" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Agukart.com
            </Typography>
          </FlexBox>
        </Box>
      </FlexRowCenter>
    </Box>
  );
}
