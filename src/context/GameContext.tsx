import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { gameReducer, getInitialState, PlayerSide } from './gameReducer'
import { getPossibleMoves, makeAIMove } from './gameLogic'
import { Action, CheckerType, State } from './types'

interface GameContextProps {
  state: State
  dispatch: React.Dispatch<Action>
  getPossibleMoves: (row: number, col: number) => void
  move: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void
  aiMove: () => void
  playerSide: PlayerSide
  reset: (playerSide: PlayerSide) => void
}

const GameContext = createContext<GameContextProps | undefined>(undefined)

export const useGameState = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider')
  }
  return context
}

const saveGameState = (state: State) => {
  localStorage.setItem('checkersGameState', JSON.stringify(state))
}

const loadGameState = (): State | null => {
  const savedState = localStorage.getItem('checkersGameState')
  return savedState ? JSON.parse(savedState) : null
}

// @ts-ignore
export const GameProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(
    gameReducer,
    loadGameState() || getInitialState(PlayerSide.Red)
  )

  useEffect(() => {
    saveGameState(state)
  }, [state])

  const getPossibleMovesFn = (row: number, col: number) => {
    const moves = getPossibleMoves(state, row, col)
    dispatch({ type: 'SET_POSSIBLE_MOVES', payload: moves })
  }

  const moveFn = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number
  ) => {
    dispatch({
      type: 'MOVE_CHECKER',
      payload: {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
      },
    })
  }

  const aiMoveFn = () => {
    const aiMove = makeAIMove(state, CheckerType.Black)
    if (aiMove) {
      const { from, to } = aiMove
      dispatch({
        type: 'MOVE_CHECKER',
        payload: {
          from: { row: from.row, col: from.col },
          to: { row: to.row, col: to.col },
        },
      })
    }
  }

  const resetFn = (playerSide: PlayerSide) => {
    dispatch({ type: 'RESET', payload: playerSide })
  }

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        getPossibleMoves: getPossibleMovesFn,
        move: moveFn,
        aiMove: aiMoveFn,
        playerSide: PlayerSide.Red,
        reset: resetFn,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}
