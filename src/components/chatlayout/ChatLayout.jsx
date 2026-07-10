"use client";
import React, { useEffect, useState } from "react";
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
import DescriptionIcon from "@mui/icons-material/Description";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useChat from "hooks/useChat";
import { Span } from "components/Typography";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Accordion, AccordionDetails, AccordionSummary, Drawer, IconButton, useTheme, useMediaQuery } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useMyProvider from "hooks/useMyProvider";
import parse from 'html-react-parser';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
  { value: "Inbox", label: "Inbox" },
  { value: "From Agukart", label: "From Agukart" },
  { value: "Sent", label: "Sent" },
  { value: "All", label: "All" },
  { value: "Unread", label: "Unread" },
  { value: "Recyle bin", label: "Recyle bin" },
];

// Styled components for better consistency
const SidebarButton = styled(Button)(({ theme, active }) => ({
  width: "100%",
  justifyContent: "space-between",
  transition: "all 300ms ease-in-out",
  fontWeight: "500",
  background: active ? "#fee8ef" : "transparent",
  border: "none",
  borderRadius: "12px",
  padding: "10px 16px",
  color: active ? "#e75e87" : "#3c4043",
  textTransform: "none",
  fontSize: "14px",
  "&:hover": {
    background: active ? "#e8f0fe" : "#f1f3f4",
    transform: "translateX(4px)",
  },
  "& .MuiSpan-root": {
    backgroundColor: active ? "#8a5666" : "#dadce0",
    color: active ? "#fff" : "#3c4043",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "12px",
    fontWeight: "600",
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  background: "#fff",
  borderRadius: "30px",
  padding: "4px 4px 4px 16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
  width: "100%",
  maxWidth: "300px",
  "&:hover": {
    boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  },
  "& .MuiTextField-root": {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: "none",
      },
    },
    "& .MuiInputBase-input": {
      padding: "8px 0",
      fontSize: "14px",
    },
  },
  "& .MuiButton-root": {
    minWidth: "40px",
    padding: "8px",
    borderRadius: "50%",
    color: "#5f6368",
    "&:hover": {
      background: "rgba(0,0,0,0.04)",
    },
  },
}));

const ActionButton = styled(Button)(({ theme, disabled: isDisabled }) => ({
  transition: "all 300ms ease-in-out",
  fontWeight: "500",
  background: "transparent",
  border: "1px solid",
  borderColor: isDisabled ? "#dadce0" : "#dadce0",
  borderRadius: "20px",
  padding: "6px 16px",
  color: isDisabled ? "#9aa0a6" : "#3c4043",
  textTransform: "none",
  fontSize: "13px",
  "&:hover": {
    background: isDisabled ? "transparent" : "#f1f3f4",
    borderColor: isDisabled ? "#dadce0" : "#3c4043",
  },
  "&.Mui-disabled": {
    opacity: 0.5,
    color: "#9aa0a6",
  },
}));

const ChatLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  const { usercredentials } = useMyProvider();
  const [singleVendorDetails, setSingleVendorDetails] = useState({});
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [productData, setProductDate] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [orderData, setOrderData] = useState(null);

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
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  let slug = searchParams.get("slug");
  const router = useRouter();

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
      setInput("");
    }
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const toggleDetailDrawer = () => {
    setDetailDrawerOpen(!detailDrawerOpen);
  };

  useEffect(() => {
    return () => setCheckMessage([]);
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  useEffect(() => {
    if (!slug) {
      setSingleVendorDetails({});
      return;
    }
    const collectionName = role === "admin" ? "composeChat" : "chatRooms";
    const chatRef = doc(db, collectionName, slug);
    const unsubscribe = onSnapshot(chatRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setSingleVendorDetails({});
        return;
      }
      const chatData = snapshot.data();
      if (!chatData?.receiverId) return;

      if (chatData.orderId && chatData.subOrderId) {
        const { text, ...order } = chatData;
        setOrderData(order);
      }
      const vendor_detail = await getSingleVendorDetails(chatData.receiverId);
      setSingleVendorDetails(vendor_detail || {});
    });
    return () => unsubscribe();
  }, [slug, role]);

  // Sidebar navigation items
  const navItems = [
    { label: "Inbox", path: "/messages/inbox", count: showCount },
    { label: "From Agukart", path: "/messages/etsy", count: etsyCount },
    { label: "Sent", path: "/messages/sent", count: showCount },
    { label: "All", path: "/messages", count: showCount },
    { label: "Unread", path: "/messages/unread", count: showCount },
    { label: "Pin", path: "/messages/pin" },
    { label: "Recycle bin", path: "/messages/trash" },
  ];

  // Sidebar content
  const SidebarContent = () => (
    <Box sx={{ height: "100%", overflowY: "auto", p: 2 }}>
      <List sx={{ p: 0 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} sx={{ px: 0, py: 0.5 }}>
            <SidebarButton
              active={pathname === item.path}
              onClick={() => {
                router.push(item.path);
                if (isMobile) setMobileDrawerOpen(false);
              }}
            >
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <Span>{item.count}</Span>
              )}
            </SidebarButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // Detail content
  const DetailContent = () => (
    <Box p={3} sx={{ height: "100%", overflowY: "auto" }}>
      <Typography
        component="div"
        pb={2}
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: "center",
          justifyContent: { xs: "center", sm: "space-between" },
        }}
      >
        <Typography
          component="div"
          sx={{ textAlign: { xs: "center", sm: "start" } }}
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
        <Typography component="div" sx={{ mb: { xs: 1, sm: 0 } }}>
          <img
            src={singleVendorDetails?.image || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
            alt=""
            style={{
              borderRadius: "50%",
              width: "45px",
              height: "45px",
              objectFit: "cover",
            }}
          />
        </Typography>
      </Typography>

      {orderData && (
        <Box mt={2}>
          <Typography
            component="div"
            sx={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#000",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            Store : {orderData.shopName || "-"}
          </Typography>
          <Typography
            component="div"
            sx={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#000",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "4px",
            }}
          >
            SubOrder Id : {`#${orderData.subOrderId || "-"}`}
          </Typography>
          <Typography fontSize={16} fontWeight={600} pb={1}>
            Items:
          </Typography>
          {orderData.products?.map((item, itemIndex) => (
            <Typography
              key={`product-item-${itemIndex}`}
              component="div"
              pb={2}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: { xs: 1, sm: 2 },
              }}
            >
              <Typography component="div">
                <img
                  src={item?.product_image || "https://i.etsystatic.com/iusa/5d5a40/98780171/iusa_75x75.98780171_9ox6.jpg?version=0"}
                  alt=""
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "4px",
                    objectFit: "cover",
                  }}
                />
              </Typography>
              <Typography component="div" sx={{ width: "100%" }}>
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
                    to=""
                    href={''}
                    sx={{
                      color: "#000",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {parse(item?.name || "") || "Product Name"}
                  </Link>
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  ${item?.sale_price}
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Qty: {item?.qty}
                </Typography>
                {item?.isCombination && item?.variantData?.map((variant, index) => (
                  <Typography
                    fontSize={13}
                    fontWeight={400}
                    color={"#000"}
                    key={`variant-${itemIndex}-${index}`}
                  >
                    {variant?.variant_name}:{" "}
                    <Typography component="span" fontWeight={400}>
                      {item?.variantAttributeData?.[index]?.attribute_value || "N/A"}
                    </Typography>
                  </Typography>
                ))}
                {item?.variants && item?.variants?.length > 0 && (
                  <>
                    {item?.variants?.map((variant, index) => (
                      <Typography
                        fontSize={13}
                        fontWeight={400}
                        color={"#000"}
                        key={`variant-${itemIndex}-${index}`}
                      >
                        {variant?.variantName}:{" "}
                        <Typography component="span" fontWeight={400}>
                          {variant?.attributeName}
                        </Typography>
                      </Typography>
                    ))}
                  </>
                )}
                {item?.customize == "Yes" && item?.customizationData?.map((customItem, index) => (
                  <div key={index}>
                    {Object.entries(customItem).map(([key, value]) => (
                      <div key={key}>
                        {typeof value === "object" ? (
                          <div>{key}: {value?.value}</div>
                        ) : (
                          <div>{key}: {value}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </Typography>
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        p={{ xs: 2, sm: 3 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          bgcolor: "#fff",
          borderBottom: "1px solid #e8eaed",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

          <Typography variant="h5" fontWeight={600} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
            Messages
          </Typography>
        </Box>

        <SearchBox>
          <TextField
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search messages..."
            size="small"
            onKeyPress={(e) => e.key === "Enter" && searchHandler()}
          />
          <Button
            disabled={!searchText}
            onClick={searchHandler}
            sx={{
              minWidth: "40px",
              p: 1,
              borderRadius: "50%",
            }}
          >
            <SearchIcon />
          </Button>
        </SearchBox>

      </Box>

      {/* Main Content */}
      <Grid container spacing={0} sx={{ height: "calc(100vh - 80px)" }}>
        {/* Sidebar - Desktop */}
        <Grid
          item
          xs={false}
          md={3}
          lg={2.5}
          sx={{
            display: { xs: "none", md: "block" },
            borderRight: "1px solid #e8eaed",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <SidebarContent />
        </Grid>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={toggleMobileDrawer}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              bgcolor: "#f8f9fa",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={toggleMobileDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <SidebarContent />
        </Drawer>

        {/* Chat List Area */}
        <Grid
          item
          xs={12}
          md={slug ? 6 : 9}
          lg={slug ? 6.5 : 9.5}
          sx={{
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            bgcolor: "#fff",
          }}>
            {/* Toolbar */}
            <Box
              p={{ xs: 1, sm: 2 }}
              sx={{
                borderBottom: "1px solid #e8eaed",
                flexShrink: 0,
                bgcolor: "#f8f9fa",
              }}
            >
              <Box sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
              }}>
                {isMobile && (
                  <IconButton onClick={toggleMobileDrawer} sx={{ color: "#3c4043" }}>
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography component="span">
                  <Checkbox
                    checked={
                      slug
                        ? checkMessage.includes(slug)
                        : chats.length > 0 && checkMessage.length === chats.length
                    }
                    onChange={() => {
                      if (slug) {
                        if (checkMessage.includes(slug)) {
                          setCheckMessage([]);
                        } else {
                          setCheckMessage([slug]);
                        }
                      } else {
                        if (checkMessage.length !== chats.length) {
                          const allCheckIds = chats.map((doc) => doc.id);
                          setCheckMessage(allCheckIds);
                        } else {
                          setCheckMessage([]);
                        }
                      }
                    }}
                    size={isMobile ? "small" : "medium"}
                  />
                </Typography>

                <Box sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  alignItems: "center",
                  flex: 1,
                }}>
                  {pathname !== "/messages/etsy" && (
                    <Tooltip title={!checkMessage.length ? "Please select a message" : ""} arrow>
                      <span>
                        <ActionButton
                          disabled={!checkMessage.length}
                          onClick={pathname === "/messages/trash" ? permanentDeleteHandler : moveToTrashHandler}
                        >
                          {pathname === "/messages/trash" ? "Delete" : "Recycle bin"}
                        </ActionButton>
                      </span>
                    </Tooltip>
                  )}

                  <Tooltip title={!checkMessage.length ? "Please select a message" : ""} arrow>
                    <span>
                      <ActionButton
                        disabled={!checkMessage.length}
                        onClick={markAsUnreadHandler}
                      >
                        Mark Unread
                      </ActionButton>
                    </span>
                  </Tooltip>

                  <ActionButton
                    disabled={!checkMessage.length}
                    onClick={markAsReadHandler}
                    sx={{ display: { xs: "none", sm: "inline-flex" } }}
                  >
                    Mark Read
                  </ActionButton>

                  {pathname === "/messages/trash" && (
                    <ActionButton
                      disabled={!checkMessage.length}
                      onClick={moveToChatHandler}
                      sx={{ display: { xs: "none", sm: "inline-flex" } }}
                    >
                      Move to inbox
                    </ActionButton>
                  )}

                  {/* Mobile More Menu */}
                  <IconButton
                    onClick={handleClick2}
                    sx={{ display: { xs: "inline-flex", sm: "none" } }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl2}
                    open={open2}
                    onClose={handleClose2}
                  >
                    <MenuItem onClick={() => { markAsReadHandler(); handleClose2(); }}>
                      Mark Read
                    </MenuItem>
                    {pathname === "/messages/trash" && (
                      <MenuItem onClick={() => { moveToChatHandler(); handleClose2(); }}>
                        Move to inbox
                      </MenuItem>
                    )}
                  </Menu>
                </Box>

                {/* Detail toggle for mobile/tablet */}
                {slug && (
                  <IconButton
                    onClick={toggleDetailDrawer}
                    sx={{ display: { xs: "inline-flex", lg: "none" } }}
                  >
                    <DescriptionIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {/* Chat List */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              {children}
            </Box>
          </Box>
        </Grid>

        {/* Detail Panel - Desktop */}
        {slug && (
          <Grid
            item
            xs={false}
            lg={3}
            sx={{
              display: { xs: "none", sm: "none", lg: "block" },
              borderLeft: "1px solid #e8eaed",
              height: "100%",
              overflow: "hidden",
              bgcolor: "#f8f9fa",
            }}
          >
            <DetailContent />
          </Grid>
        )}

        {/* Detail Drawer - Mobile/Tablet */}
        <Drawer
          anchor="right"
          open={detailDrawerOpen}
          onClose={toggleDetailDrawer}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              width: { xs: "90%", sm: 400 },
              boxSizing: "border-box",
              bgcolor: "#f8f9fa",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={toggleDetailDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <DetailContent />
        </Drawer>
      </Grid>
    </Box>
  );
};

export default ChatLayout;