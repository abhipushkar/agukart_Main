"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
// MUI

import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import TouchRipple from "@mui/material/ButtonBase";
// TRANSLATION

import { useTranslation } from "react-i18next";
// MUI ICON COMPONENTS

import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import Twitter from "@mui/icons-material/Twitter";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import ExpandMore from "@mui/icons-material/ExpandMore";

// GLOBAL CUSTOM COMPONENTS

import { Span } from "components/Typography";
import BazaarMenu from "components/BazaarMenu";
import { FlexBetween, FlexBox } from "components/flex-box";
// STYLED COMPONENTS

import { StyledChip, StyledContainer, StyledRoot } from "./styles";
import CustomTranslate from "components/language/customTranslate";
import { fetchConversionRate } from "utils/currencyConverter";
import { useCurrency } from "contexts/CurrencyContext";
import { getAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
// ==============================================================

// ==============================================================

// LANGUAGE OPTIONS
const languageOptions = {
  en: {
    title: "EN",
    value: "en",
  },
  es: {
    title: "DE",
    value: "de",
  },
};
const socialLinks = [
  {
    id: 1,
    Icon: Facebook,
    url: "#",
  },
  {
    id: 2,
    Icon: Instagram,
    url: "#",
  },
  {
    id: 3,
    Icon: PinterestIcon,
    url: "#",
  },
  // {
  //   id: 4,
  //   Icon: Twitter,
  //   url: "#",
  // },
];

const countries = [
  { symbol: "$", country: "United States", code: "(USD)" },
  { symbol: "د.إ", country: "United Arab Emirates", code: "(AED)" },
  { symbol: "؋", country: "Afghanistan", code: "(AFN)" },
  { symbol: "L", country: "Albania", code: "(ALL)" },
  { symbol: "֏", country: "Armenia", code: "(AMD)" },
  { symbol: "ƒ", country: "Netherlands Antilles", code: "(ANG)" },
  { symbol: "Kz", country: "Angola", code: "(AOA)" },
  { symbol: "$", country: "Argentina", code: "(ARS)" },
  { symbol: "$", country: "Australia", code: "(AUD)" },
  { symbol: "ƒ", country: "Aruba", code: "(AWG)" },
  { symbol: "₼", country: "Azerbaijan", code: "(AZN)" },
  { symbol: "KM", country: "Bosnia and Herzegovina", code: "(BAM)" },
  { symbol: "$", country: "Barbados", code: "(BBD)" },
  { symbol: "৳", country: "Bangladesh", code: "(BDT)" },
  { symbol: "лв", country: "Bulgaria", code: "(BGN)" },
  { symbol: "ب.د", country: "Bahrain", code: "(BHD)" },
  { symbol: "FBu", country: "Burundi", code: "(BIF)" },
  { symbol: "$", country: "Bermuda", code: "(BMD)" },
  { symbol: "$", country: "Brunei", code: "(BND)" },
  { symbol: "Bs.", country: "Bolivia", code: "(BOB)" },
  { symbol: "R$", country: "Brazil", code: "(BRL)" },
  { symbol: "$", country: "Bahamas", code: "(BSD)" },
  { symbol: "Nu.", country: "Bhutan", code: "(BTN)" },
  { symbol: "P", country: "Botswana", code: "(BWP)" },
  { symbol: "Br", country: "Belarus", code: "(BYN)" },
  { symbol: "$", country: "Belize", code: "(BZD)" },
  { symbol: "$", country: "Canada", code: "(CAD)" },
  { symbol: "FC", country: "Congo", code: "(CDF)" },
  { symbol: "CHF", country: "Switzerland", code: "(CHF)" },
  { symbol: "$", country: "Chile", code: "(CLP)" },
  { symbol: "¥", country: "China", code: "(CNY)" },
  { symbol: "$", country: "Colombia", code: "(COP)" },
  { symbol: "₡", country: "Costa Rica", code: "(CRC)" },
  { symbol: "$", country: "Cuba", code: "(CUP)" },
  { symbol: "$", country: "Cape Verde", code: "(CVE)" },
  { symbol: "Kč", country: "Czech Republic", code: "(CZK)" },
  { symbol: "Fdj", country: "Djibouti", code: "(DJF)" },
  { symbol: "kr", country: "Denmark", code: "(DKK)" },
  { symbol: "RD$", country: "Dominican Republic", code: "(DOP)" },
  { symbol: "دج", country: "Algeria", code: "(DZD)" },
  { symbol: "£", country: "United Kingdom", code: "(GBP)" },
  { symbol: "€", country: "Eurozone", code: "(EUR)" },
  { symbol: "₹", country: "India", code: "(INR)" },
  { symbol: "¥", country: "Japan", code: "(JPY)" },
];

// [
//   "$ Australia (AUS)",
//   "€ Austria (AUT)",
//   "$ Canada (CAN)",
//   "kr Denmark (DEN)",
//   "€ France (FRA)",
//   "€ Germany (GER)",
//   "Ft Hungary (HUN)",
//   "kr Iceland (ICE)",
//   "₪ Israel (ISR)",
//   "€ Italy (ITA)",
//   "¥ Japan (JPN)",
//   "₩ Korea (KOR)",
//   "RM Malaysia (MYS)",
//   "$ Mexico (MEX)",
//   "€ Netherlands (NLD)",
//   "$ New Zealand (NZL)",
//   "kr Norway (NOR)",
//   "₽ Russia (RUS)",
//   "$ Singapore (SGP)",
//   "R South Africa (ZAF)",
//   "€ Spain (ESP)",
//   "CHF Switzerland (CHE)",
//   "د.إ United Arab Emirates (ARE)",
//   "£ United Kingdom (GBR)",
//   "$ United States (USA)",
// ];

// [
//   "$ United States (USD)",
//   "$ Canada (CAD)",
//   "€ France (EUR)",
//   "£ United Kingdom (GBP)",
//   "€ Netherlands (EUR)",
//   "$ New Zealand (NZD)",
//   "$ Australia (AUD)",
//   "RM Malaysia (MYR)",
//   "€ Austria (EUR)",
//   "kr Denmark (DKK)",
//   "€ Germany (EUR)",
//   "Ft Hungary (HUF)",
//   "kr Iceland (ISK)",
//   "₪ Israel (ILS)",
//   "€ Italy (EUR)",
//   "¥ Japan (JPY)",
//   "₩ Korea (KRW)",
//   "$ Mexico (MXN)",
//   "kr Norway (NOK)",
//   "₽ Russia (RUB)",
//   "$ Singapore (SGD)",
//   "R South Africa (ZAR)",
//   "€ Spain (EUR)",
//   "CHF Switzerland (CHF)",
//   "د.إ United Arab Emirates (AED)",
// ];

// ===========================================

// ===========================================
export default function Topbar({ bgColor }) {
  const { currency, updateCurrency } = useCurrency();
  const { token } = useAuth();
  const { i18n, t } = useTranslation();
  const [expand, setExpand] = useState(false);
  const [dealsData, setDealsData] = useState({});

  const handleChangeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  const handleCurrencyChange = async (country, onClose) => {
    const targetCurrency = country.code.split("(")[1].split(")")[0];
    const rate = await fetchConversionRate("USD", targetCurrency);
    updateCurrency(country.country, country.symbol, country.code, rate);
    onClose();
  };

  const selectedLanguage = languageOptions[i18n.language];

  const getDeals = async () => {
    try {
      const res = await getAPIAuth("get-deals", token);
      if (res.status === 200) {
        setDealsData({
          base_url: res.data.base_url,
          box_url: res.data.box_url,
          ...res.data.data,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDeals();
  }, []);

  return (
    <StyledRoot bgColor={bgColor} expand={expand ? 1 : 0}>
      <StyledContainer sx={{ height: "30px !important" }}>
        <FlexBetween width="100%">
          {dealsData?.header_text && (
            <FlexBox alignItems="center" gap={1} sx={{ margin: "0 auto" }}>
              <StyledChip label={t("HOT")} size="small" />
              <Span
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                className="title"
              >
                {t(`${dealsData?.header_text}`)}
              </Span>
            </FlexBox>
          )}
          <IconButton
            disableRipple
            className="expand"
            onClick={() => setExpand((state) => !state)}
          >
            {expand ? <Remove /> : <Add />}
          </IconButton>
        </FlexBetween>

        <FlexBox className="topbarRight" alignItems="center">
          {/* LANGUAGE MENU SELECTOR */}

          <BazaarMenu
            handler={(e) => (
              <TouchRipple className="handler marginRight" onClick={e}>
                <Span className="menuTitle">{`${currency.symbol} ${currency.code}`}</Span>
                <ExpandMore fontSize="inherit" />
              </TouchRipple>
            )}
            options={(onClose) => {
              return countries.map((country) => (
                <MenuItem
                  className="menuItem notranslate"
                  key={country.country}
                  onClick={() => handleCurrencyChange(country, onClose)}
                >
                  <Span className="menuTitle">
                    {`${country.symbol}  ${country.country}  ${country.code}`}
                  </Span>
                </MenuItem>
              ));
            }}
          />

          {/* <BazaarMenu
            handler={(e) => (
              <TouchRipple className="handler marginRight" onClick={e}>
                <Span className="menuTitle">{selectedLanguage.title}</Span>
                <ExpandMore fontSize="inherit" />
              </TouchRipple>
            )}
            options={(onClose) => {
              return Object.keys(languageOptions).map((language) => (
                <>
                  <MenuItem
                    className="menuItem"
                    key={languageOptions[language].title}
                    onClick={() => {
                      handleChangeLanguage(language);
                      onClose();
                    }}
                  >
                    <Span className="menuTitle">
                      {languageOptions[language].title}
                    </Span>
                  </MenuItem>
                </>
              ));
            }}
          /> */}
          <div>
            <CustomTranslate />
          </div>
          {/* SOCIAL LINKS AREA */}
          <FlexBox alignItems="center" gap={1.5}>
            {socialLinks.map(({ id, Icon, url }) => (
              <Link href={url} key={id} style={{ lineHeight: "0" }}>
                <Icon
                  style={{
                    fontSize: 18,
                  }}
                />
              </Link>
            ))}
          </FlexBox>
        </FlexBox>
      </StyledContainer>
    </StyledRoot>
  );
}
