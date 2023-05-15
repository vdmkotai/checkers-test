import styled from '@emotion/styled'

export const BoardWrapper = styled.div`
  display: grid;
  grid-template-rows: repeat(8, 1fr);
  grid-template-columns: repeat(8, 1fr);
  background-color: #bbada0;
  width: 600px;
  height: 600px;
`

type CellProps = {
  dark: boolean
  highlight: boolean
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void
}

export const Cell = styled.div<CellProps>`
  background-color: ${({ dark }) => (dark ? '#8B4513' : '#F0D9B5')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  ${({ highlight }) => (highlight ? 'border: 3px solid #7FDBFF;' : null)}
  height: 100%;

  ${({ onDrop }) =>
    onDrop &&
    `
    ondrop: ${onDrop};
  `}
  ${({ onDragOver }) =>
    onDragOver &&
    `
    ondragover: ${onDragOver};
  `}
`
