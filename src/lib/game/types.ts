
export type CardSource = 
| { type: 'shared'; index: number }
| { type: 'player'; zone: 'hand' | 'drawPile' | 'discardPile'; playerIndex: number };

export interface Card {
    suit: string;
    value: string;
  }
   
  export interface Player {
    drawPile: Card[];
    hand: Card[];
    discardPile: Card[];
    isActive: boolean;
  }
  
  export interface GameState {
    players: Player[];
    sharedPiles: Card[][];
    sharedFoundationPiles: Card[][];
    currentPlayer?: number;
    gameWinner: number | null;
  }
  
  export interface SelectedCardInfo {
    card: Card;
    source: CardSource;
  }

  export interface GameContextType {
    gameState: GameState;
    currentlySelectedCard: SelectedCardInfo | null;
    handleSelectCard: (source: string) => void;
    attemptMove: (
      targetZone: string, 
      index: number | null, 
      playerTarget: number | null
    ) => void;
  }
  