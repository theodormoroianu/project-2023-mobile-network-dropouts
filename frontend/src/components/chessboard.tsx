import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Button, EditableText, FormGroup } from '@blueprintjs/core';

interface ChessBoardViewProps {
    setBoardStateCallback: (callback: (fen: string) => void) => void
};

/** Shows a chessboard, whose content can be set by using the exposed callback. */
function ChessBoardView({ setBoardStateCallback } : ChessBoardViewProps) {
    const mountedRef = useRef(false) 
    // quick and dirty way to generate a random ID
    const ref = useRef<HTMLDivElement>(null);
    let [fen, setFen] = useState("rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR");
    let [chessboard, setChessboard] = useState<ReturnType<typeof Chessground> | null>(null);

    // Mount the chessboard.
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            const c = Chessground(ref.current as HTMLDivElement, {fen: "rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR"});
            setChessboard(c);
            // Set callback.
            setBoardStateCallback(setFen);
        }
    }, []);

    // // Answer to fen updates.
    useEffect(() => {
        chessboard?.set({ fen: fen });
    }, [fen]);


    return <div ref={ref} style={{"height": "500px", "width": "500px"}}></div>;
}


interface ChessFenSelectorProps {
    setFen: (fen: string) => void
};

/** Allows the user to select a FEN. */
function ChessBoardFenSelector({ setFen } : ChessFenSelectorProps) {
    let [value, setValue] = useState("");
    console.log("Received setFen of ", setFen);

    return <div>
        <FormGroup
    // helperText="FEN Input..."
    // label="Label A"
    // labelFor="text-input"
    // labelInfo="(required)"
>
    {/* <InputGroup id="text-input" placeholder="Placeholder text" /> */}
        <EditableText minWidth={1000} onChange={setValue} />
        <br />
        <br />
        
        <Button onClick={() => setFen(value)}>Update FEN</Button>
</FormGroup>
    </div>
}


function ChessBoard() {
    let [fenCallback, setFenCallback] = useState<(fen: string) => void>(() => (value: string) => {
        console.log(`Ignored request for ${value} as callback was not registered!`);
    });

    return <div>
        <div style={{"padding": "30px"}}>
            <ChessBoardFenSelector setFen={fenCallback} />
        </div>
        <div style={{"padding": "30px"}}>
            <ChessBoardView setBoardStateCallback={useCallback((x) => setFenCallback(() => x), [])} />
        </div>
    </div>
}

// function ChessBoard() {
//     const mountedRef = useRef(false) 
//     // quick and dirty way to generate a random ID
//     const ref = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!mountedRef.current) {
//             mountedRef.current = true;
//             const ground = Chessground(ref.current as HTMLDivElement, {fen: "rn2k1r1/ppp1pp1p/3p2p1/5bn1/P7/2N2B2/1PPPPP2/2BNK1RR"});
//             console.log("Done")

//         }
//     });
//     return <div ref={ref} style={{"height": "500px", "width": "500px"}}></div>;
// }

export default ChessBoard;
