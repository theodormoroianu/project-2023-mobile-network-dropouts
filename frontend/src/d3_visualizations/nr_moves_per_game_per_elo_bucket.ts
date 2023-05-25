import * as d3 from 'd3';
import { AverageGameLengthStat } from '../api/stats_api';

/** Displays a histogram of the length of the game for a given ELO bucket */
export const NrMovesPerGamePerEloBucket = (selector: string, data: AverageGameLengthStat) => {
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
        .text("Number of moves histogram")
    svg.append("text")
        .attr("transform", "translate(100,0)")
        .attr("x", 110)
        .attr("y", 75)
        .attr("font-size", "20px")
        .text(`Elo range: ${data.elo_min} - ${data.elo_max}`)

    var xScale = d3.scaleLinear().range([0, width]),
        yScale = d3.scaleLinear().range([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + 100 + "," + 100 + ")");
    
    xScale.domain([0, data.frq_games_by_nr_moves.length - 1]);
    yScale.domain([0, d3.max(data.frq_games_by_nr_moves)??0]);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(function (d) {
            return d + " moves";
        }).ticks(10))
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("transform", "rotate(-30) translate(-10,5)");

    g.append("text")
        .attr("y", height + 50)
        .attr("x", width - 100)
        .attr("text-anchor", "end")
        .attr("stroke", "black")
        .text("Length of game by number of moves");

    g.append("g")
        .call(d3.axisLeft(yScale).tickFormat(function (d) {
            return d + " games";
        }).ticks(10))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "-7.1em")
        .attr("text-anchor", "end")
        .attr("stroke", "black")
        .text("Average Number of moves per game");

    g.selectAll(".bar")
        .data(Array.from({length: data.frq_games_by_nr_moves.length}).map((_, i) => i))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (idx) => xScale(idx)??0)
        .attr("y", (idx) => yScale(data.frq_games_by_nr_moves[idx]))
        .attr("width", xScale(1) - xScale(0))
        .attr("height", (idx) => height - yScale(data.frq_games_by_nr_moves[idx]))
        .attr("fill", "rgb(161, 181, 216)")
}
