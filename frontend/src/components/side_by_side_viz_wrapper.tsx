import { Card, Elevation, NonIdealState } from '@blueprintjs/core';
import React, { useState } from 'react';
import D3Wrapper from './d3_wrapper';

interface SideBySideVizWrapperProps<T> {
    D3RendererMasterViz: (elementSelector: string, changeDataOfSecondViz: (data: T) => void) => void
    D3RendererSlaveViz: (elementSelector: string, data: T) => void
};

function SideBySideVizWrapper<T>({ D3RendererMasterViz, D3RendererSlaveViz }: SideBySideVizWrapperProps<T>) {
    let [data, setData] = useState<T | null>(null);

    return <div style={{
        "padding": "30px",
        "display": "flex",
        "flexDirection": "row",
        "width": "100%"
    }}>
        <div style={{ "width": "50%" }}>
            <Card interactive={true} elevation={Elevation.TWO} style={{"height": "100%"}}>
                <D3Wrapper D3Renderer={(selector) => D3RendererMasterViz(selector, setData)} />
            </Card>
        </div>
        <div style={{ "width": "5%" }}></div>
        <div style={{ "width": "45%" }}>
            <Card interactive={false} elevation={Elevation.TWO} style={{"height": "100%"}}>
                {data !== null && <D3Wrapper D3Renderer={(selector) => D3RendererSlaveViz(selector, data as T)} redrawOnChange={true} />}
                {data === null && <NonIdealState
                    icon={"search"}
                    title={"Please select an ELO range."}
                    description={"To view a histogram of the number of moves per game in an ELO range, please click on the apropriate entry."}
                />}
            </Card>
        </div>
    </div>
}

export default SideBySideVizWrapper;
