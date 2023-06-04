import { EloBucketStats } from "../api/elo_bucket_stats_api";
import ReactApexChart from "react-apexcharts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
    data.push({ name: date.toLocaleDateString("en-UK"), rating: rating });
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="rating"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
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
      {color === "all" && <h4 style={{ marginLeft: "110px" }}>All games</h4>}
      {color !== "all" && (
        <h4 style={{ marginLeft: "90px" }}>Games with {color}</h4>
      )}
      {/* @ts-ignore */}
      <ReactApexChart
        /* @ts-ignore */
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
          marginTop: "-35px",
          width: "90%",
          height: "100%",
          paddingTop: "0",
          display: "flex",
          justifyContent: "space-evenly",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            marginLeft: "60px",
          }}
        >
          <h2>Player username:</h2>
          <h2 style={{ color: "#0b06a9", marginLeft: "10px" }}>{playerName}</h2>
        </div>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <h2>Average oponent rating:</h2>
          <h2 style={{ color: "#df2935", marginLeft: "10px" }}>
            {averageOponentRating}
          </h2>
        </div>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <h2>Total number of games:</h2>
          <h2 style={{ color: "#29BA48", marginLeft: "10px" }}>
            {stats.length}
          </h2>
        </div>
      </div>
      <div
        style={{
          marginTop: "0px",
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
