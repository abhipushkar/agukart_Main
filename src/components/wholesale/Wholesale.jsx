"use client";
import React, { useEffect, useState } from "react";
import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import { H2, H4, H3, H6, Small } from "components/Typography";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { postAPI } from "utils/__api__/ApiServies";
import parse from "html-react-parser";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
// LOCAL CUSTOM COMPONENT

const WholeSale = () => {
  const [data, setData] = useState({});
  const getWholeSale = async () => {
    try {
      const res = await postAPI("get-description", {
        type: "Wholesale",
      });

      if (res.status === 200) {
        setData(res.data.information);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getWholeSale();
  }, []);

  if (Object.entries(data).length > 0)
    return (
      <>
        <SectionCreator my={2}>
          <Grid
            py={2}
            sx={{ background: "#e8e8e8", width: "100%", textAlign: "center" }}
          >
            <H2 sx={{ textAlign: "center" }}>Wholesale</H2>
          </Grid>
          <HtmlRenderer html={ data?.description || ""} />
        </SectionCreator>
      </>

    );
  <></>;
};

export default WholeSale;
