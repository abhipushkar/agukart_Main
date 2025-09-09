"use client";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
// MUI ICON COMPONENTS

import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
// GLOBAL CUSTOM COMPONENTS

import { Paragraph } from "components/Typography";
// LOCAL CUSTOM COMPONENT

import TableRow from "../table-row";
import {
  Box,
  Dialog,
  DialogActions,
  DialogTitle,
  Modal,
  Typography,
} from "@mui/material";
import { postAPIAuth } from "utils/__api__/ApiServies";
import useAuth from "hooks/useAuth";
import { useToasts } from "react-toast-notifications";
import React, { useState } from "react";
import Button from "@mui/material/Button";
// CUSTOM DATA MODEL

// ==============================================================
export default function AddressListItem({ address, getProfileData }) {
  console.log("addressaddressaddressaddress", address);
  const [open, setOpen] = useState(false);
  const [addressdata, setAddressData] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOk = () => {
    console.log("OK clicked");
    setOpen(false);
  };
  const router = useRouter();
  const { token } = useAuth();
  const { addToast } = useToasts();
  const style = {
    position: "absolute",
    top: "34px",
    left: "50%",
    transform: "translateX(-50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "none",
    borderRadius: "3px",
    boxShadow: 24,
    p: 4,
    outline: "none",
    paddingBottom: "14px",
  };

  // console.log("addressaddress", address);

  const handleDelete = async (e) => {
    // alert("hii")
    handleOk();
    console.log("address._idaddress._idaddress._id", address._id);
    e.stopPropagation();
    try {
      const param = {
        address_id: `${address._id}`,
      };

      const res = await postAPIAuth(
        "user/delete-address",
        param,
        token,
        addToast
      );
      console.log("ressqwertyu", res);
      if ((res.status = 200)) {
        addToast(res?.data?.message, {
          appearance: "success",
          autoDismiss: true,
        });
        getProfileData();
      }
    } catch (error) {
      console.log("errorr", error);
    }
  };
  const {
    address_line1,
    address_line2,
    city,
    mobile,
    pincode,
    state,
    country,
    first_name,
    last_name,
    _id,
    phone_code,
  } = address || {};

  return (
    <>
      <Box>
        <TableRow>
          <Paragraph ellipsis>
            <span style={{ textTransform: "capitalize" }}> {first_name} </span>{" "}
            {last_name}
            <span
              style={{
                fontWeight: "600",
                color: "gray",
              }}
            >
              {" "}
              {address.default === "1" ? "(Default)" : ""}
            </span>{" "}
          </Paragraph>

          <Paragraph
            ellipsis
          >{`${address_line1} ${address_line2}, ${city} ${state} ${country} ${pincode}`}</Paragraph>
          <Paragraph ellipsis>{`${phone_code}  ${mobile}`}</Paragraph>
          <Paragraph color="grey.600">
            <Link href={`/profile/address/${_id}`}>
              <IconButton>
                <Edit fontSize="small" color="inherit" />
              </IconButton>
            </Link>

            <IconButton onClick={handleOpen}>
              <Delete fontSize="small" color="inherit" />
            </IconButton>
          </Paragraph>
        </TableRow>
      </Box>

      {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="MuiBox-root css-9ru1ps" tabIndex="-1">
          <Typography
            id="modal-modal-description"
            sx={{
              fontSize: "18px",
              fontWeight: 700,
              mt: 0,
              mb: 2,
              overflow: "hidden",
              textTransform: "capitalize",
              textAlign: "center",
              textWrap: "nowrap",
            }}
            className="MuiTypography-root MuiTypography-body1 css-t1790b-MuiTypography-root"
          >
            Are you sure you want to delete this address?
          </Typography>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#fff", // Light background for the button container
              p: 2, // Padding around the buttons
              borderRadius: "4px", // Rounded corners,
            }}
          >
            <Button
              onClick={handleClose}
              sx={{
                backgroundColor: "#D23F57",
                color: "#fff",
                padding: "7px 22px",
                border: "none",
                fontSize: "17px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                lineHeight: "0",
                height: "37px",
                fontFamily: "fangsong",
                marginRight: "8px",
                "&:hover": {
                  backgroundColor: "#c50000",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                  color: "#666",
                },
              }}
            >
              Close
            </Button>

            <Button
              onClick={handleDelete}
              sx={{
                backgroundColor: "#119437",
                color: "#fff",
                padding: "7px 22px",
                border: "#fff",
                fontSize: "17px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                lineHeight: "0",
                height: "37px",
                fontFamily: "fangsong",
                "&:hover": {
                  backgroundColor: "#18af18",
                },
              }}
              variant="contained"
            >
              OK
            </Button>
          </Box>
        </Box>
      </Modal> */}

      <React.Fragment>
        <Dialog
          open={open}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure? you want to delete this address
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => handleClose()}>No</Button>
            <Button autoFocus onClick={(e) => handleDelete(e)}>
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    </>
  );
}
