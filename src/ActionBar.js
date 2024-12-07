import React, { useEffect, useState } from "react";

const ActionBar = ({
  selectedSeat,
  onJoinGame,
  onLeaveSeat,
  isPlayerTurn,
  currentBet = 0,
  minRaise = 1,
  playerStack = -1,
  playerBet = -1,
  isShowdownState = false,
  onAction,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [buyInAmount, setBuyInAmount] = useState(100);
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  useEffect(() => {
    setRaiseAmount(minRaise);
  }, [minRaise]);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (playerName && buyInAmount >= 1) {
      onJoinGame(playerName, buyInAmount);
    }
  };

  if (isShowdownState) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => onAction("showcard", 0)}
          >
            Show Card 1
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => onAction("showcard", 1)}
          >
            Show Card 2
          </button>
        </div>
      </div>
    );
  }

  // Join game form
  if (selectedSeat !== -1 && playerStack < 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <form
          onSubmit={handleJoinSubmit}
          className="flex items-center justify-between gap-4 max-w-4xl mx-auto"
        >
          {/* Player Name Input */}
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />

          {/* Buy-In Amount Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBuyInAmount(Math.max(100, buyInAmount - 100))}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
            >
              -
            </button>
            <input
              type="number"
              value={buyInAmount}
              onChange={(e) => setBuyInAmount(Number(e.target.value))}
              className="w-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white text-center focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setBuyInAmount(buyInAmount + 100)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
            >
              +
            </button>
          </div>

          {/* Join Game Button */}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Join Game
          </button>
          <button
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={onLeaveSeat}
          >
            Leave Seat
          </button>
        </form>
      </div>
    );
  }

  // Action buttons
  if (playerStack > 0 && isPlayerTurn) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction("fold")}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Fold
              {playerBet === currentBet && " (Unnecessary)"}
            </button>
            {playerBet === currentBet ? (
              <button
                onClick={() => onAction("check")}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Check
              </button>
            ) : (
              <button
                onClick={() =>
                  onAction(
                    "call",
                    Math.min(currentBet, playerStack + playerBet)
                  )
                }
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                {currentBet >= playerStack + playerBet
                  ? "All in"
                  : `Call $${currentBet}`}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setRaiseAmount(Math.max(minRaise, raiseAmount - minRaise))
              }
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
            >
              -
            </button>
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500 
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() =>
                setRaiseAmount(
                  Math.min(playerStack + playerBet, raiseAmount + minRaise)
                )
              }
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700"
            >
              +
            </button>
            <button
              onClick={() => onAction("raise", raiseAmount)}
              disabled={
                raiseAmount < minRaise || raiseAmount > playerStack + playerBet
              }
              className={`px-6 py-2 rounded focus:outline-none ${
                raiseAmount < minRaise || raiseAmount > playerStack + playerBet
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              } text-white`}
            >
              Raise to ${raiseAmount}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Waiting state
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
      <p className="text-center text-gray-400">
        {selectedSeat === -1
          ? "Select a seat to join the game"
          : "Waiting for your turn..."}
      </p>
    </div>
  );
};

export default ActionBar;
