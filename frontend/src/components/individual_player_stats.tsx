// TODO: implement this
import { Card, Elevation, RadioGroup, Radio, Slider } from '@blueprintjs/core';
import { Dispatch, SetStateAction, useState } from 'react';
import { EloBucketStats } from '../api/elo_bucket_stats_api';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { rgb } from 'd3';
import { CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';

const RatingScatter = () => {
		const data01 = [
      { x: "22-10-2020", y: 30 },
      { x: "23-10-2020", y: 200 },
      { x: "24-10-2020", y: 100 },
      { x: "25-10-2020", y: 400 },
      { x: "26-10-2020", y: 150 },
      { x: "27-10-2020", y: 250 },
    ];

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
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="Rating Change" data={data01} fill="#8884d8" line shape="cross" />
        </ScatterChart>
      </ResponsiveContainer>
    )
}

interface WinRateProps {
  noWins: number,
  noLoses: number, 
  noDraws: number,
  color: string
}
const WinRate = ({ noWins, noLoses, noDraws, color }: WinRateProps) => {
  const series = [noWins, noLoses, noDraws];
  const options = {
			chart: {
				width: 380,
				type: 'pie',
			},
			labels: ['Win', 'Loss', 'Draw'],
      colors: ['#6eae81', '#da2c38', '#9c8d6d'],
			responsive: [{
				breakpoint: 480,
				options: {
					chart: {
						width: 200
					},
					legend: {
						position: 'bottom'
					}
				}
			}]
		};

		return <div style={{
    }}>
      {color === "all" && <h4>All games</h4>}
      {color !== "all" && <h4>Games with {color}</h4>}
      {/* @ts-ignore */}
			<ReactApexChart options={options} series={series} type="pie" width={380} />
		</div>
}

const PlayerStats = ({ eloBucketStats }: IndividualPlayerStatsProps) => {
  const noWins = 50;
  const noLoses = 50;
  const noDraws = 50;
          
    return <div style={{
        "display": "flex",
        "height": "100%",
        "width": "100%",
        "flexDirection": "row",
        "justifyContent": "space-evenly",
        "paddingLeft": "150px"
    }}>
       <WinRate noWins={noWins} noLoses={noLoses} noDraws={noDraws} color="all"/>
       <WinRate noWins={noWins} noLoses={noLoses} noDraws={noDraws} color="White"/>
       <WinRate noWins={noWins} noLoses={noLoses} noDraws={noDraws} color="Black"/>
    </div>
}

interface IndividualPlayerStatsProps {
    eloBucketStats: EloBucketStats | null,
}
const IndividualPlayerStats = ({ eloBucketStats }: IndividualPlayerStatsProps) => {
    if (eloBucketStats === null || eloBucketStats === undefined)
        return <div><p>Loading...</p></div>;
   
    return <div>
        <div style={{
            "width": "90%",
            "height": "100%",
            "paddingTop": "0",
        }}>
            <h2>Player name: Magnus</h2>
            <h2>Average oponent rating: 1250</h2>
        </div>
        <div style={{
            "width": "90%",
            "height": "100%",
        }}>
            <PlayerStats eloBucketStats={eloBucketStats}/>
        </div>
        <div style={{
            "width": "90%",
            "height": "100%",
        }}>
            <RatingScatter/>
        </div>
    </div>;
}

export default IndividualPlayerStats;
