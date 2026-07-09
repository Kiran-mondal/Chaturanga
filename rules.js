/**
 * Historical rules for Chaturanga pieces on an 8x8 Ashtapada board.
 * Returns true if a move from (fromRow, fromCol) to (toRow, toCol) is valid.
 */
export const isValidMove = (piece, fromRow, fromCol, toRow, toCol, board) => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  switch (piece.toLowerCase()) {
    case 'padati': // Foot-soldier (Pawn) - Moves 1 step forward only, captures 1 step diagonally forward
      const direction = piece.isWhite ? -1 : 1; // Assuming White moves up, Black moves down
      if (fromCol === toCol && toRow === fromRow + direction) {
        return !board[`${toRow}-${toCol}`]; // Move forward if empty
      }
      if (colDiff === 1 && toRow === fromRow + direction) {
        return !!board[`${toRow}-${toCol}`]; // Capture diagonally if occupied
      }
      return false;

    case 'ashva': // Horse (Knight) - Standard L-shape move (2x1)
      return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

    case 'ratha': // Chariot (Rook) - Moves straight horizontally or vertically
      if (fromRow !== toRow && fromCol !== toCol) return false;
      // Note: A collision check function will be added later to ensure it doesn't jump over pieces
      return true;

    case 'gaja': // Elephant - Moves exactly 2 squares diagonally (Jumps over pieces historically)
      return rowDiff === 2 && colDiff === 2;

    case 'mantri': // Counselor - Moves exactly 1 square diagonally
      return rowDiff === 1 && colDiff === 1;

    case 'raja': // King - Moves 1 square in any direction
      return rowDiff <= 1 && colDiff <= 1;

    default:
      return false;
  }
};
