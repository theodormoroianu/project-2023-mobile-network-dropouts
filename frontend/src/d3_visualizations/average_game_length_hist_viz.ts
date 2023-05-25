import * as d3 from 'd3';
import { AverageGameLengthStat, FetchAverageGameLengthStats } from '../api/stats_api';

// // set the dimensions and margins of the graph
// const margin = { top: 80, right: 80, bottom: 90, left: 40 },
//     width = 700 - margin.left - margin.right,
//     height = 470 - margin.top - margin.bottom;

/** Displays a histogram of the numbers of games for each ELO level */
export const AverageGameLengthHistViz = (selector: string, setSlaveData: (data: AverageGameLengthStat) => void) => {
    FetchAverageGameLengthStats().then(data => {
        var svg_dom_obj = document.querySelector(selector);
        const margin = { top: 80, right: 80, bottom: 90, left: 40 },
            width = (svg_dom_obj?.clientWidth??10) - margin.left - margin.right,
            height = 470 - margin.top - margin.bottom;

        // console.log("Detected size of ",  svg_dom_obj?.clientWidth, width)
        var svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

        svg.append("text")
            .attr("transform", "translate(100,0)")
            .attr("x", 50)
            .attr("y", 50)
            .attr("font-size", "24px")
            .text("Average Game Length Stats")

        var xScale = d3.scaleBand().range([0, width]).padding(0.2),
            yScale = d3.scaleLinear().range([height, 0]);

        var g = svg.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");
        
        xScale.domain(data.map((d) => `${d.elo_min}-${d.elo_max}`));
        yScale.domain([0, d3.max(data, (d) => d.average_length)??0]);

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
                return d + " moves";
            }).ticks(10))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "-7.1em")
            .attr("text-anchor", "end")
            .attr("stroke", "black")
            .text("Average Number of moves per game");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", (d) => xScale(`${d.elo_min}-${d.elo_max}`)??0)
            .attr("y", (d) => yScale(d.average_length))
            .attr("width", xScale.bandwidth())
            .attr("height", (d) => height - yScale(d.average_length))
            .attr("fill", "rgb(82, 183, 136)")
            .on("click", (event: any, obj: AverageGameLengthStat) => {
                console.log("Clicked!", obj)
                setSlaveData(obj)
            })
            .on("mouseover", function(this: SVGRectElement, event: any, obj: AverageGameLengthStat) {
                d3.select(this)
                .style("stroke", "black")
                .attr("fill", "rgb(62, 163, 106)")
            })
            .on("mouseleave", function(this: SVGRectElement, event: any, obj: AverageGameLengthStat) {
                d3.select(this)
                .style("stroke", "none")
                .attr("fill", "rgb(82, 183, 136)")
            })
    }).catch(err => console.log(err));
}
