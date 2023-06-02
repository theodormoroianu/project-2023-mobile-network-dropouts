import { useState } from "react";
import { EloBucketStats } from "../api/elo_bucket_stats_api";
import { PieCharViewer } from "./pie_chart_viewer";
import { ChessBoardFenExplorer } from "./chessboard";

interface OpeningsChartStats {
  eloBucketStats: EloBucketStats | null;
}
const OpeningsChart = ({ eloBucketStats }: OpeningsChartStats) => {
  const [fensToDisplay, setFensToDisplay] = useState<
    Promise<[string[], number]>
  >(new Promise(() => [[], 0]));
  let stats_data = eloBucketStats?.most_used_openings_and_frq;
  let data: { name: string; value: number; sample_game: string[] }[] = [];
  stats_data?.forEach((value, key) => {
    data.push({
      name: key,
      value: value.nr_games,
      sample_game: value.sample_game,
    });
  });

  const [selectedOpening, setSelectedOpening] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          width: "60%",
          height: "100%",
          alignSelf: "flex-start",
        }}
      >
        <PieCharViewer
          data={data}
          setFensToDisplay={setFensToDisplay}
          selectedOpening={selectedOpening}
          setSelectedOpening={setSelectedOpening}
        />
      </div>
      <div
        style={{
          width: "35%",
          height: "100%",
        }}
      >
        <ChessBoardFenExplorer
          fensToDisplay={fensToDisplay}
          showNonIdealStateIfEmpty={true}
          my_title="Please select an Opening."
          my_description="To view the chessboard, please click on the apropriate Opening entry from the Pie Chart."
          chessboard_title={data[selectedOpening].name}
        />
      </div>
    </div>
  );
};

export default OpeningsChart;
