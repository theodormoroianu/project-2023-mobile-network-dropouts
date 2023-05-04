import { Alignment, Button, Classes, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import { useState } from 'react';
import { HeatMapViz } from '../d3_visualizations/heatmap_viz';
import { EloGamesDistributionViz } from '../d3_visualizations/elo_games_distribution_viz';
import { D3VizAndChessboardSplitScreen } from './viz_and_chess_wrapper';

function Root() {
    // stores the view we want to display
    let [view, setView] = useState("sample_page");

    return (
            <div style={{"width": "100%"}}>
                <Navbar>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading>Chess Visualizer</NavbarHeading>
                        <NavbarDivider />
                        <Button className={Classes.MINIMAL} icon="home" text="ELO" onClick={() => setView("elo_games_distribution")} />
                        <Button className={Classes.MINIMAL} icon="document" text="Heat Map" onClick={() => setView("d3_chess")} />
                    </NavbarGroup>
                </Navbar>
                <div style={{"width": "100%", "padding": "30px"}}>
                    {/* We display the view we are interested in. */}
                    {view === "elo_games_distribution" && <D3VizAndChessboardSplitScreen d3Viz={EloGamesDistributionViz}/> }
                    {view === "d3_chess" && <D3VizAndChessboardSplitScreen d3Viz={HeatMapViz}/> }
                </div>
            </div>
    );
}

export default Root;
