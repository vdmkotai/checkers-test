import { Action, Cell, CheckerType, Move, State } from './types'
import { getValidMoves, makeAIMove, moveChecker } from './gameLogic'

export enum PlayerSide {
  Red = 'Red',
  Black = 'Black',
}

export const createBoard = (playerSide: PlayerSide): Cell[][] => {
  const boardSize = 8
  const board: Cell[][] = []

  for (let row = 0; row < boardSize; row++) {
    const currentRow: Cell[] = []
    for (let col = 0; col < boardSize; col++) {
      let checkerType: CheckerType | null = null
      if ((row + col) % 2 !== 0) {
        if (playerSide === PlayerSide.Red) {
          if (row < 3) {
            checkerType = CheckerType.Black
          } else if (row > 4) {
            checkerType = CheckerType.Red
          }
        } else {
          if (row < 3) {
            checkerType = CheckerType.Red
          } else if (row > 4) {
            checkerType = CheckerType.Black
          }
        }
      }
      currentRow.push({ row, col, checkerType })
    }
    board.push(currentRow)
  }

  return board
}

export const getInitialState = (playerSide: PlayerSide): State => {
  const board = createBoard(playerSide)

  return {
    board,
    possibleMoves: [],
  }
}
export const gameReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'MOVE_CHECKER': {
      const { from, to } = action.payload
      const checkerType = state.board[from.row][from.col]
        .checkerType as CheckerType

      if (!checkerType) {
        console.error('Invalid move: no checker at the starting position.')
        return state
      }

      const validMoves = getValidMoves(state, from.row, from.col)

      const validMove = validMoves.find(
        (move: Move) =>
          move.from.row === from.row &&
          move.from.col === from.col &&
          move.to.row === to.row &&
          move.to.col === to.col
      )

      if (!validMove) {
        console.error('Invalid move: not a valid move.')
        return state
      }

      let newState = moveChecker(state, from, to, validMove.captured || [])

      // Check if the checker should be upgraded to a King.
      if (to.row === 0 && checkerType === CheckerType.Red) {
        newState.board[to.row][to.col].checkerType = CheckerType.RedKing
      }

      // Simulate AI's turn
      const aiMove = makeAIMove(newState, CheckerType.Black)
      if (aiMove) {
        const aiValidMove = getValidMoves(
          newState,
          aiMove.from.row,
          aiMove.from.col
        ).find(
          (move: Move) =>
            move.from.row === aiMove.from.row &&
            move.from.col === aiMove.from.col &&
            move.to.row === aiMove.to.row &&
            move.to.col === aiMove.to.col
        )

        if (aiValidMove) {
          newState = moveChecker(
            newState,
            aiMove.from,
            aiMove.to,
            aiValidMove.captured || []
          )

          // Check if the AI's checker should be upgraded to a King.
          if (
            aiMove.to.row === 7 &&
            newState.board[aiMove.to.row][aiMove.to.col].checkerType ===
              CheckerType.Black
          ) {
            newState.board[aiMove.to.row][aiMove.to.col].checkerType =
              CheckerType.BlackKing
          }
        } else {
          console.error('Invalid AI move.')
        }
      }

      return newState
    }
    case 'RESET': {
      return getInitialState(action.payload)
    }
    case 'SET_POSSIBLE_MOVES': {
      return {
        ...state,
        possibleMoves: action.payload,
      }
    }
    default: {
      return state
    }
  }
}
