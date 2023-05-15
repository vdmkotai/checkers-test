import styled from '@emotion/styled'

interface CheckerWrapperProps {
  color: string
  king: boolean
}

export const CheckerWrapper = styled.div<CheckerWrapperProps>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  width: 80%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  user-select: none;
  cursor: grab;
  transition: transform 0.1s ease-in-out;

  ${({ king }) =>
    king &&
    `
    border: 2px solid gold;
  `}

  &:active {
    cursor: grabbing;
    transform: scale(1.1);
  }
  
`
