import Link from "next/link";
import Image from "next/image";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container"; 
// CUSTOM ICON COMPONENT

import CategoryIcon from "icons/Category"; 
// GLOBAL CUSTOM COMPONENTS

import { Paragraph } from "components/Typography";
import { SectionHeader } from "components/section-header"; 
// STYLED COMPONENT

import { StyledCard } from "./styles"; 
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
export default function Section9() {
  // const categories = await api.getCategories();
  const [data , setdata] = useState([])

  const getCategories = async() => {

    const categories = await api.getCategories();
    setdata(categories)
    
  }
  
  useEffect(() => {
    getCategories()
  }, []);
  return <Container className="mb-5">
      <SectionHeader seeMoreLink="#" title="Categories" icon={<CategoryIcon color="primary" />} />

      <Grid container spacing={3}>
        {data?.map((item, ind) => <Grid item lg={2} md={3} sm={4} xs={6} key={ind}>
            <Link href={`/products/search/${item.slug}`}>
              <StyledCard elevation={1}>
                <Image width={52} height={52} alt="fashion" src={item.image} />
                <Paragraph fontWeight="600">{item.name}</Paragraph>
              </StyledCard>
            </Link>
          </Grid>)}
      </Grid>
    </Container>;
}