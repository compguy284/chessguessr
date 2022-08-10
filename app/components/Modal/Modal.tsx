import { useCopyToClipboard } from "../../hooks/useCopyToClipboard";
import StatsCards from "./StatsCards";
import { Tile } from "~/styles/styles";
import { GameStatus } from "~/utils/types";
import Distribution from "./Distribution";
import Countdown, { zeroPad } from "react-countdown";
import { countdownRenderer, midnightUtcTomorrow } from "~/utils/utils";

const getSolvedPercentage = (puzzleStats) => {
  if (!puzzleStats?.solved || !puzzleStats?.failed) {
    return null;
  }

  return Math.round(
    (puzzleStats.solved / (puzzleStats.solved + puzzleStats.failed)) * 100
  );
};

const getAverageNumberOfTurns = (puzzleStats) => {
  if (!(puzzleStats?.solved > 0 && puzzleStats?.turns > 0)) {
    return null;
  }

  return Math.round((puzzleStats.turns / puzzleStats.solved) * 100) / 100;
};

const Correct = ({ game, gameUrlText, puzzleStats }) => {
  const solvedPercentage = getSolvedPercentage(puzzleStats);

  const averageNumberOfTurns = getAverageNumberOfTurns(puzzleStats);

  return (
    <div className="relative pl-6 pr-6 flex-auto">
      <div className="divider" />
      <p className="my-4 text-lg leading-relaxed">
        This game was played between {game.white}{" "}
        {game.wAka && `(${game.wAka})`} and {game.black}
        {game.bAka && ` (${game.bAka})`}. Check out the game{" "}
        <a
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          href={game.gameUrl}
          target="_blank"
        >
          {gameUrlText(game)}
        </a>
        .
      </p>
      <span className="font-semibold">Solution</span>
      <div className="flex flex-row mt-1">
        {game.solution?.map((move, i) => (
          <Tile
            className="mr-[6px]"
            color="green"
            flipTile={true}
            animationIndex={i * 0.2}
            tutorial={true}
          >
            {move}
          </Tile>
        ))}
      </div>
      {solvedPercentage && averageNumberOfTurns && (
        <>
          <p className="my-4 text-lg leading-relaxed">
            {solvedPercentage}% got this one right. For the people that got it
            right, the average number of turns was {averageNumberOfTurns}.
          </p>
        </>
      )}
    </div>
  );
};

const Failed = ({ game, gameUrlText, puzzleStats }) => {
  const solvedPercentage = getSolvedPercentage(puzzleStats);

  const averageNumberOfTurns = getAverageNumberOfTurns(puzzleStats);

  return (
    <div className="relative pl-6 pr-6 flex-auto">
      <div className="divider" />
      <p className="my-4 text-lg leading-relaxed">
        This game was played between {game.white} and {game.black}. Check out
        the game{" "}
        <a
          className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
          href={game.gameUrl}
          target="_blank"
        >
          {gameUrlText(game)}
        </a>
        .
      </p>
      <span className="font-semibold">Solution</span>
      <div className="flex flex-row mt-1">
        {game.solution?.map((move, i) => (
          <Tile
            className="mr-[6px]"
            color="green"
            flipTile={true}
            animationIndex={i * 0.2}
            tutorial={true}
          >
            {move}
          </Tile>
        ))}
      </div>
      {solvedPercentage && averageNumberOfTurns && (
        <>
          <h1 className="my-4  text-lg leading-relaxed">
            {solvedPercentage}% got this one right. For the people that got it
            right, the average number of turns was {averageNumberOfTurns}.
          </h1>
        </>
      )}
    </div>
  );
};

export default function Modal({
  showModal,
  setShowModal,
  game,
  guesses,
  turn,
  playerStats,
  puzzleStats,
  gameStatus,
}) {
  const [value, copy] = useCopyToClipboard();

  const solvedPercentage = getSolvedPercentage(puzzleStats);

  const gameUrlText = (game) => {
    if (game.gameUrl.includes("lichess.org")) {
      return "on lichess";
    }

    return "here";
  };

  const getShareGameText = (
    guesses: any,
    game: any,
    turn: number,
    correct: boolean
  ) => {
    let text = `Chessguessr #${game.id} ${correct ? turn : "X"}/5\n\n`;

    guesses.forEach((guess) => {
      if (!guess[0]) return;

      guess.forEach((move) => {
        if (move && move.color && move.pieceColor) {
          if (move.color === "green") {
            text += "🟩";
          } else if (move.color === "yellow" && move.pieceColor === "red") {
            text += "🟧";
          } else if (move.color === "yellow") {
            text += "🟨";
          } else if (move.pieceColor === "red") {
            text += "🟥";
          } else if (move.color === "grey") {
            text += "⬜";
          }
        }
      });

      text += "\n";
    });

    text += "\nhttps://chessguessr.com";

    return text;
  };

  const shareGameText = getShareGameText(
    guesses,
    game,
    turn,
    gameStatus === GameStatus.SOLVED
  );

  const utcTomorrow = midnightUtcTomorrow();

  const nextDate =
    utcTomorrow.getFullYear().toString() +
    "-" +
    (utcTomorrow.getMonth() + 1).toString().padStart(2, 0) +
    "-" +
    utcTomorrow.getDate().toString();

  return (
    <>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-base-200 outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 rounded-t">
                  <h3 className="text-3xl font-semibold">Statistics</h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-10 w-10"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <StatsCards playerStats={playerStats} />

                {playerStats?.guesses && (
                  <Distribution guessDistribution={playerStats.guesses} />
                )}

                {gameStatus !== GameStatus.IN_PROGRESS ? (
                  <>
                    {gameStatus === GameStatus.SOLVED ? (
                      <Correct
                        game={game}
                        gameUrlText={gameUrlText}
                        puzzleStats={puzzleStats}
                      />
                    ) : (
                      <Failed
                        game={game}
                        gameUrlText={gameUrlText}
                        puzzleStats={puzzleStats}
                      />
                    )}
                  </>
                ) : null}

                <div className="relative pl-6 flex-auto">
                  <p className="mt-4 mb-4 text-md">
                    Feedback? Post in the{" "}
                    <a
                      target="_blank"
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                      href="https://lichess.org/team/chessguessr"
                    >
                      Lichess team forum.
                    </a>{" "}
                  </p>
                  <p className="text-md">
                    {" "}
                    Now also on Twitter! Follow{" "}
                    <a
                      target="_blank"
                      className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
                      href="https://twitter.com/chessguessr"
                    >
                      Chessguessr
                    </a>{" "}
                    for updates.
                  </p>
                </div>

                <div className="flex space-x-12 items-center justify-between p-6 rounded-b">
                  <div className="font-bold">
                    NEW PUZZLE AT MIDNIGHT UTC (
                    <Countdown
                      date={nextDate}
                      zeroPadTime={2}
                      renderer={countdownRenderer}
                    />
                    )
                  </div>
                  <div className="flex">
                    {gameStatus !== GameStatus.IN_PROGRESS && (
                      <button
                        type="button"
                        onClick={() => copy(shareGameText)}
                        className="text-white bg-primary hover:bg-primary-focus focus:ring-2 focus:outline-none focus:ring-primary-focus font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2"
                      >
                        {!value ? "SHARE SCORE" : "Copied to clipboard"}
                      </button>
                    )}

                    <button
                      className="text-red-500 font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
