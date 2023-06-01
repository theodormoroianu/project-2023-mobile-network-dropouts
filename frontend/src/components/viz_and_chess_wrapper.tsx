import React, { useState } from "react";
import D3Wrapper from "./d3_wrapper";
import { ChessBoardFenExplorer } from "./chessboard";

interface ComponentAndChessboardSplitScreenProps {
  Component: ({
    setFensToDisplay,
  }: {
    setFensToDisplay: (fens: Promise<[string[], number]>) => void;
  }) => JSX.Element;
}

export const ComponentAndChessboardSplitScreen = ({
  Component,
}: ComponentAndChessboardSplitScreenProps) => {
  // initially, fensToDisplay is an empty promise (a promise that resolves to nothing).
  const [fensToDisplay, setFensToDisplay] = useState<
    Promise<[string[], number]>
  >(new Promise(() => [[], 0]));

  return (
    <div
      style={{
        padding: "30px",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div style={{ width: "60%" }}>
        <Component setFensToDisplay={setFensToDisplay} />
      </div>
      <div style={{ flexGrow: "5%" }}></div>
      <div style={{ width: "35%" }}>
        <ChessBoardFenExplorer fensToDisplay={fensToDisplay} />
      </div>
    </div>
  );
};

interface D3VizAndChessboardSplitScreenProps {
  d3Viz: (
    selector: string,
    setFens: (fens: Promise<[string[], number]>) => void,
    setChessboardTitle: (chessboardTitle: string) => void
  ) => void;
  redrawOnChange?: boolean;
}

export const D3VizAndChessboardSplitScreen = ({
  d3Viz,
  redrawOnChange,
}: D3VizAndChessboardSplitScreenProps) => {
  // initially, fensToDisplay is an empty promise (a promise that resolves to nothing).
  const [fensToDisplay, setFensToDisplay] = useState<
    Promise<[string[], number]>
  >(new Promise(() => [[], 0]));
  const [chessboardTitle, setChessboardTitle] = useState("");

  // true if the chessboard is displaying some fens.
  // false otherwise.

  return (
    <div
      style={{
        padding: "30px",
        display: "flex",
        flexDirection: "row",
        width: "100%",
      }}
    >
      <div style={{ width: "60%" }}>
        <D3Wrapper
          D3Renderer={(selector) =>
            d3Viz(selector, setFensToDisplay, setChessboardTitle)
          }
          redrawOnChange={redrawOnChange}
        />
      </div>
      <div style={{ width: "5%" }}></div>
      <div style={{ width: "35%", position: "relative", top: "-70px" }}>
        <ChessBoardFenExplorer
          fensToDisplay={fensToDisplay}
          showNonIdealStateIfEmpty={true}
          my_title="Please select an ELO range."
          my_description="To view the chessboard, please click on the apropriate ELO range entry."
          chessboard_title={chessboardTitle}
        />
      </div>
    </div>
  );
};

export default D3Wrapper;
