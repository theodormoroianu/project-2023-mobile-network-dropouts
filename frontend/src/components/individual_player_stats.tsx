// TODO: implement this
import { Card, Elevation, RadioGroup, Radio, Slider } from '@blueprintjs/core';
import { Dispatch, SetStateAction, useState } from 'react';
import { EloBucketStats } from '../api/elo_bucket_stats_api';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { rgb } from 'd3';
import { CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';

const RatingScatter = () => {
		const data01 = [
      { x: 10, y: 30 },
      { x: 30, y: 200 },
      { x: 45, y: 100 },
      { x: 50, y: 400 },
      { x: 70, y: 150 },
      { x: 100, y: 250 },
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
          <XAxis type="number" dataKey="x" name="stature" unit="cm" />
          <YAxis type="number" dataKey="y" name="weight" unit="kg" />
          <ZAxis type="number" range={[100]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />
          <Scatter name="A school" data={data01} fill="#8884d8" line shape="cross" />
        </ScatterChart>
      </ResponsiveContainer>
    )
}

interface IndividualPlayerStatsProps {
    eloBucketStats: EloBucketStats | null,
}
const IndividualPlayerStats = ({ eloBucketStats }: IndividualPlayerStatsProps) => {
    if (eloBucketStats === null || eloBucketStats === undefined)
        return <div><p>Loading...</p></div>;
   
    return(
    <>
      TODO
      <RatingScatter/>
    </>)
}

export default IndividualPlayerStats;
