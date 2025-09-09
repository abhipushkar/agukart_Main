import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import React, { useEffect, useState } from "react";
import { useCurrency } from "contexts/CurrencyContext";
import { getAPI } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const DeliveryAndReturnPolicy = ({ shippingTemplate, exchangePolicy }) => {
  console.log({ exchangePolicy }, "ghr4hrhrhrhrthrthrth");
  const { currency } = useCurrency();
  const { addToast } = useToasts();
  const [allCountries, setAllCountries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [country, setCountry] = useState("India");
  const [existingShipping,setExistingShipping] = useState({});
  const minDays = Number(shippingTemplate?.shippingTemplateData?.standardShipping[0]?.transitTime?.minDays);
  const maxDays =
    Number(shippingTemplate?.shippingTemplateData?.standardShipping[0]?.transitTime
      ?.maxDays);

  const today = new Date();
  console.log({minDays,maxDays})
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  const options = { day: "numeric", month: "long" };

  const formattedDateRange = `${minDate.toLocaleDateString("en-GB", options)} - ${maxDate.toLocaleDateString("en-GB", options)}`;
  console.log({formattedDateRange});

  const handleSave = () => {
    setIsEditing(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("country", country);
    }
  };
  const handleCountryChange = (e) => {
    const value = e.target.value;
    let existsShipping = shippingTemplate?.shippingTemplateData?.standardShipping?.find((item)=>item?.region?.includes(value))
    console.log({existsShipping})
    if(existsShipping){
      setCountry(value);
      setExistingShipping(existsShipping);
    }else{
      addToast("Delivery is not available in this country.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
  const getCountryData = async () => {
    try {
      const res = await getAPI("get-country");
      console.log("resresresres", res);
      if (res.status == 200) {
        setAllCountries(res?.data?.contryList);
      }
    } catch (error) {
      console.log("errro", error);
    }
  };
  useEffect(() => {
    getCountryData();
  }, []);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     setCountry(localStorage.getItem("country") || "India");
  //   }
  // }, []);
  useEffect(()=>{
    if(shippingTemplate){
      const existingShipping = shippingTemplate?.shippingTemplateData?.standardShipping?.[0];
      const exisitngCountry = existingShipping?.region?.[0]
      setExistingShipping(existingShipping)
      setCountry(exisitngCountry)
    }
  },[shippingTemplate])
  return (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Delivery and Return Policies
        </Typography>
        {Object.keys(shippingTemplate || {}).length > 0 && (
          <>
            <List sx={{ mt: 2 }}>
              <ListItem>
                <ListItemIcon>
                  <CalendarTodayIcon sx={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <p>Estimated Delivery :</p>
                    <p>
                      Order today to get in
                      <Tooltip
                        arrow
                        title={
                          <Typography sx={{ fontSize: "14px" }}>
                            Your order should arrive by this date if you buy
                            today. To calculate an estimated delivery date you
                            can count on, we look at things like the carrier's
                            latest transit times, the seller's processing time
                            and dispatch history, and where the order is
                            dispatched from and delivered to.
                          </Typography>
                        }
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: "white",
                              color: "black",
                              border: "1px solid black",
                              boxShadow: 2,
                              maxWidth: 300,
                              fontSize: "14px",
                              borderRadius: "10px",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "white",
                              "&::before": {
                                border: "1px solid black",
                                backgroundColor: "white",
                              },
                            },
                          },
                        }}
                      >
                        <span style={{ textDecoration: "underline" }}>
                          {" "}{formattedDateRange}
                        </span>
                      </Tooltip>
                    </p>
                  </Box>
                  <div style={{ color: "#00000099", marginTop: "5px" }}>
                    Need it faster? Contact the seller or choose a shipping
                    upgrade during checkout
                  </div>
                </ListItemText>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <AutorenewIcon sx={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip
                      arrow
                      title={
                        <Typography sx={{ fontSize: "14px" }}>
                          Buyers are responsible for return postage costs. If
                          the item is not returned in its original condition,
                          the buyer is responsible for any loss in value.
                        </Typography>
                      }
                      componentsProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "white",
                            color: "black",
                            border: "1px solid black",
                            boxShadow: 2, // Optional for a subtle shadow
                            maxWidth: 300, // Optional to control width
                            fontSize: "14px",
                            borderRadius: "10px",
                          },
                        },
                        arrow: {
                          sx: {
                            color: "white",
                            "&::before": {
                              border: "1px solid black",
                              backgroundColor: "white",
                            },
                          },
                        },
                      }}
                    >
                      <p style={{ textDecoration: "underline" }}>
                        {exchangePolicy?.returns && "Returns"} {exchangePolicy?.returns && exchangePolicy?.exchange && "&"} {exchangePolicy?.exchange && "Exchanges" } Accepted within
                      </p>
                    </Tooltip>
                    <p> {exchangePolicy?.returnExchangeTime} days</p>
                  </Box>
                </ListItemText>
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <LocalShippingIcon sx={{ color: "black" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Delivery Cost:"
                  secondary={`${currency?.symbol} ${(currency?.rate * (+existingShipping?.shippingFee?.perItem + +existingShipping?.shippingFee?.perOrder)).toFixed(2)}`}
                />
              </ListItem>

              {/* <ListItem>
                <ListItemIcon>
                  <LocationOnIcon  sx={{ color: "black" }}  />
                </ListItemIcon>
                <ListItemText
                  primary="Shipped From:"
                  secondary="Dispatched from India"
                />
              </ListItem> */}
              <ListItem>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOnIcon sx={{ color: "black", mr: 1 }} />
                  <Typography variant="body1" fontWeight={500}>
                    Deliver to {country}
                  </Typography>
                  <IconButton
                    sx={{ ml: 1 }}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <EditIcon sx={{ color: "black" }} />
                  </IconButton>
                </Box>
              </ListItem>
              
            </List>
          </>
        )}
        <Box>
          {isEditing && (
            <Box
              sx={{
                mt: 2,
                columnCount: {
                  xs: 1, // Mobile
                  sm: 2, // Small screens
                  md: 3, // Medium screens
                  lg: 4, // Large screens
                },
                columnGap: 2, // Optional: add gap between columns
              }}
            >
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={country}
                  onChange={handleCountryChange}
                  label="Country"
                >
                  {allCountries?.map((item, index) => (
                    <MenuItem key={index} value={item?.name}>
                      {item?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button variant="contained" fullWidth onClick={handleSave}>
                Submit
              </Button>
            </Box>
          )}
        </Box>
        <List>
          <ListItem>
            <HtmlRenderer html={ exchangePolicy?.description || ""} />
          </ListItem>
        </List>
      </Box>
    </>
  );
};

export default DeliveryAndReturnPolicy;
