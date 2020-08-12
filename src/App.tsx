import React from 'react'
import './App.scss'
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import BuildingSearch from './BuildingSearch'
import { BuildList } from './BuildList'

const App = () => {
  return (
    <div className="App App-body">
      <Router>
        <Switch>
          <Route exact path='/'>
            <BuildingSearch />
          </Route>
          <Route path='/build/:query'>
            <BuildList />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App;
