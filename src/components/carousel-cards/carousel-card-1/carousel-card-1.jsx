import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button"; 
import BazaarImage from "components/BazaarImage";
import { Paragraph } from "components/Typography"; 
import { StyledRoot } from "./styles"; 

export default function CarouselCard1({
  title,
  image,
  buttonLik,
  buttonText,
  description,
  buttonColor = "primary"
}) {
  return (
    <StyledRoot>
      <Grid container spacing={3} alignItems="center">
        <Grid item xl={12} md={12} sm={12} xs={12}>
         <BazaarImage
  src={image}
  alt="slider"
  sx={{
    mx: "auto",
    width: "100%",
    height: { xs: 140, sm: 350, md: 450 },
objectFit: "contain",
    objectPosition: { xs: "center top" },
    display: "block",
    borderRadius: 2,
    padding: 0,
    margin: 0
  }}
/>
        </Grid>
      </Grid>
    </StyledRoot>
  );
}
