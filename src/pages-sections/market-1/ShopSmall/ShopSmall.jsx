import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { postAPI, getAPIAuth } from "utils/__api__/ApiServies";
import { useRouter } from "next/navigation";
import useAuth from "hooks/useAuth";
import Skeleton from "@mui/material/Skeleton";

function ShopSmall() {
  const [specialMoment, setSpecialMoment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();


  const getAdminCategory = async () => {
    try {
      const res = await getAPIAuth("get-admin-menu-category", token);
      if (res.status === 200) setCat(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setCatLoading(false);
    }
  };

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
    getAdminCategory();
  }, []);

  return (
    <Container
      style={{
        background: "#fff",
        padding: "26px 0",
        marginBottom: {
  xs: "10px",
  md: "40px",
},
      }}
    >
      <Box sx={{ px: 1, pb: 2, display: { xs: "block", md: "none" } }}>
        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: "16px",
            pb: 1,
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {catLoading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                  <Skeleton variant="circular" width={75} height={75} animation="wave" />
                  <Skeleton variant="text" width={60} height={16} sx={{ mt: 1 }} animation="wave" />
                </Box>
              ))
            : cat?.map((item) => (
                <Box
                  key={item._id}
                  onClick={() => router.push(`/${item.fullSlug}`)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: "80px",
                    cursor: "pointer",
                  }}
                >
                  <Box
                    sx={{
                      width: 75,
                      height: 75,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid #f0f0f0",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "11px",
                      textAlign: "center",
                      mt: 0.8,
                      color: "#333",
                      maxWidth: "75px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
              ))}
        </Box>
      </Box>
      <Grid
  item
  lg={12}
  md={12}
  sm={12}
  xs={12}
  sx={{
    margin: {
      xs: "10px 0",
      md: "25px 0",
    },
  }}
>
        <Typography sx={{ textAlign: "center", fontSize: "30px" }}>
          Small Shop Make Every Moment More Special
        </Typography>

        <Grid
  container
  spacing={1}
  sx={{
    marginTop: {
      xs: "5px",
      md: "15px",
    },
  }}
>
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
