import { EloGamesDistributionViz } from "../d3_visualizations/elo_games_distribution_viz";
import { D3VizAndChessboardSplitScreen } from "./viz_and_chess_wrapper";

import ReactMarkdown from "react-markdown";
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
          ELO Rating Of Players On Lichess
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
          The level of a player is measured my his/her ELO, a rating system used
          in many zero-sum games including chess, pool or table tennis. You can
          see the typical ELO of players, together with a game played by them in
          the graph below.
        </p>
      </div>
    </>
  );
};

const Content = () => {
  const s = [
    "## History",
    "The ELO system was introduced aroung 1960. Despite common belief, ELO is not an acronym, but rather comes from its creator Arpad Elo. It was devised as an improvement over the older Harkness system, used between 1950 and 1960.",
    "## The idea behind ELO",
    "The ELO rating system offers a statistical measurement of the relative skill of players, using a zero-sum, self-correcting scoring system.",
    "The main idea behind the ELO system is that each player's skill level can be represented as a normal distribution, the ELO rating ideally representing the mean of the distribution. Such a model allows to easily compute the odds of the possible outcomes between two players.",
    "## How ELO Works",
    "The ELO system is quite simple:",
    " * A new player receives a pre-set rating, which usually depends on the rating maintainer (for instance, [lichess](https://lichess.org/) gives new users an ELO of 1500, while [chess.com](https://chess.com) gives new users an ELO of 1200).\n" +
      ' * When two oponents play, the winner "takes" points (as ELO is a zero-sum game the points are transfered from the winner to the looser). The easier the victory was (if the winner has a high rating), the less points are transfered from the looser to the winner.',
    "Over time, each player's rating should converge to their __real__ skill level.",
  ];

  return (
    <div className="react-markdown">
      {s.map((el) => (
        <ReactMarkdown remarkPlugins={[remarkGfm]} children={el} />
      ))}
    </div>
  );
};

export const ELO = () => {
  return (
    <div>
      <Title />
      <D3VizAndChessboardSplitScreen d3Viz={EloGamesDistributionViz} />
      <div
        style={{
          paddingLeft: "20%",
          paddingRight: "20%",
          paddingBottom: "300px",
        }}
      >
        <Content />
      </div>
    </div>
  );
};
