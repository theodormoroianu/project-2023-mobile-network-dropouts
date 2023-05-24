import React, { useState, memo } from "react";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import Tooltip from "react-tooltip";
import { csv } from "d3-fetch";
import { DSVRowArray } from "d3";

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

const Intro = () => {
  return <>
  <h1>Chess Visualizer</h1>
  <p>This will soon be made in markdown...</p>
  </>
}

export const Home = () => {
  return <div>
    <Intro />
    <Map />
    {/* <p>Text after</p> */}
  </div>
}