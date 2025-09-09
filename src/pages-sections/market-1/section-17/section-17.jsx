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

  const ShimmerBoxSingle = ({ height = 377 }) => (
    <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
      <Skeleton variant="text" width="60%" height={30} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <ShimmerCard height={height} />
        </Grid>
      </Grid>
    </Grid>
  );

  // 🔹 Shimmer for Box 4 (1 large top + 3 small below)
  const ShimmerBoxMixed = () => (
    <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
      <Skeleton variant="text" width="60%" height={30} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <ShimmerCard height={250} />
        </Grid>
        {[1, 2, 3].map((_, idx) => (
          <Grid item xs={4} md={4} key={idx}>
            <ShimmerCard height={80} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  const ShimmerCard = ({ height = 150 }) => (
    <Box sx={{ textAlign: "center" }}>
      <Skeleton
        variant="rectangular"
        width="100%"
        height={height}
        sx={{ borderRadius: "5px" }}
      />
      <Skeleton
        variant="text"
        width="60%"
        height={20}
        sx={{ mx: "auto", mt: 1 }}
      />
    </Box>
  );

  const ShimmerBox = ({ count = 4, height = 150 }) => (
    <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
      <Skeleton variant="text" width="60%" height={30} />
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid key={i} item xs={6} md={6}>
            <ShimmerCard height={height} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );

  return (
    <SectionCreator sx={{ background: "#d8d8d8" }} pb={0}>
      <Grid container spacing={3} ml={0} mt={0} pt={2}>

        {/* Box 1 */}
        <Grid container item xs={12} md={3} sx={{ paddingLeft: "0 !important" }}>
          {loading ? (
            <ShimmerBox count={4} height={150} />
          ) : dealData?.box1_title && (
            <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
              <H2 fontSize={18} mb={1} style={{ textTransform: "capitalize" }}>
                {dealData.box1_title}
              </H2>
              <Grid container spacing={3}>
                {dealData.box1_category.map((cat) => (
                  <Grid key={cat._id} item xs={6} md={6} style={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                      style={{ width: "100%" }}
                    >
                      <LazyImage
                        width={385}
                        height={342}
                        alt="banner"
                        src={dealData.box_url + cat.image}
                        sx={{
                          width: "{{ xs: '100%', md: '95px' }}",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </Link>
                    <H4 fontSize={13} sx={{ textAlign: "center" }} style={{ textTransform: "capitalize" }}>
                      {cat.title}
                    </H4>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Box 2 */}
        <Grid container item xs={12} md={3} sx={{ paddingLeft: "0 !important" }}>
          {loading ? (
            <ShimmerBoxSingle />
          ) : dealData?.box2_title && (
            <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
              <H2 fontSize={18} mb={1} style={{ textTransform: "capitalize" }}>
                {dealData.box2_title}
              </H2>
              <Grid container spacing={3}>
                {dealData.box2_category.map((cat) => (
                  <Grid key={cat._id} item xs={12} md={12}>
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                    >
                      <LazyImage
                        width={385}
                        height={342}
                        alt="banner"
                        src={dealData.box_url + cat.image}
                        sx={{
                          height: "377px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </Link>
                    <H4 fontSize={16} sx={{ textAlign: "center" }} style={{ textTransform: "capitalize" }}>
                      {cat.title}
                    </H4>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Box 3 */}
        <Grid container item xs={12} md={3} sx={{ paddingLeft: "0 !important" }}>
          {loading ? (
            <ShimmerBox
              count={dealData.box3_category?.length || 4}
              height={150}
            />
          ) : dealData?.box3_title && (
            <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
              <H2 fontSize={18} mb={1} style={{ textTransform: "capitalize" }}>
                {dealData.box3_title}
              </H2>
              <Grid container spacing={3}>
                {dealData.box3_category.map((cat) => (
                  <Grid key={cat._id} item xs={6} md={6} style={{ display: "flex", flexDirection: "column", alignItems: "center" }} >
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`} style={{ width: "100%" }}
                    >
                      <LazyImage
                        width={385}
                        height={342}
                        alt="banner"
                        src={dealData.box_url + cat.image}
                        sx={{
                          width: { md: "95px", xs: "100%" },
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </Link>
                    <H4 fontSize={13} sx={{ textAlign: "center" }} style={{ textTransform: "capitalize" }}>
                      {cat.title}
                    </H4>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Box 4 */}
        <Grid container item xs={12} md={3} sx={{ paddingLeft: "0 !important" }}>
          {loading ? (
            <ShimmerBoxMixed />
          ) : dealData?.box4_title && (
            <Grid container spacing={3} p={3} mx={3} sx={{ background: "#fff" }}>
              <H2 fontSize={18} mb={1}>{dealData.box4_title}</H2>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12}>
                  <Link
                    href={`/product?slug=${dealData?.box4_category?.[0]?.slug}`}
                  >
                    <LazyImage
                      width={385}
                      height={342}
                      alt="banner"
                      src={dealData.box_url + dealData.box4_category[0]?.image}
                      sx={{
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "5px",
                      }}
                    />
                  </Link>
                  <H4 fontSize={13} sx={{ textAlign: "center" }} style={{ textTransform: "capitalize" }}>
                    {dealData.box4_category[0]?.title}
                  </H4>
                </Grid>

                {dealData.box4_category.slice(1).map((cat) => (
                  <Grid key={cat._id} item xs={4} md={4} >
                    <Link
                      href={`/product?slug=${cat.slug}&id=${cat._id}&title=${cat.title}`}
                    >
                      <LazyImage
                        width={385}
                        height={342}
                        alt="banner"
                        src={dealData.box_url + cat.image}
                        sx={{
                          width: { xs: "100%", md: "55px" },
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </Link>
                    <H4 fontSize={13} sx={{ textAlign: "center" }} style={{ textTransform: "capitalize" }}>
                      {cat.title}
                    </H4>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </SectionCreator >
  );
};

export default section17;
