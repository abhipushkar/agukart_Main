import Link from "next/link";
// CUSTOM ICON COMPONENT

// GLOBAL CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import { H2, H4, H6 } from "components/Typography";
import Typography from "@mui/material/Typography";
import { CircularProgress, Input } from "@mui/material";
import Button from "@mui/material/Button";
// LOCAL CUSTOM COMPONENT

// CUSTOM DATA MODEL
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import { fontSize } from "theme/typography";
import { useState } from "react";
import { postAPI } from "utils/__api__/ApiServies";
import { useToasts } from "react-toast-notifications";

const section23 = () => {
  const { addToast } = useToasts();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError("");
  };

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Email is required");
    } else if (!emailRegex.test(email)) {
      setError("Enter a valid email address");
    } else {
      console.log("Subscribed Email:", email);
      try {
        const payload = {
          email: email,
        };
        setLoading(true);
        const res = await postAPI("subscribe", payload);
        if (res.status === 200) {
          setLoading(false);
          addToast(res?.data?.message, {
            appearance: "success",
            autoDismiss: true,
          });
          setEmail("");
        }
      } catch (error) {
        setLoading(false);
        addToast(error?.response?.data.message || error, {
          appearance: "error",
          autoDismiss: true,
        });
        console.log("error", error?.response?.data || error);
      }
    }
  };
  return (
    <>
      <SectionCreator
        sx={{ background: "#bafbff", textAlign: "center" }}
        pt={3}
        pb={2}
        mb={0}
      >
        <Typography component="div" sx={{ fontWeight: "bold" }}>
          Yes Send Me exclusive offers, unique gifts ideas, and personalized
          tips for shoping and seeling on Agukart
        </Typography>
        <Grid
          container
          spacing={3}
          pl={0}
          ml={0}
          mt={0}
          sx={{ margin: "0 auto", width: "100%" }}
        >
          <Grid
            item
            md={4}
            xs={12}
            sx={{ paddingLeft: "0 !important", margin: "0 auto" }}
          >
            <Box
              sx={{
                background: "#fff",
                boxShadow: "0 0 2px #a1a1a1",
                display: "flex",
                borderRadius: "34px",
                padding: "6px 15px",
                justifyContent: "space-between",
              }}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                name="email"
                value={email}
                onChange={handleChange}
                sx={{
                  border: "none",
                  outline: "none",
                  "&::before": {
                    display: "none",
                  },
                  "&::after": {
                    display: "none",
                  },
                  "&:focus": {
                    outline: "none",
                  },
                }}
              />
                <Button  endIcon={loading ? <CircularProgress size={15} /> : ""}
                    disabled={loading ? true : false}
                    variant="text" 
                    onClick={handleSubscribe}
                >
                Subscribe
              </Button>
            </Box>
            {error && (
              <Typography
                color="error"
                sx={{ fontSize: "12px", marginTop: "5px" }}
              >
                {error}
              </Typography>
            )}
          </Grid>
        </Grid>
      </SectionCreator>
    </>
  );
};

export default section23;
