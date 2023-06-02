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

  const scale = (x: number) => {
    // use a logarithmic scale
    const x1 = 0.01;
    const y1 = 0.01;
    const x2 = mostFreqPos;
    const y2 = 1;

    const b = Math.log(y1 / y2) / (x1 - x2);
    const a = y2 / Math.exp(b * x2);

    // return a * Math.exp(b * x);
    return x / mostFreqPos;
  };

  let series = heatmapData?.map((row, index) => {
    return {
      name: `${8 - index}`,
      data: row.map((item) => scale(item)),
    };
  });
  series?.reverse();

  let playerColorCapitalized =
    playerColor[0].toUpperCase() + playerColor.slice(1);

  let R = 0,
    G = 0,
    B = 0;
  if (playerColorCapitalized === "Black") {
    R = 255;
    G = 0;
    B = 0;
  }

  if (playerColorCapitalized === "White") {
    R = 0;
    G = 0;
    B = 255;
  }

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
                color:
                  playerColorCapitalized === "Black"
                    ? rgb(R, 255 - 2.55 * id, 255 - 2.55 * id).formatHex()
                    : rgb(255 - 2.55 * id, 255 - 2.55 * id, B).formatHex(),
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
                color: rgb(R, G, B).formatHex(),
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
      offsetY: 20,
    },
  };
  return (
    /* @ts-ignore */
    <ReactApexChart
      options={options}
      series={series}
      type="heatmap"
      height={"100%"}
      width={"100%"}
    />
  );
};

interface PiecesRadioProps {
  pieceType: string;
  setPieceType: Dispatch<SetStateAction<string>>;
}
const PiecesRadio = ({ pieceType, setPieceType }: PiecesRadioProps) => {
  return (
    <>
      <h4 style={{ textAlign: "center" }}>Select Piece Type</h4>
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
    </>
  );
};

interface MoveNoSliderProps {
  moveNo: number;
  setMoveNo: Dispatch<SetStateAction<number>>;
}
const MoveNoSlider = ({ moveNo, setMoveNo }: MoveNoSliderProps) => {
  return (
    <>
      <h4 style={{ textAlign: "center" }}>Select Move Number</h4>
      <Slider
        min={0}
        max={100}
        stepSize={1}
        labelStepSize={10}
        value={moveNo}
        onChange={(newMoveNo) => setMoveNo(newMoveNo)}
      />
    </>
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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <div style={{ height: "15%", alignSelf: "center" }}>
          <PiecesRadio pieceType={pieceType} setPieceType={setPieceType} />
        </div>
        <div
          style={{
            width: "90%",
            height: "90%",
            alignSelf: "center",
          }}
        >
          <Heatmap
            eloBucketStats={eloBucketStats}
            pieceType={pieceType}
            moveNo={moveNo}
            playerColor={"white"}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
        }}
      >
        <div style={{ height: "15%", width: "80%", alignSelf: "center" }}>
          <MoveNoSlider moveNo={moveNo} setMoveNo={setMoveNo} />
        </div>
        <div
          style={{
            width: "90%",
            height: "90%",
            alignSelf: "center",
          }}
        >
          <Heatmap
            eloBucketStats={eloBucketStats}
            pieceType={pieceType}
            moveNo={moveNo}
            playerColor={"black"}
          />
        </div>
      </div>
    </div>
  );
};

export default PiecesPositionsHeatmap;
