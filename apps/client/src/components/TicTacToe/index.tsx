import React, { useState, useCallback } from 'react';
import styles from './styles.module.scss';

type Player = 'X' | 'O';
type Cell = Player | null;

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function calculateWinner(board: Cell[]): Player | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

const TicTacToe: React.FC = () => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((cell) => cell !== null);

  const handleCellClick = useCallback((index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }, [board, currentPlayer, winner]);

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
  };

  let status: string;
  if (winner) {
    status = `Player ${winner} wins!`;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = `Player ${currentPlayer}'s turn`;
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Tic Tac Toe</h2>
      <p className={styles.status}>{status}</p>
      <div className={styles.board}>
        {board.map((cell, index) => (
          <button
            key={index}
            className={`${styles.cell} ${cell ? styles[`cell${cell}`] : ''}`}
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !!winner}
            aria-label={cell ? `Cell ${index + 1}: ${cell}` : `Cell ${index + 1}: empty`}
          >
            {cell}
          </button>
        ))}
      </div>
      <button className={styles.restartButton} onClick={handleRestart}>
        Restart
      </button>
    </div>
  );
};

export default TicTacToe;
