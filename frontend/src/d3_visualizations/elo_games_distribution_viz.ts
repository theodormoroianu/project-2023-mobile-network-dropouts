import * as d3 from 'd3';
import { BasicEloGameStat, FetchBasicEloGameStats } from '../api/stats_api';

// // set the dimensions and margins of the graph
// const margin = { top: 80, right: 80, bottom: 90, left: 40 },
//     width = 700 - margin.left - margin.right,
//     height = 470 - margin.top - margin.bottom;

/** Displays a histogram of the numbers of games for each ELO level */
export const EloGamesDistributionViz = (selector: string, setFens: (fens: Promise <[string[], number]>) => void) => {
    FetchBasicEloGameStats().then(data => {
        var svg_dom_obj = document.querySelector(selector);
        console.log(svg_dom_obj)
        const margin = { top: 80, right: 80, bottom: 90, left: 40 },
            width = (svg_dom_obj?.clientWidth??10) - margin.left - margin.right,
            height = 470 - margin.top - margin.bottom;

        console.log("Detected size of ",  svg_dom_obj?.clientWidth, width)
        var svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        svg.append("text")
            .attr("transform", "translate(100,0)")
            .attr("x", 50)
            .attr("y", 50)
            .attr("font-size", "24px")
            .text("Basic ELO Stats")

        var xScale = d3.scaleBand().range([0, width]).padding(0.2),
            yScale = d3.scaleLinear().range([height, 0]);

        var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");
        
        xScale.domain(data.map((d) => `${d.elo_min}-${d.elo_max}`));
        yScale.domain([0, d3.max(data, (d) => d.nr_games)??0]);

        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("font-size", "8px")
            .attr("transform", "rotate(-30) translate(-10,5)");

        g.append("text")
            .attr("y", height + 50)
            .attr("x", width - 100)
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Player ELOs");

        g.append("g")
            .call(d3.axisLeft(yScale).tickFormat(function (d) {
                return d + "%";
            }).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-5.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Percentage of Games");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(`${d.elo_min}-${d.elo_max}`)??0)
            .attr("y", (d) => yScale(d.nr_games))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d.nr_games))
            .attr("fill", "rgb(30,129,176)")
            .on("click", (event: any, obj: BasicEloGameStat) => {
                console.log("Clicked!", obj)
                setFens(Promise.resolve([obj.sample_game, 0]))
            })
            .on("mouseover", function(this: SVGRectElement, event: any, obj: BasicEloGameStat) {
                d3.select(this)
                .style("stroke", "black")
                .attr("fill", "rgb(20,82,146)")
            })
            .on("mouseleave", function(this: SVGRectElement, event: any, obj: BasicEloGameStat) {
                d3.select(this)
                .style("stroke", "none")
                .attr("fill", "rgb(30,129,176)")
            })
    }).catch(err => console.log(err));
}
