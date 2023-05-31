// TODO: implement this
import { Card, Elevation, RadioGroup, Radio, Slider } from "@blueprintjs/core";
import { Dispatch, SetStateAction, useState } from "react";
import { EloBucketStats } from "../api/elo_bucket_stats_api";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { rgb } from "d3";
import {
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

const RatingScatter = ({ eloBucketStats }: IndividualPlayerStatsProps) => {
  let ratingMap = new Map<Date, number>();
  const stats = eloBucketStats!.individual_player_stats;
  for (let i = 0; i < stats.length; i++) {
    let utc_day_string = stats[i][7].split("|")[0].split(".");
    let utc_day = new Date(
      Number(utc_day_string[0]),
      Number(utc_day_string[1]) - 1,
      Number(utc_day_string[2])
    );
    let rating = Number(stats[i][4]);
    if (ratingMap.has(utc_day))
      ratingMap.set(utc_day, Math.max(ratingMap.get(utc_day)!, rating));
    else ratingMap.set(utc_day, rating);
  }

  let data: any[] = [];
  ratingMap.forEach((rating, date) => {
    data.push({ x: date.toLocaleDateString("en-UK"), y: rating });
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis type="category" dataKey="x" name="date" />
        <YAxis type="number" dataKey="y" name="ELO" />
        <ZAxis type="number" range={[100]} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        <Legend />
        <Scatter name="Rating Change" data={data} fill="#8884d8" line />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

interface WinRateProps {
  noWins: number;
  noLoses: number;
  noDraws: number;
  color: string;
}
const WinRate = ({ noWins, noLoses, noDraws, color }: WinRateProps) => {
  const series = [noWins, noLoses, noDraws];
  const options = {
    chart: {
      width: 380,
      type: "pie",
    },
    labels: ["Win", "Loss", "Draw"],
    colors: ["#6eae81", "#da2c38", "#9c8d6d"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div style={{}}>
      {color === "all" && <h4>All games</h4>}
      {color !== "all" && <h4>Games with {color}</h4>}
      {/* @ts-ignore */}
      <ReactApexChart
        options={options}
        series={series}
        type="pie"
        width={380}
      />
    </div>
  );
};

const PlayerStats = ({ eloBucketStats }: IndividualPlayerStatsProps) => {
  const stats = eloBucketStats!.individual_player_stats;
  let noWitheWins = 0,
    noWitheLoses = 0,
    noWitheDraws = 0;
  let noBlackWins = 0,
    noBlackLoses = 0,
    noBlackDraws = 0;

  console.log(stats[0]);

  for (let i = 0; i < stats.length; i++) {
    let color = stats[i][1];
    let outcome = stats[i][2];

    if (outcome === "win") {
      if (color === "White") noWitheWins++;
      else noBlackWins++;
    } else if (outcome === "loss") {
      if (color === "White") noWitheLoses++;
      else noBlackLoses++;
    } else if (outcome === "draw") {
      if (color === "White") noWitheDraws++;
      else noBlackDraws++;
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        paddingLeft: "150px",
      }}
    >
      <WinRate
        noWins={noWitheWins + noBlackWins}
        noLoses={noWitheLoses + noBlackLoses}
        noDraws={noWitheDraws + noBlackDraws}
        color="all"
      />
      <WinRate
        noWins={noWitheWins}
        noLoses={noWitheLoses}
        noDraws={noWitheDraws}
        color="White"
      />
      <WinRate
        noWins={noBlackWins}
        noLoses={noBlackLoses}
        noDraws={noBlackDraws}
        color="Black"
      />
    </div>
  );
};

interface IndividualPlayerStatsProps {
  eloBucketStats: EloBucketStats | null;
}
const IndividualPlayerStats = ({
  eloBucketStats,
}: IndividualPlayerStatsProps) => {
  if (eloBucketStats === null || eloBucketStats === undefined)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  const stats = eloBucketStats.individual_player_stats;
  const playerName = stats[0][0];

  let averageOponentRating = 0;
  for (let i = 0; i < stats.length; i++)
    averageOponentRating += Number(stats[i][6]);
  averageOponentRating = Math.round(averageOponentRating / stats.length);

  return (
    <div>
      <div
        style={{
          width: "90%",
          height: "100%",
          paddingTop: "0",
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <h2>Player username: {playerName}</h2>
        <h2>Average oponent rating: {averageOponentRating}</h2>
        <h2>Total number of games: {stats.length}</h2>
      </div>
      <div
        style={{
          width: "90%",
          height: "100%",
        }}
      >
        <PlayerStats eloBucketStats={eloBucketStats} />
      </div>
      <div
        style={{
          width: "90%",
          height: "100%",
        }}
      >
        <RatingScatter eloBucketStats={eloBucketStats} />
      </div>
    </div>
  );
};

export default IndividualPlayerStats;
