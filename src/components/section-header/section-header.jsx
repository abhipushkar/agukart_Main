"use client";

import Link from "next/link";

// MUI ICON COMPONENTS
import ArrowLeft from "@mui/icons-material/ArrowLeft";
import ArrowRight from "@mui/icons-material/ArrowRight"; 
// LOCAL CUSTOM COMPONENTS

import { H2 } from "../Typography";
import { FlexBetween, FlexBox } from "../flex-box"; 
// GLOBAL CUSTOM HOOK

import useSettings from "hooks/useSettings"; 
// ===================================================


// ===================================================
export default function SectionHeader({
  title,
  seeMoreLink,
  icon
}) {
  const {
    settings
  } = useSettings();
  return <FlexBetween
  mb={1}
  sx={{
    mt: 0,
    pt: 0,
    pb: 0,
  }}
>
      <FlexBox
  alignItems="center"
  gap={0.7}
  sx={{
    width: {
      xs: "70%",
      sm: "auto",
    },
  }}
>
        {icon ?? null}
        <H2
  lineHeight={1.2}
  sx={{
    fontSize: {
      xs: "15px",
      sm: "22px",
    },
    fontWeight: 700,
    wordBreak: "break-word",
  }}
>
  {title}
</H2>
      </FlexBox>

      {seeMoreLink ? <Link href={seeMoreLink}>
          <FlexBox
  alignItems="center"
  color="grey.600"
  sx={{
    fontSize: {
      xs: "12px",
      sm: "14px",
    },
    ml: "auto",
    whiteSpace: "nowrap",
  }}
>
            View all
            {settings.direction === "ltr" ? <ArrowRight fontSize="small" color="inherit" /> : <ArrowLeft fontSize="small" color="inherit" />}
          </FlexBox>
        </Link> : null}
    </FlexBetween>;
}