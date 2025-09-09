import { Fragment } from "react";
import { Heading, StyledLink } from "../styles";
import { ABOUT_LINKS } from "../data";
// ==============================================================

// ==============================================================
export default function AboutLinks({ isDark }) {
  return (
    <Fragment>
      <Heading>About Us</Heading>

      <div>
        {ABOUT_LINKS.map((item, ind) => {
          return (
            item.name === "Blog" ?
            <StyledLink isDark={isDark} href="/blog" key={ind}>
              {item.name}
            </StyledLink>:
            <StyledLink isDark={isDark} href={item.url} key={ind}>
              {item.name}
            </StyledLink>
          );
        })}
      </div>
    </Fragment>
  );
}
