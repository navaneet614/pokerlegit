import React from "react";
import { User, Plus, Ban, LogIn } from "lucide-react";
import { evaluateHand } from "./CardManager";

const PokerTable = ({
  mySeat = -1,
  seats = [],
  communityCards = [],
  activeSeat = -1,
  pot = 0,
  onSeatClick = (seatIndex) => {},
  dealingSpeed = 300,
}) => {
  // Calculate positions for 8 seats around an oval table
  const seatPositions = [
    "top-0 left-1/4", // Top left
    "top-0 right-1/4", // Top right
    "top-1/4 right-0", // Right Top
    "bottom-1/4 right-0", // Right Bottom
    "bottom-0 right-1/4", // Bottom right
    "bottom-0 left-1/4", // Bottom left
    "bottom-1/4 left-0", // Left Bottom
    "top-1/4 left-0", // Left Top
  ];

  // Reset and deal new cards
  // const dealCards = () => {
  //   setDealtCards([]);
  //   setPlayerCards({});

  //   // Deal player cards first
  //   players.forEach((player, playerIndex) => {
  //     setTimeout(() => {
  //       setPlayerCards((prev) => ({
  //         ...prev,
  //         [player.seat]: [...(prev[player.seat] || []), { dealing: true }],
  //       }));

  //       setTimeout(() => {
  //         setPlayerCards((prev) => ({
  //           ...prev,
  //           [player.seat]: player.cards || [null, null],
  //         }));
  //       }, dealingSpeed);
  //     }, playerIndex * dealingSpeed * 2);
  //   });

  //   // Then deal community cards
  //   communityCards.forEach((card, index) => {
  //     setTimeout(() => {
  //       setDealtCards((prev) => [...prev, { dealing: true }]);

  //       setTimeout(() => {
  //         setDealtCards((prev) => {
  //           const newCards = [...prev];
  //           newCards[index] = card;
  //           return newCards;
  //         });
  //       }, dealingSpeed);
  //     }, (players.length * 2 + index) * dealingSpeed);
  //   });
  // };

  // Chip denominations and colors
  const chipValues = [
    { value: 1000, color: "bg-orange-500", textColor: "text-white" },
    { value: 100, color: "bg-green-500", textColor: "text-white" },
    { value: 25, color: "bg-blue-500", textColor: "text-white" },
    { value: 5, color: "bg-red-500", textColor: "text-white" },
    { value: 1, color: "bg-gray-200", textColor: "text-gray-800" },
  ];

  // Convert amount to chip stacks
  const getChipStacks = (amount) => {
    const stacks = [];
    let remaining = amount;

    chipValues.forEach(({ value, color, textColor }) => {
      const count = Math.floor(remaining / value);
      if (count > 0) {
        stacks.push({ value, count, color, textColor });
        remaining %= value;
      }
    });

    return stacks;
  };

  // Render a stack of chips
  const renderChipStack = (amount, position) => {
    return;
    // const stacks = getChipStacks(amount);
    // return (
    //   <div
    //     className={`absolute ${position} flex flex-col-reverse items-center`}
    //   >
    //     {stacks.map(({ value, count, color, textColor }, stackIndex) => (
    //       <div
    //         key={value}
    //         className="relative"
    //         style={{ marginBottom: `-${count * 2}px` }}
    //       >
    //         {Array(count)
    //           .fill(null)
    //           .map((_, i) => (
    //             <div
    //               key={i}
    //               className={`w-8 h-8 rounded-full ${color} ${textColor} border-2 border-white
    //               flex items-center justify-center text-xs font-bold relative`}
    //               style={{
    //                 marginTop: `-${i * 2}px`,
    //                 transform: `scale(${1 - i * 0.05})`,
    //                 zIndex: 100 - i,
    //               }}
    //             >
    //               {value}
    //             </div>
    //           ))}
    //       </div>
    //     ))}
    //   </div>
    // );
  };

  const renderCard = (card, index, isDealing = false) => {
    if (!card)
      return (
        <div
          key={index}
          className="w-8 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-sm flex items-center justify-center"
        >
          <div className="w-6 h-10 bg-gray-100 rounded"></div>
        </div>
      );

    const { rank, suit, dealing } = card;
    const rankMap = {
      11: "J",
      12: "Q",
      13: "K",
      14: "A",
    };
    const displayRank = rank > 10 ? rankMap[rank] : rank;

    if (dealing) {
      return (
        <div
          key={index}
          className="w-8 h-12 bg-red-500 border-2 border-gray-300 rounded-lg shadow-sm 
            animate-[dealCard_0.3s_ease-out] origin-center"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #000 0, #000 2px, #fff 0, #fff 4px)",
          }}
        />
      );
    }

    const suitColors = {
      "♥": "text-red-500",
      "♦": "text-red-500",
      "♠": "text-gray-900",
      "♣": "text-gray-900",
    };

    return (
      <div
        key={index}
        className="w-8 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-sm flex flex-col items-center justify-center"
        aria-label={`${displayRank} of ${suit}`}
      >
        <span className={`text-sm font-bold ${suitColors[suit]}`}>{displayRank}</span>
        <span className={`text-lg ${suitColors[suit]}`}>{suit}</span>
      </div>
    );
  };

  const renderSeat = (seatIndex) => {
    const seat = seats[seatIndex];
    const isActive = activeSeat === seatIndex;
    const cards = seat?.cards || [];
    const taken = seat?.taken;
    const showCards =
      mySeat === seatIndex || (mySeat === -1 && seat?.allowSpectate);
    const showCard1 = showCards || seat?.showCard1;
    const showCard2 = showCards || seat?.showCard2;
    let icon;
    if (mySeat === seatIndex) {
      icon = <User size={32} className="text-gray-600" />;
    } else if (taken) {
      icon = <User size={32} className="text-gray-600" />;
    } else if (mySeat !== -1) {
      return;
    } else {
      icon = <LogIn size={32} className="text-gray-600" />;
    }

    return (
      <div
        key={seatIndex}
        className={`absolute ${seatPositions[seatIndex]} w-32 flex flex-col items-center gap-1`}
      >
        <button
          disabled={taken || mySeat !== -1}
          onClick={() => onSeatClick(seatIndex)}
          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 
            ${
              isActive
                ? "border-yellow-400"
                : "border-gray-300"
            }
            ${
              taken || mySeat !== -1
                ? mySeat === seatIndex
                  ? "bg-green-600"
                  : "bg-blue-100"
                : "bg-gray-100 hover:bg-gray-400"
            } transition-colors`}
          aria-label={
            taken
              ? `Seat ${seatIndex + 1}: ${seat.name}`
              : `Empty seat ${seatIndex + 1}`
          }
        >
          {icon}
        </button>

        {taken && (
          <>
            <div className="text-sm font-semibold">{seat.name}</div>
            {(showCards || showCard1 || showCard2) && (
              <div className="flex gap-1">
                {renderCard((showCard1 || showCards)?cards[0]:null, 0)}
                {renderCard((showCard2 || showCards)?cards[1]:null, 1)}
              </div>
            )}
            {(showCards || showCard1 || showCard2) && cards.length > 0 && (
              <div className="text-xs flex items-center gap-1">
                {evaluateHand([...cards, ...communityCards]).name}
              </div>
            )}
            {seat.stack >= 0 && <div className="text-xs flex items-center gap-1">Stack: {seat.stack}</div>}
            {seat.bet >= 0 && <div className="text-xs flex items-center gap-1">Bet: {seat.bet}</div>}
            {seat.bet > 0 && renderChipStack(seat.bet, "mt-2")}
          </>
        )}
      </div>
    );
  };

  // Add dealing animation keyframes
  const style = document.createElement("style");
  style.textContent = `
    @keyframes dealCard {
      0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
      }
      100% {
        transform: translate(0, 0) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  return (
    <div className="w-full max-w-4xl aspect-video bg-green-800 rounded-full relative mx-auto">
      {/* Table felt */}
      <div className="absolute inset-8 bg-green-700 rounded-full border-4 border-brown-800">
        {/* Community cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
          {communityCards.map((card, i) => renderCard(card, i, card?.dealing))}
          {Array(5 - communityCards.length)
            .fill(null)
            .map((_, i) => renderCard(null, i + communityCards.length))}
        </div>

        {/* Pot */}
        {pot > 0 && (
          <>
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              Pot: {pot}
            </div>
            {renderChipStack(pot, "top-1/2 left-1/2 -translate-x-1/2 mt-8")}
          </>
        )}
      </div>

      {/* Seats */}
      {Array(8)
        .fill(null)
        .map((_, i) => renderSeat(i))}
    </div>
  );
};

export default PokerTable;
