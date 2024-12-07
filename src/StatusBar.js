import React from "react";

const StatusBar = ({ isAdmin, gameState, onAdminButtonClick, allowToggleSpectate, onToggleSpectate }) => {
  const getGameStateText = () => {
    return gameState;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Game State */}
        <div className="flex items-center">
          <span className="text-lg font-medium text-white">
            {isAdmin?"admin " : ""}
            game state:
            {getGameStateText()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Start Game Button - Only visible to admin when game isn't started */}
          {isAdmin && gameState === "ROUND_OVER" && (
            <button
              onClick={onAdminButtonClick}
              className={`px-4 py-2 rounded text-white ${"bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"}`}
            >
              Start Round
            </button>
          )}
          {isAdmin && gameState === "SHOWDOWN" && (
            <button
              onClick={onAdminButtonClick}
              className={`px-4 py-2 rounded text-white ${"bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"}`}
            >
              Continue
            </button>
          )}


          {/* Spectator Toggle */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="allowSpectate"
              className="text-white flex items-center gap-2"
            >
              <input
                id="allowSpectate"
                type="checkbox"
                disabled={!allowToggleSpectate}
                onChange={(e) => onToggleSpectate(e.target.checked)}
                className="w-5 h-5 text-blue-500 bg-gray-800 border-gray-700 rounded focus:ring-blue-500 focus:ring-opacity-50"
              />
              Allow Spectate
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
