import { useState } from "react";
import { Popover, Box } from "@mui/material";

const LightPopover = ({
  title,
  children,
  trigger = "click", // click | hover
  placement = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
  },
  paperSx = {},
  open: controlledOpen,
  onOpen,
  onClose,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : Boolean(anchorEl);

  const handleOpen = (event) => {
    if (!isControlled) {
      setAnchorEl(event.currentTarget);
    }
    onOpen?.(event);
  };

  const handleClose = () => {
    if (!isControlled) {
      setAnchorEl(null);
    }
    onClose?.();
  };

  const triggerProps =
    trigger === "hover"
      ? {
        onMouseEnter: handleOpen,
        onMouseLeave: handleClose,
      }
      : {
        onClick: (e) =>
          open ? handleClose() : handleOpen(e),
      };

  return (
    <>
      <Box
        component="span"
        {...triggerProps}
        sx={{
          display: "inline-flex",
          cursor: "pointer",
        }}
      >
        {children}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={placement.anchorOrigin}
        transformOrigin={placement.transformOrigin}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#fff",
              color: "rgba(0,0,0,.87)",
              boxShadow: 1,
              p: 1,
              borderRadius: 1,
              overflow: "visible",
              mt: 1,
              mb: 1,
              // "&::before": {
              //   content: '""',
              //   position: "absolute",
              //   top: -7,
              //   left: "20%",
              //   width: 12,
              //   height: 12,
              //   backgroundColor: "#fff",
              //   borderLeft: "1px solid #e8eaed",
              //   borderTop: "1px solid #e8eaed",
              //   transform: "translateX(-50%) rotate(45deg)",
              //   boxShadow: "4px #1a191990",
              //   zIndex: 0,
              // },
              ...paperSx,
            },
          },
        }}
      >
        {typeof title === "string" ? (
          <Box>{title}</Box>
        ) : (
          title
        )}
      </Popover>
    </>
  );
};

export default LightPopover;