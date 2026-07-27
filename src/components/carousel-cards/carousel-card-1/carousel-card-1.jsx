import Grid from "@mui/material/Grid";
import BazaarImage from "components/BazaarImage";
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
    <StyledRoot sx={{ p: 0, m: 0, height: "100%" }}>
      <Grid
        container
        spacing={0}
        alignItems="center"
        sx={{ m: 0, height: "100%" }}
      >
        <Grid item xs={12} sx={{ p: "0 !important", height: "100%" }}>
          <BazaarImage
            src={image}
            alt="slider"
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              borderRadius: 2,
              m: 0,
              p: 0,
              lineHeight: 0
            }}
          />
        </Grid>
      </Grid>
    </StyledRoot>
  );
}