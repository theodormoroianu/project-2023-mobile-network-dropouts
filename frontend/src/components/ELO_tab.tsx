import { EloGamesDistributionViz } from "../d3_visualizations/elo_games_distribution_viz";
import { D3VizAndChessboardSplitScreen } from "./viz_and_chess_wrapper";

export const ELO = () => {
  return <D3VizAndChessboardSplitScreen d3Viz={EloGamesDistributionViz} />;
};
