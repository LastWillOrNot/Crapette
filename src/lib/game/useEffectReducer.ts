import {Player, GameState, Card, CardSource, SelectedCardInfo  } from "@/lib/game/types";
import {initialState, GameAction} from "@/lib/game/gameTypes";


export function gameReducer(gameState: GameState, action: GameAction): GameState {
    switch (action.type) {
      // Initialisation
      case 'INIT_GAME':
        return {
          ...initialState,
          players: action.players.map((player: Player, i:number) => ({
            ...player,
            isActive: i === action.firstPlayer - 1
          })),
          sharedPiles: action.sharedPiles,
          currentPlayer: action.firstPlayer
        };
  
      // Sélection de carte
      case 'SELECT_CARD':
        return {
          ...gameState,
          players: action.playerIndex !== undefined
            ? gameState.players.map((player, i) => 
                i === action.playerIndex
                  ? { ...player, isHandSelected: action.source.type === 'player' &&
                     action.source.zone === 'hand' }
                  : player
              )
            : gameState.players
        };
  
      // Mouvement de carte
      case 'MOVE_CARD': {
        const { source } = selectedCard;
        const card = gameState.selectedCard;
              
        return {
          ...gameState,
          players: newPlayers,
          sharedPiles: newSharedPiles,
          sharedFoundationPiles: newSharedFoundationPiles,
          selectedCard: null
        };
      }
  
      // Changement de joueur
      case 'SWITCH_PLAYER':
        return {
          ...gameState,
          currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
          players: gameState.players.map(player => ({
            ...player,
            isActive: !player.isActive
          }))
        };
  
      // Gestion de la main
      case 'SET_HAND_SELECTED':
        return {
          ...gameState,
          players: gameState.players.map((player, i) => 
            i === action.playerIndex
              ? { ...player, isHandSelected: action.isSelected }
              : player
          )
        };
  
      // Fin de jeu
      case 'SET_WINNER':
        return {
          ...gameState,
          gameWinner: action.playerIndex
        };
  
    case 'RECYCLE_DISCARD': {
        const player = gameState.players[action.playerIndex];
        return {
            ...gameState,
            players: gameState.players.map((p, i) => 
            i === action.playerIndex
                ? {
                    ...p,
                    hand: [...player.discardPile].reverse(),
                    discardPile: []
                }
                : p
            )
        };
        }

      default:
        return gameState;
    }
  }

function moveCardLogic(gameState: GameState, action: Extract<GameAction, { type: 'MOVE_CARD' }>): GameState {
  
  return newState;
}

