import React, { useState, useEffect, useRef, act } from "react";
import { ref, onValue, update, get } from "firebase/database"; // Use onValue for real-time updates
import { database } from "./firebase"; // Your Firebase database configuration
import { useParams, useNavigate } from "react-router-dom";
import PokerTable from "./PokerTable";
import ActionBar from "./ActionBar";
import StatusBar from "./StatusBar";
import CardManager from "./CardManager";
import {
  dealFlop,
  dealPlayerCards,
  dealRiver,
  dealTurn,
  everyoneAllIn,
  manageBetting,
  roundOver,
  showdown,
} from "./StateMachine";

function Game() {
  const { gameCode } = useParams(); // Get the gameCode from the URL
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameData, setGameData] = useState({});
  const [mySeat, setMySeat] = useState(-1);
  const cardManagerRef = useRef(new CardManager());
  const navigate = useNavigate();

  // Fetch game data from Firebase
  useEffect(() => {
    const gameRef = ref(database, gameCode); // Reference to the game node using the gameCode

    const isAdminData = localStorage.getItem("isAdmin");
    if (isAdminData && isAdminData === gameCode) {
      setIsAdmin(true);
    }

    // Set up a real-time listener for updates on this game
    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setGameData(data);
        // console.log("Game data updated", data);
        if (isAdminData === gameCode) {
          handleGameStateUpdate(data);
        }
      } else {
        alert("Game not found");
        navigate("/");
      }
    });

    // Clean up the listener on component unmount
    return () => {
      unsubscribe();
    };
  }, [gameCode]);

  const handleGameStateUpdate = async (gameData) => {
    const gameState = gameData.state;
    console.log("game data is: ", gameData);
    let newData = {};
    if (gameState === "DEAL_PLAYER_CARDS") {
      newData = dealPlayerCards(gameData, cardManagerRef.current);
    } else if (gameState.startsWith("BETTING")) {
      newData = manageBetting(gameData, gameState.split("_")[1]);
    } else if (gameState === "DEAL_FLOP") {
      newData = dealFlop(gameData, cardManagerRef.current);
    } else if (gameState === "DEAL_TURN") {
      newData = dealTurn(gameData, cardManagerRef.current);
    } else if (gameState === "DEAL_RIVER") {
      newData = dealRiver(gameData, cardManagerRef.current);
    } else if (gameState === "SHOWDOWN") {
      newData = showdown(gameData);
    } else if (gameState === "EVERYONE_ALL_IN") {
      newData = everyoneAllIn(gameData, cardManagerRef.current);
    } else if (gameState === "ROUND_OVER") {
      newData = roundOver(gameData);
    }
    console.log("newData from ", gameState, " is: ", newData);
    await updateGame(newData);
  };

  const updateGame = async (newVals) => {
    const gameRef = ref(database, `/${gameCode}`);
    await update(gameRef, newVals).catch((error) => {
      alert("Error", error);
    });
  };

  const handleSeatClick = async (seatPosition) => {
    const seatRef = ref(database, `/${gameCode}/seats/${seatPosition}`);
    await update(seatRef, {
      taken: true,
      name: "Joining...",
      stack: -1,
    }).catch((error) => {
      alert("Error", error);
    });
    setMySeat(seatPosition);
  };

  const handleJoinGame = async (name, buyInAmount) => {
    if (gameData.state !== "ROUND_OVER") {
        alert("Can only join when round is over");
        return;
    }
    const seatRef = ref(database, `/${gameCode}/seats/${mySeat}`);
    await update(seatRef, {
      name: name,
      stack: buyInAmount,
      allowSpectate: false,
    }).catch((error) => {
      alert("Error", error);
    });
  };

  const handleLeaveSeat = async () => {
    const seatRef = ref(database, `/${gameCode}/seats/${mySeat}`);
    await update(seatRef, {
      stack: -1,
      allowSpectate: false,
      taken: false,
    }).catch((error) => {
      alert("Error", error);
    });
    setMySeat(-1);
  };

  const handleStartGame = async () => {
    if (isAdmin) {
      const seats = gameData.seats;
      let numPlayers = 0;
      for (let i = 0; i < seats.length; i++) {
        const seat = seats[i];
        if (seat.taken && seat.stack > 0) {
          numPlayers++;
        }
      }
      if (numPlayers >= 2) {
        const gameRef = ref(database, `/${gameCode}`);
        await update(gameRef, { state: "DEAL_PLAYER_CARDS" }).catch((error) => {
          alert("Error", error);
        });
      } else {
        alert("At least 2 players are needed to start game.");
      }
    }
  };

  const handleAdminButtonClick = async () => {
    if (isAdmin) {
      if (gameData.state === "ROUND_OVER") {
        await handleStartGame();
      } else if (gameData.state === "SHOWDOWN") {
        const gameRef = ref(database, `/${gameCode}`);
        await update(gameRef, { state: "ROUND_OVER" }).catch((error) => {
          alert("Error", error);
        });
      }
    }
  };

  const handleToggleSpectate = async (allowSpectate) => {
    if (mySeat !== -1) {
      const seatRef = ref(database, `/${gameCode}/seats/${mySeat}`);
      await update(seatRef, {
        allowSpectate: allowSpectate,
      }).catch((error) => {
        alert("Error", error);
      });
    }
  };

  const handlePlayerAction = async (action, bet) => {
    const newVals = {};
    if (action === "fold") {
      newVals["pot"] = gameData.pot + gameData.seats[mySeat].bet;
      newVals[`seats/${mySeat}/bet`] = -1;
      // newVals[`seats/${mySeat}/folded`] = true;
      const playersIdxs = gameData.seatsInRound;
      const myIdx = playersIdxs.indexOf(gameData.activeSeat);
      newVals["seatsInRound"] = playersIdxs.splice(myIdx, myIdx);
    } else if (action === "check") {
      // no need to do anything
    } else if (action === "call" || action === "raise") {
      if (bet >= gameData.seats[mySeat].stack + gameData.seats[mySeat].bet) {
        // all in
        newVals[`seats/${mySeat}/bet`] =
          gameData.seats[mySeat].stack + gameData.seats[mySeat].bet;
        newVals[`seats/${mySeat}/stack`] = 0;
      } else {
        newVals[`seats/${mySeat}/stack`] =
          gameData.seats[mySeat].stack - (bet - gameData.seats[mySeat].bet);
        newVals[`seats/${mySeat}/bet`] = bet;
      }
      newVals["currentBet"] = bet;
      if (action === "raise" && bet > gameData.currentBet) {
        newVals["lastRaiser"] = mySeat;
        newVals["minRaise"] = bet + 1;
      }
    } else if(action === "showcard" && gameData.state === "SHOWDOWN") {
        newVals[`seats/${mySeat}/showCard${bet}`] = true;
    }
    newVals["activeSeatPlayed"] = true;
    console.log("player action new data: ", newVals);
    updateGame(newVals);
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="pt-32 pb-32">
        <PokerTable
          mySeat={mySeat}
          seats={gameData.seats}
          communityCards={gameData.communityCards}
          activeSeat={gameData.activeSeat}
          pot={gameData.pot}
          onSeatClick={handleSeatClick}
          dealingSpeed={300} // Control animation speed (ms)
        />
      </div>
      <StatusBar
        isAdmin={isAdmin}
        gameState={gameData.state}
        onAdminButtonClick={handleAdminButtonClick}
        allowToggleSpectate={mySeat !== -1}
        onToggleSpectate={handleToggleSpectate}
      />
      <ActionBar
        selectedSeat={mySeat}
        onJoinGame={handleJoinGame}
        onLeaveSeat={handleLeaveSeat}
        isPlayerTurn={
          gameData.activeSeat === mySeat && !gameData.activeSeatPlayed
        }
        currentBet={gameData.currentBet}
        minRaise={gameData.minRaise}
        playerStack={mySeat === -1 ? -1 : gameData.seats[mySeat].stack}
        playerBet={mySeat === -1 ? -1 : gameData.seats[mySeat].bet}
        isShowdownState={gameData.state === "SHOWDOWN"}
        onAction={handlePlayerAction}
      />
    </div>
  );
}

export default Game;
