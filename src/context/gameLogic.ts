import { CheckerType, Move, Position, State } from './types'

const isValidPosition = (row: number, col: number) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

export const getPossibleMoves = (
  state: State,
  row: number,
  col: number,
  captured: Position[] = []
): Move[] => {
  const checkerType = state.board[row][col].checkerType

  if (checkerType === CheckerType.Red || checkerType === CheckerType.Black) {
    return getRegularCheckerMoves(state, row, col)
  } else if (
    checkerType === CheckerType.RedKing ||
    checkerType === CheckerType.BlackKing
  ) {
    return getKingMoves(state, row, col)
  }

  return []
}

const getMoveDirections = (checkerType: CheckerType): [number, number][] => {
  switch (checkerType) {
    case CheckerType.Red:
      return [
        [-1, -1],
        [-1, 1],
      ]
    case CheckerType.Black:
      return [
        [1, -1],
        [1, 1],
      ]
    case CheckerType.RedKing:
    case CheckerType.BlackKing:
      return [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]
    default:
      return []
  }
}

const isInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8
}

export const isEnemyChecker = (
  checkerType: CheckerType,
  otherCheckerType: CheckerType | null
) => {
  if (!otherCheckerType) {
    return false
  }

  return (
    ((checkerType === CheckerType.Red || checkerType === CheckerType.RedKing) &&
      (otherCheckerType === CheckerType.Black ||
        otherCheckerType === CheckerType.BlackKing)) ||
    ((checkerType === CheckerType.Black ||
      checkerType === CheckerType.BlackKing) &&
      (otherCheckerType === CheckerType.Red ||
        otherCheckerType === CheckerType.RedKing))
  )
}

const getRegularCheckerMoves = (
  state: State,
  row: number,
  col: number
): Move[] => {
  const checkerType = state.board[row][col].checkerType
  const direction = checkerType === CheckerType.Red ? -1 : 1
  const moves: Move[] = []

  for (let dx = -1; dx <= 1; dx += 2) {
    for (let step = 1; step <= 2; step++) {
      const newRow = row + direction * step
      const newCol = col + dx * step

      if (!isInBounds(newRow, newCol)) continue

      const destCell = state.board[newRow][newCol]
      const midCell = state.board[row + direction][col + dx]

      if (step === 1 && !destCell.checkerType) {
        moves.push({ from: { row, col }, to: { row: newRow, col: newCol } })
      } else if (
        step === 2 &&
        !destCell.checkerType &&
        midCell.checkerType &&
        midCell.checkerType !== checkerType
      ) {
        moves.push({ from: { row, col }, to: { row: newRow, col: newCol } })
      }
    }
  }

  return moves
}

export function getKingMoves(state: State, row: number, col: number): Move[] {
  const moves: Move[] = []
  const directions = [
    [-1, -1], // up-left
    [-1, 1], // up-right
    [1, -1], // down-left
    [1, 1], // down-right
  ]

  for (const [dx, dy] of directions) {
    let x = row + dx
    let y = col + dy
    while (isValidPosition(x, y) && !state.board[x][y].checkerType) {
      moves.push({ from: { row, col }, to: { row: x, col: y } })
      x += dx
      y += dy
    }
  }

  return moves
}

export function getValidMoves(
  state: State,
  row: number,
  col: number,
  captured: Position[] = []
): Move[] {
  const checkerType = state.board[row][col].checkerType
  const validMoves: Move[] = []

  if (checkerType === null) return validMoves

  const directions = getMoveDirections(checkerType)

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (!isInBounds(newRow, newCol)) continue

    const nextCheckerType = state.board[newRow][newCol].checkerType

    if (nextCheckerType === null && captured.length === 0) {
      // Simple move
      validMoves.push({
        from: { row, col },
        to: { row: newRow, col: newCol },
        captured,
      })
    } else if (
      nextCheckerType !== null &&
      isEnemyChecker(nextCheckerType, checkerType)
    ) {
      // Capture move
      const newRow2 = newRow + dr
      const newCol2 = newCol + dc

      if (!isInBounds(newRow2, newCol2)) continue

      const nextCheckerType2 = state.board[newRow2][newCol2].checkerType

      if (
        nextCheckerType2 === null &&
        !captured.some((pos) => pos.row === newRow && pos.col === newCol)
      ) {
        // Valid capture move
        const newState = moveChecker(
          state,
          { row, col },
          { row: newRow2, col: newCol2 },
          captured.concat({ row: newRow, col: newCol })
        )
        const nextMoves = getValidMoves(
          newState,
          newRow2,
          newCol2,
          captured.concat({ row: newRow, col: newCol })
        )

        for (const move of nextMoves) {
          validMoves.push({
            from: { row, col },
            to: move.to,
            captured: captured.concat(
              { row: newRow, col: newCol },
              ...move.captured!
            ),
          })
        }

        if (nextMoves.length === 0) {
          // Single capture move
          validMoves.push({
            from: { row, col },
            to: { row: newRow2, col: newCol2 },
            captured: captured.concat({ row: newRow, col: newCol }),
          })
        }
      }
    }
  }

  return validMoves
}

export const getAllValidMoves = (
  state: State,
  checkerType: CheckerType
): Move[] => {
  const moves: Move[] = []

  for (let row = 0; row < state.board.length; row++) {
    for (let col = 0; col < state.board[row].length; col++) {
      const cell = state.board[row][col]
      if (
        cell.checkerType === checkerType ||
        cell.checkerType ===
          (checkerType === CheckerType.Red
            ? CheckerType.RedKing
            : CheckerType.BlackKing)
      ) {
        const validMoves = getValidMoves(state, row, col)
        moves.push(...validMoves)
      }
    }
  }

  return moves
}

export const chooseRandomMove = (moves: Move[]): Move | null => {
  if (moves.length === 0) return null

  // Separate capture moves from non-capture moves.
  // @ts-ignore
  const captureMoves = moves.filter((move) => move.captured?.length > 0)
  const nonCaptureMoves = moves.filter((move) => !move.captured?.length)

  // If there are capture moves, return a random capture move.
  if (captureMoves.length > 0) {
    return captureMoves[Math.floor(Math.random() * captureMoves.length)]
  }

  // Otherwise, return a random non-capture move.
  return nonCaptureMoves[Math.floor(Math.random() * nonCaptureMoves.length)]
}

export const makeAIMove = (
  state: State,
  checkerType: CheckerType
): Move | null => {
  const validMoves: Move[] = []

  for (let row = 0; row < state.board.length; row++) {
    for (let col = 0; col < state.board[row].length; col++) {
      if (state.board[row][col].checkerType === checkerType) {
        const moves = getValidMoves(state, row, col)
        validMoves.push(...moves)
      }
    }
  }

  return chooseRandomMove(validMoves)
}

export const makeMove = (state: State, from: Position, to: Position): State => {
  const board = [...state.board]
  const checkerType = board[from.row][from.col].checkerType
  board[from.row][from.col].checkerType = null

  if (Math.abs(from.row - to.row) === 2) {
    const capturedRow = (from.row + to.row) / 2
    const capturedCol = (from.col + to.col) / 2
    board[capturedRow][capturedCol].checkerType = null
  }

  board[to.row][to.col].checkerType = checkerType

  return { ...state, board }
}

export const getHighlightStatus = (
  state: State,
  row: number,
  col: number
): boolean => {
  return state.possibleMoves.some(
    (move) => move.to.row === row && move.to.col === col
  )
}

export const moveChecker = (
  state: State,
  from: { row: number; col: number },
  to: { row: number; col: number },
  captured: { row: number; col: number }[]
): State => {
  const boardCopy = JSON.parse(JSON.stringify(state.board))

  // Move the checker to the new position.
  boardCopy[to.row][to.col].checkerType =
    boardCopy[from.row][from.col].checkerType

  // Remove the checker from the starting position.
  boardCopy[from.row][from.col].checkerType = null

  // Remove the captured checkers.
  for (const { row, col } of captured) {
    boardCopy[row][col].checkerType = null
  }

  // Check if the checker should be promoted to a king.
  if (
    (boardCopy[to.row][to.col].checkerType === CheckerType.Red &&
      to.row === 0) ||
    (boardCopy[to.row][to.col].checkerType === CheckerType.Black &&
      to.row === 7)
  ) {
    boardCopy[to.row][to.col].checkerType =
      boardCopy[to.row][to.col].checkerType === CheckerType.Red
        ? CheckerType.RedKing
        : CheckerType.BlackKing
  }

  return {
    ...state,
    board: boardCopy,
  }
}
