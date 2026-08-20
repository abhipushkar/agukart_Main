import Image from "next/image"; 
// CUSTOM COMPONENTS

import { H5 } from "components/Typography";
import FlexRowCenter from "components/flex-box/flex-row-center"; 
// IMPORT IMAGES

// import logo from "../../../../public/assets/images/bazaar-black-sm.svg";
import logo from "../../../../public/assets/images/AK_gold.png"
export default function LogoWithTitle() {
  return <FlexRowCenter flexDirection="column" gap={1.5} mb={4}>
      <Image src={logo} width={"50"} height={"50"} alt="bazaar" />
      <H5 fontWeight={700}>Welcome To Agukart</H5>
    </FlexRowCenter>;
}