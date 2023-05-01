import { useEffect, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { ChessBoardView } from './chessboard';
import { FetchDummyFens } from '../api/fens_api';


interface ChessBoardFenPickerProps {
    setFen: (fen: string) => void
};

/** Allows the user to select a FEN. */
function ChessBoardFenPicker({ setFen } : ChessBoardFenPickerProps) {
    let [fens, setFens] = useState<string[]>([]);
    let [currentMove, setCurrentMove] = useState(0);

    // fetch dummy fens
    useEffect(() => {
        FetchDummyFens().then((fens) => {
            setFens(fens);
            console.log("Set fens: ", fens);
            if (fens.length > 0)
                setFen(fens[0]);
        });
    }, []);

    if (fens.length === 0)
        return <p>Unable to fetch fens!</p>

    return <div>
        <p>Move through moves:</p>
        <div>
            <Button onClick={() => {
                if (currentMove > 0) {
                    setFen(fens[currentMove - 1]);
                    setCurrentMove(currentMove - 1);
                }
            }}>
                Prev
            </Button>
            <Button onClick={() => {
                if (currentMove + 1 < fens.length) {
                    setFen(fens[currentMove + 1]);
                    setCurrentMove(currentMove + 1);
                }
            }}>
                Next
            </Button>
        </div>
        </div>
}


function ChessBoardFenExplorer() {
    let [fenCallback, setFenCallback] = useState<(fen: string) => void>(() => (value: string) => {
        console.log(`Ignored request for ${value} as callback was not registered!`);
    });

    return <div style={{"display": "flex", "flexDirection": "row"}}>
        <div style={{"padding": "30px", "width": "500px"}}>
            <ChessBoardFenPicker setFen={fenCallback} />
        </div>
        <div style={{"padding": "30px"}}>
            <ChessBoardView setBoardStateCallback={(x) => setFenCallback(() => x)} />
        </div>
    </div>
}

export default ChessBoardFenExplorer;
