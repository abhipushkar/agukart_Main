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
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";
import { postAPIAuth } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";
import useAuth from "hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ReportShop({ shop_id }) {
  const router = useRouter();
  const { token } = useAuth();
  const errorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const { addToast } = useToasts();
  const [reason, setReason] = useState("");
  const [policyDetails, setPolicyDetails] = useState({
    subReason: "",
    details: "",
  });
  const [policyError, setPolicyError] = useState({
    subReason: "",
    details: "",
  });

  const handleSubmit = async() => {
    const errors = { subReason: "", details: "" };
    let hasError = false;
  
    if (reason === "policy") {
      if (!policyDetails.subReason) {
        errors.subReason = "Please choose a reason.";
        hasError = true;
      }
  
      if (!policyDetails.details.trim()) {
        errors.details = "Please provide additional details.";
        hasError = true;
      }
  
      if (hasError) {
        setPolicyError(errors);
        setTimeout(() => {
          errorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
        return;
      }
    }
  
    // If no error
    setPolicyError({ subReason: "", details: "" });
  
      try {
        const payload = {
          type: "policy",
          reporttype: "shop",
          reason: policyDetails?.subReason,
          description: policyDetails?.details,
          store_id: shop_id,
        };
        const res = await postAPIAuth("user/create-report", payload,token);
        if (res?.data?.success) {
          addToast("Reported Successfully", {
            appearance: "success",
            autoDismiss: true,
          });
          setPolicyDetails({ subReason: "", details: "" });
          setPolicyError({ subReason: "", details: "" });
          setOpen(false);
          setReason("");
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
        <br></br>
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
          We take intellectual property concerns very seriously, but many of
          these problems can be resolved directly by the parties involved. We
          suggest contacting the seller directly to respectfully share your
          concerns.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          If you’d like to file an allegation of infringement, you’ll need to
          follow the process described in our
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
              const url = `/shop-report/${shop_id}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            {" "}
            Copyright and Intellectual Property Policy
          </Typography>
        </Typography>
      </>
    ),
    policy: (
      <>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Review how we define handmade, vintage and supplies
        </Typography>
        <Link href="" underline="hover">
          See a list of prohibited items and materials Read our mature content
          policy
        </Link>
        <Box sx={{ mt: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              They sell items that are...
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
              {[
                "not handmade",
                "not vintage (20+ years)",
                "not craft supplies",
                "prohibited or uses prohibited materials",
                "not properly labelled as mature content",
              ].map((text) => (
                <FormControlLabel
                  key={text}
                  value={text}
                  control={<Radio />}
                  label={text}
                />
              ))}
            </RadioGroup>

            {policyError.subReason && (
              <Typography ref={errorRef} color="error" sx={{ mt: 1 }}>
                {policyError.subReason}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Tell us more about how this shop violates our policies"
            placeholder="Add more details here..."
            multiline
            minRows={4}
            fullWidth
            variant="outlined"
            value={policyDetails.details}
            onChange={(e) => {
              setPolicyDetails((prev) => ({
                ...prev,
                details: e.target.value,
              }));
              setPolicyError((prev) => ({ ...prev, details: "" }));
            }}
            sx={{ mt: 3 }}
          />

          {policyError.details && (
            <Typography color="error" ref={errorRef} sx={{ mt: 1 }}>
              {policyError.details}
            </Typography>
          )}
        </Box>
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
      <Typography
        mt={1}
        component="span"
        onClick={handleOpen}
        sx={{
          textDecoration: "underline",
          color: "#000",
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        {/* <FlagIcon sx={{ mr: 1 }} /> */}
        Report this shop to Agukart
      </Typography>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ style: { width: "500px", height: "auto" } }}
      >
        <DialogTitle>
          What’s wrong with this shop?
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
            <MenuItem value="order">There's a problem with my order</MenuItem>
            <MenuItem value="ip">
              They're using my intellectual property without my permission
            </MenuItem>
            <MenuItem value="policy">
              They sell items that don't meet Agukart's polices
            </MenuItem>
          </Select>
          {reason && additionalInfo[reason]}
        </DialogContent>
        <DialogActions>
          {reason == "policy" && (
            <Button
              onClick={handleSubmit}
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
              Report this shop
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
