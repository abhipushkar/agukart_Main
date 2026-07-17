"use client";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import useChat from "hooks/useChat";
import ChatBox from "../ChatBox";
import ChatList from "../ChatList";

import { useSearchParams } from "next/navigation";


const FromEtsy = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);
  const { markComposeAsRead } = useChat();

  const searchParams = useSearchParams();
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

  useEffect(() => {
    if (!slug) return;

    markComposeAsRead([slug]);
  }, [slug]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {!slug ? (
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <ChatList chatListProp={'fromEtsy'} />
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ChatBox />
        </Box>
      )}
    </Box>
  );
};

export default FromEtsy;
