import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { rgb } from "d3";
import { useState } from "react";
import { EloBucketStats } from "../api/elo_bucket_stats_api";
import { ChessBoardFenExplorer } from "./chessboard";

interface PlayersVictoryHeatmapStats {
  eloBucketStats: EloBucketStats | null;
}
const PlayersVictoryHeatmap = ({
  eloBucketStats,
}: PlayersVictoryHeatmapStats) => {
  // fens to display in the attached chessboard view
  const [fensToDisplay, setFensToDisplay] = useState<
    Promise<[string[], number]>
  >(new Promise(() => [[], 0]));

  const [gameMsg, setGameMsg] = useState("Demo game");

  if (eloBucketStats === null || eloBucketStats === undefined)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  let series = eloBucketStats.games_won_heatmap.map((row, index) => {
    return {
      name: `ELO between ${eloBucketStats.elo_min + index * 10} and ${
        eloBucketStats.elo_min + index * 10 + 9
      }`,
      data: row.map(
        (item) =>
          Math.round(
            (item.games_won / Math.max(1, item.games_won + item.games_lost)) *
              100
          ) / 100
      ),
    };
  });
  series.reverse();

  let options: ApexOptions = {
    plotOptions: {
      heatmap: {
        radius: 0,
        colorScale: {
          ranges: Array(100)
            .fill(0)
            .map((_, id) => {
              return {
                from: 0.4 + id / 500,
                to: 0.4 + (id + 1) / 500,
                name: `range-${id}`,
                color: rgb(255 - 2.55 * id, 255 - 2.55 * id, 255).formatHex(),
              };
            })
            .concat([
              {
                from: 0,
                to: 0.4,
                name: `range-0`,
                color: rgb(240, 240, 255).formatHex(),
              },
              {
                from: 0.6,
                to: 1,
                name: `range-1`,
                color: rgb(0, 0, 255).formatHex(),
              },
            ]),
        },
      },
    },
    chart: {
      toolbar: {
        show: false,
      },
      height: 350,
      type: "heatmap",
      zoom: {
        enabled: false,
      },
      events: {
        click(e, chart, options) {
          const row = options.seriesIndex,
            column = options.dataPointIndex;
          console.log(options);
          console.log(row, column);
          if (row !== -1) {
            setFensToDisplay(
              Promise.resolve([
                eloBucketStats.games_won_heatmap[9 - row][column].sample_game,
                0,
              ])
            );
            let y_axis = eloBucketStats.elo_min + (9 - row) * 10;
            let x_axis = eloBucketStats.elo_min + column * 10;
            let range_0 = y_axis.toString() + "-" + (y_axis + 9).toString();
            let range_1 = x_axis.toString() + "-" + (x_axis + 9).toString();
            setGameMsg("ELO Of " + range_0 + " Vs ELO Of " + range_1);
          }
        },
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
        (index) =>
          `ELO between ${eloBucketStats.elo_min + index * 10} and ${
            eloBucketStats.elo_min + index * 10 + 9
          }`
      ),
      tickAmount: eloBucketStats.games_won_heatmap.length,
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    colors: ["#008FFF"],
    title: {
      text: "Player Victory Rate By ELO Rating",
      align: "right",
    },
  };

  return (
    <div
      style={{
        // "padding": "30px",
        // "padding-top"
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{ width: "60%" }}>
        {/* @ts-ignore */}
        <ReactApexChart
          options={options}
          series={series}
          type="heatmap"
          height={600}
          width={700}
        />
      </div>
      <div style={{ width: "35%", position: "relative", top: "-50px" }}>
        <ChessBoardFenExplorer
          fensToDisplay={fensToDisplay}
          showNonIdealStateIfEmpty={true}
          my_title="Please select a Square."
          my_description="To view the chessboard, please click on the Square entry from the Heatmap."
          chessboard_title={gameMsg}
        />
      </div>
    </div>
  );
};

export default PlayersVictoryHeatmap;
