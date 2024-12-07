class CardManager {
  constructor() {
    this.deck = [];
    this.newDeck();
  }

  /**
   * Initialize the deck with 52 cards
   */
  newDeck() {
    // const suits = ["hearts", "diamonds", "clubs", "spades"];
    const suits = ["♥", "♦", "♣", "♠"];
    const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    this.deck = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.deck.push({ rank, suit });
      }
    }
    this.shuffleDeck();
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  getOneCard() {
    return this.deck.pop();
  }
}

export default CardManager;

export function evaluateHand(cards) {
  if (cards.length < 2 || cards.length > 7) {
    throw new Error("Number of cards must be between 2 and 7.");
  }

  // Utility functions
  const getRanks = (cards) =>
    cards.map((card) => card.rank).sort((a, b) => b - a); // Descending
  const getSuits = (cards) => cards.map((card) => card.suit);

  const isFlush = (suits) =>
    Object.values(
      suits.reduce((acc, suit) => {
        acc[suit] = (acc[suit] || 0) + 1;
        return acc;
      }, {})
    ).some((count) => count >= 5);

  const isStraight = (ranks) => {
    const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) return true;
    }

    // Check for Ace-low straight
    return (
      uniqueRanks.includes(14) &&
      uniqueRanks.slice(0, 4).toString() === [2, 3, 4, 5].toString()
    );
  };

  const rankCounts = (ranks) =>
    ranks.reduce((acc, rank) => {
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});

  // Core evaluation logic
  const evaluateHandOfFive = (hand) => {
    const ranks = getRanks(hand);
    const suits = getSuits(hand);
    const flush = isFlush(suits);
    const straight = isStraight(ranks);
    const counts = rankCounts(ranks);
    const sortedCounts = Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([rank]) => Number(rank));

    // Identify specific hand types
    if (flush && straight) {
      const isRoyal =
        ranks.includes(14) && ranks.includes(13) && ranks.includes(12);
      return {
        rank: isRoyal ? 10 : 9,
        name: isRoyal ? "Royal Flush" : "Straight Flush",
        keyCards: sortedCounts,
      };
    }
    if (Object.values(counts).includes(4)) {
      return {
        rank: 8,
        name: "Four of a Kind",
        keyCards: sortedCounts,
      };
    }
    if (Object.values(counts).includes(3) && Object.values(counts).includes(2)) {
      return {
        rank: 7,
        name: "Full House",
        keyCards: sortedCounts,
      };
    }
    if (flush) {
      return {
        rank: 6,
        name: "Flush",
        keyCards: sortedCounts,
      };
    }
    if (straight) {
      return {
        rank: 5,
        name: "Straight",
        keyCards: sortedCounts,
      };
    }
    if (Object.values(counts).includes(3)) {
      return {
        rank: 4,
        name: "Three of a Kind",
        keyCards: sortedCounts,
      };
    }
    if (
      Object.values(counts).filter((count) => count === 2).length === 2
    ) {
      return {
        rank: 3,
        name: "Two Pair",
        keyCards: sortedCounts,
      };
    }
    if (Object.values(counts).includes(2)) {
      return {
        rank: 2,
        name: "One Pair",
        keyCards: sortedCounts,
      };
    }
    return {
      rank: 1,
      name: "High Card",
      keyCards: sortedCounts,
    };
  };

  // Handle fewer than 5 cards
  if (cards.length <= 5) {
    return evaluateHandOfFive(cards);
  }

  // Generate combinations and evaluate all possible hands
  const getCombinations = (arr, size) => {
    const results = [];
    const combo = [];
    const generate = (start, depth) => {
      if (depth === size) {
        results.push([...combo]);
        return;
      }
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        generate(i + 1, depth + 1);
        combo.pop();
      }
    };
    generate(0, 0);
    return results;
  };

  const allCombinations = getCombinations(cards, 5);
  return allCombinations.reduce((best, combo) => {
    const hand = evaluateHandOfFive(combo);
    return compareHands(hand, best) === 1 ? hand : best;
  });
}

export function compareHands(hand1, hand2) {
  if (hand1.rank !== hand2.rank) {
    return hand1.rank > hand2.rank ? 1 : -1;
  }
  for (let i = 0; i < hand1.keyCards.length; i++) {
    if (hand1.keyCards[i] !== hand2.keyCards[i]) {
      return hand1.keyCards[i] > hand2.keyCards[i] ? 1 : -1;
    }
  }
  return 0; // Tie
}

