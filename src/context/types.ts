import { PlayerSide } from './gameReducer'

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  captured?: Position[]
}

export interface Checker {
  checkerType: CheckerType | null
}

export interface Cell {
  row: number
  col: number
  checkerType: CheckerType | null
}

export enum CheckerType {
  Red = 'red',
  RedKing = 'redKing',
  Black = 'black',
  BlackKing = 'blackKing',
}

export interface State {
  board: Cell[][]
  possibleMoves: Move[]
}

export type Action =
  | { type: 'MOVE_CHECKER'; payload: { from: Position; to: Position } }
  | { type: 'RESET'; payload: PlayerSide }
  | { type: 'SET_POSSIBLE_MOVES'; payload: Move[] }
