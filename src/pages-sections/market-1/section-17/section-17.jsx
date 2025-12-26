import Link from "next/link";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import LazyImage from "components/LazyImage";
import { H2, H4 } from "components/Typography";
import { useEffect, useState } from "react";
import { getAPIAuth } from "utils/__api__/ApiServies";
import { Box, Skeleton } from "@mui/material";
import useAuth from "hooks/useAuth";

const section17 = () => {
  const [dealData, setDealsData] = useState({});
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const getDeals = async () => {
    try {
      const res = await getAPIAuth("get-deals", token);
      if (res.status === 200) {
        setDealsData({
          base_url: res.data.base_url,
          box_url: res.data.box_url,
          ...res.data.data,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDeals();
  }, []);

  // Shimmer Components
  const ShimmerBoxSingle = () => (
    <Box sx={{ p: 3, background: "#fff", borderRadius: "8px", height: "100%" }}>
      <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
      <Skeleton
        variant="rectangular"
        width="100%"
        height={300}
        sx={{ borderRadius: "8px", mb: 2 }}
      />
      <Skeleton variant="text" width="80%" height={24} sx={{ mx: "auto" }} />
    </Box>
  );

  const ShimmerBoxGrid = ({ count = 4 }) => (
    <Box sx={{ p: 3, background: "#fff", borderRadius: "8px", height: "100%" }}>
      <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
      <Grid container spacing={1}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid key={i} item xs={6}>
            <Box sx={{ textAlign: "center" }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={140}
                sx={{ borderRadius: "6px", mb: 1 }}
              />
              <Skeleton variant="text" width="80%" height={20} sx={{ mx: "auto" }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const ShimmerBoxMixed = () => (
    <Box sx={{ p: 3, background: "#fff", borderRadius: "8px", height: "100%" }}>
      <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={200}
          sx={{ borderRadius: "8px" }}
        />
        <Skeleton variant="text" width="80%" height={24} sx={{ mx: "auto", mt: 1 }} />
      </Box>
      <Grid container spacing={0.5}>
        {[1, 2, 3].map((_, idx) => (
          <Grid item xs={4} key={idx}>
            <Box sx={{ textAlign: "center" }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={90}
                sx={{ borderRadius: "4px", mb: 0.5 }}
              />
              <Skeleton variant="text" width="70%" height={16} sx={{ mx: "auto" }} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <SectionCreator sx={{ background: "#f5f5f5" }} pb={0}>
      <Grid container spacing={2} sx={{ px: { xs: 1, md: 0 } }}>
        {/* Box 1 - 2x2 Grid */}
        <Grid item xs={12} md={3}>
          {loading ? (
            <ShimmerBoxGrid count={4} />
          ) : dealData?.box1_title && dealData?.box1_category?.length > 0 ? (
            <Box sx={{
              p: 2,
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }
            }}>
              <H2
                fontSize={16}
                fontWeight={600}
                mb={1.5}
                sx={{
                  color: "#222",
                  textTransform: "capitalize",
                  borderBottom: "1px solid #eee",
                  pb: 1
                }}
              >
                {dealData.box1_title}
              </H2>
              <Grid container spacing={1}>
                {dealData.box1_category.map((cat) => (
                  <Grid key={cat._id} item xs={6}>
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Box sx={{
                        textAlign: "center",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        }
                      }}>
                        <Box sx={{
                          position: "relative",
                          width: "100%",
                          paddingBottom: "100%", // Creates 1:1 aspect ratio
                          overflow: "hidden",
                          borderRadius: "6px",
                          mb: 0.5,
                          bgcolor: "#f8f8f8"
                        }}>
                          <LazyImage
                            alt={cat.title}
                            src={dealData.box_url + cat.image}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            width={200}
                            height={200}
                          />
                        </Box>
                        <H4
                          fontSize={12}
                          fontWeight={500}
                          sx={{
                            color: "#333",
                            textTransform: "capitalize",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            px: 0.5
                          }}
                        >
                          {cat.title}
                        </H4>
                      </Box>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </Grid>

        {/* Box 2 - Single Large */}
        <Grid item xs={12} md={3}>
          {loading ? (
            <ShimmerBoxSingle />
          ) : dealData?.box2_title && dealData?.box2_category?.length > 0 ? (
            <Box sx={{
              p: 2,
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }
            }}>
              <H2
                fontSize={16}
                fontWeight={600}
                mb={1.5}
                sx={{
                  color: "#222",
                  textTransform: "capitalize",
                  borderBottom: "1px solid #eee",
                  pb: 1
                }}
              >
                {dealData.box2_title}
              </H2>
              {dealData.box2_category.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Box sx={{
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                    }
                  }}>
                    <Box sx={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "120%",
                      overflow: "hidden",
                      borderRadius: "6px",
                      mb: 1.5,
                      bgcolor: "#f8f8f8"
                    }}>
                      <LazyImage
                        alt={cat.title}
                        src={dealData.box_url + cat.image}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        width={200}
                        height={400}
                      />
                    </Box>
                    <H4
                      fontSize={14}
                      fontWeight={500}
                      sx={{
                        textAlign: "center",
                        color: "#333",
                        textTransform: "capitalize",
                        lineHeight: 1.3
                      }}
                    >
                      {cat.title}
                    </H4>
                  </Box>
                </Link>
              ))}
            </Box>
          ) : null}
        </Grid>

        {/* Box 3 - 2x2 Grid */}
        <Grid item xs={12} md={3}>
          {loading ? (
            <ShimmerBoxGrid count={dealData.box3_category?.length || 4} />
          ) : dealData?.box3_title && dealData?.box3_category?.length > 0 ? (
            <Box sx={{
              p: 2,
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }
            }}>
              <H2
                fontSize={16}
                fontWeight={600}
                mb={1.5}
                sx={{
                  color: "#222",
                  textTransform: "capitalize",
                  borderBottom: "1px solid #eee",
                  pb: 1
                }}
              >
                {dealData.box3_title}
              </H2>
              <Grid container spacing={1}>
                {dealData.box3_category.map((cat) => (
                  <Grid key={cat._id} item xs={6}>
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Box sx={{
                        textAlign: "center",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        }
                      }}>
                        <Box sx={{
                          position: "relative",
                          width: "100%",
                          paddingBottom: "100%", // 1:1 aspect ratio
                          overflow: "hidden",
                          borderRadius: "6px",
                          mb: 0.5,
                          bgcolor: "#f8f8f8"
                        }}>
                          <LazyImage
                            alt={cat.title}
                            src={dealData.box_url + cat.image}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            width={200}
                            height={200}
                          />
                        </Box>
                        <H4
                          fontSize={12}
                          fontWeight={500}
                          sx={{
                            color: "#333",
                            textTransform: "capitalize",
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            px: 0.5
                          }}
                        >
                          {cat.title}
                        </H4>
                      </Box>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </Grid>

        {/* Box 4 - 1 Large + 3 Small */}
        <Grid item xs={12} md={3}>
          {loading ? (
            <ShimmerBoxMixed />
          ) : dealData?.box4_title && dealData?.box4_category?.length > 0 ? (
            <Box sx={{
              p: 2,
              background: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              height: "100%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              }
            }}>
              <H2
                fontSize={16}
                fontWeight={600}
                mb={1.5}
                sx={{
                  color: "#222",
                  borderBottom: "1px solid #eee",
                  pb: 1
                }}
              >
                {dealData.box4_title}
              </H2>

              {/* Large Top Item */}
              {dealData.box4_category[0] && (
                <Link
                  href={`/product?slug=${dealData.box4_category[0]?.slug}&id=${dealData.box4_category[0]?._id}&title=${dealData.box4_category[0]?.title}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Box sx={{
                    mb: 1.5,
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                    }
                  }}>
                    <Box sx={{
                      position: "relative",
                      width: "100%",
                      paddingBottom: "80%", // Slightly taller for larger image
                      overflow: "hidden",
                      borderRadius: "6px",
                      bgcolor: "#f8f8f8"
                    }}>
                      <LazyImage
                        alt={dealData.box4_category[0]?.title}
                        src={dealData.box_url + dealData.box4_category[0]?.image}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        width={200}
                        height={200}
                      />
                    </Box>
                    <H4
                      fontSize={13}
                      fontWeight={500}
                      sx={{
                        textAlign: "center",
                        color: "#333",
                        textTransform: "capitalize",
                        mt: 1,
                        lineHeight: 1.3
                      }}
                    >
                      {dealData.box4_category[0]?.title}
                    </H4>
                  </Box>
                </Link>
              )}

              {/* 3 Small Items Below */}
              <Grid container spacing={0.5}>
                {dealData.box4_category.slice(1, 4).map((cat) => (
                  <Grid key={cat._id} item xs={4}>
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <Box sx={{
                        textAlign: "center",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        }
                      }}>
                        <Box sx={{
                          position: "relative",
                          width: "100%",
                          paddingBottom: "100%", // 1:1 aspect ratio
                          overflow: "hidden",
                          borderRadius: "4px",
                          bgcolor: "#f8f8f8"
                        }}>
                          <LazyImage
                            alt={cat.title}
                            src={dealData.box_url + cat.image}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            width={200}
                            height={200}
                          />
                        </Box>
                        <H4
                          fontSize={10}
                          fontWeight={400}
                          sx={{
                            color: "#555",
                            textTransform: "capitalize",
                            lineHeight: 1.2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            mt: 0.5
                          }}
                        >
                          {cat.title}
                        </H4>
                      </Box>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : null}
        </Grid>
      </Grid>
    </SectionCreator>
  );
};

export default section17;
