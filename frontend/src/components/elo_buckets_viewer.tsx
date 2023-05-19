import { NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { EloBucketList, EloBucketStats, FetchEloBucketStats } from '../api/elo_bucket_stats_api';
import { FetchEloBucketList } from '../api/elo_bucket_stats_api';
import { PieCharViewer } from './pie_chart_viewer';

interface EloBucketViewerProps {
    eloBucket: number
}

// const 

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

    // let [index, setIndex] = useState(0);
    let pie_chart_data = data.map(d => ({ name: d.name, value: d.value }));

    return <PieCharViewer data={pie_chart_data} />
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