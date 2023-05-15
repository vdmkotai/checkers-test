import React from 'react'
import { useGameState } from '../context/GameContext'
import Board from './Board'
import { PlayerSide } from '../context/gameReducer'

const Game: React.FC = () => {
  const { reset } = useGameState()

  return (
    <>
      <Board />
      <button onClick={() => reset(PlayerSide.Red)}>Reset</button>
    </>
  )
}

export default Game
