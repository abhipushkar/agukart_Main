"use client";

import { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Typography,
  Link,
  IconButton,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import { set } from "lodash";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ReportItem({ product_id }) {
  const router = useRouter();
  const { token } = useAuth();
  const { addToast } = useToasts();
  const errorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [policyMoreDetailsToggle, setPolicyMoreDetailsToggle] = useState(false);
  const [policyDetails, setPolicyDetails] = useState({
    subReason: "",
    details: "",
  });
  const [policyError, setPolicyError] = useState({
    subReason: "",
    details: "",
  });

  const handleNext = () => {
    if (reason === "policy" && !policyDetails.subReason) {
      setPolicyError((prev) => ({
        ...prev,
        subReason: "Please choose a reason.",
      }));
      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return;
    }
    setPolicyError({ subReason: "", details: "" });
    setPolicyMoreDetailsToggle(true);
  };

  const handleFinalSubmit = async () => {
    let hasError = false;
    let errors = { subReason: "", details: "" };

    if (!policyDetails.subReason) {
      errors.subReason = "Please select a reason.";
      hasError = true;
    }
    if (!policyDetails.details.trim()) {
      errors.details = "Please provide additional details.";
      hasError = true;
    }

    if (hasError) {
      setPolicyError(errors);
      return;
    }
    try {
      const payload = {
        type: "policy",
        reporttype: "product",
        reason: policyDetails?.subReason,
        description: policyDetails?.details,
        product_id: product_id,
      };

      const res = await postAPIAuth("user/create-report", payload,token);
      console.log({res})
      if (res?.data?.success) {
        console.log("dfgedgd")
        addToast("Reported Successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        setOpen(false);
        setReason("");
        setPolicyDetails({ subReason: "", details: "" });
        setPolicyMoreDetailsToggle(false);
        setPolicyError({ subReason: "", details: "" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const additionalInfo = {
    order: (
      <>
        <Typography variant="body2" sx={{ mt: 2 }}>
          The first thing you should do is contact the seller directly.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          If you’ve already done that, your item hasn’t arrived, or it’s not as
          described, you can report that to Agukart by opening a case.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            textDecoration: "underline",
            color: "primary.main",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => {
            const url = `/profile/orders`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          {" "}
          Report a problem with an order
        </Typography>
      </>
    ),
    ip: (
      <>
        <Typography variant="body2" sx={{ mt: 2 }}>
          If someone is using your intellectual property without permission, you
          can report it through Agukart’s intellectual property policy.
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            textDecoration: "underline",
            color: "primary.main",
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => {
            const url = `/product-report/${product_id}`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          Copyright and Intellectual Property Policy
        </Typography>
      </>
    ),
    policy: (
      <>
        <Typography variant="body2" sx={{ mt: 2 }}>
          If this listing violates Agukart’s policies, you can report it for
          further review.
        </Typography>
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <Typography variant="subtitle1">
            Tell us why you're reporting this item
          </Typography>
          <RadioGroup
            value={policyDetails.subReason}
            onChange={(e) => {
              setPolicyDetails((prev) => ({
                ...prev,
                subReason: e.target.value,
              }));
              setPolicyError((prev) => ({
                ...prev,
                subReason: "",
              }));
            }}
          >
            <FormControlLabel
              value="It's not handmade, vintage, or craft supplies"
              control={<Radio />}
              label="It's not handmade, vintage, or craft supplies"
            />
            <FormControlLabel
              value="It's pornographic"
              control={<Radio />}
              label="It's pornographic"
            />
            <FormControlLabel
              value="It's hate speech or harassment"
              control={<Radio />}
              label="It's hate speech or harassment"
            />
            <FormControlLabel
              value="It's a threat to minor safety"
              control={<Radio />}
              label="It's a threat to minor safety"
            />
            <FormControlLabel
              value="It promotes violence or self-harm"
              control={<Radio />}
              label="It promotes violence or self-harm"
            />
            <FormControlLabel
              value="It's dangerous or hazardous"
              control={<Radio />}
              label="It's dangerous or hazardous"
            />
            <FormControlLabel
              value="It's violating a specific law or regulation"
              control={<Radio />}
              label="It's violating a specific law or regulation"
            />
            <FormControlLabel
              value="It violates a policy that's not listed here"
              control={<Radio />}
              label="It violates a policy that's not listed here"
            />
          </RadioGroup>
        </FormControl>
      </>
    ),
  };
  const handleOpen = ()=>{
    if(!token){
      return router.push("/login")
    }
    setOpen(true)
  }
  return (
    <div>
      <Button
        variant="text"
        onClick={handleOpen}
        startIcon={<FlagIcon />}
        sx={{
          padding: "12px 20px",
          borderRadius: "25px",
          marginBottom: "12px",
          color: "#000",
          border: "none",
        }}
      >
        Report with this item
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ style: { width: "500px", height: "auto" } }}
      >
        {!policyMoreDetailsToggle ? (
          <>
            <DialogTitle>
              What’s wrong with this listing?
              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Select
                fullWidth
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                }}
                displayEmpty
              >
                <MenuItem value="">Choose a reason...</MenuItem>
                <MenuItem value="order">
                  There’s a problem with my order
                </MenuItem>
                <MenuItem value="ip">
                  It uses my intellectual property without permission
                </MenuItem>
                <MenuItem value="policy">
                  I don’t think it meets Agukart’s policies
                </MenuItem>
              </Select>
              {reason && additionalInfo[reason]}
              {policyError.subReason && (
                <Typography ref={errorRef} color="error" sx={{ mt: 1 }}>
                  {policyError.subReason}
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              {reason == "policy" && (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  sx={{
                    background: "#000",
                    padding: "12px 20px",
                    fontSize: "15px",
                    borderRadius: "25px",
                    marginBottom: "12px",
                    color: "#fff",
                    "&:hover": { background: "#4f4e4e" },
                  }}
                >
                  Next
                </Button>
              )}
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h5">Add more details</Typography>
              <IconButton
                aria-label="close"
                onClick={() => setOpen(false)}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Typography variant="body1" gutterBottom>
                Share more specifics to help us review this item and protect our
                marketplace.
              </Typography>
              <TextField
                label="Include anything else we should know about this item"
                placeholder="Type here..."
                fullWidth
                multiline
                minRows={4}
                value={policyDetails.details}
                onChange={(e) => {
                  setPolicyDetails((prev) => ({
                    ...prev,
                    details: e.target.value,
                  }));
                  setPolicyError((prev) => ({ ...prev, details: "" }));
                }}
                variant="outlined"
                error={!!policyError.details}
                helperText={policyError.details}
              />
            </DialogContent>

            <DialogActions
              sx={{ justifyContent: "space-between", px: 3, pb: 2 }}
            >
              <Button
                variant="text"
                onClick={() => setPolicyMoreDetailsToggle(false)}
              >
                Go back
              </Button>
              <Button variant="contained" onClick={handleFinalSubmit}>
                Submit report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
