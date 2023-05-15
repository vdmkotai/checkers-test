import React from 'react'
import './App.css'
import Game from './components/Game'
import { GameProvider } from './context/GameContext'

const App = () => (
  <GameProvider>
    <Game />
  </GameProvider>
)

export default App
