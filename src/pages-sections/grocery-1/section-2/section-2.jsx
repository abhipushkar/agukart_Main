import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";

// CUSTOM ICON COMPONENTS
import appIcons from "icons"; 
// GLOBAL CUSTOM COMPONENTS

import { H4, Span } from "components/Typography";

// STYLED COMPONENT
import { ServiceCard } from "./styles"; 
// =============================================================


// =============================================================
export default function Section2({
  services
}) {
  const servicesData = services.slice(0, 4);
  return <Container className="pt-6 pb-4">
      <Grid container spacing={3}>
        {servicesData.map(item => {
        const Icon = appIcons[item.icon];
        return <Grid item lg={3} md={6} sm={6} xs={12} key={item.title}>
              <ServiceCard>
                <Icon fontSize="large" />

                <div>
                  <H4 color="grey.900" fontSize="1rem" fontWeight="700">
                    {item.title}
                  </H4>

                  <Span color="grey.600">{item.description}</Span>
                </div>
              </ServiceCard>
            </Grid>;
      })}
      </Grid>
    </Container>;
}