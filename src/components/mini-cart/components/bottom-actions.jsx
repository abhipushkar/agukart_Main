import Box from "@mui/material/Box";
import Button from "@mui/material/Button"; 
import Link from "next/link";
// ==============================================================


// ==============================================================
export default function BottomActions({
  total,
  handleNavigate
}) {
  return <Box p={2.5}>
      <Link href="/cart" passHref>
        <Button
          fullWidth
          color="primary"
          variant="outlined"
          component="a"
          sx={{
            height: 40,
            mb: "0.75rem",
            visibility: "hidden",
          }}
          onClick={handleNavigate}
        >
          View Cart
        </Button>
      </Link>
      <Link href="/cart" passHref>
        <Button
          fullWidth
          color="primary"
          variant="contained"
          sx={{ height: "40px" }}
          onClick={handleNavigate}
        >
          Checkout Now ({total})
        </Button>
      </Link>
    </Box>;
}