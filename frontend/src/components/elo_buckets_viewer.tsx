import { NonIdealState, Spinner, Tab, Tabs } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { EloBucketList, EloBucketStats, FetchEloBucketStats } from '../api/elo_bucket_stats_api';
import { FetchEloBucketList } from '../api/elo_bucket_stats_api';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    const FixLength = (str: string): string[] => {
      let arr = str.split(":");
      if (arr.length > 1)
        arr[0] = arr[0] + ":";
      
      if (arr.length > 1 && arr[1].length > 40)
        arr[1] = arr[1].substring(0, 40);

      return arr;
    }

    return (
      <g>
        {FixLength(payload.name).map((str, idx) => 
          <text key={idx} x={cx} y={cy + idx * 16} dy={0} textAnchor="middle" fill={fill}>
          {FixLength(str)}
        </text>  
        )}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 8}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius}
          outerRadius={outerRadius}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
          {`${(percent * 100).toFixed(2)}% Of Games`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`(Played ${value} times)`}
        </text>
      </g>
    );
  };
  
interface EloBucketViewerProps {
    eloBucket: number
}
/** Shows statistics about a SINGLE elo range */
const EloBucketViewer = ({ eloBucket } : EloBucketViewerProps) => {
    let [eloBucketStats, setEloBucketStats] = useState<EloBucketStats | null>(null);

    useEffect(() => {
      FetchEloBucketStats(eloBucket).then(setEloBucketStats)
    }, [eloBucket]);

    
    let stats_data = eloBucketStats?.most_used_openings_and_frq
    let data: {name: string, value: number}[] = []
    stats_data?.forEach((value, key) => {
      data.push({name: key, value: value})
    })

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#e3b505", "#d08e07", "#bc6709", "#95190c", "#7b0e29", "#610345", "#394161", "#107e7d", "#0a657e"];

    let [index, setIndex] = useState(0);
    let real_data = data.map(d => ({ name: d.name, value: d.value }));

    return <ResponsiveContainer width="100%" height="100%">
    <PieChart width={400} height={400} style={{"background": "white"}}>
      <Pie
        activeIndex={index}
        activeShape={renderActiveShape}
        data={real_data}
        cx="50%"
        cy="50%"
        innerRadius={150}
        outerRadius={200}
        fill="#8884d8"
        dataKey="value"
        onMouseEnter={(_, index) => setIndex(index)}
        onMouseOver={(_, index) => setIndex(index)}
      > 
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{"cursor": "pointer"}} />
        ))}
        </Pie>
    </PieChart>
  </ResponsiveContainer>
}

/** This function shows a selector at top, where users can
 * click on an ELO range, to see specific data about it. */
export const EloBucketsViewer = () => {
    let [eloBuckets, setEloBuckets] = useState<EloBucketList | null>(null);
    let [eloBucket, setEloBucket] = useState<string>("");

    useEffect(() => {
        FetchEloBucketList().then(setEloBuckets)
    }, []);

    if (eloBuckets === null)
        return <p>Not loaded!</p>;

    return <div style={{"display": "flex", "flexDirection": "row"}}>
        <Tabs vertical={true} onChange={(newTab) => setEloBucket(newTab.toString())} selectedTabId={eloBucket}>
            {eloBuckets.map(eloBucket => 
                <Tab key={eloBucket.elo_bucket}
                    id={eloBucket.elo_bucket}
                    title={eloBucket.elo_min + " - " + eloBucket.elo_max} 
                />
            )}
        </Tabs>
        <div style={{"paddingLeft": "30px", "width": "100%"}}>
            {eloBucket === "" && <NonIdealState
                    icon={"search"}
                    title={"Please select an ELO range."}
                    description={"To view additional statistics about a specific ELO range, please click on the apropriate entry."}
                />}
            {eloBucket !== "" && <EloBucketViewer eloBucket={Number(eloBucket)} />}
        </div>
    </div>
}