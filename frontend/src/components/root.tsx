import { Alignment, Button, Classes, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import React, { useState } from 'react';
import SamplePage from './sample_page';
import ApiTest from './api_test';
import D3Sample from './d3_sample';
import D3Wrapper from './d3_wrapper';
import { ShowSampleViz } from '../d3_visualizations/sample_viz';

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
                    </NavbarGroup>
                </Navbar>
                <div>
                    {/* We display the view we are interested in. */}
                    {view === "sample_page" && <SamplePage />}
                    {view === "api_test" && <ApiTest />}
                    {view === "d3_sample" && <D3Wrapper D3Renderer={ShowSampleViz} />}
                </div>
            </div>
    );
}

export default Root;
