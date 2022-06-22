import { useState, useEffect } from "react";
import { arraysEqual } from "../utils/utils";
import * as ChessJS from "chess.js";
import { Square } from "react-chessboard";
import toast from "react-hot-toast";
import { useLocalStorage } from "./useLocalStorage";
import { Game } from "~/utils/types";

const Chess = typeof ChessJS === "function" ? ChessJS : ChessJS.Chess;

const useChessguessr = (game: Game) => {
  const [turn, setTurn] = useState(0);
  const [currentGuess, setCurrentGuess] = useState([]);
  const [guesses, setGuesses] = useState([
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ]);
  const [history, setHistory] = useState([]);
  const [correct, setCorrect] = useState(false);
  const [failed, setFailed] = useState(false);
  const [position, setPosition] = useState(null);
  const [fenHistory, setFenHistory] = useState([]);
  const [insufficientMoves, setInsufficientMoves] = useState(false);

  const [gameState, setGameState] = useLocalStorage("cg-state", {
    guesses: guesses,
    turn: turn,
    history: history,
    correct: correct,
    failed: failed,
    date: game.date,
  });

  useEffect(() => {
    if (gameState.turn > 0 && gameState.date === game.date) {
      setGuesses(gameState.guesses);
      setTurn(gameState.turn);
      setHistory(gameState.history);
      setCorrect(gameState.correct);
      setFailed(gameState.failed);
    } else {
      setGameState({
        guesses: guesses,
        turn: turn,
        history: history,
        correct: correct,
        failed: failed,
        date: game.date,
      });
    }
  }, []);

  useEffect(() => {
    if (game) {
      setPosition(new Chess(game.fen));
    }
  }, [game]);

  const updateChessBoard = (modify: any) => {
    setPosition((g: any) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  };

  const formatGuess = () => {
    let solutionArray = [...game.solution];

    let formattedGuess = [...currentGuess].map((move) => {
      return { move: move, color: "grey" };
    });

    formattedGuess.forEach((move, i) => {
      if (solutionArray[i] === move.move) {
        formattedGuess[i].color = "green";
        solutionArray[i] = null;
      }
    });

    formattedGuess.forEach((move, i) => {
      if (solutionArray.includes(move.move) && move.color !== "green") {
        formattedGuess[i].color = "yellow";
        solutionArray[solutionArray.indexOf(move.move)] = null;
      }
    });

    return formattedGuess;
  };

  const addGuess = (formattedGuess: any) => {
    const newGuesses = [...guesses];
    const newTurn = turn + 1;
    const newHistory = [...history, currentGuess];
    const solved = arraysEqual(currentGuess, game.solution);
    let newFailed = false;

    if (newTurn === 5 && !solved) {
      newFailed = true;
    }

    newGuesses[turn] = formattedGuess;

    setGuesses(newGuesses);
    setTurn(newTurn);
    setHistory(newHistory);
    setFailed(newFailed);

    if (solved) {
      setCorrect(true);
    } else {
      setPosition(new Chess(game.fen));
    }

    setGameState((prev) => {
      return {
        ...prev,
        guesses: newGuesses,
        turn: newTurn,
        history: newHistory,
        correct: solved,
        failed: newFailed,
      };
    });

    setCurrentGuess([]);
    setFenHistory([]);
  };

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    let move = null;

    updateChessBoard((game: any) => {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
    });

    if (move) {
      if (currentGuess.length < 5 && position) {
        setFenHistory((prev): any => [...prev, position.fen()]);
        setCurrentGuess((prev): any => [...prev, move.san]);
      }

      return true;
    }

    return false;
  };

  const takeback = () => {
    if (currentGuess.length < 1) {
      toast.error("Nothing to undo.", { duration: 2000 });
      return;
    }

    if (fenHistory.length < 2) {
      setPosition(new Chess(game.fen));
    } else {
      setPosition(new Chess(fenHistory[fenHistory.length - 2]));
    }

    setCurrentGuess((prev) => prev.filter((_, i) => i !== prev.length - 1));

    setFenHistory((prev) => prev.filter((_, i) => i !== prev.length - 1));
  };

  const submitGuess = () => {
    if (turn > 5) {
      console.log("Too many guesses");
      return;
    }

    if (history.includes(currentGuess)) {
      console.log("Already guessed");
      return;
    }

    if (currentGuess.length !== 5) {
      console.log("Need 5 moves");
      setInsufficientMoves(true);
      toast.error("5 moves needed.", { duration: 2000 });

      setTimeout(
        function () {
          setInsufficientMoves(false);
        }.bind(this),
        1000
      );

      return;
    }

    const formatted = formatGuess();

    addGuess(formatted);
  };

  return {
    turn,
    currentGuess,
    guesses,
    correct,
    failed,
    onDrop,
    position,
    takeback,
    submitGuess,
    insufficientMoves,
  };
};

export default useChessguessr;
