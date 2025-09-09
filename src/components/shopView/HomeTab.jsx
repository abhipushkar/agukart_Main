"use client";

import HtmlRenderer from "components/HtmlRender/HtmlRenderer";

const HomeTab = ({description}) => {
  return (
    <>
      <HtmlRenderer html={ description || ""} />
    </>
  );
};

export default HomeTab;
