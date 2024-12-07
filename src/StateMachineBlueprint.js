// TODO: all ins, split pot, run it twice

// globalVars: dealer (seatNum), activeSeat(SeatNum), activeSeatPlayed(bool), last_raiser(seatNum)
// keep pots stack in case of side pots

// NOT_STARTED same as ROUND_OVER
  // admin clicks start button
  // advance to DEAL_PLAYER_CARDS
// DEAL_PLAYER_CARDS
  // make sure all players are not set to folded
  // admin deal cards
  // increment dealer
  // put small blind in
  // put big blind in
  // save current bet as the big blind, pot as 0, lastRaiser and activeSeat as person after big blind, activeSeatPlayed to false
  // save minRaise as double whatever big blind put in
  // advance to BETTING(1)
// BETTING (input: roundNum)
  // each person listens on activeSeat, plays, and then sets activeSeatPlayed to true
    // if raise, set last_raiser
  // admin listens on activeSeatPlayed, sets it to false and increments activeSeat
  // admin loops until activeSeat increment becomes last_raiser
  // set activeSeat to -1, deal with side pots
  // if everyone all in, advance to EVERYONE_ALL_IN
  // if everyone but one folds, advance to ROUND_OVER
  // if roundNum is 1 advance to DEAL_FLOP
  // if roundNum is 2 advance to DEAL_TURN
  // if roundNum is 3 advance to DEAL_RIVER
  // if roundNum is 4 advance to SHOWDOWN
// DEAL_FLOP
  // admin deal cards
  // save dealer as last_raiser
  // set min raise to smallBlind
  // save dealer as activeSeat, set activeSeatPlayed to false
  // advance to BETTING(2)
// DEAL_TURN
  // admin deal cards
  // save dealer as last_raiser
  // set min raise to smallBlind
  // save dealer as activeSeat, set activeSeatPlayed to false
  // advance to BETTING(3)
// DEAL_RIVER
  // admin deal cards
  // save dealer as last_raiser
  // set min raise to smallBlind
  // save dealer as activeSeat, set activeSeatPlayed to false
  // advance to BETTING(4)
// SHOWDOWN
  // best hand shows
  // allow others to show'
  // admin has timer
// EVERYONE_ALL_IN
  // ask everyone for run it twice
  // show the all_in cards
  // deal remaining cards either once or twice
  // perform logic to distribute funds
  // increment dealer
// ROUND_OVER
  // for each pot, get the winner and distribute funds
  // set players with 0 stack to -1
