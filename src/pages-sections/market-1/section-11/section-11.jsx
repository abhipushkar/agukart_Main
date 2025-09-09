import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container"; 
// LOCAL CUSTOM COMPONENTS

import ServiceCard from "./service-card"; 
// API FUNCTIONS

import api from "utils/__api__/market-1";
import { useEffect, useState } from "react";
export default function Section11() {
  // const services = await api.getServiceList();
  const [data , setdata] = useState([])

  const getServiceList = async() => {

    const services = await api.getServiceList();
    setdata(services)
    
  }
  
  useEffect(() => {
    getServiceList()
  }, []);
  return <Container className="mb-5">
      <Grid container spacing={3}>
        {data?.map(item => <ServiceCard key={item.id} service={item} />)}
      </Grid>
    </Container>;
}