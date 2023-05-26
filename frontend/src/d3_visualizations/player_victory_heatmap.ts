import * as d3 from 'd3';
import { FetchDummyFens } from '../api/fens_api';
import { EloBucketStats, GamesWonHeatmapType } from '../api/elo_bucket_stats_api';

// set the dimensions and margins of the graph
const margin = { top: 80, right: 25, bottom: 30, left: 40 },
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// equivalent of SUBBUCKETS in the backend. The nr of lines / columns of the viz
const NR_GROUPS = 10;
const GROUP_SIZE = 100;

export const PlayerVictoryHeatmapViz = (selector: string, setFens: (fens: Promise <[string[], number]>) => void, data: EloBucketStats) => {
    // append the svg object to the body of the page
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
    const myGroups = Array(10).fill(0).map((_, id) => "" + id)
        // `${data.elo_min + id * GROUP_SIZE / NR_GROUPS}-${data.elo_min + (id + 1) * GROUP_SIZE / NR_GROUPS - 1}`)
    const myVars = myGroups

    // Build X scales and axis:
    const x = d3.scaleBand()
        .range([0, width])
        .domain(myGroups)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    // Build Y scales and axis:
    const y = d3.scaleBand()
        .range([height, 0])
        .domain(myVars)
        .padding(0.05);
    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain").remove()

    // Build color scale
    const myColor = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([1, 100])

    // create a tooltip
    const tooltip = d3.select(selector)
        .append("div")
        .style("opacity", 1)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
    
    tooltip
        .html("Hover a cell to see more details.")

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (this: any, _event: any, _d: any) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    const mousemove = function (event: any, d: any) {
        tooltip
            .html("The exact value of<br>this cell is: " + d.games_won)
            .style("left", (event.x) / 2 + "px")
            .style("top", (event.y) / 2 + "px")
    }
    const mouseclick = function (event: any, d: any) {
        console.log("Click detected on ", d);
        setFens(Promise.resolve([d.sample_game, 0]))
    }
    const mouseleave = function (this: any, event: any, d: any) {
        // tooltip
        //     .style("opacity", 0)
        // d3.select(this)
        //     .style("stroke", "none")
        //     .style("opacity", 0.8)
    }

    let items: { row: string, column: string, games_won: number, sample_game: string[] }[] = []
    for (let i = 0; i < NR_GROUPS; i++)
        for (let j = 0; j < NR_GROUPS; j++)
            items.push({
                row: "" + i,
                column: "" + j,
                ...data.games_won_heatmap[i][j]
            })

    // add the squares
    svg.selectAll()
        .data(items, function (d) { return d?.row + ':' + d?.column; })
        .join("rect")
        .attr("x", function (d: any) { return x(d.row) } as any)
        .attr("y", function (d: any) { return y(d.column) } as any)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", function (d) { return myColor(d.games_won) })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("click", mouseclick)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
  
    // Add title to graph
    // svg.append("text")
    //     .attr("x", 0)
    //     .attr("y", -50)
    //     .attr("text-anchor", "left")
    //     .style("font-size", "22px")
    //     .text("A d3.js heatmap");

    // Add subtitle to graph
    svg.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("text-anchor", "left")
        .style("font-size", "14px")
        .style("fill", "grey")
        .style("max-width", 400)
        .text("Probability of victory for games between players of different ELO.");
}