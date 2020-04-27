import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Components/Home";
import Download from "./Components/Download";

const App = () => {
  return (
      <>
       <Router>
        <Switch>
            <Route path="/download/:url"><Download /></Route>
            <Route path="/"><Home /></Route>
        </Switch>
        </Router>
      </>
  );
}

export default App;
