import {GameState, Player, Card, CardSource} from "@/lib/game/types";

export const initialState: GameState = {
    players: [
      {
        drawPile: [],
        hand: [],
        discardPile: [],
        isActive: false,
        isHandSelected: false
      },
      {
        drawPile: [],
        hand: [],
        discardPile: [],
        isActive: false,
        isHandSelected: false
      }
    ],
    sharedPiles: Array(8).fill([]),
    sharedFoundationPiles: Array(8).fill([]),
    currentPlayer: undefined,
    gameWinner: null,
    selectedCard: null
  };


  export type GameAction =
  // Initialisation
  | {
      type: 'INIT_GAME';
      players: [Player, Player];
      sharedPiles: Card[][];
      firstPlayer: number;
    }
  
  // Sélection de carte
  | {
      type: 'SELECT_CARD';
      playerIndex?: number;
      card: Card;
      source: CardSource;
      cardIndex: number | null;
    }
  
  // Mouvement de carte
  | {
      type: 'MOVE_CARD';
      target: {
        zone: 'shared' | 'foundation' | 'drawPile' | 'discard';
        index?: number;
        playerIndex?: number;
      };
    }
  
  // Changement de joueur
  | { type: 'SWITCH_PLAYER' }
  
  // Changement de joueur
  | { type: 'RECYCLE_DISCARD';
    playerIndex: number
   }

  // Gestion de la main
  | {type: 'SET_HAND_SELECTED';
      playerIndex: number;
      isSelected: boolean;
    }
  
  // Fin de jeu
  | { type: 'SET_WINNER';
     playerIndex: number
     };
    