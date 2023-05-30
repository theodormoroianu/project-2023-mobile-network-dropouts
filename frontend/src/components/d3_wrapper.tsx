import React, { useEffect, useRef } from "react";

interface D3WrapperProps {
  D3Renderer: (elementSelector: string) => void;
  redrawOnChange?: Boolean;
}

function D3Wrapper({ D3Renderer, redrawOnChange }: D3WrapperProps) {
  const mountedRef = useRef(false);
  // quick and dirty way to generate a random ID
  const random_id_name = ("selector" + Math.random()).replaceAll(".", "");

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      D3Renderer("#" + random_id_name);
    }
  });

  useEffect(() => {
    if (mountedRef.current && redrawOnChange === true) {
      let div_to_clear = document.getElementById(random_id_name);
      if (div_to_clear !== null) {
        div_to_clear.innerHTML = "";
        D3Renderer("#" + random_id_name);
      } else console.log("Unable to find div!!");
    }
  }, [D3Renderer, random_id_name, redrawOnChange]);

  return <div id={random_id_name}></div>;
}

export default D3Wrapper;
