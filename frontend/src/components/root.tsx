import { Alignment, Button, Classes, Navbar, NavbarDivider, NavbarGroup, NavbarHeading } from '@blueprintjs/core';
import React, { useState } from 'react';
import SamplePage from './sample_page';
import ApiTest from './api_test';

function Root() {
    // stores the view we want to display
    let [view, setView] = useState("api_test");

    return (
            <div>
                <Navbar>
                    <NavbarGroup align={Alignment.LEFT}>
                        <NavbarHeading>Chess Visualizer</NavbarHeading>
                        <NavbarDivider />
                        <Button className={Classes.MINIMAL} icon="home" text="Home" onClick={() => setView("sample_page")} />
                        <Button className={Classes.MINIMAL} icon="document" text="Files" />
                        <Button className={Classes.MINIMAL} icon="settings" text="Test API" onClick={() => setView("api_test")} />
                    </NavbarGroup>
                </Navbar>
                <div>
                    {/* We display the view we are interested in. */}
                    {view === "sample_page" && <SamplePage />}
                    {view === "api_test" && <ApiTest />}
                </div>
            </div>
    );
}

export default Root;
