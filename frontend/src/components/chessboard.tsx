import React, { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import "chessground/assets/chessground.base.css"
import "chessground/assets/chessground.brown.css"
import "chessground/assets/chessground.cburnett.css"

interface ChessBoardProps {
    setBoardStateCallback: (callback: (fen: string) => void) => void
};

function ChessBoard() {
    const mountedRef = useRef(false) 
    // quick and dirty way to generate a random ID
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            const ground = Chessground(ref.current as HTMLDivElement, {fen: "rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR"});
            console.log("Done")

        }
    });
    return <div ref={ref} style={{"height": "500px", "width": "500px"}}></div>;
}

export default ChessBoard;
