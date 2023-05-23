import { NonIdealState, Tab, Tabs } from '@blueprintjs/core';
import { useEffect, useState } from 'react';
import { EloBucketList, EloBucketStats, FetchEloBucketStats } from '../api/elo_bucket_stats_api';
import { FetchEloBucketList } from '../api/elo_bucket_stats_api';
import { PieCharViewer } from './pie_chart_viewer';
import ReactApexChart from 'react-apexcharts';
import React from 'react';
import { ApexOptions } from 'apexcharts';
import { rgb } from 'd3';
import { ChessBoardFenExplorer } from './chessboard';


interface PlayersVictoryHeatmapStats {
    eloBucketStats: EloBucketStats | null
}
const PlayersVictoryHeatmap = ({ eloBucketStats }: PlayersVictoryHeatmapStats) => {
    // fens to display in the attached chessboard view
    const [fensToDisplay, setFensToDisplay] = useState<Promise<[string[], number]>>(new Promise(() => [[], 0]));

    if (eloBucketStats === null || eloBucketStats === undefined)
        return <div><p>Loading...</p></div>;
    
    let series = eloBucketStats.games_won_heatmap.map((row, index) =>
        {return {
            name: `ELO between ${eloBucketStats.elo_min + index * 10} and ${eloBucketStats.elo_min + index * 10 + 9}`,
            data: row.map(item => Math.round(item.games_won / Math.max(1, item.games_won + item.games_lost) * 100) / 100)
        }}
    );
    series.reverse();

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
            events: {
                click(e, chart, options) {
                    const row = options.seriesIndex, column = options.dataPointIndex;
                    console.log(options);
                    console.log(row, column);
                    if (row !== -1) {
                        setFensToDisplay(Promise.resolve([
                            eloBucketStats.games_won_heatmap[9 - row][column].sample_game,
                            0
                        ]));
                    }
                },
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
            categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
                .map(index =>
                    `ELO between ${eloBucketStats.elo_min + index * 10} and ${eloBucketStats.elo_min + index * 10 + 9}`
                ),
            tickAmount: eloBucketStats.games_won_heatmap.length,
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
            text: 'Player Victory By ELO Intervals',
            align: 'right'
        },
        
    };

    return (<div style={{
        // "padding": "30px",
        // "padding-top"
        "display": "flex",
        "flexDirection": "row",
        "width": "100%",
        "height": "100%"
        }}>
        <div style={{"width": "60%"}}>
        {/* @ts-ignore */}
        <ReactApexChart options={options} series={series} type="heatmap" height={600} width={700} />
        </div>
        {/* <div style={{"width": "5%"}}></div> */}
        <div style={{"width": "35%", paddingTop: "-50px"}}>
            <ChessBoardFenExplorer fensToDisplay={fensToDisplay} showNonIdealStateIfEmpty={true} />
        </div>
    </div>)
}

interface EloBucketViewerProps {
    eloBucket: number
}

interface OpeningsChartStats {
    eloBucketStats: EloBucketStats | null
}
const OpeningsChart = ({ eloBucketStats }: OpeningsChartStats) => {
    const [fensToDisplay, setFensToDisplay] = useState<Promise<[string[], number]>>(new Promise(() => [[], 0]));
    let stats_data = eloBucketStats?.most_used_openings_and_frq
    let data: {name: string, value: number, sample_game: string[]}[] = []
    stats_data?.forEach((value, key) => {
      data.push({name: key, value: value.nr_games, sample_game: value.sample_game})
    })

    // let [index, setIndex] = useState(0);
    // let pie_chart_data = data.map(d => ({ name: d.name, value: d.value }));
    return <div style={{
        "display": "flex",
        "height": "100%",
        "width": "100%",
        "flexDirection": "row",
        "justifyContent": "space-between"
    }}>
        <div style={{
            "width": "60%",
            "height": "100%",
        }}>
            <PieCharViewer data={data} setFensToDisplay={setFensToDisplay} />
        </div>
        <div style={{
            "width": "35%",
            "height": "100%",
        }}>
            <ChessBoardFenExplorer fensToDisplay={fensToDisplay} showNonIdealStateIfEmpty={true} />
        </div>
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
            {activeTab === "players-victory-heatmap" && <PlayersVictoryHeatmap eloBucketStats={eloBucketStats} />}
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
