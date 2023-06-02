import { NonIdealState, Tab, Tabs } from "@blueprintjs/core";
import { useEffect, useState } from "react";
import {
  EloBucketList,
  EloBucketStats,
  FetchEloBucketStats,
} from "../api/elo_bucket_stats_api";
import { FetchEloBucketList } from "../api/elo_bucket_stats_api";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PiecesPositionsHeatmap from "./piece_placement_heatmap";
import IndividualPlayerStats from "./individual_player_stats";
import OpeningsChart from "./openings_chart";
import PlayersVictoryHeatmap from "./players_victory_heatmap";
import { ChessBoardFenExplorer } from "./chessboard";

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

  let ordered_openings: [number, string][] = [];
  eloBucketStats?.most_used_openings_and_frq?.forEach((value, key) => {
    ordered_openings.push([value.nr_games, key]);
  });

  ordered_openings.sort((a, b) => a[0] - b[0]).reverse();
  console.log(ordered_openings);

  let top_openings: string[] = ["Opening 1", "Opening 2", "Opening 3"];
  for (let i = 0; i < Math.min(3, ordered_openings.length); i++)
    top_openings[i] = ordered_openings[i][1];

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
      },
    },
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
    <div style={{ marginTop: "-30px" }}>
      <h1 className={"bp4-monospace-text"} style={{ textAlign: "center" }}>
        Elo Bucket {eloBucketStats?.elo_min} - {eloBucketStats?.elo_max}
      </h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h2>Time control frequency</h2>
          <div style={{ width: "100%" }}>
            <div style={{ marginLeft: "55px", marginTop: "30px" }}>
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ width: "100%", paddingBottom: "10px" }}>
            <h2>Number of Games</h2>
            <h1 style={{ color: "#e85d04", marginTop: "-20px" }}>
              {eloBucketStats?.total_nr_games_in_elo_bucket}
            </h1>
            <h2>Number of Players</h2>
            <h1 style={{ color: "#a672a0", marginTop: "-20px" }}>
              {eloBucketStats?.nr_of_players}
            </h1>
            <h2>Average Lenght of Game in moves</h2>
            <h1 style={{ color: "#85842e", marginTop: "-20px" }}>
              {Number(eloBucketStats?.average_length).toPrecision(4)}
            </h1>
          </div>
          <h2>Frequent Openings</h2>
          <div
            style={{
              textAlign: "left",
              alignSelf: "center",
              wordWrap: "break-word",
              width: "250px",
              paddingLeft: "30px",
            }}
          >
            <h3 style={{ color: "#f24236" }}>1. &nbsp; {top_openings[0]}</h3>
            <h3 style={{ color: "#2e86ab" }}>2. &nbsp; {top_openings[1]}</h3>
            <h3 style={{ color: "#2f8d6b" }}>3. &nbsp; {top_openings[2]}</h3>
            {/* {top_openings.map((opening, index) => <h3>{index + 1}. {opening}</h3>)}  */}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h2>Representantive Player</h2>
          <h2 style={{ color: "#296eb4", marginTop: "-15px" }}>
            {eloBucketStats?.individual_player_stats[0][0]}
          </h2>
          <h2>Sample Game in this ELO bucket</h2>
          <div style={{ marginTop: "-70px" }}>
            <ChessBoardFenExplorer
              fensToDisplay={Promise.resolve([eloBucketStats?.sample_game!, 0])}
              showNonIdealStateIfEmpty={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface EloBucketViewerProps {
  eloBucket: number;
}

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
