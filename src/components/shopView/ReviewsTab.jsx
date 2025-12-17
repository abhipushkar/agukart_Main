"use client";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import StarIcon from "@mui/icons-material/Star";
import TabPanel from "@mui/lab/TabPanel";
import { FlexBox } from "components/flex-box";
import Pagination from "@mui/material/Pagination";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import FlagIcon from "@mui/icons-material/Flag";
import { useEffect, useState } from "react";
import { getAPIAuth, postAPI } from "utils/__api__/ApiServies";
import { CircularProgress, Rating } from "@mui/material";



const SORT_OPTIONS = [
  {
    label: "Relevance",
    value: "relevance",
  },
  {
    label: "Newest",
    value: "date",
  },
  {
    label: "Price Low to High",
    value: "asc",
  },
  {
    label: "Price High to Low",
    value: "desc",
  },
];

const ReviewsTab = ({ vendor_id }) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [imageBaseUrl, setImageBaseUrl] = useState("");
  const [productImageBaseUrl, setProductImageBaseUrl] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const getAllVendorReview = async (page) => {
    try {
      setLoading(true);
      const res = await getAPIAuth(`vendor-reviews/${vendor_id}?page=${page}&limit=10`);
      if (res.status === 200) {
        setLoading(false);
        setReviews(res?.data?.data);
        setAvgRating(res?.data?.ratingAvg);
        setImageBaseUrl(res?.data?.image_url);
        setProductImageBaseUrl(res?.data?.product_image_url);
        setTotalPages(res?.data?.totalPages);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    if (vendor_id) {
      getAllVendorReview(page);
    }
  }, [vendor_id, page])

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  return (
    <>
      {
        loading ?
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              padding: "48px",
              height: "100vh",
            }}
          >
            <CircularProgress size={20} />
          </Box>
          :
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Review
            </Typography>
            <Box
              mt={2}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                component="div"
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Typography pr={1}>Average item review</Typography>
                <Typography
                  pr={1}
                  component="div"
                  sx={{ paddingTop: "4px" }}
                  display={"flex"}
                  alignItems={"center"}
                >
                  <Rating
                    precision={0.5}
                    value={Number(avgRating) || 0}
                    size="small"
                    readOnly
                    sx={{
                      fontSize: 13,
                      color: '#fbc02d'
                    }}
                  />
                </Typography>
                <Typography>{reviews?.length}</Typography>
              </Typography>
              {/* <Typography component="div">
              <FlexBox
                alignItems="center"
                justifyContent="end"
                gap={1}
                flex="1 1 0"
              >
                <Typography color="grey.600" whiteSpace="pre">
                  Sort by:
                </Typography>
                <TextField
                  select
                  size="small"
                  value={sortBy}
                  variant="outlined"
                  placeholder="Sort by"
                  onChange={(e) => handleChangeSortBy(e.target.value)}
                  sx={{
                    border: "none",
                    ".MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    ".MuiSelect-select": {
                      paddingLeft: "0",
                    },
                  }}
                >
                  {SORT_OPTIONS.map((item) => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </FlexBox>
            </Typography> */}
            </Box>
            <Box>
              {
                reviews?.map((item, i) => (
                  <Typography
                    component="div"
                    pb={2}
                    mb={2}
                    sx={{ borderBottom: "1px solid #e7e7e7" }}
                  >
                    <Typography
                      mb={1}
                      fontSize={14}
                      display={"flex"}
                      pt={1}
                      alignItems={"center"}
                    >
                      <Typography component={"span"} overflow={"hidden"}>
                        <img
                          src={item?.userdata?.image ? `${imageBaseUrl}${item?.userdata?.image}` : "https://i.etsystatic.com/iusa/6dc243/109604397/iusa_75x75.109604397_a4mk.jpg?version=0"}
                          style={{
                            borderRadius: "50%",
                            width: "25px",
                            height: "25px",
                          }}
                          alt=""
                        />{" "}
                      </Typography>
                      <Typography component="span" pl={1}>
                        <Link
                          href="#"
                          style={{
                            color: "gray",
                            fontSize: "14px",
                            textDecoration: "underline",
                          }}
                        >
                          {item?.userdata?.name}
                        </Link>
                      </Typography>
                      <Typography fontSize={14} color={"gray"} pl={1}>
                        {new Date(item?.createdAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </Typography>
                    </Typography>
                    <Typography component="div" display={"flex"} alignItems={"center"}>
                      <Rating
                        precision={0.5}
                        value={Number(item?.item_rating) || 0}
                        size="small"
                        readOnly
                        sx={{
                          fontSize: 13,
                          color: '#fbc02d'
                        }}
                      />
                    </Typography>
                    <Typography sx={{ fontSize: "18px", color: "gray" }}>
                      {item?.additional_comment}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      mt={1}
                      p={1}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        backgroundColor: "#fafafa",
                        maxWidth: 450,
                        cusor: "pointer",
                      }}
                      onClick={() => {
                        const url = `/products/${item?.productdata?._id}`
                        window.open(url, "_blank");
                      }}
                    >
                      {/* Product Image */}
                      <Box
                        component="img"
                        src={
                          item?.productdata?.image?.length > 0 ? `${productImageBaseUrl}${item?.productdata?.image?.[0]}` :
                            "https://i.etsystatic.com/il/5d0e88/5158021585/il_794xN.5158021585_1kc5.jpg"
                        }
                        alt="Product Image"
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: "4px",
                          objectFit: "cover",
                        }}
                      />

                      {/* Product Title */}
                      <Typography
                        fontSize={14}
                        color="text.primary"
                        sx={{ flex: 1 }}
                      >
                        {item?.productdata?.product_title?.replace(/<[^>]*>?/gm, '')}
                      </Typography>
                    </Box>
                    {/* <Typography
                      mt={1}
                      fontSize={14}
                      display={"flex"}
                      pt={1}
                      alignItems={"center"}
                    >
                      <Typography component={"span"} overflow={"hidden"}>
                        <img
                          src="https://i.etsystatic.com/iusa/6dc243/109604397/iusa_75x75.109604397_a4mk.jpg?version=0"
                          style={{
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                          }}
                          alt=""
                        />
                      </Typography>
                      <Typography component="div" pl={1}>
                        <Typography
                          component="div"
                          sx={{ display: "flex", alignItems: "center" }}
                        >
                          <Link
                            href="#"
                            style={{
                              color: "gray",
                              fontSize: "14px",
                              textDecoration: "underline",
                            }}
                          >
                            Katarzyna
                          </Link>{" "}
                          <Typography fontSize={14} color={"gray"} pl={1}>
                            responded 30 Sep, 2024
                          </Typography>
                        </Typography>
                        <Typography>
                          Thank you so much for leaving a wonderful review
                        </Typography>
                      </Typography>
                    </Typography> */}
                    {/* <Typography
                      mt={2}
                      fontSize={14}
                      display={"flex"}
                      pt={1}
                      alignItems={"center"}
                    >
                      <Typography component={"span"}>
                        <img
                          src="https://i.etsystatic.com/iusa/6dc243/109604397/iusa_75x75.109604397_a4mk.jpg?version=0"
                          style={{
                            borderRadius: "5px",
                            width: "130px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                          alt=""
                        />
                      </Typography>
                      <Typography component="div" ml={1}>
                        <Typography>
                          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas
                          natus esse velit aliquam ipsam, at delectus quibusdam
                          voluptatibus culpa fugit iste veritatis qui. Nisi eveniet
                          quaerat cumque provident quia sapiente?
                        </Typography>
                      </Typography>
                    </Typography>

                    <Box mt={5}>
                      <Typography component="div">
                        <Button
                          sx={{
                            background: "transparent",
                            border: "none",
                            borderRadius: "30px",
                            padding: "4px 16px",
                          }}
                        >
                          <ThumbUpAltIcon sx={{ marginRight: "6px" }} />
                          is this review helpful?
                        </Button>
                        <Button
                          sx={{
                            marginLeft: "16px",
                            background: "transparent",
                            border: "none",
                            borderRadius: "30px",
                            padding: "4px 16px",
                          }}
                        >
                          <FlagIcon sx={{ marginRight: "6px" }} />
                          Report this review
                        </Button>
                      </Typography>
                    </Box> */}
                  </Typography>
                ))
              }
              {/* <Typography component="div" pt={2} mt={2}>
              <Typography fontSize={14} display={"flex"}>
                <Typography component={"span"} overflow={"hidden"}>
                  <img
                    src="https://i.etsystatic.com/iusa/6dc243/109604397/iusa_75x75.109604397_a4mk.jpg?version=0"
                    style={{
                      borderRadius: "50%",
                      width: "25px",
                      height: "25px",
                    }}
                    alt=""
                  />
                </Typography>
                <Typography component="div" pl={1}>
                  <Typography
                    component="div"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Link
                      href="#"
                      style={{
                        color: "gray",
                        fontSize: "14px",
                        textDecoration: "underline",
                      }}
                    >
                      Katarzyna
                    </Link>{" "}
                    <Typography fontSize={14} color={"gray"} pl={1}>
                      30 Sep, 2024
                    </Typography>
                  </Typography>
                  <Typography component="div" mt={1}>
                    {" "}
                    <img
                      src="https://i.etsystatic.com/iusa/6dc243/109604397/iusa_75x75.109604397_a4mk.jpg?version=0"
                      style={{
                        borderRadius: "4px",
                        width: "200px",
                        height: "200px",
                      }}
                      alt=""
                    />
                  </Typography>
                  <Typography
                    component="div"
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <Typography component="span">
                      <StarIcon />
                    </Typography>
                    <Typography component="span">
                      <StarIcon />
                    </Typography>
                    <Typography component="span">
                      <StarIcon />
                    </Typography>
                    <Typography component="span">
                      <StarIcon />
                    </Typography>
                    <Typography component="span">
                      <StarIcon />
                    </Typography>
                  </Typography>
                  <Typography>
                    Thank you so much for leaving a wonderful review
                  </Typography>
                </Typography>
              </Typography>
            </Typography> */}
            </Box>
            {
              reviews.length > 0 && (
                <Box mt={4}>
                  <Pagination count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    variant="outlined" />
                </Box>
              )
            }
          </Box>
      }
    </>
  );
};

export default ReviewsTab;
