import Image from "next/image"; 
// STYLED COMPONENTS

import { CardRoot, StyledParagraph, StyledParagraph2 } from "./styles"; 
// ===========================================================


// ===========================================================
export default function DealWeekCard({
  title,
  imgUrl,
  off
}) {
  return <CardRoot>
      <Image alt={title} width={580} src={imgUrl} height={225} className="banner" />
      <StyledParagraph>{title}</StyledParagraph>
      <StyledParagraph2>{off}% OFF</StyledParagraph2>
    </CardRoot>;
}