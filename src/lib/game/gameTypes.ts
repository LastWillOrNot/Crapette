import {GameState, Player, CardItem, CardPosition} from "@/lib/game/types";

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
    gameWinner: 0,
    selectedCard: null
  };


  export type GameAction =
  // Initialisation
  | {
      type: 'INIT_GAME';
      players: [Player, Player];
      sharedPiles: CardItem[][];
      firstPlayer: number;
    }
  
  // Sélection de carte
  | {
      type: 'SELECT_CARD';
      card: CardItem;
      source: CardPosition;
    }
  
  // Mouvement de carte
  | {
      type: 'MOVE_CARD';
      source: CardPosition;       // Position source (ex: { type: 'player', zone: 'hand', playerIndex: 0 })
      targetZone: CardPosition;   // Position cible (ex: { type: 'shared', index: 2 })
      cardsToMove: CardItem[];    // Cartes à déplacer (ex: [{ suit: 'hearts', value: 'A' }])
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
  
  // Annulation de la sélection
  | { type: 'CANCEL_SELECTION'; }

  // Fin de jeu
  | { type: 'SET_WINNER';
     playerIndex: number
 
};    