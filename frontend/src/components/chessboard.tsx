import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Button, EditableText, FormGroup } from '@blueprintjs/core';

interface ChessBoardViewProps {
    setBoardStateCallback: (callback: (fen: string) => void) => void
};

/** Shows a chessboard, whose content can be set by using the exposed callback. */
export function ChessBoardView({ setBoardStateCallback } : ChessBoardViewProps) {
    const mountedRef = useRef(false) 
    // quick and dirty way to generate a random ID
    const ref = useRef<HTMLDivElement>(null);
    let [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    let [chessboard, setChessboard] = useState<ReturnType<typeof Chessground> | null>(null);

    // Mount the chessboard.
    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            const c = Chessground(ref.current as HTMLDivElement, {fen: fen});
            setChessboard(c);
            // Set callback.
            setBoardStateCallback(setFen);
        }
    }, [fen, setBoardStateCallback]);

    // // Answer to fen updates.
    useEffect(() => {
        chessboard?.set({ fen: fen });
    }, [fen, chessboard]);


    return <div ref={ref} style={{"width": "100%", "aspectRatio": "1/1"}}></div>;
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
        <div style={{"padding": "30px", "width": "400px"}}>
            <ChessBoardView setBoardStateCallback={useCallback((x) => setFenCallback(() => x), [])} />
        </div>
    </div>
}

export default ChessBoard;
