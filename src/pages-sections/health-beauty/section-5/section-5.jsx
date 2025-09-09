"use client";

import Grid from "@mui/material/Grid";

// CUSTOM ICON COMPONENT
import appIcons from "icons"; 
// GLOBAL CUSTOM COMPONENTS

import { H4, Paragraph } from "components/Typography"; 
// CUSTOM DATA MODEL


// STYLED COMPONENTS
import { IconBox, StyledRoot } from "./styles"; 
// ========================================================


// ========================================================
export default function Section5({
  services = []
}) {
  const servicesData = services.slice(0, 3);
  return <div className="mb-3">
      <Grid container spacing={3}>
        {servicesData.map((item, ind) => {
        const Icon = appIcons[item.icon];
        return <Grid item lg={4} md={4} sm={12} xs={12} key={ind}>
              <StyledRoot>
                <IconBox>
                  <Icon color="primary">{item.icon}</Icon>
                </IconBox>

                <div>
                  <H4 fontSize={16} fontWeight="700" color="primary.main">
                    {item.title}
                  </H4>

                  <Paragraph color="grey.600">{item.description}</Paragraph>
                </div>
              </StyledRoot>
            </Grid>;
      })}
      </Grid>
    </div>;
}