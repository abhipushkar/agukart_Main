"use client";

import {
  Box,
  Button,
  Link,
  List,
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
import ListItem from "@mui/material/ListItem";
import React, { useEffect, useRef, useState } from "react";
import { db, storage } from "../../../src/firebase/Firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { InsertDriveFile, VideoFile } from "@mui/icons-material";
import useMyProvider from "hooks/useMyProvider";
import { useSearchParams } from "next/navigation";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { getAPIAuth, postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useCurrency } from "contexts/CurrencyContext";
import parse from "html-react-parser";
import useChat from "hooks/useChat";
import { styled } from '@mui/material/styles';
import { uploadChatFiles } from "utils/uploadChatFile";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";

// Styled Components
const MessageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
  backgroundColor: "#fafafa",
}));

const MessagesWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  overflowX: 'hidden',
  minHeight: 0, // Critical for flex children
  height: "100%", // Take full height
  padding: theme.spacing(2),
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

const MessageBubble = styled(Paper)(({ theme, isOwn, images, video }) => ({
  padding: theme.spacing(1.5),
  maxWidth: video ? '70%' : images > 1 ? "50%" : images === 1 ? "30%" : "100%",
  minHeight: video ? '70%' : undefined,
  minWidth: video ? 'fit-content' : '60px',
  borderRadius: isOwn ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  backgroundColor: isOwn ? '#fff' : "#ddd",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  wordWrap: "break-word",
  whiteSpace: "pre-wrap",
  transition: "all 0.2s ease",
  marginTop: "8px",
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
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
}));

const StyledTextArea = styled('textarea')(({ theme }) => ({
  width: '100%',
  padding: '12px 16px',
  fontSize: '14px',
  borderRadius: '24px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #222',
  resize: 'vertical',
  minHeight: '52px',
  maxHeight: '400px',
  outline: 'none',
  fontFamily: 'inherit',
  '&:focus': {
    border: `2px solid ${theme.palette.primary.main}`
  },
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '13px',
    padding: '10px 12px',
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
  flex: 1,
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


const MediaGrid = ({ items, isOwn, onMediaClick }) => {
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

const ChatBox = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const { usercredentials } = useMyProvider();
  const { currency } = useCurrency();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputContainerRef = useRef(null);
  const senderId = usercredentials?._id;
  const { token } = useAuth();
  const [singleVendorDetails, setSingleVendorDetails] = useState({});
  const [uploadError, setUploadError] = useState(null);
  const { getSingleVendorDetails } = useChat();

  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const slug = searchParams.get("slug");

  // Replace existing lightbox state with this
  const [lightboxState, setLightboxState] = useState({
    open: false,
    index: 0,
    slides: [],
  });

  // Handle image/video click
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

  // Close lightbox
  const handleLightboxClose = () => {
    setLightboxState({ ...lightboxState, open: false });
  };


  const handleTextareaInput = (e) => {
    const textarea = e.target;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height based on scrollHeight
    const newHeight = Math.max(textarea.scrollHeight, 52); // 56px = min height
    textarea.style.height = newHeight + 'px';

    // Update input value
    setInput(e.target.value);
  };

  // Function to get all media items from a message
  const getMediaItems = (msg) => {
    const items = [];

    // Old imageUrls
    if (msg?.imageUrls?.length > 0) {
      msg.imageUrls.forEach(url => {
        items.push({ type: 'image', url });
      });
    }

    // New attachments
    if (msg?.attachments?.length > 0) {
      msg.attachments.forEach(attachment => {
        if (attachment.type === 'image' || attachment.type === 'video') {
          items.push({ type: attachment.type, url: attachment.url });
        }
      });
    }

    return items;
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if (inputContainerRef.current)
          inputContainerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }, 100);
    }
    console.log(messages, "msg");
  }, [messages]);

  const handleRemoveAllNotification = async (venderID) => {
    if (!slug || !usercredentials?._id) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }

    const querySnapshot = await getDocs(
      collection(db, role === "admin" ? "composeChat" : "chatRooms")
    );

    const documents = querySnapshot.docs.map((doc) => {
      const docId = doc.id;
      const docData = doc.data();
      const receiverId = docData.receiverId;

      return {
        id: docId,
        data: docData,
        receiverId: receiverId,
      };
    });

    const matchingDocument = documents.find((doc) => {
      return doc.id === venderID;
    });

    if (!matchingDocument) {
      console.error("No matching document found for the provided venderID");
      return;
    }

    const existingText = matchingDocument.data.text || [];

    const updatedText = existingText.map((item) => {
      // Only mark vendor/admin messages as read (not user's own messages)
      if (
        item.messageSenderId !== senderId &&
        (item.senderType === "vendor" || item.senderType === "admin")
      ) {
        return {
          ...item,
          isNotification: true,
        };
      }
      return item;
    });

    await updateDoc(
      doc(
        db,
        role === "admin" ? "composeChat" : "chatRooms",
        matchingDocument.id
      ),
      {
        text: updatedText,
      }
    );
  };

  useEffect(() => {
    if (slug && messages.length > 0) {
      // Check if there are any unread messages from vendor/admin
      const hasUnreadVendorMessages = messages.some(
        (msg) =>
          msg.messageSenderId !== senderId &&
          (msg.senderType === "vendor" || msg.senderType === "admin") &&
          msg.isNotification === false
      );

      if (hasUnreadVendorMessages) {
        handleRemoveAllNotification(slug);
      }
    }
  }, [messages, slug, senderId]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploadError(null);

    // Validate files
    const validFiles = selectedFiles.filter(file => {
      const isValidType = file.type.startsWith('image/') ||
        file.type.startsWith('video/') ||
        file.type === 'application/pdf';
      const isValidSize = file.size <= 25 * 1024 * 1024; // 25MB

      if (!isValidType) {
        setUploadError(`Invalid file type: ${file.type}`);
        return false;
      }
      if (!isValidSize) {
        setUploadError(`File too large: ${file.name} (${file.size} bytes)`);
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

    // Check for existing non-image files (video or PDF)
    const existingNonImages = files.filter(f => !f.type.startsWith('image/'));
    const newNonImages = validFiles.filter(f => !f.type.startsWith('image/'));

    // If there's already a video/PDF and trying to add another, prevent it
    if (existingNonImages.length > 0 && newNonImages.length > 0) {
      setUploadError("Only one video or PDF allowed");
      // Show toast notification here
      e.target.value = ""; // Reset input
      return;
    }

    // Count total images
    const existingImages = files.filter(f => f.type.startsWith('image/'));
    const newImages = validFiles.filter(f => f.type.startsWith('image/'));

    // Check image limit
    if (existingImages.length + newImages.length > 10) {
      setUploadError("Maximum 10 images allowed");
      e.target.value = ""; // Reset input
      return;
    }

    // Merge existing files with new valid files
    const updatedFiles = [...files, ...validFiles];
    const previews = updatedFiles.map((file) => URL.createObjectURL(file));

    setFiles(updatedFiles);
    setImagePreviews(previews);

    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
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

  useEffect(() => {
    const chatRef = doc(
      db,
      role === "admin" ? "composeChat" : "chatRooms",
      slug
    );

    const unsubscribe = onSnapshot(chatRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();

      const vendor_detail = await getSingleVendorDetails(data?.receiverId);
      setSingleVendorDetails(vendor_detail);

      const filterMsg = data?.text?.filter(
        (msg) => msg?.permanentDeleteUser !== usercredentials?._id
      );

      setMessages(filterMsg || []);
    });

    return () => unsubscribe();
  }, [slug, usercredentials?._id, role]);


  const sendMessage = async () => {
    if ((!input.trim() && files.length === 0) || isSending) return;

    setIsSending(true);
    let uploadedFiles = [];

    try {
      const chatRef = doc(
        db,
        role === "admin" ? "composeChat" : "chatRooms",
        slug
      );

      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        setIsSending(false);
        return;
      }

      const matchingDocument = {
        id: chatSnap.id,
        data: chatSnap.data(),
      };

      if (matchingDocument) {
        // Upload files to backend API
        if (files.length > 0) {
          try {
            const uploadResult = await uploadChatFiles({
              files: files,
              token: token,
              addToast: (msg) => console.log(msg), // Replace with your toast function
            });
            uploadedFiles = uploadResult;
            handleClearPreview();
          } catch (uploadError) {
            console.error("File upload failed:", uploadError);
            setIsSending(false);
            return;
          }
        }

        const existingText = matchingDocument.data.text || [];
        const updatedText = [
          ...existingText,
          {
            senderType: "user",
            text: input.trim(),
            attachments: uploadedFiles, // Store the uploaded files
            createdAt: {
              seconds: Math.floor(Date.now() / 1000),
            },
            messageSenderId: senderId,
            isNotification: false,
          },
        ];
        await updateDoc(doc(
          db,
          role === "admin" ? "composeChat" : "chatRooms",
          matchingDocument.id
        ), {
          text: updatedText,
          currentTime: new Date(),
        });
      }

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
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

  const detectLink = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            fontWeight: 500,
          }}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  // Group messages by date
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
    <MessageContainer className="message-container">
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
                          src={singleVendorDetails?.image || "https://i.etsystatic.com/site-assets/images/avatars/default_avatar.png?width=75"}
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
                        {/* Images */}
                        {/* Combined Message Content */}
                        {(msg?.imageUrls?.length > 0 || msg?.attachments?.length > 0) && (

                          <MessageBubble elevation={0} isOwn={isOwn} images={msg?.attachments?.length} video={msg?.attachments?.some(att => att.type === 'video')}>
                            {/* Images from old format with WhatsApp style */}

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
                          </MessageBubble>)}

                        {msg.text && (
                          <MessageBubble elevation={0} isOwn={isOwn}>
                            {/* Text Message */}
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

                        {/* Shop Card */}
                        {Object.keys(msg?.shopData || {}).length > 0 && (
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.5,
                              borderRadius: "12px",
                              border: "1px solid #e8eaed",
                              backgroundColor: "#fff",
                              maxWidth: "280px",
                              mt: 0.5,
                            }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <img
                                src={msg?.shopData?.imageUrl}
                                alt="Shop"
                                style={{
                                  width: 60,
                                  height: 60,
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
                                  {parse(msg?.shopData?.shopName || "")}
                                </Typography>
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    mt: 0.5,
                                    backgroundColor: theme.palette.primary.main,
                                    textTransform: "none",
                                    fontSize: "11px",
                                    "&:hover": {
                                      backgroundColor: theme.palette.primary.dark,
                                    },
                                  }}
                                  onClick={() => {
                                    window.open(msg.shopLink, "_blank");
                                  }}
                                >
                                  Visit Shop
                                </Button>
                              </Box>
                            </Stack>
                          </Paper>
                        )}

                        <TimeStamp variant="caption">
                          {formatTime(msg?.createdAt)}
                        </TimeStamp>
                      </Box>

                      {/* Own Avatar */}
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
          <div ref={messagesEndRef} />
        </List>
      </MessagesWrapper>

      {/* Input Area - Fixed at bottom */}
      {role !== "admin" && (
        <InputContainer elevation={0} ref={inputContainerRef}>
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
                      sx={{ zIndex: 10 }} // Fix z-index
                    >
                      <CloseIcon />
                    </RemoveImageButton>
                  </ImagePreview>
                );
              })}
            </ImagePreviewContainer>
          )}

          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
            <StyledTextArea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              placeholder="Type a message..."
              rows={1}
              disabled={isSending}
              style={{
                minHeight: '56px',
                maxHeight: '300px',
                overflow: 'auto',
              }}
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
      )}
    </MessageContainer>
  );
};

export default ChatBox;