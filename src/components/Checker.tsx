import React from 'react'
import { useGameState } from '../context/GameContext'
import { CheckerWrapper } from '../styles/Checker.styles'

interface CheckerProps {
  id: string
  player: string
  row: number
  col: number
}

const Checker: React.FC<CheckerProps> = ({ id, player, row, col }) => {
  const { getPossibleMoves } = useGameState()

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ row, col }))
    if (getPossibleMoves) {
      getPossibleMoves(row, col)
    }
  }

  const color = player.startsWith('red') ? 'red' : 'black'
  const king = player.endsWith('King')

  return (
    <CheckerWrapper
      id={id}
      color={color}
      king={king}
      draggable
      onDragStart={handleDragStart}
    >
      {king && 'K'}
    </CheckerWrapper>
  )
}

export default Checker
