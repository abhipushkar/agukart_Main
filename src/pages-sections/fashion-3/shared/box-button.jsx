
// STYLED COMPONENT
import { StyledButtonBase } from "./styles"; 
// ==============================================================


// ==============================================================
export default function BoxButton({
  variant = "light",
  ...props
}) {
  return <StyledButtonBase variant={variant} {...props}>
      Shop Now
    </StyledButtonBase>;
}