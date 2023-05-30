import { AverageGameLengthHistViz } from "../d3_visualizations/average_game_length_hist_viz";
import { NrMovesPerGamePerEloBucket } from "../d3_visualizations/nr_moves_per_game_per_elo_bucket";
import SideBySideVizWrapper from "./side_by_side_viz_wrapper";

export const AverageLength = () => {
  return (
    <SideBySideVizWrapper
      D3RendererMasterViz={AverageGameLengthHistViz}
      D3RendererSlaveViz={NrMovesPerGamePerEloBucket}
    />
  );
};
