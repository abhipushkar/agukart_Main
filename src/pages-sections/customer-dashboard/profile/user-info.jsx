"use client";

import { format } from "date-fns";
import Card from "@mui/material/Card";
import useMediaQuery from "@mui/material/useMediaQuery";
// GLOBAL CUSTOM COMPONENTS

import FlexBox from "components/flex-box/flex-box";
import { Small, Span } from "components/Typography";
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import React from "react";
import { useRouter } from "next/navigation";

// CUSTOM DATA MODEL

// ==============================================================
export default function UserInfo({ data }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const downMd = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  console.log({data},"here is my user Data")
  return (
    <Card
      sx={{
        mt: 3,
        display: "flex",
        flexWrap: "wrap",
        p: "0.75rem 1.5rem",
        alignItems: "center",
        justifyContent: "space-between",
        ...(downMd && {
          alignItems: "start",
          flexDirection: "column",
          justifyContent: "flex-start",
        }),
      }}
    >
      <Dialog
        fullWidth={false}
        maxWidth={"xs"}
        open={open}
        onClose={handleClose}
      >
        <DialogContent>
          <DialogContentText>
            Your Email Not Varified Do you Want to varify Your Email
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={() => router.push("/profile/change-email")}
          >
            Varify Email
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <TableRowItem title="First Name" value={data?.name} />

      <TableRowItem
        title="Email"
        value={
          <span style={{ position: "relative" }}>
            {data.email}

            {data?.email_verified === "Confirmed" ? (
              <>
                <IconButton sx={{ position: "absolute", top: "-5px" }}>
                  <CheckIcon
                    sx={{
                      color: "green",
                      cursor: "pointer",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                </IconButton>
                <span
                  style={{
                    marginLeft: "25px",
                    color: "green",
                  }}
                >
                  (Verified)
                </span>
              </>
            ) : (
              <>
                {/* <IconButton
                  onClick={handleClickOpen}
                  sx={{
                    position: "absolute",
                    top: "-5px",
                  }}
                >
                  <ClearIcon
                    sx={{
                      color: "red",
                      cursor: "pointer",
                      width: "16px",
                      height: "16px",
                    }}
                  />
                </IconButton> */}

                <span
                  onClick={handleClickOpen}
                  style={{
                    marginLeft: "5px",
                    color: "red",
                    cursor: "pointer",
                  }}
                >
                  (Unverified)
                </span>
              </>
            )}
          </span>
        }
      />
      <TableRowItem
        title="Phone"
        value={`${data?.phone_code}${data?.mobile}`}
      />
      <TableRowItem
        title="Birth date"
        value={
          data.dob && !isNaN(new Date(data.dob))
            ? format(new Date(data.dob), "dd MMM, yyyy")
            : ""
        }
      />
    </Card>
  );
}

function TableRowItem({ title, value }) {
  return (
    <FlexBox flexDirection="column" p={1}>
      <Small color="grey.600" mb={0.5}>
        {title}
      </Small>

      <Span>{value}</Span>
    </FlexBox>
  );
}
