"use client";
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
import Link from "@mui/material/Link";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WallpaperIcon from "@mui/icons-material/Wallpaper";
import ChatBox from "./ChatBox";
import ChatList from "./ChatList";
import { useSearchParams } from "next/navigation";
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

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);

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

  return (
    <>
      <Box>
        {!slug ? (
          <div>
            <ChatList />
          </div>
        ) : (
          <div>
            <ChatBox slug={slug} />
          </div>
        )}{" "}
      </Box>

    </>
  );
};

export default Messages;
