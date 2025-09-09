"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Link from "next/link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useChat from "hooks/useChat";
import { Span } from "components/Typography";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useMyProvider from "hooks/useMyProvider";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, storage } from "../../../src/firebase/Firebase";

const nameSelect = [
  {
    value: "Inbox",
    label: "Inbox",
  },
  {
    value: "From Agukart",
    label: "From Agukart",
  },
  {
    value: "Sent",
    label: "Sent",
  },
  {
    value: "All",
    label: "All",
  },
  {
    value: "Unread",
    label: "Unread",
  },
  {
    value: "Recyle bin",
    label: "Recyle bin",
  },
];

const ChatLayout = ({ children }) => {
  const { usercredentials } = useMyProvider();
  const [singleVendorDetails, setSingleVendorDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [productData,setProductDate] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const {
    checkMessage,
    moveToChatHandler,
    moveToTrashHandler,
    permanentDeleteHandler,
    setCheckMessage,
    showCount,
    markAsUnreadHandler,
    markAsReadHandler,
    allChecked,
    setAllChecked,
    chats,
    etsyCount,
    searchText,
    setSearchText,
    searchHandler,
    getSingleVendorDetails
  } = useChat();

  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);

  const pathname = usePathname();

  // console.log({children})

  console.log(etsyCount, "childrenchildren");

  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  let slug = searchParams.get("slug");


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, input]);
      setInput(""); // Clear input field
    }
  };

  const router = useRouter();
  console.log("chats", chats, checkMessage);
  useEffect(() => {
    return () => setCheckMessage([]);
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

   useEffect(() => {
    const q = query(
      collection(db, role === "admin" ? "composeChat" : "chatRooms"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, async(snapshot) => {
      const newMessages = snapshot?.docs?.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const matchingDocument = newMessages?.filter((doc) => {
        return doc?.id === slug;
      });
      const vendor_detail = await getSingleVendorDetails(matchingDocument[0]?.receiverId);
      setSingleVendorDetails(vendor_detail);
    });

    return () => unsubscribe();
  }, [slug, usercredentials?._id, role]);
  return (
    <Box>
      <Box
        p={3}
        sx={{
          display: { lg: "flex", md: "flex", xs: "block" },
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Message
        </Typography>
        <Box
          sx={{
            marginLeft: { lg: "25px", md: "25px", xs: "0" },
            marginTop: { lg: "0", md: "0", xs: "12px" },
            height: "40px",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            boxShadow: "0 0 3px #000",
            borderRadius: "30px",
          }}
        >
          <TextField
            required
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            id="outlined-required"
            defaultValue="Enter Code"
            sx={{ ".MuiOutlinedInput-notchedOutline": { border: "none" } }}
          />
          <Button
            disabled={searchText ? false : true}
            onClick={searchHandler}
            sx={{
              paddingLeft: "18px",
              paddingRight: "18px",
              background: "none",
              border: "none",
              borderRadius: "30px",
            }}
          >
            <SearchIcon />
          </Button>
        </Box>
      </Box>
      <Grid
        container
        border={"1px solid #b6b6b6"}
        width={"100%"}
        m={0}
        mb={4}
        spacing={3}
      >
        <Grid lg={2} md={3} xs={12} borderRight={"1px solid #b6b6b6"}>
          <Box
            p={2}
            sx={{
              height: "100%",
              background: "#f6f9fc",
              display: { lg: "block", md: "block", xs: "none" },
            }}
          >
            <List>
              <ListItem
                sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
              >
                <Button
                  onClick={() => router.push("/messages/inbox")}
                  sx={{
                    background: pathname === "/messages/inbox"? "#dedede" : "none",
                    width: "100%",
                    justifyContent: "space-between",
                    transition: "all 500ms",
                    fontWeight: "500",
                    border: "none",
                    borderRadius: "30px",
                    padding: "5px 16px",
                    color: "#000",
                    "&:hover": { background: "#dedede" },
                  }}
                >
                  Inbox
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </Button>
              </ListItem>
              <ListItem
                sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
              >
                <Button
                  onClick={() => router.push("/messages/etsy")}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    transition: "all 500ms",
                    fontWeight: "500",
                    background:
                      pathname === "/messages/etsy"
                        ? "#dedede"
                        : "none",

                    border: "none",
                    borderRadius: "30px",
                    padding: "5px 16px",
                    color: "#000",
                    "&:hover": { background: "#dedede" },
                  }}
                >
                  From Agukart
                  <Span>{etsyCount === 0 ? "" : etsyCount}</Span>
                </Button>
              </ListItem>
              <ListItem
                sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
              >
                <Button
                  onClick={() => router.push("/messages/sent")}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    transition: "all 500ms",
                    fontWeight: "500",
                    background:
                      pathname === "/messages/sent"
                        ? "#dedede"
                        : "none",

                    border: "none",
                    borderRadius: "30px",
                    padding: "5px 16px",
                    color: "#000",
                    "&:hover": { background: "#dedede" },
                  }}
                >
                  Sent
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </Button>
              </ListItem>
              <ListItem
                sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
              >
                <Button
                  onClick={() => router.push("/messages")}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    transition: "all 500ms",
                    fontWeight: "500",
                    background: pathname === "/messages"  ? "#dedede"
                    : "none",
                    border: "none",
                    borderRadius: "30px",
                    padding: "5px 16px",
                    color: "#000",
                    "&:hover": { background: "#dedede" },
                  }}
                >
                  All
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </Button>
              </ListItem>
              <ListItem
                sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
              >
                <Button
                  onClick={() => router.push("/messages/unread")}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    transition: "all 500ms",
                    fontWeight: "500",
                    background:
                      pathname === "/messages/unread"
                        ? "#dedede"
                        : "none",
                    border: "none",
                    borderRadius: "30px",
                    padding: "5px 16px",
                    color: "#000",
                    "&:hover": { background: "#dedede" },
                  }}
                >
                  Unread
                  <Span>{showCount === 0 ? "" : showCount}</Span>
                </Button>
              </ListItem>
              <ListItem
                sx={{ paddingLeft: "0", paddingRight: "0", paddingBottom: "0" }}
              >
                <Button
                  onClick={() => router.push("/messages/pin")}
                  sx={{
                    width: "100%",
                    justifyContent: "space-between",
                    transition: "all 500ms",
                    fontWeight: "500",
                    background:
                      pathname === "/messages/pin"
                        ? "#dedede"
                        :"none",
                    border: "none",
                    borderRadius: "30px",
                    padding: "5px 16px",
                    color: "#000",
                    "&:hover": { background: "#dedede" },
                  }}
                >
                  Pin
                </Button>
              </ListItem>
              <Link href="/messages/trash">
                <ListItem
                  sx={{
                    paddingLeft: "0",
                    paddingRight: "0",
                    paddingBottom: "0",
                  }}
                >
                  <Button
                    sx={{
                      width: "100%",
                      justifyContent: "space-between",
                      transition: "all 500ms",
                      fontWeight: "500",
                      background:
                        pathname === "/messages/trash"
                          ? "#dedede"
                          : "none",
                      border: "none",
                      borderRadius: "30px",
                      padding: "5px 16px",
                      color: "#000",
                      "&:hover": { background: "#dedede" },
                    }}
                  >
                    Recycle bin
                  </Button>
                </ListItem>
              </Link>
            </List>
          </Box>
          <Box p={2} sx={{ display: { lg: "none", md: "none", xs: "block" } }}>
            <TextField
              select
              defaultValue="Inbox"
              sx={{
                width: "100%",
                ".MuiInputBase-root": {
                  height: "50px",
                },
              }}
            >
              {nameSelect.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Grid>
        <Grid lg={slug ? 7 : 10} md={slug ? 7 : 10} xs={12}>
          <Box>
            <Box
              p={2}
              sx={{ background: "#f6f9fc" }}
              borderBottom={"1px solid #b6b6b6"}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {chats.length === 0 ? (
                  <>
                    <Typography component="span">
                      <Checkbox />
                    </Typography>
                  </>
                ) : (
                  <Typography component="span">
                    <Checkbox
                      checked={checkMessage.length === chats.length}
                      onChange={() => {
                        if (checkMessage.length !== chats.length) {
                          const allCheckIds = chats.map((doc) => {
                            return doc.id;
                          });
                          setCheckMessage(allCheckIds);
                        } else {
                          setCheckMessage([]);
                        }
                      }}
                    />
                  </Typography>
                )}

                <List
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0",
                    marginLeft: "30px",
                  }}
                >
                  {pathname !== "/messages/etsy" && (
                    <ListItem
                      sx={{
                        width: "auto",
                        paddingLeft: "0",
                        paddingRight: "8px",
                      }}
                    >
                      <Tooltip
                        title={
                          !checkMessage.length ? "Please select a message" : ""
                        }
                        arrow
                      >
                        <Button
                          onClick={
                            pathname === "/messages/trash"
                              ? permanentDeleteHandler
                              : moveToTrashHandler
                          }
                          sx={{
                            transition: "all 500ms",
                            fontWeight: "500",
                            background: "none",
                            border:
                              checkMessage.length === 0
                                ? "1px solid #e1e1e1"
                                : "1px solid black",
                            opacity: checkMessage.length === 0 ? "0.4" : "1",
                            borderRadius: "30px",
                            padding: "5px 16px",
                            color: "#000",
                            "&:hover": { background: "#dedede" },
                          }}
                        >
                          {pathname === "/messages/trash"
                            ? "Delete"
                            : "Recycle bin"}
                        </Button>
                      </Tooltip>
                    </ListItem>
                  )}
                  <ListItem
                    sx={{
                      width: "auto",
                      paddingLeft: "0",
                      paddingRight: "6px",
                    }}
                  >
                    <Tooltip
                      title={
                        checkMessage.length > 0 ? "" : "Please select a message"
                      }
                      arrow
                    >
                      <Button
                        onClick={markAsUnreadHandler}
                        sx={{
                          transition: "all 500ms",
                          fontWeight: "500",
                          background: "none",
                          border:
                            checkMessage.length === 0
                              ? "1px solid #e1e1e1"
                              : "1px solid black",
                          opacity: checkMessage.length === 0 ? "0.4" : "1",
                          borderRadius: "30px",
                          padding: "5px 16px",
                          color: "#000",
                          "&:hover": { background: "#dedede" },
                        }}
                      >
                        Mark Unread
                      </Button>
                    </Tooltip>
                  </ListItem>
                  <ListItem
                    sx={{
                      width: "auto",
                      paddingLeft: "0",
                      paddingRight: "6px",
                      display: { lg: "block", md: "block", xs: "none" },
                    }}
                  >
                    <Tooltip
                      title={
                        checkMessage.length > 0 ? "" : "Please select a message"
                      }
                      arrow
                    >
                      <Button
                        onClick={markAsReadHandler}
                        sx={{
                          transition: "all 500ms",
                          fontWeight: "500",
                          background: "none",
                          border:
                            checkMessage.length === 0
                              ? "1px solid #e1e1e1"
                              : "1px solid black",
                          opacity: checkMessage.length === 0 ? "0.4" : "1",
                          borderRadius: "30px",
                          padding: "5px 16px",
                          color: "#000",
                          "&:hover": { background: "#dedede" },
                        }}
                      >
                        Mark Read
                      </Button>
                    </Tooltip>
                  </ListItem>
                  {pathname === "/messages/trash" ? (
                    <ListItem
                      sx={{
                        width: "auto",
                        paddingLeft: "0",
                        paddingRight: "6px",
                        display: { lg: "block", md: "block", xs: "none" },
                      }}
                    >
                      <Tooltip
                        title={
                          checkMessage.length > 0
                            ? ""
                            : "Please select a message"
                        }
                        arrow
                      >
                        <Button
                          onClick={moveToChatHandler}
                          sx={{
                            transition: "all 500ms",
                            fontWeight: "500",
                            background: "none",
                            border:
                              checkMessage.length === 0
                                ? "1px solid #e1e1e1"
                                : "1px solid black",
                            opacity: checkMessage.length === 0 ? "0.4" : "1",
                            borderRadius: "30px",
                            padding: "5px 16px",
                            color: "#000",
                            "&:hover": { background: "#dedede" },
                          }}
                        >
                          Move to inbox
                        </Button>
                      </Tooltip>
                    </ListItem>
                  ) : (
                    <></>
                  )}
                  <ListItem
                    sx={{
                      width: "auto",
                      paddingLeft: "0",
                      paddingRight: "6px",
                      display: { lg: "none", md: "none", xs: "block" },
                    }}
                  >
                    <Button
                      aria-label="more"
                      id="basic-button"
                      aria-controls={open2 ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open2 ? "true" : undefined}
                      onClick={handleClick2}
                      sx={{
                        transition: "all 500ms",
                        fontWeight: "500",
                        background: "none",
                        border: "none",
                        opacity: "0.4",
                        borderRadius: "30px",
                        padding: "5px 16px",
                        color: "#000",
                        "&:hover": { background: "#dedede" },
                      }}
                    >
                      <MoreVertIcon />
                    </Button>
                    <Menu
                      anchorEl={anchorEl2}
                      open={open2}
                      onClose={handleClose2}
                      MenuListProps={{
                        "aria-labelledby": "basic-button",
                      }}
                    >
                      <MenuItem>
                        <Box>
                          <List>
                            <ListItem
                              sx={{
                                paddingBottom: "0",
                                width: "auto",
                                paddingLeft: "0",
                                paddingRight: "6px",
                              }}
                            >
                              <Button
                                sx={{
                                  transition: "all 500ms",
                                  fontWeight: "500",
                                  background: "#fff",
                                  border: "none",
                                  borderRadius: "30px",
                                  padding: "5px 16px",
                                  color: "#000",
                                  "&:hover": { background: "#dedede" },
                                }}
                              >
                                Mark Read
                              </Button>
                            </ListItem>
                            <ListItem
                              sx={{
                                paddingBottom: "0",
                                width: "auto",
                                paddingLeft: "0",
                                paddingRight: "6px",
                              }}
                            >
                              <Button
                                sx={{
                                  transition: "all 500ms",
                                  fontWeight: "500",
                                  background: "#fff",
                                  border: "none",
                                  borderRadius: "30px",
                                  padding: "5px 16px",
                                  color: "#000",
                                  "&:hover": { background: "#dedede" },
                                }}
                              >
                                Move to inbox
                              </Button>
                            </ListItem>
                          </List>
                        </Box>
                      </MenuItem>
                    </Menu>
                  </ListItem>
                </List>
              </Box>
            </Box>
            {children}
          </Box>
        </Grid>
        {slug && (
          <Grid lg={3} md={3} xs={12}>
            <Box p={3} sx={{ border: "1px solid #b6b6b6", height: "100%" }}>
              <Typography
                component="div"
                pb={2}
                sx={{
                  display: "flex",
                  flexDirection: { lg: "row", md: "row", xs: "column-reverse" },
                  alignItems: "center",
                  justifyContent: {
                    lg: "space-between",
                    md: "space-between",
                    xs: "center",
                  },
                }}
              >
                <Typography
                  component="div"
                  sx={{ textAlign: { lg: "start", md: "start", xs: "center" } }}
                >
                  <Typography fontSize={15} fontWeight={500} color={"#000"}>
                    <Link
                      href="#"
                      sx={{
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Name : {singleVendorDetails?.name ? `${singleVendorDetails.name} (${singleVendorDetails?.vendor?.shop_name || "Unknown Vendor"})` : "Agukart"}
                    </Link>
                  </Typography>
                </Typography>
                <Typography component="div">
                  <img
                    src={singleVendorDetails?.image || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
                    alt=""
                    style={{
                      borderRadius: "50%",
                      width: "45px",
                      height: "45px",
                    }}
                  />
                </Typography>
              </Typography>
              {
                Object.keys(productData).length > 0 &&  
                <Box mt={2}>
                  <Typography fontSize={16} fontWeight={600} pb={1}>
                    Item
                  </Typography>
                  <Typography
                    component="div"
                    pb={2}
                    sx={{
                      display: "flex",
                      flexDirection: { lg: "row", md: "row", xs: "column" },
                      justifyContent: {
                        lg: "space-between",
                        md: "space-between",
                        xs: "star",
                      },
                    }}
                  >
                    <Typography component="div">
                      <img
                        src="https://i.etsystatic.com/iusa/5d5a40/98780171/iusa_75x75.98780171_9ox6.jpg?version=0"
                        alt=""
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "4px",
                        }}
                      />
                    </Typography>
                    <Typography
                      component="div"
                      sx={{ paddingLeft: { lg: 2, md: 2, xs: 0 } }}
                    >
                      <Typography
                        fontSize={14}
                        fontWeight={500}
                        color={"#000"}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <Link
                          href="#"
                          sx={{
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          925 Sterling Silver Spinner Ring for Woman Girls
                        </Link>
                      </Typography>
                      <Typography fontSize={13} fontWeight={500} color={"#000"}>
                        $69.88
                      </Typography>
                      <Typography fontSize={14} fontWeight={500} color={"#000"}>
                        Ring size:{" "}
                        <Typography component="span" fontWeight={400}>
                          9 US
                        </Typography>
                      </Typography>
                      <Typography fontSize={14} fontWeight={500} color={"#000"}>
                        Design and Engraved Options:{" "}
                        <Typography component="span" fontWeight={400}>
                          Design A not Engrave
                        </Typography>
                      </Typography>
                    </Typography>
                  </Typography>
                </Box>
              }
              <Accordion expanded={expanded === "messageHistory"} onChange={handleChange("messageHistory")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                  <Typography fontWeight={500}>Message History</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>No data available</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion expanded={expanded === "orderHistory"} onChange={handleChange("orderHistory")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                  <Typography fontWeight={500}>Order History</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>No data available</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion expanded={expanded === "reviews"} onChange={handleChange("reviews")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                  <Typography fontWeight={500}>Reviews</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>No data available</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion expanded={expanded === "favoriteItems"} onChange={handleChange("favoriteItems")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                  <Typography fontWeight={500}>Favorite Items</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>No data available</Typography>
                </AccordionDetails>
              </Accordion>
              <Accordion expanded={expanded === "privateNotes"} onChange={handleChange("privateNotes")} sx={{ boxShadow: "none", border: "1px solid #ddd", borderRadius: "6px", mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f9f9f9" }}>
                  <Typography fontWeight={500}>Private Notes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>No data available</Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ChatLayout;
