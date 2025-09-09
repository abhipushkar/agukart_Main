
// GLOBAL CUSTOM COMPONENTS
import { H3, Paragraph } from "components/Typography"; 
// STYLED COMPONENT

import { StyledRoot } from "./styles"; 
// ==========================================================


// ==========================================================
export default function Card4({
  title,
  body,
  Icon
}) {
  return <StyledRoot>
      <div>
        <div className="icon-box">
          <Icon className="icon" color="primary" />
        </div>

        <H3 fontWeight={900} textAlign="center" mb="0.3rem">
          {title}
        </H3>

        <Paragraph color="grey.600" textAlign="center">
          {body}
        </Paragraph>
      </div>
    </StyledRoot>;
}