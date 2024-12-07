import {evaluateHand, compareHands} from "./CardManager";

export function dealPlayerCards(gameData, cardManager) {
  const alreadyStarted =
    localStorage.getItem("startedDealPlayerCards") === "true";
  if (alreadyStarted) return {};
  localStorage.setItem("startedDealPlayerCards", true);
  // fold all seats and deal cards
  cardManager.newDeck();
  const newVals = {};
  const seats = gameData.seats;
  const dealer = (gameData.dealer + 1) * seats.length;
  const playersIdxs = [];
  for (let i = 0; i < seats.length; i++) {
    const seat = seats[(i + dealer) % seats.length];
    if (seat.taken && seat.stack + seat.bet > 0) {
      playersIdxs.push((i + dealer) % seats.length);
    }
  }
  for (const i in playersIdxs) {
    const cards = [];
    cards.push(cardManager.getOneCard());
    cards.push(cardManager.getOneCard());
    newVals[`seats/${i}/cards`] = cards;
    // newVals[`seats/${i}/folded`] = false;
    newVals[`seats/${i}/showCard1`] = false;
    newVals[`seats/${i}/showCard2`] = false;
  }
  // put small blind in
  const smallBlindSeatNum = playersIdxs[1];
  const smallBlindSeat = seats[smallBlindSeatNum];
  if (smallBlindSeat.stack <= gameData.smallBlind) {
    // all in
    newVals[`seats/${smallBlindSeatNum}/bet`] = smallBlindSeat.stack;
    newVals[`seats/${smallBlindSeatNum}/stack`] = 0;
  } else {
    newVals[`seats/${smallBlindSeatNum}/stack`] =
      smallBlindSeat.stack - gameData.smallBlind;
    newVals[`seats/${smallBlindSeatNum}/bet`] = gameData.smallBlind;
  }
  // put big blind in
  const bigBlindSeatNum = playersIdxs[2 % playersIdxs.length];
  const bigBlindSeat = seats[bigBlindSeatNum];
  if (bigBlindSeat.stack <= gameData.bigBlind) {
    // all in
    newVals[`seats/${bigBlindSeatNum}/bet`] = bigBlindSeat.stack;
    newVals[`seats/${bigBlindSeatNum}/stack`] = 0;
  } else {
    newVals[`seats/${bigBlindSeatNum}/stack`] =
      bigBlindSeat.stack - gameData.bigBlind;
    newVals[`seats/${bigBlindSeatNum}/bet`] = gameData.bigBlind;
  }
  newVals["seatsInRound"] = playersIdxs;
  newVals["dealer"] = playersIdxs[0];
  newVals["lastRaiser"] = playersIdxs[3 % playersIdxs.length];
  newVals["activeSeat"] = playersIdxs[3 % playersIdxs.length];
  newVals["activeSeatPlayed"] = false;
  newVals["currentBet"] = gameData.bigBlind;
  newVals["minRaise"] = gameData.bigBlind * 2;
  newVals["pot"] = 0;
  newVals["state"] = "BETTING_1";
  newVals["communityCards"] = [];

  return newVals;
}

function doSidePotsIfNeeded(gameData, newVals) {
  newVals["sidePots"] = gameData.sidePots || [];
  // let playersIdxs = getPlayerIdxs(
  //   gameData.seats,
  //   (gameData.activeSeat + 1) % gameData.seats.length
  // );
  let playersIdxs = gameData.seatsInRound;
  playersIdxs.sort((idx1, idx2) => {
    return gameData.seats[idx1].bet - gameData.seats[idx2].bet;
  });
  while (true) {
    let end = 0;
    while (
      end < playersIdxs.length &&
      gameData.seats[playersIdxs[0]].bet ===
        gameData.seats[playersIdxs[end]].bet
    ) {
      end++;
    }
    if (end >= playersIdxs.length) {
      // all bet sizes were same, no need to do anything
      break;
    } else if (end === playersIdxs.length - 1) {
      // last guy put in too much
      const bet = gameData.seats[playersIdxs[0]].bet;
      const over = gameData.seats[playersIdxs[end]].bet - bet;
      gameData.seats[playersIdxs[end]].stack += over;
      gameData.seats[playersIdxs[end]].bet = bet;
      newVals[`seats/${playersIdxs[end]}/stack`] =
        gameData.seats[playersIdxs[end]].stack;
      newVals[`seats/${playersIdxs[end]}/bet`] =
        gameData.seats[playersIdxs[end]].bet;
      break;
    } else {
      // side pot needed
      newVals["sidePots"].push({
        pot: gameData.seats[playersIdxs[0]].bet,
        contributors: playersIdxs,
      });
      gameData.pot -= gameData.seats[playersIdxs[0]].bet;
      newVals["pot"] = gameData.pot;
      playersIdxs = playersIdxs.slice(end);
    }
    end = 0;
  }
  newVals["seatsInRound"] = gameData.seatsInRound.filter(number => playersIdxs.includes(number));
}

export function manageBetting(gameData, roundNum) {
  localStorage.setItem("startedDealPlayerCards", false);
  if (gameData.activeSeatPlayed) {
    const newVals = {};
    // const playersIdxs = getPlayerIdxs(
    //   gameData.seats,
    //   (gameData.activeSeat + 1) % gameData.seats.length
    // );
    const playersIdxs = gameData.seatsInRound;
    const nextActiveSeatIdx = (playersIdxs.indexOf(gameData.activeSeat) + 1) % playersIdxs.length;
    let allFolded = playersIdxs.length === 1;
    let everyoneAllIn = true;
    playersIdxs.forEach((i, index) => {
      if (gameData.seats[i].stack > 0) {
        everyoneAllIn = false;
      }
    });
    newVals["activeSeatPlayed"] = false;
    newVals["activeSeat"] = -1;
    if (everyoneAllIn) {
      doSidePotsIfNeeded(gameData, newVals);
      // do main pot
      let pot = gameData.pot;
      for (const i in playersIdxs) {
        if (gameData.seats[i].bet > 0) {
          pot += gameData.seats[i].bet;
          newVals[`seats/${i}/bet`] = 0;
        }
      }
      newVals[`pot`] = pot;
      newVals[`currentBet`] = 0;
      newVals["state"] = "EVERYONE_ALL_IN";
    } else if (allFolded) {
      newVals["state"] = "ROUND_OVER";
    } else if (playersIdxs[nextActiveSeatIdx] === gameData.lastRaiser) {
      doSidePotsIfNeeded(gameData, newVals);
      // do main pot
      let pot = gameData.pot;
      for (const i in playersIdxs) {
        if (gameData.seats[i].bet > 0) {
          pot += gameData.seats[i].bet;
          newVals[`seats/${i}/bet`] = 0;
        }
      }
      newVals[`pot`] = pot;
      newVals[`currentBet`] = 0;
      const nextState = {
        1: "DEAL_FLOP",
        2: "DEAL_TURN",
        3: "DEAL_RIVER",
        4: "SHOWDOWN",
      };
      newVals["state"] = nextState[roundNum];
    } else {
      newVals["activeSeat"] = playersIdxs[nextActiveSeatIdx];
      newVals["state"] = `BETTING_${roundNum}`;
    }
    return newVals;
  }
  return {};
}

export function dealFlop(gameData, cardManager) {
  const newVals = {};
  newVals[`communityCards/0`] = cardManager.getOneCard();
  newVals[`communityCards/1`] = cardManager.getOneCard();
  newVals[`communityCards/2`] = cardManager.getOneCard();

  // const playersIdxs = getPlayerIdxs(gameData.seats, gameData.dealer);
  const playersIdxs = gameData.seatsInRound;
  const nextActiveSeatIdx = (playersIdxs.indexOf(gameData.activeSeat) + 1) % playersIdxs.length;
  newVals["lastRaiser"] = playersIdxs[nextActiveSeatIdx];
  newVals["activeSeat"] = playersIdxs[nextActiveSeatIdx];
  newVals["minRaise"] = gameData.smallBlind;
  newVals["activeSeatPlayed"] = false;
  newVals["state"] = "BETTING_2";
  return newVals;
}

export function dealTurn(gameData, cardManager) {
  const newVals = {};
  newVals[`communityCards/3`] = cardManager.getOneCard();
  // const playersIdxs = getPlayerIdxs(gameData.seats, gameData.dealer);
  const playersIdxs = gameData.seatsInRound;
  const nextActiveSeatIdx = (playersIdxs.indexOf(gameData.activeSeat) + 1) % playersIdxs.length;
  newVals["lastRaiser"] = playersIdxs[nextActiveSeatIdx];
  newVals["activeSeat"] = playersIdxs[nextActiveSeatIdx];
  newVals["minRaise"] = gameData.smallBlind;
  newVals["activeSeatPlayed"] = false;
  newVals["state"] = "BETTING_3";
  return newVals;
}

export function dealRiver(gameData, cardManager) {
  const newVals = {};
  newVals[`communityCards/4`] = cardManager.getOneCard();
  // const playersIdxs = getPlayerIdxs(gameData.seats, gameData.dealer);
  const playersIdxs = gameData.seatsInRound;
  const nextActiveSeatIdx = (playersIdxs.indexOf(gameData.activeSeat) + 1) % playersIdxs.length;
  newVals["lastRaiser"] = playersIdxs[nextActiveSeatIdx];
  newVals["activeSeat"] = playersIdxs[nextActiveSeatIdx];
  newVals["minRaise"] = gameData.smallBlind;
  newVals["activeSeatPlayed"] = false;
  newVals["state"] = "BETTING_4";
  return newVals;
}

function getWinners(gameData, playersIdxs) {
  let winners = [];
  const hands = {};
  let currMax = { rank: 0, highCard: 0 };

  playersIdxs.forEach((i) => {
    const handCards = [...gameData.communityCards, ...gameData.seats[i].cards];
    hands[i] = evaluateHand(handCards);

    const comparison = compareHands(hands[i], currMax);
    if (comparison === 1) {
      winners = [i];
      currMax = hands[i];
    } else if (comparison === 0) {
      winners.push(i);
    }
  });

  return winners;
}


export function showdown(gameData) {
  const newVals = {};
  // const playersIdxs = getPlayerIdxs(gameData.seats, gameData.dealer);
  const playersIdxs = gameData.seatsInRound;
  const winners = getWinners(gameData, playersIdxs);
  // show cards of winners TODO:show only relevant card
  winners.forEach((i, index) => {
    newVals[`seats/${i}/showCard1`] = true;
    newVals[`seats/${i}/showCard2`] = true;
  });
  return newVals;
}

export function everyoneAllIn(gameData, cardManager) {
  const newVals = {};
  const playersIdxs = gameData.seatsInRound;
  playersIdxs.forEach((i, index) => {
    newVals[`seats/${i}/showCard1`] = true;
    newVals[`seats/${i}/showCard2`] = true;
  });
  let start = gameData.communityCards.length;
  while (start < 5) {
    newVals[`communityCards/${start}`] = cardManager.getOneCard();
    start++;
  }
  newVals["state"] = "SHOWDOWN"
  return {};
}

function doPot(pot, players, gameData, newVals) {
  const winners = getWinners(gameData, players);
  const baseValue = Math.floor(pot / winners.length); // Base value for each element
  const remainder = pot % winners.length; // Remaining value to distribute
  // Create the array with baseValue
  const winMoney = Array(winners.length).fill(baseValue);
  // Distribute the remainder
  for (let i = 0; i < remainder; i++) {
    winMoney[i]++;
  }
  winners.forEach((playerIdx, index) => {
    newVals[`seats/${playerIdx}/stack`] = gameData.seats[playerIdx].stack + winMoney[index];
  });
}

export function roundOver(gameData) {
  const newVals = {};
  if (gameData.pot > 0 || gameData.sidePots) {
    doPot(gameData.pot, gameData.seatsInRound, gameData, newVals);
    newVals["pot"] = 0;
    if (gameData.sidePots) {
      for (const potData in gameData.sidePots) {
        doPot(potData.pot, potData.contributors, gameData, newVals);
      }
      newVals["sidePots"] = [];
    }
  }
  for (let i = 0; i < gameData.seats.length; i++) {
    if (gameData.seats[i].stack === 0) {
      newVals[`seats/${i}/stack`] = -1;
    }
  }
  return newVals;
}