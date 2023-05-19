import { NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { EloBucketList, EloBucketStats, FetchEloBucketStats } from '../api/elo_bucket_stats_api';
import { FetchEloBucketList } from '../api/elo_bucket_stats_api';
import { PieCharViewer } from './pie_chart_viewer';
import { ChessBoardFenExplorer } from './chessboard';

interface EloBucketViewerProps {
    eloBucket: number
}

interface OpeningsChartStats {
    eloBucketStats: EloBucketStats | null
}
const OpeningsChart = ({ eloBucketStats }: OpeningsChartStats) => {
    let stats_data = eloBucketStats?.most_used_openings_and_frq
    let data: {name: string, value: number}[] = []
    stats_data?.forEach((value, key) => {
      data.push({name: key, value: value})
    })

    // let [index, setIndex] = useState(0);
    let pie_chart_data = data.map(d => ({ name: d.name, value: d.value }));
    return <div style={{
        "display": "flex",
        "height": "100%",
        "width": "100%",
        "flexDirection": "row",
        "justifyContent": "space-between"
    }}>
        {/* <div style={{
            "width": "60%",
            "height": "100%",
        }}> */}
            <PieCharViewer data={pie_chart_data} />
        {/* </div>
        <div>
            <ChessBoardFenExplorer fensToDisplay={Promise.resolve([[], 0])} />
        </div> */}
    </div>;
}

/** Shows statistics about a SINGLE elo range */
const EloBucketViewer = ({ eloBucket } : EloBucketViewerProps) => {
    let [eloBucketStats, setEloBucketStats] = useState<EloBucketStats | null>(null);
    let [activeTab, setActiveTab] = useState("openings-chart");

    useEffect(() => {
      FetchEloBucketStats(eloBucket).then(setEloBucketStats)
    }, [eloBucket]);

    return <div style={{
            "display": "flex",
            "flexDirection": "column",
            "height": "100%",
            "position": "relative",
            "top": "-20px"
        }}>
        <Tabs onChange={(newTab) => setActiveTab(newTab.toString())} selectedTabId={activeTab}>
            <Tab id={"openings-chart"} title={"Openings Frequency"} />
            <Tab id={"players-victory-heatmap"} title={"Players Victory Rate"} />
        </Tabs>
        <div style={{"paddingTop": "30px", "width": "100%", "height": "100%"}}>
            {activeTab === "openings-chart" && <OpeningsChart eloBucketStats={eloBucketStats} />}
            {activeTab === "players-victory-heatmap" && <p>Hello</p>}
        </div>
    </div>
}

/** This function shows a selector at the left of the screen, where users can
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