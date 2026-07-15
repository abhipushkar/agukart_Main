"use client";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Link,
  List,
  ListItem,
  TextField,
  Tooltip,
  Typography,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
  Chip,
  Card,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { styled } from '@mui/material/styles';
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import CloseIcon from "@mui/icons-material/Close";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import SendIcon from "@mui/icons-material/Send";
import ImageIcon from "@mui/icons-material/Image";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import parse from "html-react-parser";
import { useCurrency } from "contexts/CurrencyContext";
import useMyProvider from "hooks/useMyProvider";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../../../../../src/firebase/Firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import useChat from "hooks/useChat";
import { where, limit } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { uploadChatFiles } from "utils/uploadChatFile";
import useAuth from "hooks/useAuth";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";

// Styled Components
const MessageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  height: "100%",
  overflow: "hidden",
  backgroundColor: "#fafafa",
}));

const MessagesWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  padding: theme.spacing(2),
  minHeight: 0,
  height: "100%",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#c1c1c1",
    borderRadius: "10px",
    "&:hover": {
      background: "#a8a8a8",
    },
  },
}));

const MessageBubble = styled(Paper)(({ theme, isOwn }) => ({
  padding: theme.spacing(1.5),
  maxWidth: "75%",
  minWidth: "60px",
  borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  backgroundColor: isOwn ? '#fff' : "#ddd",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
  transition: "all 0.2s ease",
  [theme.breakpoints.down("sm")]: {
    maxWidth: "90%",
    padding: theme.spacing(1),
  },
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: "#ffffff",
  borderTop: "1px solid #e8eaed",
  boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  flexShrink: 0,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "24px",
    backgroundColor: "#f8f9fa",
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
    },
    "& textarea": {
      padding: "12px 16px",
      fontSize: "14px",
      lineHeight: "1.5",
      [theme.breakpoints.down("sm")]: {
        fontSize: "13px",
        padding: "10px 12px",
      },
    },
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  flexWrap: "wrap",
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    gap: theme.spacing(0.5),
  },
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "60px",
  height: "60px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "2px solid #e8eaed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f5f5f5",
  [theme.breakpoints.down("sm")]: {
    width: "50px",
    height: "50px",
  },
}));

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: -6,
  right: -6,
  backgroundColor: "rgba(0,0,0,0.6)",
  color: "#fff",
  padding: "2px",
  width: "20px",
  height: "20px",
  zIndex: 10,
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "14px",
  },
}));

const DateDivider = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  color: theme.palette.text.secondary,
  fontSize: "12px",
  padding: theme.spacing(1, 0),
  [theme.breakpoints.down("sm")]: {
    fontSize: "11px",
  },
  // flex: 1,
  display: 'flex',
  justifyContent: 'center'
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: "10px",
  color: theme.palette.text.secondary,
  marginTop: "4px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "9px",
  },
}));

const MediaGrid = ({ items, onMediaClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!items || items.length === 0) return null;

  const displayItems = items.slice(0, 4);
  const remaining = items.length - 4;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: items.length === 1 ? '1fr' : 'repeat(2, 1fr)',
        gap: 0.5,
        maxWidth: "100%",
        mb: 1,
      }}
    >
      {displayItems.map((item, index) => {
        const isLast = index === 3 && remaining > 0;

        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: items.length === 1 ? '8px' : '4px',
              overflow: 'hidden',
              cursor: 'pointer',
              gridColumn: items.length === 1 ? '1 / -1' : 'auto',
              ...(items.length === 3 && index === 0 && {
                gridRow: '1 / 3',
              }),
            }}
            onClick={() => onMediaClick(index)}
          >
            <img
              src={item.url}
              alt={`media-${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {isLast && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                +{remaining}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const MessagePopup = ({
  vendorName,
  shopName,
  shopImage,
  handleClosePopup,
  openPopup,
  productID,
  productData,
  product_image,
  receiverid,
  orderId,
  subOrderId,
  subOrderProducts,
  baseUrl
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { usercredentials } = useMyProvider();
  const { currency } = useCurrency();
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const receiverId = receiverid;
  const senderId = usercredentials?._id;
  const router = useRouter();

  const [lightboxState, setLightboxState] = useState({
    open: false,
    index: 0,
    slides: [],
  });

  const handleMediaClick = (mediaItems, index) => {
    const slides = mediaItems.map(item => {
      if (item.type === 'video') {
        return {
          type: 'video',
          sources: [{ src: item.url, type: 'video/mp4' }],
        };
      }
      return {
        src: item.url,
      };
    });

    setLightboxState({
      open: true,
      index: index,
      slides: slides,
    });
  };

  const handleLightboxClose = () => {
    setLightboxState({ ...lightboxState, open: false });
  };

  const getMediaItems = (msg) => {
    const items = [];
    if (msg?.imageUrls?.length > 0) {
      msg.imageUrls.forEach(url => {
        items.push({ type: 'image', url });
      });
    }
    if (msg?.attachments?.length > 0) {
      msg.attachments.forEach(attachment => {
        if (attachment.type === 'image' || attachment.type === 'video') {
          items.push({ type: attachment.type, url: attachment.url });
        }
      });
    }
    return items;
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    console.log("msg", messages);
  }, [messages]);

  const detectLink = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", fontWeight: 500 }}>
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    if (!token) return;
    const q = query(
      collection(db, "chatRooms"),
      where("receiverId", "==", receiverId),
      where("user", "==", senderId),
      where("subOrderId", "==", subOrderId),
      limit(1)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot?.docs?.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const matchingDocument = newMessages?.filter((doc) => {
        return (
          doc?.subOrderId === subOrderId
        );
      });
      if (matchingDocument[0]?.permanentDeleteUser1 === usercredentials?._id) {
        setMessages([]);
        return;
      }
      matchingDocument.forEach((data) => {
        const filterArr = data?.text?.filter((msg) => {
          return msg.permanentDeleteUser !== senderId;
        });
        setMessages(filterArr);
      });
    });
    return () => unsubscribe();
  }, [senderId, receiverId, subOrderId]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploadError(null);

    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') ||
        file.type.startsWith('video/') ||
        file.type === 'application/pdf';
      const isValidSize = file.size <= 25 * 1024 * 1024;

      if (!isValidType) {
        setUploadError(`Invalid file type: ${file.type}`);
        return false;
      }
      if (!isValidSize) {
        setUploadError(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });

    const hasImages = validFiles.some(f => f.type.startsWith('image/'));
    const hasNonImages = validFiles.some(f => !f.type.startsWith('image/'));

    if (hasImages && hasNonImages) {
      setUploadError("Cannot send images and other file types together. Please send separately.");
      e.target.value = "";
      return;
    }

    const existingNonImages = files.filter(f => !f.type.startsWith('image/'));
    const newNonImages = validFiles.filter(f => !f.type.startsWith('image/'));

    if (existingNonImages.length > 0 && newNonImages.length > 0) {
      setUploadError("Only one video or PDF allowed");
      e.target.value = "";
      return;
    }

    const existingImages = files.filter(f => f.type.startsWith('image/'));
    const newImages = validFiles.filter(f => f.type.startsWith('image/'));

    if (existingImages.length + newImages.length > 10) {
      setUploadError("Maximum 10 images allowed");
      e.target.value = "";
      return;
    }

    const updatedFiles = [...files, ...validFiles];
    const previews = updatedFiles.map((file) => URL.createObjectURL(file));

    setFiles(updatedFiles);
    setImagePreviews(previews);
    e.target.value = "";
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        URL.revokeObjectURL(preview);
      });
    };
  }, []);

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPreview = () => {
    setImagePreviews([]);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const buildProductMessages = () => {
    let messages = [];

    if (subOrderProducts && subOrderProducts.length > 0 && !productID && !productData) {
      const productMessages = subOrderProducts.map((p) => ({
        senderType: "user",
        text: "",
        createdAt: new Date(),
        messageSenderId: senderId,
        isNotification: true,
        imageUrls: [],
        productId: p?.productData?._id || null,
        productLink: `https://agukart.com/product/slug/${p?.productData?.product_code}`,
        productData: {
          productTitle: p?.productData?.product_title || "",
          price: p?.sub_total || 0,
          imageUrl: p?.productData?.image?.[0] ? `${baseUrl}${p.productData.image[0]}` : "",
        },
        orderId: orderId || "",
        subOrderId: subOrderId || "",
      }));
      messages = productMessages;

      messages.push({
        senderType: "user",
        text: input?.trim() || "Hi, I need help with this order",
        createdAt: new Date(),
        messageSenderId: senderId,
        isNotification: false,
        imageUrls: [],
        orderId: orderId || "",
        subOrderId: subOrderId || ""
      });
    } else {
      messages = [
        {
          senderType: "user",
          text: "",
          createdAt: new Date(),
          messageSenderId: senderId,
          isNotification: true,
          imageUrls: [],
          productId: productID || null,
          productData: {
            productTitle: productData?.productData?.product_title || "",
            price: productData?.sub_total || 0,
            imageUrl: product_image || "",
          },
          orderId: orderId || "",
          subOrderId: subOrderId || ""
        },
        {
          senderType: "user",
          text: input?.trim() || "Hi, I need help with this order",
          createdAt: new Date(),
          messageSenderId: senderId,
          isNotification: false,
          imageUrls: [],
          orderId: orderId || "",
          subOrderId: subOrderId || ""
        }
      ];
    }

    // Clean messages - remove undefined values
    return messages.map(msg => {
      const cleaned = { ...msg };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === undefined) {
          delete cleaned[key];
        }
      });
      return cleaned;
    });
  };

  const sendMessage = async () => {
    if ((!input.trim() && files.length === 0) || isSending) return;
    setIsSending(true);
    let uploadedFiles = [];

    try {
      const chatQuery = query(
        collection(db, "chatRooms"),
        where("receiverId", "==", receiverId),
        where("user", "==", senderId),
        where("subOrderId", "==", subOrderId),
        limit(1)
      );

      const querySnapshot = await getDocs(chatQuery);
      let matchingDocument = null;

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        matchingDocument = {
          id: docSnap.id,
          data: docSnap.data(),
        };
      }

      // Upload files to backend API
      if (files.length > 0) {
        try {
          const uploadResult = await uploadChatFiles({
            files: files,
            token: token,
            addToast: (msg) => console.log(msg),
          });
          uploadedFiles = uploadResult;
          handleClearPreview();
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          setIsSending(false);
          return;
        }
      }

      if (matchingDocument) {
        if (matchingDocument.data.permanentDeleteUser1 === senderId) {
          await updateDoc(doc(db, "chatRooms", matchingDocument.id), {
            permanentDeleteUser1: "",
            isTempDelete1: "",
          });
        }

        const existingText = matchingDocument.data.text || [];
        const newMessages = [];

        if (input.trim() || uploadedFiles.length > 0) {
          newMessages.push({
            senderType: "user",
            text: input.trim(),
            createdAt: {
              seconds: Math.floor(Date.now() / 1000),
            },
            messageSenderId: senderId,
            isNotification: false,
            attachments: uploadedFiles,
          });
        }

        const alreadySent = productID
          ? existingText.some((msg) => msg.productId === productID)
          : false;

        if (productID && !alreadySent) {
          newMessages.push({
            senderType: "user",
            text: "",
            createdAt: {
              seconds: Math.floor(Date.now() / 1000),
            },
            messageSenderId: senderId,
            isNotification: true,
            imageUrls: [],
            productId: productID,
            productData: {
              productTitle: productData?.productData?.product_title,
              price: productData?.sub_total,
              imageUrl: product_image,
            },
          });
        }

        if (newMessages.length === 0) {
          setIsSending(false);
          return;
        }

        const updatedText = [...existingText, ...newMessages];
        await updateDoc(doc(db, "chatRooms", matchingDocument.id), {
          text: updatedText,
          currentTime: new Date(),
        });
        // Replace this entire else block (from line ~350-380) with:

      } else {
        const productMessages = buildProductMessages();

        // Build productData only if there's actual data
        let productdata = {};
        if (productData && Object.keys(productData).length > 0) {
          productdata = {
            orderId: orderId,
            name: productData?.productData?.product_title || "",
            qty: productData?.qty || 0,
            sale_price: productData?.sub_total || 0,
            product_image: product_image || "",
            isCombination: productData?.isCombination || false,
            variants: productData?.variants || [],
            variantData: productData?.variantData || [],
            variantAttributeData: productData?.variantAttributeData || [],
            customize: productData?.customize || "No",
            customizationData: productData?.customizationData || [],
          };
        }

        const mappedProducts = (subOrderProducts || []).map((item) => ({
          orderId: orderId || "",
          name: item?.productData?.product_title || "",
          qty: item?.qty || 0,
          sale_price: item?.sub_total || 0,
          product_image: item?.productData?.image?.[0] ? baseUrl + item.productData.image[0] : "",
          isCombination: item?.isCombination || false,
          variants: productData?.variants || [],
          variantData: item?.variantData || [],
          variantAttributeData: item?.variantAttributeData || [],
          customize: item?.customize || "No",
          customizationData: item?.customizationData || [],
        }));

        // Clean up the payload - remove undefined values
        const payload = {
          text: productMessages,
          createdAt: new Date(),
          user: senderId,
          receiverId: receiverId,
          isDeleted: false,
          currentTime: new Date(),
          userName: usercredentials?.name || "",
          vendorName: vendorName || "",
          shopName: shopName || "",
          productId: productID || "",
          orderId: orderId || "",
          subOrderId: subOrderId || "",
        };

        // Only add productData if it has keys
        if (Object.keys(productdata).length > 0) {
          payload.productData = productdata;
        }

        // Only add products if array has items
        if (mappedProducts && mappedProducts.length > 0) {
          payload.products = mappedProducts;
        }

        // Also clean up productMessages to ensure no undefined values
        const cleanedProductMessages = productMessages.map(msg => {
          const cleaned = { ...msg };
          // Remove undefined values
          Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === undefined) {
              delete cleaned[key];
            }
          });
          return cleaned;
        });

        // Update the text in payload with cleaned messages
        payload.text = cleanedProductMessages;

        await addDoc(collection(db, "chatRooms"), payload);
      }
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      console.trace("err", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date?.toLocaleDateString();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp?.seconds * 1000);
    return date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getExistingChatId = async () => {
    const q = query(
      collection(db, "chatRooms"),
      where("receiverId", "==", receiverId),
      where("user", "==", senderId),
      where("subOrderId", "==", subOrderId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }
    return null;
  };

  const groupMessagesByDate = () => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg?.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <Dialog
      open={openPopup}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          height: { xs: "100vh", sm: "600px" },
          maxHeight: { xs: "100vh", sm: "80vh" },
          maxWidth: "500px",
          margin: { xs: 0, sm: "auto" },
          borderRadius: { xs: 0, sm: "12px" },
          position: { xs: "fixed", sm: "relative" },
          bottom: { xs: 0, sm: "auto" },
          right: { xs: 0, sm: "auto" },
        },
        "& .MuiDialogContent-root": {
          padding: 0,
          overflow: "hidden",
        },
      }}
      PaperProps={{
        sx: {
          minWidth: { md: '50vw' },
          minHeight: { md: '90vh', lg: '90vh' }
        }
      }}
    >
      <DialogContent sx={{ padding: "0", height: "100%", overflow: "hidden" }}>
        <Lightbox
          open={lightboxState.open}
          close={handleLightboxClose}
          slides={lightboxState.slides}
          plugins={[Video]}
          index={lightboxState.index}
          styles={{
            container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
          }}
          controller={{
            closeOnBackdropClick: true,
          }}
          carousel={{
            finite: true,
            preload: 1,
          }}
          video={{
            autoPlay: false,
            controls: true,
          }}
        />

        <MessageContainer>
          {/* Header */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              background: "#fff",
              p: 2,
              flexShrink: 0,
              zIndex: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={shopImage || "https://i.etsystatic.com/isla/24ec0e/34844512/isla_75x75.34844512_ke6bg9xj.jpg?version=0"}
                sx={{ width: 40, height: 40 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={500}
                  fontSize={16}
                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                  onClick={async () => {
                    const chatId = await getExistingChatId();
                    if (chatId) {
                      handleClosePopup();
                      router.push(`/messages?slug=${chatId}`);
                    }
                  }}
                >
                  {vendorName} ({shopName})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Typically responds within 24 hours
                </Typography>
              </Box>
              <IconButton onClick={handleClosePopup} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages Area */}
          <MessagesWrapper bgcolor={'#efefef'}>
            <List sx={{ p: 0 }}>
              {Object.keys(messageGroups).map((date) => (
                <React.Fragment key={date}>
                  <DateDivider variant="caption">
                    {date === formatDate(new Date()) ? "Today" : date}
                  </DateDivider>
                  {messageGroups[date].map((msg, index) => {
                    const isOwn = msg.senderType === 'user';

                    return (
                      <ListItem
                        key={`${date}-${index}`}
                        sx={{
                          display: "flex",
                          justifyContent: isOwn ? "flex-end" : "flex-start",
                          padding: "4px 0",
                          border: "none",
                          width: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            maxWidth: "85%", // Increased from 100%
                            gap: 1,
                            width: "auto", // Allow it to size based on content
                            flex: 1
                          }}
                        >
                          {!isOwn && (
                            <Avatar
                              src={shopImage || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
                              sx={{
                                width: 32,
                                height: 32,
                                flexShrink: 0,
                                [theme.breakpoints.down("sm")]: {
                                  width: 28,
                                  height: 28,
                                },
                              }}
                            />
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isOwn ? "flex-end" : "flex-start",
                              maxWidth: "100%",
                              minWidth: 0, // Allow shrinking
                              flex: "1 1 auto", // Allow growth
                            }}
                          >
                            {(msg.text || msg?.imageUrls?.length > 0 || msg?.attachments?.length > 0) && (
                              <MessageBubble elevation={0} isOwn={isOwn}>
                                {/* Images from old format */}
                                {msg?.imageUrls?.length > 0 && (
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns: msg.imageUrls.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                      gap: 0.5,
                                      maxWidth: "100%",
                                      mb: msg.text ? 1 : 0,
                                    }}
                                  >
                                    {msg.imageUrls.slice(0, 4).map((imageUrl, imgIndex) => {
                                      const isLast = imgIndex === 3 && msg.imageUrls.length > 4;
                                      const remainingCount = msg.imageUrls.length - 4;

                                      return (
                                        <Box
                                          key={imgIndex}
                                          sx={{
                                            position: 'relative',
                                            aspectRatio: '1',
                                            borderRadius: msg.imageUrls.length === 1 ? '8px' : '4px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            gridColumn: msg.imageUrls.length === 1 ? '1 / -1' : 'auto',
                                            ...(msg.imageUrls.length === 3 && imgIndex === 0 && {
                                              gridRow: '1 / 3',
                                            }),
                                          }}
                                          onClick={() => {
                                            const mediaItems = getMediaItems(msg);
                                            const imageIndex = mediaItems.findIndex(item => item.url === imageUrl);
                                            handleMediaClick(mediaItems, imageIndex);
                                          }}
                                        >
                                          <img
                                            src={imageUrl}
                                            alt={`message-image-${imgIndex}`}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "cover",
                                            }}
                                          />
                                          {isLast && (
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                              }}
                                              onClick={() => {
                                                const mediaItems = getMediaItems(msg);
                                                const imageIndex = mediaItems.findIndex(item => item.url === imageUrl);
                                                handleMediaClick(mediaItems, imageIndex);
                                              }}
                                            >
                                              +{remainingCount}
                                            </Box>
                                          )}
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                )}

                                {/* New Attachments */}
                                {/* Images Grid */}
                                {msg?.attachments?.filter(a => a.type === 'image').length > 0 && (
                                  <Box
                                    sx={{
                                      display: "grid",
                                      gridTemplateColumns: msg.attachments.filter(a => a.type === 'image').length === 1 ? '1fr' : 'repeat(2, 1fr)',
                                      gap: 0.5,
                                      maxWidth: "100%",
                                      mb: msg.text ? 1 : 0,
                                    }}
                                  >
                                    {msg.attachments.filter(a => a.type === 'image').slice(0, 4).map((attachment, index) => {
                                      const imageAttachments = msg.attachments.filter(a => a.type === 'image');
                                      const imageIndex = imageAttachments.indexOf(attachment);
                                      const isLast = imageIndex === 3 && imageAttachments.length > 4;
                                      const remainingCount = imageAttachments.length - 4;

                                      return (
                                        <Box
                                          key={index}
                                          sx={{
                                            position: 'relative',
                                            aspectRatio: '1',
                                            borderRadius: imageAttachments.length === 1 ? '8px' : '4px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            gridColumn: imageAttachments.length === 1 ? '1 / -1' : 'auto',
                                            ...(imageAttachments.length === 3 && imageIndex === 0 && {
                                              gridRow: '1 / 3',
                                            }),
                                          }}
                                          onClick={() => {
                                            const mediaItems = getMediaItems(msg);
                                            const imageIndex = mediaItems.findIndex(item => item.url === attachment.url);
                                            handleMediaClick(mediaItems, imageIndex);
                                          }}
                                        >
                                          <img
                                            src={attachment.url}
                                            alt={`attachment-${index}`}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "cover",
                                            }}
                                          />
                                          {isLast && (
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                              }}
                                              onClick={() => {
                                                const mediaItems = getMediaItems(msg);
                                                const imageIndex = mediaItems.findIndex(item => item.url === attachment.url);
                                                handleMediaClick(mediaItems, imageIndex);
                                              }}
                                            >
                                              +{remainingCount}
                                            </Box>
                                          )}
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                )}

                                {/* Videos */}
                                {msg?.attachments?.filter(a => a.type === 'video').map((attachment, index) => (
                                  <Box
                                    key={`video-${index}`}
                                    sx={{
                                      maxWidth: "300px",
                                      maxHeight: "300px",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      cursor: 'pointer',
                                      mb: 0.5,
                                    }}
                                    onClick={() => {
                                      const mediaItems = getMediaItems(msg);
                                      const videoIndex = mediaItems.findIndex(item => item.url === attachment.url);
                                      handleMediaClick(mediaItems, videoIndex);
                                    }}
                                  >
                                    <video
                                      controls
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                      }}
                                    >
                                      <source src={attachment.url} />
                                      Your browser does not support the video tag.
                                    </video>
                                  </Box>
                                ))}

                                {/* PDFs */}
                                {msg?.attachments?.filter(a => a.type === 'pdf').map((attachment, index) => (
                                  <Box
                                    key={`pdf-${index}`}
                                    sx={{
                                      maxWidth: "280px",
                                      borderRadius: "8px",
                                      overflow: "hidden",
                                      border: "1px solid #e8eaed",
                                      p: 1,
                                      backgroundColor: isOwn ? "rgba(255,255,255,0.1)" : "#fff",
                                      mb: 0.5,
                                    }}
                                  >
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <span>📄</span>
                                      <Typography sx={{
                                        fontSize: "13px",
                                        wordBreak: "break-all",
                                        color: isOwn ? "#fff" : "inherit",
                                      }}>
                                        {attachment.fileName || "PDF Document"}
                                      </Typography>
                                    </a>
                                  </Box>
                                ))}

                                {/* Text Message */}
                                {msg.text && (
                                  <Typography
                                    sx={{
                                      fontSize: isMobile ? "14px" : "15px",
                                      wordWrap: "break-word",
                                      whiteSpace: "pre-wrap",
                                      width: 'fit-content',
                                      maxWidth: "100%",
                                      textAlign: "initial",
                                    }}
                                  >
                                    {detectLink(msg.text || "")}
                                  </Typography>
                                )}
                              </MessageBubble>
                            )}

                            {/* Product Card */}
                            {Object.keys(msg?.productData || {}).length > 0 && (
                              <Card
                                elevation={1}
                                sx={{
                                  p: 1.5,
                                  borderRadius: "12px",
                                  border: "1px solid #e8eaed",
                                  backgroundColor: "#fff",
                                  maxWidth: "280px",
                                  mt: 0.5,
                                }}
                              >
                                <Stack direction="row" spacing={1.5}>
                                  <img
                                    src={msg?.productData?.imageUrl}
                                    alt="Product"
                                    style={{
                                      width: 100,
                                      height: 100,
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                    }}
                                  />
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                      }}
                                    >
                                      {parse(msg?.productData?.productTitle || "")}
                                    </Typography>
                                    <Typography sx={{ fontSize: "14px", color: theme.palette.primary.main, fontWeight: 600 }}>
                                      {currency?.symbol}
                                      {(currency?.rate * msg?.productData?.price).toFixed(2)}
                                    </Typography>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      sx={{
                                        mt: 0.5,
                                        backgroundColor: 'black',
                                        color: 'white',
                                        textTransform: "none",
                                        fontSize: "11px",
                                        "&:hover": {
                                          backgroundColor: theme.palette.primary.dark,
                                        },
                                      }}
                                      onClick={() => {
                                        window.open(msg.productLink, "_blank");
                                      }}
                                    >
                                      Buy Now
                                    </Button>
                                  </Box>
                                </Stack>
                              </Card>
                            )}

                            <TimeStamp variant="caption">
                              {formatTime(msg?.createdAt)}
                            </TimeStamp>
                          </Box>

                          {isOwn && (
                            <Avatar
                              src={usercredentials?.image || "https://i.etsystatic.com/icm/0ff82a/701770387/icm_150x150.701770387_gvl90sgooigcowk8wcw0.png?version=0"}
                              sx={{
                                width: 32,
                                height: 32,
                                flexShrink: 0,
                                [theme.breakpoints.down("sm")]: {
                                  width: 28,
                                  height: 28,
                                },
                              }}
                            />
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </React.Fragment>
              ))}
            </List>
            <div ref={messagesEndRef} />
          </MessagesWrapper>

          {/* Input Area */}
          <InputContainer elevation={0}>
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <ImagePreviewContainer>
                {uploadError && (
                  <Typography
                    sx={{
                      color: 'error.main',
                      fontSize: '12px',
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    {uploadError}
                  </Typography>
                )}

                {files.length > 0 && (
                  <Typography
                    sx={{
                      color: 'text.secondary',
                      fontSize: '11px',
                      width: '100%',
                      mb: 1,
                    }}
                  >
                    {files.some(f => f.type.startsWith('video/')) && 'Max video size: 25MB'}
                    {files.some(f => f.type === 'application/pdf') && 'Max PDF size: 25MB'}
                    {files.some(f => f.type.startsWith('image/')) && `Max 10 images`}
                  </Typography>
                )}

                {imagePreviews.map((preview, index) => {
                  const file = files[index];
                  const isVideo = file?.type?.startsWith('video/');
                  const isPdf = file?.type === 'application/pdf';
                  const isImage = file?.type?.startsWith('image/');

                  return (
                    <ImagePreview key={index} sx={{ position: 'relative' }}>
                      {isVideo ? (
                        <span style={{ fontSize: "24px" }}>🎬</span>
                      ) : isPdf ? (
                        <span style={{ fontSize: "24px" }}>📄</span>
                      ) : isImage ? (
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : null}
                      <RemoveImageButton
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{ zIndex: 10 }}
                      >
                        <CloseIcon />
                      </RemoveImageButton>
                    </ImagePreview>
                  );
                })}
              </ImagePreviewContainer>
            )}

            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
              <StyledTextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                multiline
                minRows={1}
                maxRows={4}
                variant="outlined"
                fullWidth
                onKeyPress={handleKeyPress}
                disabled={isSending}
              />

              <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                <Tooltip title="Attach Image or Video or PDF" arrow>
                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    sx={{
                      backgroundColor: "transparent",
                      color: theme.palette.text.secondary,
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <AttachFileIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Send" arrow>
                  <IconButton
                    onClick={sendMessage}
                    disabled={(!input.trim() && files.length === 0) || isSending}
                    sx={{
                      backgroundColor: (!input.trim() && files.length === 0) || isSending
                        ? "rgba(0,0,0,0.12)"
                        : theme.palette.primary.main,
                      color: (!input.trim() && files.length === 0) || isSending
                        ? "rgba(0,0,0,0.26)"
                        : "#fff",
                      "&:hover": {
                        backgroundColor: (!input.trim() && files.length === 0) || isSending
                          ? "rgba(0,0,0,0.12)"
                          : theme.palette.primary.dark,
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <input
              type="file"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf"
              multiple
            />
          </InputContainer>
        </MessageContainer>
      </DialogContent>
    </Dialog>
  );
};

export default MessagePopup;