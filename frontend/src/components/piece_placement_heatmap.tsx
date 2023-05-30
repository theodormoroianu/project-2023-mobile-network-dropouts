import { Card, Elevation, RadioGroup, Radio, Slider } from "@blueprintjs/core";
import { Dispatch, SetStateAction, useState } from "react";
import { EloBucketStats } from "../api/elo_bucket_stats_api";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { rgb } from "d3";

interface HeatmapStats {
  eloBucketStats: EloBucketStats | null;
  pieceType: string;
  moveNo: number;
  playerColor: string;
}
const Heatmap = ({
  eloBucketStats,
  pieceType,
  moveNo,
  playerColor,
}: HeatmapStats) => {
  if (eloBucketStats === null || eloBucketStats === undefined)
    return (
      <div>
        <p>Loading...</p>
      </div>
    );

  const obtainHeatmapData = (
    playerColor: string,
    pieceType: string,
    moveNo: number
  ) => {
    let lookupKey = `${playerColor}|${pieceType}|${moveNo}`;
    return eloBucketStats.pieces_pos_heatmap.get(lookupKey);
  };

  let heatmapData = obtainHeatmapData(playerColor, pieceType, moveNo);
  let mostFreqPos = Math.max(
    ...heatmapData!.reduce((acc, row) => acc.concat(row))
  );

  let series = heatmapData?.map((row, index) => {
    return {
      name: `${8 - index}`,
      data: row.map((item) => item / mostFreqPos),
    };
  });
  series?.reverse();

  let playerColorCapitalized =
    playerColor[0].toUpperCase() + playerColor.slice(1);

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
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: [0, 1, 2, 3, 4, 5, 6, 7].map(
        (index) => `${String.fromCharCode(65 + index)}`
      ),
      tickAmount: 8,
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
      text: `${playerColorCapitalized} ${pieceType} placement at move ${moveNo}`,
      align: "center",
    },
  };
  return (
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
  );
};

interface PiecesRadioProps {
  pieceType: string;
  setPieceType: Dispatch<SetStateAction<string>>;
}
const PiecesRadio = ({ pieceType, setPieceType }: PiecesRadioProps) => {
  return (
    <div
      style={{
        width: 600,
        paddingLeft: 30,
      }}
    >
      <div
        style={{
          paddingTop: 0,
          paddingLeft: 190,
        }}
      >
        <h4>Select Piece Type</h4>
      </div>
      <RadioGroup
        onChange={(event) => setPieceType(event.currentTarget.value)}
        selectedValue={pieceType}
        inline={true}
      >
        <Radio label="Pawn" value="pawn" />
        <Radio label="Knight" value="knight" />
        <Radio label="Bishop" value="bishop" />
        <Radio label="Rook" value="rook" />
        <Radio label="Queen" value="queen" />
        <Radio label="King" value="king" />
      </RadioGroup>
    </div>
  );
};

interface MoveNoSliderProps {
  moveNo: number;
  setMoveNo: Dispatch<SetStateAction<number>>;
}
const MoveNoSlider = ({ moveNo, setMoveNo }: MoveNoSliderProps) => {
  return (
    <div
      style={{
        width: 600,
      }}
    >
      <div
        style={{
          paddingTop: 0,
          paddingLeft: 230,
        }}
      >
        <h4>Select Move Number</h4>
      </div>
      <Slider
        min={0}
        max={100}
        stepSize={1}
        labelStepSize={10}
        value={moveNo}
        onChange={(newMoveNo) => setMoveNo(newMoveNo)}
      />
    </div>
  );
};

interface PiecesPositionsHeatmapStats {
  eloBucketStats: EloBucketStats | null;
}
const PiecesPositionsHeatmap = ({
  eloBucketStats,
}: PiecesPositionsHeatmapStats) => {
  const [pieceType, setPieceType] = useState("pawn");
  const [moveNo, setMoveNo] = useState(0);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "88%",
          margin: "2%",
        }}
      >
        <Card interactive={true} elevation={Elevation.TWO}>
          <PiecesRadio pieceType={pieceType} setPieceType={setPieceType} />
        </Card>
        <Card interactive={true} elevation={Elevation.TWO}>
          <MoveNoSlider moveNo={moveNo} setMoveNo={setMoveNo} />
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <Heatmap
          eloBucketStats={eloBucketStats}
          pieceType={pieceType}
          moveNo={moveNo}
          playerColor={"white"}
        />
        <Heatmap
          eloBucketStats={eloBucketStats}
          pieceType={pieceType}
          moveNo={moveNo}
          playerColor={"black"}
        />
      </div>
    </>
  );
};

export default PiecesPositionsHeatmap;
