import Link from "next/link";
// CUSTOM ICON COMPONENT

// GLOBAL CUSTOM COMPONENTS

import { SectionCreator } from "components/section-header";
import LazyImage from "components/LazyImage";
import { H2, H4,H6 } from "components/Typography";
// GLOBAL CUSTOM COMPONENTS

// LOCAL CUSTOM COMPONENT


// CUSTOM DATA MODEL
import { Box } from "@mui/material";
import { Carousel } from "components/carousel";
import { fontSize } from "theme/typography";

const section19 = () => {

    const responsive = [{
        breakpoint: 959,
        settings: {
          slidesToShow: 2
        }
      }, {
        breakpoint: 650,
        settings: {
          slidesToShow: 1
        }
      }];


    return (
        <>
         <SectionCreator seeMoreLink="#" pt={2}  sx={{background:'#e9e7e7'}}>
           <Box sx={{background:'#fff'}} p={2} my={1}>
            <H4 fontSize={20} pb={1}>Best Sellers in Jewelry</H4>
            <Carousel  slidesToShow={6} responsive={responsive}>
                <Link href={`/products/`}>
                    <Box >
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box >
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
            </Carousel>
            </Box>
            <Box sx={{background:'#fff'}} p={2} my={1}>
            <H4 fontSize={20} pb={1}>Best Sellers in Clothing,shoes</H4>
            <Carousel  slidesToShow={6} responsive={responsive}>
                <Link href={`/products/`}>
                    <Box >
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box >
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
                <Link href={`/products/`}>
                    <Box>
                    <LazyImage 
                        width={385} 
                        height={342} 
                        alt="banner" 
                        src="https://i.etsystatic.com/46225130/r/il/70b696/5349101311/il_300x300.5349101311_9eus.jpg" 
                        />                       
                    </Box>
                </Link>
            </Carousel>
            </Box>
            </SectionCreator>
        </>
    )
}

export default section19

