import Box from "@mui/material/Box"; 
// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box";
import { Paragraph } from "components/Typography"; 
import { useCurrency } from "contexts/CurrencyContext";
// CUSTOM UTILS LIBRARY FUNCTIONS

import { calculateDiscount, currency } from "lib"; 
// ==============================================================


// ==============================================================
export default function ProductPrice({
  salePrice,
  originalPrice
}) 


{
  const {currency} = useCurrency();
  return <FlexBox alignItems="center" gap={1} mt={0.5}>
      <Paragraph fontWeight={600} color="primary.main">
        {currency?.symbol}{(salePrice * currency?.rate).toFixed(2)}
      </Paragraph>
      {
        originalPrice != salePrice && <Box component="del" fontWeight={600} color="grey.600">
          {currency?.symbol}{(originalPrice * currency?.rate).toFixed(2)}
        </Box> 
      }
    </FlexBox>;
}