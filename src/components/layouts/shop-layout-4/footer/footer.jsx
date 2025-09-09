import Link from "next/link";
import Divider from "@mui/material/Divider"; 
// GLOBAL CUSTOM COMPONENTS

import { Paragraph } from "components/Typography"; 
// STYLED COMPONENT

import { StyledRoot } from "./styles";
export default function Footer() {
  return <StyledRoot>
      <Divider />

      <div className="links">
        <Link href="/terms-condition">Terms</Link>
        <Link href="/privacy-policy">Privacy</Link>
        <Link href="#">Help</Link>
      </div>

      <Paragraph>© Copyright {new Date().getFullYear()} By UI LIB.</Paragraph>
    </StyledRoot>;
}