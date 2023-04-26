import { Alignment, Button, Classes, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import React, { useState } from 'react';
import SamplePage from './sample_page';
import ApiTest from './api_test';
import D3Wrapper from './d3_wrapper';
import { SampleViz } from '../d3_visualizations/sample_viz';
import { EloGamesDistributionViz } from '../d3_visualizations/elo_games_distribution_viz';
import ChessBoard from './chessboard';

function Root() {
    // stores the view we want to display
    let [view, setView] = useState("sample_page");

    return (
            <div>
                <Navbar>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading>Chess Visualizer</NavbarHeading>
                        <NavbarDivider />
                        <Button className={Classes.MINIMAL} icon="home" text="Home" onClick={() => setView("sample_page")} />
                        <Button className={Classes.MINIMAL} icon="document" text="D3 Sample" onClick={() => setView("d3_sample")} />
                        <Button className={Classes.MINIMAL} icon="settings" text="Test API" onClick={() => setView("api_test")} />
                        <Button className={Classes.MINIMAL} icon="settings" text="Basic ELO Games" onClick={() => setView("elo_games_distribution")} />
                        <Button className={Classes.MINIMAL} icon="settings" text="Chess Board" onClick={() => setView("chessboard")} />
                    </NavbarGroup>
                </Navbar>
                <div>
                    {/* We display the view we are interested in. */}
                    {view === "sample_page" && <SamplePage />}
                    {view === "api_test" && <ApiTest />}
                    {view === "d3_sample" && <D3Wrapper D3Renderer={SampleViz} />}
                    {view === "elo_games_distribution" && <D3Wrapper D3Renderer={EloGamesDistributionViz} />}
                    {view === "chessboard" && <ChessBoard />}
                </div>
            </div>
    );
}

export default Root;
