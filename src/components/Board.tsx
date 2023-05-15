import React from 'react'
import Checker from './Checker'
import { BoardWrapper, Cell } from '../styles/Board.styles'
import { useGameState } from '../context/GameContext'
import { getHighlightStatus } from '../context/gameLogic'

const Board: React.FC = () => {
  const { state, dispatch } = useGameState()
  const { board } = state

  console.log('Board: ', board)

  const handleDrop =
    (row: number, col: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()

      const { row: fromRow, col: fromCol } = JSON.parse(
        event.dataTransfer.getData('text/plain')
      )

      console.log('TRYING MOVE', {
        from: { row: fromRow, col: fromCol },
        to: { row, col },
      })

      dispatch({
        type: 'MOVE_CHECKER',
        payload: {
          from: { row: fromRow, col: fromCol },
          to: { row, col },
        },
      })
    }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <BoardWrapper>
      {board.map((row, rowIndex: number) => (
        <React.Fragment key={rowIndex}>
          {row.map((cell, colIndex: number) => {
            const highlight = getHighlightStatus(state, rowIndex, colIndex)
            return (
              <Cell
                key={colIndex}
                dark={rowIndex % 2 !== colIndex % 2}
                highlight={highlight}
                onDrop={
                  cell.checkerType ? undefined : handleDrop(rowIndex, colIndex)
                }
                onDragOver={handleDragOver}
              >
                {cell.checkerType && (
                  <Checker
                    id={`${rowIndex}-${colIndex}`}
                    player={cell.checkerType}
                    row={rowIndex}
                    col={colIndex}
                  />
                )}
              </Cell>
            )
          })}
        </React.Fragment>
      ))}
    </BoardWrapper>
  )
}

export default Board
