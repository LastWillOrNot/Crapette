import { createShuffledDeck } from "@/lib/game/cardUtils";
import { compareSuitsCards } from "@/lib/game/rules";
import { Card, CardSource} from "@/lib/game/types";
import { GameAction} from "@/lib/game/gameTypes";


// Initialisation

export const initGame = () => {
    const decks = [createShuffledDeck(), createShuffledDeck()];
    const players = decks.map(deck => ({
      drawPile: deck.slice(0, 13),
      hand: deck.slice(17, 52),
      discardPile: [],
      isActive: false,
      isHandSelected: false
    }));

    return {
      type: 'INIT_GAME',
      players,
      sharedPiles: Array(8).fill([]).map((_, i) => 
        [decks[i < 4 ? 0 : 1][13 + (i % 4)]]
      ),
      firstPlayer: determineFirstPlayer(players)
    };
  };
  
  // Sélection de carte
  export const selectCard = (
    card: Card,
    source: CardSource,
    cardIndex: number | null,
    playerIndex?: number
  ): GameAction => ({
    type: 'SELECT_CARD',
    card,
    source,
    cardIndex,
    playerIndex
  });
  
  // Mouvement de carte
  export const moveCard = (
    targetZone: 'shared' | 'foundation' | 'drawPile' | 'discard',
    targetIndex?: number,
    targetPlayer?: number
  ): GameAction => ({
    type: 'MOVE_CARD',
    target: {
      zone: targetZone,
      index: targetIndex,
      playerIndex: targetPlayer
    }
  });
  
  // Autres actions
  export const switchPlayer = (): GameAction => ({ 
    type: 'SWITCH_PLAYER' 
  });
  
  export const recycleDiscard = (playerIndex: number): GameAction => ({ 
    type: 'RECYCLE_DISCARD',
    playerIndex
  });


  export const setWinner = (playerIndex: number): GameAction => ({ 
    type: 'SET_WINNER',
    playerIndex 
  });
  
  function determineFirstPlayer(players: any[]): number
   {
    console.log(`Détermination du 1er joueur`)
    console.log ('Comparaison de cartes ' + players[0].drawPile[0] + players[1].drawPile[0])
    const comparison = compareSuitsCards(players[0].drawPile[0], players[1].drawPile[0]);
    let firstPlayer: number;
    
    if (comparison > 0) {
    firstPlayer = 2;
    } else if (comparison < 0) {
    firstPlayer = 1;
    } else {
    const comparison2 = compareSuitsCards(players[0].handPile[0], players[1].handPile[0]);
    firstPlayer = comparison2 > 0 ? 2 : comparison2 < 0 ? 1 : Math.floor(Math.random() * 2) + 1;
    }
   return firstPlayer }

