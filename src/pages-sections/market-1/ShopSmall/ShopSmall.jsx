import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { postAPI } from "utils/__api__/ApiServies";
import Skeleton from "@mui/material/Skeleton";

function ShopSmall() {
  const [specialMoment, setSpecialMoment] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSpecialMoment = async () => {
    try {
      const res = await postAPI("get-admin-category", {
        type: "special",
      });

      if (res.status === 200) {
        setSpecialMoment(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSpecialMoment();
  }, []);

  return (
    <Container
      style={{
        background: "#fff",
        padding: "26px 0",
        marginBottom: "50px",
      }}
    >
      <Grid item lg={12} md={12} sm={12} xs={12} sx={{ margin: "25px 0" }}>
        <Typography sx={{ textAlign: "center", fontSize: "30px" }}>
          Small Shop Make Every Moment More Special
        </Typography>

        <Grid container spacing={1} sx={{ marginTop: "15px" }}>
          <Grid item lg={10} md={10} sm={12} xs={12} sx={{ margin: "0 auto" }}>
            <Grid container spacing={1} justifyContent="center">
              {loading
                ? Array.from({ length: 6 }).map((_, idx) => (
                    <Grid
                      key={idx}
                      item
                      lg={2}
                      md={4}
                      sm={6}
                      xs={6}
                      sx={{
                        padding: "6px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Skeleton
                          variant="circular"
                          width={150}
                          height={150}
                          animation="wave"
                        />
                        <Skeleton
                          variant="text"
                          width={100}
                          height={20}
                          animation="wave"
                          sx={{ margin: "8px auto" }}
                        />
                      </Box>
                    </Grid>
                  ))
                : specialMoment?.map((item) => (
                    <Grid
                      key={item._id}
                      item
                      lg={2}
                      md={4}
                      sm={6}
                      xs={6}
                      sx={{
                        padding: "6px",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <img
                          alt={item.title}
                          src={item.image}
                          style={{
                            width: 150,
                            height: 150,
                            borderRadius: "50%",
                            margin: "0 auto",
                          }}
                        />
                        <Link
                          href={`product?slug=${item.slug}&id=${item._id}&title=${item.title}`}
                        >
                          <Typography
                            style={{ textTransform: "capitalize" }}
                            sx={{ paddingTop: "6px", color: "#000" }}
                          >
                            {item.title}
                          </Typography>
                        </Link>
                      </Box>
                    </Grid>
                  ))}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ShopSmall;
