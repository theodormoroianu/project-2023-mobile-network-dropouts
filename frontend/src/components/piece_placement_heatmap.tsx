import { Card, Elevation, NonIdealState, Tab, Tabs, Checkbox } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { EloBucketList, EloBucketStats, FetchEloBucketStats } from '../api/elo_bucket_stats_api';
import { FetchEloBucketList } from '../api/elo_bucket_stats_api';
import { PieCharViewer } from './pie_chart_viewer';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { rgb } from 'd3';
import { ChessBoardFenExplorer } from './chessboard';

interface HeatmapStats {
    eloBucketStats: EloBucketStats | null,
    pieceType: string,
    moveNo: number,
    playerColor: string
}
const Heatmap = ({ eloBucketStats, pieceType, moveNo, playerColor }: HeatmapStats) => {
    if (eloBucketStats === null || eloBucketStats === undefined)
        return <div><p>Loading...</p></div>;
    
    let series = eloBucketStats.games_won_heatmap.map((row, index) =>
        {return {

            // TODO reverse rows when displaying
            name: `${8 - index}`,
            data: row.map(item => Math.round(item.games_won / Math.max(1, item.games_won + item.games_lost) * 100) / 100)
        }}
    );
    series.reverse();

    let playerColorCapitalized = playerColor[0].toUpperCase() + playerColor.slice(1);

    let options: ApexOptions = {
        plotOptions: {
            heatmap: {
                radius: 0,
                colorScale: {
                    ranges: Array(100).fill(0).map((_, id) => {return {
                        from: 0.4 + id / 500,
                        to: 0.4 + (id + 1) / 500,
                        name: `range-${id}`,
                        color: rgb(255 - 2.55 * id, 255 - 2.55 * id, 255).formatHex() 
                    }}).concat([{
                        from: 0,
                        to: 0.4,
                        name: `range-0`,
                        color: rgb(240, 240, 255).formatHex() 
                    },
                    {
                        from: 0.6,
                        to: 1,
                        name: `range-1`,
                        color: rgb(0, 0, 255).formatHex() 
                    }])
                }
            }
        },
        chart: {
            toolbar: {
                show: false
            },
            height: 350,
            type: 'heatmap',
            zoom: {
                enabled: false
            },
        },
        legend: {
            show: false
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            type: "category",
            categories: [0, 1, 2, 3, 4, 5, 6, 7]
                .map(index =>
                    `${String.fromCharCode(65 + index)}`
                ),
            tickAmount: 8,
            axisTicks: {
                show: false
            },
            axisBorder: {
                show: false
            },
        },
        grid: {
            show: false
        },
        colors: ["#008FFF"],
        title: {
            text: `${playerColorCapitalized} ${pieceType} placement at move ${moveNo}`,
            align: 'center'
        },
        
    };
    return (<div style={{"width": "60%"}}>
        {/* @ts-ignore */}
        <ReactApexChart options={options} series={series} type="heatmap" height={600} width={700} />
    </div>)

}

interface PiecesPositionsHeatmapStats {
    eloBucketStats: EloBucketStats | null
}
const PiecesPositionsHeatmap = ({ eloBucketStats }: PiecesPositionsHeatmapStats) => {
    const [pieceType, setPieceType] = useState("pawn");
    const [moveNo, setMoveNo] = useState(0);

   return <div style={{
        "display": "flex",
        "flexDirection": "row",
        "width": "100%",
        "height": "100%"
   }}>
        <Heatmap eloBucketStats={eloBucketStats} pieceType={pieceType} moveNo={moveNo} playerColor={"white"}/>
        <Heatmap eloBucketStats={eloBucketStats} pieceType={pieceType} moveNo={moveNo} playerColor={"black"}/>
   </div>
}

export default PiecesPositionsHeatmap;
