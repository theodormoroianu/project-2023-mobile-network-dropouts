import React, { useState } from 'react';

function ApiTest() {
    let [val, setVal] = useState("");
    fetch("/api/test").then(response =>
    response.text().then(x => {
        setVal(x);
        console.log("Received answer!")
    }));

    

    return (
            <div>
                <p>Api response:</p>
                <p>{val}</p>
            </div>
    );
}

export default ApiTest;
