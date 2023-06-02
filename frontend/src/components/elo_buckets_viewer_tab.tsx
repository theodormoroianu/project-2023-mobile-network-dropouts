import { NonIdealState, Tab, Tabs } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import {
  EloBucketList,
  EloBucketStats,
  FetchEloBucketStats,
} from "../api/elo_bucket_stats_api";
import { FetchEloBucketList } from "../api/elo_bucket_stats_api";
import { PieCharViewer } from "./pie_chart_viewer";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { rgb } from "d3";
import { ChessBoardFenExplorer } from "./chessboard";
import PiecesPositionsHeatmap from "./piece_placement_heatmap";
import IndividualPlayerStats from "./individual_player_stats";

interface GeneralInformationStats {
  eloBucketStats: EloBucketStats | null;
}

const GeneralInformation = ({ eloBucketStats }: GeneralInformationStats) => {
  let series: string[] = [];
  eloBucketStats?.most_used_timecontrols_and_frq.forEach((value, key) => {
    series.push(
      "" +
        (
          (value / eloBucketStats.total_nr_games_in_elo_bucket) *
          100
        ).toPrecision(3)
    );
  });

  let options: ApexOptions = {
    chart: {
      height: 600,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: "20%",
          background: "transparent",
          image: undefined,
        },
        dataLabels: {
          //   name: {
          //     show: false,
          //   },
          //   value: {
          //     show: false,
          //   }
        },
      },
    },
    // colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5', "#0077B5"],
    labels: Array.from(
      eloBucketStats?.most_used_timecontrols_and_frq.keys() ?? []
    ),
    legend: {
      show: true,
      floating: true,
      fontSize: "12px",
      position: "left",
      offsetX: 50,
      offsetY: 0,
      labels: {
        useSeriesColors: true,
      },
      horizontalAlign: "right",
      markers: {
        radius: 0,
      },
      //   formatter: function(seriesName, opts) {
      //     return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
      //   },
      itemMargin: {
        vertical: 3,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: false,
          },
        },
      },
    ],
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "70%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "70%",
        }}
      >
        <div style={{ width: "70%", paddingBottom: "10px" }}>
          <h2 className={"bp4-monospace-text"}>
            Elo Bucket {eloBucketStats?.elo_min} - {eloBucketStats?.elo_max}
          </h2>
        </div>
        <div style={{ width: "70%" }}>
          <div style={{ width: "100%" }}>
            {/* @ts-ignore */}
            <ReactApexChart
              options={options}
              /* @ts-ignore */
              series={series}
              type="radialBar"
              height={350}
              width={350}
            />
          </div>
        </div>
      </div>
      <div style={{ width: "50%" }}>
        <h3 className={"bp4-monospace-text"}>Frequent Openings</h3>
        <br></br>
      </div>
    </div>
  );
};

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

interface EloBucketViewerProps {
  eloBucket: number;
}

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

  // let [index, setIndex] = useState(0);
  // let pie_chart_data = data.map(d => ({ name: d.name, value: d.value }));
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

/** Shows statistics about a SINGLE elo range */
const EloBucketViewer = ({ eloBucket }: EloBucketViewerProps) => {
  let [eloBucketStats, setEloBucketStats] = useState<EloBucketStats | null>(
    null
  );
  let [activeTab, setActiveTab] = useState("general-information");

  useEffect(() => {
    FetchEloBucketStats(eloBucket).then(setEloBucketStats);
  }, [eloBucket]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        top: "-20px",
      }}
    >
      <Tabs
        onChange={(newTab) => setActiveTab(newTab.toString())}
        selectedTabId={activeTab}
      >
        <Tab id={"general-information"} title={"General Information"} />
        <Tab id={"openings-chart"} title={"Openings Frequency"} />
        <Tab id={"players-victory-heatmap"} title={"Players Victory Rate"} />
        <Tab
          id={"pieces-placement-heatmap"}
          title={"Pieces Placement Throught Games"}
        />
        <Tab
          id={"specific-player-stats"}
          title={"Player stats of a representative player"}
        />
      </Tabs>
      <div style={{ paddingTop: "30px", width: "100%", height: "100%" }}>
        {activeTab === "general-information" && (
          <GeneralInformation eloBucketStats={eloBucketStats} />
        )}
        {activeTab === "openings-chart" && (
          <OpeningsChart eloBucketStats={eloBucketStats} />
        )}
        {activeTab === "players-victory-heatmap" && (
          <PlayersVictoryHeatmap eloBucketStats={eloBucketStats} />
        )}
        {activeTab === "pieces-placement-heatmap" && (
          <PiecesPositionsHeatmap eloBucketStats={eloBucketStats} />
        )}
        {activeTab === "specific-player-stats" && (
          <IndividualPlayerStats eloBucketStats={eloBucketStats} />
        )}
      </div>
    </div>
  );
};

/** This function shows a selector at the left of the screen, where users can
 * click on an ELO range, to see specific data about it. */
export const EloBucketsViewer = () => {
  let [eloBuckets, setEloBuckets] = useState<EloBucketList | null>(null);
  let [eloBucket, setEloBucket] = useState<string>("");

  useEffect(() => {
    FetchEloBucketList().then(setEloBuckets);
  }, []);

  if (eloBuckets === null) return <div></div>;

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
      <Tabs
        vertical={true}
        onChange={(newTab) => setEloBucket(newTab.toString())}
        selectedTabId={eloBucket}
      >
        {eloBuckets.map((eloBucket) => (
          <Tab
            key={eloBucket.elo_bucket}
            id={eloBucket.elo_bucket}
            title={eloBucket.elo_min + " - " + eloBucket.elo_max}
          />
        ))}
      </Tabs>
      <div style={{ paddingLeft: "30px", width: "100%", height: "100%" }}>
        {eloBucket === "" && (
          <NonIdealState
            icon={"search"}
            title={"Please select an ELO range."}
            description={
              "To view additional statistics about a specific ELO range, please click on the apropriate entry."
            }
          />
        )}
        {eloBucket !== "" && <EloBucketViewer eloBucket={Number(eloBucket)} />}
      </div>
    </div>
  );
};
