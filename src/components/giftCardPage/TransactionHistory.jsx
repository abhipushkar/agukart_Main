"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "@mui/material/Link";
// Local CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import { H2, H3, H4, H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ErrorIcon from "@mui/icons-material/Error";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// LOCAL CUSTOM COMPONENT

// CUSTOM DATA MODEL
import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Tooltip,
  tooltipClasses,
} from "@mui/material";
import { Carousel } from "components/carousel";
import { fontSize } from "theme/typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";

const TransactionHistory = () => {
  const { addToast } = useToasts();
  const [showLoading, setShowLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedValue, setSelectedValue] = useState("redeemed");
  const [open, setOpen] = useState(false);
  const [giftCardId, setGiftCardId] = useState("");
  const [email, setEmail] = useState("");
  console.log({ email });
  const [loading, setLoading] = useState(false);
  console.log(transactions, "transactions");

  const handleOpen = (id) => {
    setGiftCardId(id);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEmail("");
    setGiftCardId("");
  };

  const getGiftCardTransactionHistory = async () => {
    try {
      setTransactions([]);
      setShowLoading(true);
      const res = await getAPIAuth(
        `user/user-gift-card-transaction-history/${selectedValue}`
      );
      if (res.status === 200) {
        setTransactions(res?.data?.transactions);
      }
    } catch (error) {
      setShowLoading(false);
      console.log(error);
    } finally {
      setShowLoading(false);
    }
  };
  useEffect(() => {
    getGiftCardTransactionHistory();
  }, [selectedValue]);

  const handleResend = async () => {
    try {
      const payload = {
        _id: giftCardId,
        email: email,
      };
      setLoading(true);
      const res = await postAPIAuth("user/resendMailForGiftCardCode", payload);
      if (res.status === 200) {
        setLoading(false);
        addToast("Gift Card Resent Successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        handleClose();
      } else {
        addToast("Failed to resend gift card!", {
            appearance: "error",
            autoDismiss: true,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error resending gift card:", error);
      addToast("Failed to resend gift card!", {
        appearance: "error",
        autoDismiss: true,
    });
    }
  };
  return showLoading ? (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "48px",
        height: "100vh",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Typography variant="h6">We are working on your request</Typography>
        <CircularProgress size={20} />
      </Box>
    </Box>
  ) : (
    <>
      <SectionCreator py={4} mb={0} sx={{ background: "#f3f3f3" }}>
        <Grid container spacing={2} justifyContent={"center"}>
          <Grid item lg={8} md={10} xs={12}>
            <Box>
              <Box
                sx={{
                  background: "#fff",
                  boxShadow: "0 0 3px #a2a2a2",
                  padding: "15px",
                }}
              >
                <Typography variant="h5" fontWeight={600}>
                  Your Transactions
                </Typography>
              </Box>
              <Box
                sx={{
                  borderTop: "1px solid #ffffff",
                  background: "#fff",
                  boxShadow: "0 0 3px #a2a2a2",
                  padding: "8px 15px",
                }}
              >
                <RadioGroup
                  row
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                >
                  <FormControlLabel
                    value="redeemed"
                    control={<Radio />}
                    label="Redeemed Gift Card"
                  />
                  <FormControlLabel
                    value="purchased"
                    control={<Radio />}
                    label="Purchased Gift Card"
                  />
                  <FormControlLabel
                    value="admin"
                    control={<Radio />}
                    label="Admin Topup"
                  />
                </RadioGroup>
              </Box>
            </Box>
            <Box mt={2}>
              {transactions?.length > 0 ? (
                transactions?.map((item, index) => (
                  <Accordion
                    sx={{ background: "transparent", boxShadow: "none", mb: 2 }}
                  >
                    <AccordionSummary
                      // expandIcon={<ExpandMoreIcon />}
                      // aria-controls="panel1-content"
                      // id="panel1-header"
                      // key={index}
                      sx={{ boxShadow: "0 0 3px #a2a2a2", background: "#fff" }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          component="div"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "64px",
                              height: "64px",
                              padding: "8px",
                              border: "1px solid #cacaca",
                            }}
                          >
                            <img
                              src="/_next/static/media/logo2.8a582178.svg"
                              style={{ width: "100%", borderRadius: "4px" }}
                              alt=""
                            />
                          </Typography>
                          <Typography component="div" pl={2}>
                            <Typography>{(item?.orderId || item?.transaction_id) && "#"}{item?.orderId || item?.transaction_id}</Typography>
                            <Typography variant="h6">
                              {item?.description || item?.message}
                            </Typography>
                            <Typography>E-Commerce Gift card</Typography>
                            <Typography>{item?.createdAt}</Typography>
                          </Typography>
                        </Typography>
                        <Typography component="div">
                          <Typography
                            color={
                              item.transaction_type === "Cr"
                                ? "#2e7d32"
                                : "#b12704"
                            }
                            fontSize={19}
                          >
                            {item.transaction_type === "Cr"
                              ? `+${item?.amount}`
                              : `-${item?.amount}`}
                          </Typography>
                        </Typography>
                        {selectedValue == "purchased" &&
                          item?.isRedeemed == "0" && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={(e) => handleOpen(item?._id)}
                            >
                              Re-send Gift Card
                            </Button>
                          )}
                      </Box>
                    </AccordionSummary>
                    {/* <AccordionDetails>
                                            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                                                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                    <TableBody>
                                                        <TableRow
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <TableCell scope="row">Paid using </TableCell>
                                                            <TableCell component="th" scope="row">Amazon Pay ICICI Bank Credit Card ****8000</TableCell>
                                                            <TableCell scope="row">${item?.amount}</TableCell>
                                                        </TableRow>
                                                        <TableRow
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            <TableCell component="th" scope="row">
                                                                <Typography>Order ID</Typography>
                                                                <Typography>Item</Typography>
                                                            </TableCell>
                                                            <TableCell scope="row">
                                                                <Typography><Link href="#" sx={{ textDecoration: 'none', color: '#007185', '&:hover': { textDecoration: 'underline', color: 'red' } }}>171-4301324-4132321</Link></Typography>
                                                                <Typography>Electricity bill payment</Typography>
                                                            </TableCell>

                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails> */}
                  </Accordion>
                ))
              ) : (
                <>
                  <Box
                    sx={{
                      textAlign: "center",
                      fontSize: "20px",
                      textTransform: "uppercase",
                      fontWeight: 900,
                    }}
                  >
                    Transaction History Not Found
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </SectionCreator>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" mb={2}>
            Enter Email to Re-send Gift Card
          </Typography>
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleResend}
            fullWidth
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default TransactionHistory;
