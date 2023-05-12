import { NonIdealState, Spinner, Tab, Tabs } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { EloBucketList, EloBucketStats, FetchEloBucketStats } from '../api/elo_bucket_stats_api';
import { FetchEloBucketList } from '../api/elo_bucket_stats_api';

interface EloBucketViewerProps {
    eloBucket: number
}
/** Shows statistics about a SINGLE elo range */
const EloBucketViewer = ({ eloBucket } : EloBucketViewerProps) => {
    // fetch the elo bucket
    let [data, setData] = useState<EloBucketStats | null>(null);

    useEffect(() => {
        FetchEloBucketStats(eloBucket).then(setData)
    }, [eloBucket]);

    if (data === null || data === undefined)
        return <Spinner />

    return <p>This renders {eloBucket} {data.elo_max}</p>
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
                    // panel={<EloBucketViewer eloBucket={eloBucket.elo_bucket} />}
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