import ReactMarkdown from "react-markdown";
import { AverageGameLengthHistViz } from "../d3_visualizations/average_game_length_hist_viz";
import { NrMovesPerGamePerEloBucket } from "../d3_visualizations/nr_moves_per_game_per_elo_bucket";
import SideBySideVizWrapper from "./side_by_side_viz_wrapper";
import remarkGfm from "remark-gfm";

const Title = () => {
  return (
    <>
      <div
        style={{
          paddingTop: "0px",
          paddingBottom: "20px",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "30px",
            color: "#333333",
            fontFamily: "georgia",
            alignSelf: "center",
          }}
        >
          The Game Of Chess
        </h1>
        <p
          style={{
            width: "1000px",
            marginTop: "-10px",
            fontSize: "20px",
            color: "#555555",
            alignSelf: "center",
            fontFamily: "Trebuchet MS",
          }}
        >
          Games of chess are played alternatively by 2 players. The number of
          rounds played until the end of the game can vary grately, and differs
          depending on the player's ELO.
        </p>
      </div>
    </>
  );
};

const Content = () => {
  const s = [
    "## Introduction",
    "The game of chess is one of the most popular games of the world.",
    "It is played on an 8x8 grid of alternating white and black squares, called a __chessboard__. Each of the two players controls an army of white, respectively black pieces which they play alternatively, the role of the game being to capture the adversary's king.",
    "## History",
    "The earliest record of a game similar game is of the game of __Chaturanga__, with records showing it existed in India all the way back to the seventh century.",
    "The modern chess rules were laid out during the 15th century in Europe, and standardized around 1800.",
    "## Game Theory And Computational Complexity",
    "Chess is a game where all information is public (there is no information hidden from any of the players), does not involve any element of chance (such as dicerolls or deck suffles), and there are an estimated 10 billion gogols possible different games, without any provable optimal strategy. This makes chess an interesting strategy game, for both human players and AI agents.",
  ];

  return (
    <div className="react-markdown">
      {s.map((el) => (
        <ReactMarkdown remarkPlugins={[remarkGfm]} children={el} />
      ))}
    </div>
  );
};

export const AverageLength = () => {
  return (
    <div>
      <Title />
      <SideBySideVizWrapper
        D3RendererMasterViz={AverageGameLengthHistViz}
        D3RendererSlaveViz={NrMovesPerGamePerEloBucket}
      />
      <div
        style={{
          paddingLeft: "20%",
          paddingRight: "20%",
          marginBottom: "300px",
        }}
      >
        <Content />
      </div>
    </div>
  );
};
