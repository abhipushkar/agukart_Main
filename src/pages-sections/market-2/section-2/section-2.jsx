"use client";

import Container from "@mui/material/Container";

// CUSTOM ICON COMPONENT
import appIcons from "icons"; 
// GLOBAL CUSTOM COMPONENTS

import { H4, Span } from "components/Typography"; 
// CUSTOM DATA MODEL


// STYLED COMPONENTS
import { StyledFlexBox, ServiceItem } from "./styles"; 
// ===========================================================


// ===========================================================
export default function Section2({
  serviceList
}) {
  return <Container className="mt-2">
      <StyledFlexBox>
        {serviceList.map((item, ind) => {
        const Icon = appIcons[item.icon];
        return <ServiceItem flexGrow={1} gap={2} key={ind}>
              <Icon sx={{
            fontSize: 40
          }} />
              <div>
                <H4 lineHeight={1.3}>{item.title}</H4>
                <Span color="grey.600">{item.description}</Span>
              </div>
            </ServiceItem>;
      })}
      </StyledFlexBox>
    </Container>;
}