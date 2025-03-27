export type CardPosition = 
| { type: 'shared'; index: number; cardIndex: number }
| { type: 'foundation'; index: number }
| { type: 'player'; zone: 'hand' | 'drawPile' | 'discard'; playerIndex: number };

export interface CardItem {
    suit: string;
    value: string;
  }
   
  export interface Player {
    drawPile: CardItem[];
    hand: CardItem[];
    discardPile: CardItem[];
    isActive: boolean;
    isHandSelected:boolean;
  }
  
  export interface GameState {
    players: Player[];
    sharedPiles: CardItem[][];
    sharedFoundationPiles: CardItem[][];
    currentPlayer?: number;
    gameWinner: number | 1 | 2;
    selectedCard: SelectedCardInfo | null;
  }
  
  export interface SelectedCardInfo {
    cardItem: CardItem;
    position: CardPosition
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
  