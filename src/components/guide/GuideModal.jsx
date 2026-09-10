import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import parse from "html-react-parser";

const GuideModal = ({ open, onClose, guide, fallbackTitle = "Guide" }) => {
  const transformRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const isImage = guide?.file && guide?.type === "image";
  const isVideo = guide?.file && guide?.type === "video";
  const isDocument = guide?.file && guide?.type === "document";
  const isEmpty = !guide?.file && !guide?.description;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: {xs: "95vw", sm: "90vw"},
          maxHeight: "95vh",
          // ✅ Allow the paper to overflow so the fixed close button isn't clipped
          overflow: "visible",
          minWidth: {xs: "95vw", sm: "90vw"}
        },
      }}
    >
      {/* Floating close button OUTSIDE DialogContent so scroll never affects it */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "fixed",
          top: 10,
          right: 10,
          bgcolor: "white",
          zIndex: (theme) => theme.zIndex.modal + 1,
          boxShadow: 5,
          "&:hover": { bgcolor: "#f5f5f5" },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* ---------- Title ---------- */}
      <DialogTitle
        sx={{
          m: 0,
          py: 1,
          pr: 6, // leave space for the floating close button
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" component="div">
          {guide?.name || fallbackTitle}
        </Typography>
      </DialogTitle>

      {/* ---------- Scrollable Content ---------- */}
      <DialogContent
        dividers
        sx={{
          p: 0,
          // ✅ Let it scroll when content overflows
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {guide?.description && (
          <Box sx={{ p: 3, pb: isImage ? 0 : 3 }}>
            {parse(guide.description)}
          </Box>
        )}

        {/* Image Viewer */}
        {isImage && (
          <Box
            sx={{
              width: "100%",
              height: "fit-content",
              minHeight: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              mb: 0.5
            }}
          >
            <TransformWrapper
              ref={transformRef}
              initialScale={0.99}
              minScale={0.5}
              maxScale={5}
              wheel={{ step: 0.2 }}
              doubleClick={{ disabled: false }}
              pinch={{ step: 10 }}
              onPanningStart={() => setIsDragging(true)}
              onPanningStop={() => setIsDragging(false)}
            >
              <TransformComponent
                wrapperStyle={{
                  display: "inline-block",
                  width: "85vw",
                  height: "fit-content",
                  cursor: isDragging ? "grabbing" : "grab",
                  boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.35)",
                  backgroundColor: "#eee",
                }}
                contentStyle={{ display: "inline-block" }}
              >
                <img
                  src={guide.file}
                  alt={guide.name || "guide"}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "78vh",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </TransformComponent>
            </TransformWrapper>
          </Box>
        )}

        {/* Video */}
        {isVideo && (
          <Box sx={{ textAlign: "center", mb: 2, p: 3 }}>
            <video
              controls
              style={{
                maxWidth: "100%",
                maxHeight: "60vh",
                borderRadius: "8px",
              }}
            >
              <source src={guide.file} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        )}

        {/* Document */}
        {isDocument && (
          <Box sx={{ textAlign: "center", mb: 2, p: 3 }}>
            <Button
              variant="contained"
              href={guide.file}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Guide
            </Button>
          </Box>
        )}

        {/* Empty state */}
        {isEmpty && (
          <Typography color="textSecondary" sx={{ textAlign: "center", py: 4 }}>
            No guide content available
          </Typography>
        )}
      </DialogContent>

      {/* ---------- Actions (only for image) ---------- */}
      {isImage && (
        <DialogActions sx={{ p: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => transformRef.current?.zoomIn()}
              variant="outlined"
              size="small"
            >
              Zoom +
            </Button>
            <Button
              onClick={() => transformRef.current?.zoomOut()}
              variant="outlined"
              size="small"
            >
              Zoom -
            </Button>
            <Button
              onClick={() => transformRef.current?.resetTransform()}
              variant="outlined"
              size="small"
            >
              Reset
            </Button>
            <Button onClick={onClose} variant="outlined" size="small">
              Close
            </Button>
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default GuideModal;