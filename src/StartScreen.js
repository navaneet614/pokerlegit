import React, { useState } from "react";
import "./App.css"; // For styling the UI
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { database } from "./firebase";
import { ref, set, get } from "firebase/database";

const numSeats = 8;
const seatData = {
  name: "",
  stack: -1,
  allowSpectate: false,
  showCard1: false,
  showCard2: false,
  cards: [],
  taken: false,
  bet: -1,
};
const gameData = {
  seats: [],
  seatsInRound: [],
  communityCards: [],
  pot: 0,
  activeSeat: -1,
  activeSeatPlayed: false,
  dealer: -1,
  smallBlind: 10,
  bigBlind: 20,
  minRaise: -1,
  lastRaiser: -1,
  currentBet: 0,
  state: "ROUND_OVER",
};
for (let i = 0; i < numSeats; i++) {
  gameData.seats.push(seatData);
}

function GameStartScreen() {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [gameCode, setGameCode] = useState("");

  const startGame = async (gameCode) => {
    localStorage.setItem("isAdmin", "");
    // Reference to the node for this specific game using the gameCode as the key
    const gameRef = ref(database, gameCode);

    // Check if a game with the provided gameCode already exists
    const success = await get(gameRef)
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          localStorage.setItem("isAdmin", "");
          return true;
        } else {
          // If the game doesn't exist, proceed to create a new game
          // Set the game data in Firebase under the gameCode node
          const success = await set(gameRef, gameData)
            .then(() => {
              console.log(`Game created with code: ${gameCode}`);
              localStorage.setItem("isAdmin", gameCode);
              localStorage.setItem("gameState", "ROUND_OVER");
              localStorage.getItem("startedDealPlayerCards", false);
              return true;
            })
            .catch((error) => {
              console.error("Error creating game:", error);
              return false;
            });
          return success;
        }
      })
      .catch((error) => {
        console.error("Error checking if game exists:", error);
        return false;
      });
    return success;
  };

  // Handle change of input for game code
  const handleGameCodeChange = (e) => {
    setGameCode(e.target.value);
  };

  // Handle form submission for joining a game
  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (gameCode) {
      console.log("Joining game with code:", gameCode);
      const success = await startGame(gameCode);
      if (success) {
        console.log(`Joined game ${gameCode}`);
        navigate(`/${gameCode}`);
      } else {
        console.log(`Failed to join game ${gameCode}}`);
      }
    } else {
      alert("Please enter a valid game code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col justify-center items-center text-white">
      <h1 className="text-3xl font-bold mb-6">Nav's Legit Poker</h1>

      <div className="join-game bg-gray-700 p-6 rounded shadow-md w-full max-w-sm">
        <form onSubmit={handleJoinGame} className="flex flex-col gap-4">
          <input
            type="text"
            id="gameCode"
            value={gameCode}
            onChange={handleGameCodeChange}
            placeholder="Enter the game code"
            required
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Game
          </button>
        </form>
      </div>
    </div>
  );
}

export default GameStartScreen;
