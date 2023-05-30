import {
  Alignment,
  Button,
  Classes,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import { useState } from "react";
import { EloBucketsViewer } from "./elo_buckets_viewer_tab";
import { Home } from "./home";
import { ELO } from "./ELO_tab";
import { AverageLength } from "./average_length_tab";

function Root() {
  // stores the view we want to display
  let [view, setView] = useState("home");

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Navbar fixedToTop>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>Chess Visualizer</NavbarHeading>
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon="home"
            text="home"
            onClick={() => setView("home")}
            active={view === "home"}
          />
          <Button
            className={Classes.MINIMAL}
            icon="model"
            text="ELO"
            onClick={() => setView("elo_games_distribution")}
            active={view === "elo_games_distribution"}
          />
          <Button
            className={Classes.MINIMAL}
            icon="comparison"
            text="Average Length"
            onClick={() => setView("average_game_length_his_viz")}
            active={view === "average_game_length_his_viz"}
          />
          <Button
            className={Classes.MINIMAL}
            icon="filter"
            text="ELO Specifics"
            onClick={() => setView("elo-specifics")}
            active={view === "elo-specifics"}
          />
        </NavbarGroup>
      </Navbar>
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "30px",
          paddingTop: "80px",
        }}
      >
        {/* We display the view we are interested in. */}
        {view === "home" && <Home />}
        {view === "elo_games_distribution" && <ELO />}
        {view === "average_game_length_his_viz" && <AverageLength />}
        {view === "elo-specifics" && <EloBucketsViewer />}
      </div>
    </div>
  );
}

export default Root;
