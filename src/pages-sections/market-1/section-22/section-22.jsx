import Link from "next/link";
// CUSTOM ICON COMPONENT

// GLOBAL CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import LazyImage from "components/LazyImage";
import { H2, H4,H6} from "components/Typography";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// LOCAL CUSTOM COMPONENT


// CUSTOM DATA MODEL
import { Box } from "@mui/material";
import { Padding } from "@mui/icons-material";
import HtmlRenderer from "components/HtmlRender/HtmlRenderer";
const section22 = ({description}) => {


    return (
        <>
             <SectionCreator sx={{background:'#ffefc3'}} pt={4} pb={3} mb={0}>
                <HtmlRenderer html={ description || ""} />
            </SectionCreator>
            {/* <SectionCreator sx={{background:'#ffefc3'}} pt={4} pb={3} mb={0}>
                   <H2 sx={{fontSize:"25px",textAlign:'center',fontWeight:'500'}}>What is Agukart</H2>
                   <Link  href=""><H4 sx={{fontSize:"14px",textAlign:'center',textDecoration:"underline"}}>Read our wonderfully weird  story</H4></Link>
                    <Grid container spacing={3} ml={0} mt={0} pt={2}>
                        <Grid item xs={12} md={4}>
                          <H4 sx={{fontSize:"20px",fontWeight:'bold'}}>A community doing good</H4>
                          <Typography gutterBottom  fontSize={14} component="div">
                             The process for adding items to your Agukart Registry is simple, and it's the same no matter if you're adding gifts to your Wedding, Baby, or Gift registry. When you find an item you'd like to add to your registry, click the icon that looks like a gift or click the 'Add to registry' button. 
                            </Typography>
                        </Grid>   
                        <Grid item xs={12} md={4}>
                          <H4 sx={{fontSize:"20px",fontWeight:'bold'}}>A community doing good</H4>
                          <Typography gutterBottom  fontSize={14} component="div">
                             The process for adding items to your Agukart Registry is simple, and it's the same no matter if you're adding gifts to your Wedding, Baby, or Gift registry. When you find an item you'd like to add to your registry, click the icon that looks like a gift or click the 'Add to registry' button. 
                            </Typography>
                        </Grid> 
                        <Grid item xs={12} md={4}>
                          <H4 sx={{fontSize:"20px",fontWeight:'bold'}}>A community doing good</H4>
                          <Typography gutterBottom  fontSize={14} component="div">
                             The process for adding items to your Agukart Registry is simple, and it's the same no matter if you're adding gifts to your Wedding, Baby, or Gift registry. When you find an item you'd like to add to your registry, click the icon that looks like a gift or click the 'Add to registry' button. 
                            </Typography>
                        </Grid> 
                    </Grid>

                    <Box sx={{textAlign:'center'}} mt={5}>
                      <Typography fontSize={14} sx={{fontWeight:'bold'}} pb={2} component="div">Have a question? Well, we've got some answers.</Typography>
                       <Button fontSize={13} sx={{border:'1px solid #000',color:'#000',background:'transparent',borderRadius:'34px',Padding:'7px 25px'}}>Go to Help Center</Button>
                    </Box>
                    
            </SectionCreator> */}
        </>
    )
}

export default section22

