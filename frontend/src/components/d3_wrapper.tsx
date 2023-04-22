import React, { useEffect, useRef } from 'react';

interface D3WrapperProps {
  D3Renderer: (elementSelector: string) => void
};

function D3Wrapper({ D3Renderer } : D3WrapperProps) {
    const mountedRef = useRef(false) 
    // quick and dirty way to generate a random ID
    const random_id_name = ("selector" + Math.random()).replaceAll(".", "");

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            D3Renderer("#" + random_id_name);
        }
    });
    return <div id={random_id_name}></div>;
}

export default D3Wrapper;
