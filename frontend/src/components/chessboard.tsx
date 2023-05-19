import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Button, NonIdealState } from '@blueprintjs/core';

interface ChessBoardViewProps {
    setBoardStateCallback: (callback: (fen: string) => void) => void
};

/** Shows a chessboard, whose content can be set by using the exposed callback. */
const ChessBoardView = ({ setBoardStateCallback } : ChessBoardViewProps) => {
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


interface ChessBoardFenPickerProps {
    setFen: (fen: string) => void
    // The function returns the list of fens, and the index of the first fen to display.
    fensToDisplay: Promise <[string[], number]>
};

/** Allows the user to select a FEN, given a list of moves in a game. */
const ChessBoardFenPicker = ({ setFen, fensToDisplay } : ChessBoardFenPickerProps) => {
    let [fens, setFens] = useState<string[]>([]);
    let [currentMove, setCurrentMove] = useState(0);

    // fetch dummy fens
    useEffect(() => {
        fensToDisplay.then(([fens, initialFenId]) => {
            setFens(fens);
            console.log("Loaded " + fens.length + " fens.");
            if (fens.length > 0) {
                setFen(fens[initialFenId]);
                setCurrentMove(initialFenId);
            }
        });
    }, [fensToDisplay, setFen]);

    if (fens.length === 0)
        return <p>No moves are available!</p>

    return <div style={{"width": "100%"}}>
            <Button active={!(currentMove > 0 && fens.length > 0)} onClick={() => {
                if (currentMove > 0) {
                    setFen(fens[currentMove - 1]);
                    setCurrentMove(currentMove - 1);
                }
            }} style={{"width": "50%"}}>
                Previous Move
            </Button>
            <Button active={!(currentMove + 1 < fens.length)} onClick={() => {
                if (currentMove + 1 < fens.length) {
                    setFen(fens[currentMove + 1]);
                    setCurrentMove(currentMove + 1);
                }
            }} style={{"width": "50%"}}>
                Next Move
            </Button>
        </div>
}

interface ChessBoardFenExplorerProps {
    // Function to call in order to get fens to display, e.g. this function can be an API call.
    // The function returns the list of fens, and the index of the first fen to display.
    fensToDisplay: Promise <[string[], number]>
    showNonIdealStateIfEmpty?: boolean
};

/** Allows the user to navigate a game, by going forward / backward in moves */
export const ChessBoardFenExplorer = ({ fensToDisplay }: ChessBoardFenExplorerProps) => {
    let [fenCallback, setFenCallback] = useState<(fen: string) => void>(() => (value: string) => {
        console.log(`Ignored request for ${value} as callback was not registered!`);
    });
    const [fensExist, setFensExist] = useState(false);

    useEffect(() => {
        fensToDisplay.then(fens => {
            if (fens[0].length != 0)
                setFensExist(true);
        });
    }, [fensToDisplay]);

    fensToDisplay.then((fens) => console.log(fens));
    // console.log("received as fens: " + fensToDisplay);

    return <div style={{
        "display": "flex",
        "flexDirection": "column",
        "justifyContent": "center",
        "padding": "30px",
        "width": "100%",
        "height": "100%"
    }}>
        {fensExist && <>
            <ChessBoardView setBoardStateCallback={(x) => setFenCallback(() => x)} />
            <ChessBoardFenPicker setFen={fenCallback} fensToDisplay={fensToDisplay} />
        </>}
        {!fensExist && <NonIdealState
            icon={"search"}
            title={"Please select an ELO range."}
            description={"To view the chessboard, please click on the apropriate ELO range entry."}
        />}
    </div>
}
