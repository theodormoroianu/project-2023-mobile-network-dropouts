import React, { useState, memo } from "react";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import Tooltip from "react-tooltip";
import { csv } from "d3-fetch";
import { DSVRowArray } from "d3";
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'

export const Map = memo(() => {
  const geoUrl = "/map/map.json";
  const countryCodeToRatingURL = "/map/country_code_to_rating.csv";

  const colorScale = scaleQuantile<string>()
    .domain([1000, 2500])
    .range(["#ffedea", "#ffcec5", "#ffad9f", "#ff8a75",
      "#ff5533", "#e2492d", "#be3d26", "#9a311f", "#782618"]);
  const DEFAULT_COLOR = "#EEE";

  const [tooltipContent, setTooltipContent] = useState<JSX.Element | undefined>(undefined);
  const [countryCodeToRating, setCountryCodeToRating] = useState<DSVRowArray<string>>();

  csv(countryCodeToRatingURL).then(setCountryCodeToRating);

  return (
    <div>
      <ComposableMap
      cursor={"pointer"}
        height={250}
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 80
        }}
        data-tip=""
      >
        <Sphere stroke="#E4E5E6" strokeWidth={0.5} id="idk" fill="#FFFFFF" />
        <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo, idx) => {
              const country = geo.properties.name;
              const rating = countryCodeToRating?.find(
                (s) => s.code === geo["id"]
              )?.best_rating;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={rating ? colorScale(+rating) : DEFAULT_COLOR}
                  onMouseEnter={() => {
                    setTooltipContent(<div>{country}<br/>{rating??"Unknown"}</div>);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent(undefined);
                  }}
                  style={{
                    default: {
                      outline: "none"
                    },
                    hover: {
                      fill: "#ff6200",
                      transition: "all 250ms",
                      outline: "none"
                    },
                    pressed: {
                      outline: "none"
                    }
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      {/* @ts-ignore */}
      <Tooltip>{tooltipContent}</Tooltip>
    </div>
  );
});

const Title = () => {
  return <>
  <div style={{
    paddingTop: "20px",
    paddingBottom: "20px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  }}>
    <h1 style={{
      fontSize: "50px",
      color: "#333333",
      fontFamily: "georgia",
      alignSelf: "center",
    }}>Chess Visualizer</h1>
    <p style={{
      width: "600px",
      marginTop: "-10px",
      fontSize: "20px",
      color: "#555555",
      alignSelf: "center",
      fontFamily: "Trebuchet MS",
    }}>Visualize and understand statistics based on chess games played on <a href="https://lichess.org/">lichess</a>, using interactive  plots and charts.</p>
  </div>
  </>
}

const Content = () => {
  const s = [
    "## Introduction",
    "_*Chess Visualizer*_ is a tool for visualizing data about chess games. This data includes:",
    " * The average ELO of online players.\n * The average length of games (by number of moves).\n" +
    " * Various statistics generated independently for multiple _ELO ranges_ (i.e. various skill level).",
    "## Who is part of the target audience?",
    "**Short answer:** Anybody.",
    "**Long answer:** Someone looking to improve their chess level, by analysing how players of various skills tackle games, including data such as the most frequent openings played for each skill level, sample games visualized on an interactive board, or how games played between players of slightly different skill usually end.",
    "## Origin of the data",
    "All of the analized data comes from [lichess](https://lichess.org), a free-to-play, open-source and multiplayer chess website, where users of any skill from all around the world play together.",
    "In April 2023 alone, `101,706,224` games were played on _lichess_ (or roughly `40` new games per second), all of which are publicly available to download on their [database page](https://database.lichess.org/)."
  ];

  return <div className="react-markdown">
      {s.map(el => 
        <ReactMarkdown  remarkPlugins={[remarkGfm]} children={el} />
      )}
  </div>
}

export const Home = () => {
  return <div>
    <Title />
    <Map />
    <div style={{
      paddingLeft: "20%",
      paddingRight: "20%",
      marginBottom: "300px"
    }}>
      <Content />
    </div>
  </div>
}