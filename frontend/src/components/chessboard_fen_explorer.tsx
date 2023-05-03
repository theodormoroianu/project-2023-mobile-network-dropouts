import { useEffect, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { ChessBoardView } from './chessboard';
import { FetchDummyFens } from '../api/fens_api';


interface ChessBoardFenPickerProps {
    setFen: (fen: string) => void
    // The function returns the list of fens, and the index of the first fen to display.
    fensToDisplay: Promise <[string[], number]>
};

/** Allows the user to select a FEN. */
function ChessBoardFenPicker({ setFen, fensToDisplay } : ChessBoardFenPickerProps) {
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
};

function ChessBoardFenExplorer({ fensToDisplay }: ChessBoardFenExplorerProps) {
    let [fenCallback, setFenCallback] = useState<(fen: string) => void>(() => (value: string) => {
        console.log(`Ignored request for ${value} as callback was not registered!`);
    });

    fensToDisplay.then((fens) => console.log(fens));
    console.log("received as fens: " + fensToDisplay);

    return <div style={{
            "display": "flex",
            "flexDirection": "column",
            "justifyContent": "center",
            "padding": "30px",
            "width": "500px"}}>
            <ChessBoardView setBoardStateCallback={(x) => setFenCallback(() => x)} />
            <ChessBoardFenPicker setFen={fenCallback} fensToDisplay={fensToDisplay} />
    </div>
}

export default ChessBoardFenExplorer;
