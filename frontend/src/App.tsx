import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  let [val, setVal] = useState("");
  fetch("/api/test").then(response =>
    response.text().then(x => {
      setVal(x);
      console.log("Received answer!")
    }));
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
          <br/>
          {val}
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
