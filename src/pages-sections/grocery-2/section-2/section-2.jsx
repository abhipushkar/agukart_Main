"use client";

import Grid from "@mui/material/Grid";

// CUSTOM ICON COMPONENTS
import appIcons from "icons"; 
// GLOBAL CUSTOM COMPONENTS

import { H4, Span } from "components/Typography"; 
// CUSTOM DATA MODEL


// STYLED COMPONENT
import { ServiceCard } from "./styles"; 
// ==========================================================


// ==========================================================
export default function Section2({
  services = []
}) {
  return <div className="mb-3">
      <Grid container spacing={3}>
        {services.map(({
        icon,
        id,
        title,
        description
      }) => {
        const Icon = appIcons[icon];
        return <Grid item lg={4} sm={6} xs={12} key={id}>
              <ServiceCard>
                <Icon sx={{
              fontSize: 50,
              color: "grey.600"
            }} />

                <div>
                  <H4 color="grey.900" fontSize={20} fontWeight={700}>
                    {title}
                  </H4>
                  <Span color="grey.600">{description}</Span>
                </div>
              </ServiceCard>
            </Grid>;
      })}
      </Grid>
    </div>;
}