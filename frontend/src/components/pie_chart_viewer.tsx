import { useState } from 'react';
import { PieChart, Pie, Sector, ResponsiveContainer, Cell } from 'recharts';

/** Function required to make pie charts work. */
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
  
interface PieChartViewerProps {
  data: { name: string, value: number, sample_game: string[] }[]
  setFensToDisplay: (fens: Promise<[string[], number]>) => void
}

/** Renders a Pie Chart */
export const PieCharViewer = ({ data, setFensToDisplay } : PieChartViewerProps) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#e3b505", "#d08e07", "#bc6709", "#95190c", "#7b0e29", "#610345", "#394161", "#107e7d", "#0a657e"];

  let [index, setIndex] = useState(0);

  return <ResponsiveContainer width="100%" height="100%">
  <PieChart width={400} height={400} style={{"background": "white"}}>
    <Pie
      activeIndex={index}
      activeShape={renderActiveShape}
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={150}
      outerRadius={200}
      fill="#8884d8"
      dataKey="value"
      onMouseEnter={(_, index) => setIndex(index)}
      onClick={(a, index) => {
        setFensToDisplay(Promise.resolve([a.sample_game, 0]))
      }}
      onMouseOver={(_, index) => setIndex(index)}
    > 
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{"cursor": "pointer"}} />
      ))}
      </Pie>
  </PieChart>
</ResponsiveContainer>
}
