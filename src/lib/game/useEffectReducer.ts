import {Player, GameState, CardItem, CardPosition, SelectedCardInfo  } from "@/lib/game/types";
import {initialState, GameAction} from "@/lib/game/gameTypes";
import { canPlaceOnFoundation, canPlaceOnShared, canPlaceOnDrawPile, canPlaceOnDiscard, countMoveableCard } from "@/lib/game/rules";
import { cp } from "fs";

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
            selectedCard: {
              cardItem: action.card,
              position: action.source
            },
            players: action.source.type === 'player'
              ? gameState.players.map((player, i) => 
                  i === action.source.playerIndex
                    ? { ...player, isHandSelected: action.source.zone === 'hand' }
                    : player
                )
              : gameState.players
          };
  
      // Mouvement de carte
      case 'MOVE_CARD': {
        const { source, targetZone, cardsToMove } = action;
        const newState = { ...gameState };
      
        // 1. Retirer les cartes de la source
        if (source.type === 'shared') {
          newState.sharedPiles[source.index] = newState.sharedPiles[source.index].slice(
            0,
            -cardsToMove.length // Retire les N dernières cartes
          );
        } 
        else if (source.type === 'player') {
          const player = newState.players[source.playerIndex];
          if (source.zone === 'hand') {
            player.hand = player.hand.slice(0, -1); // Retire la dernière carte
            player.isHandSelected = true;
          } 
          else if (source.zone === 'drawPile') {
            player.drawPile = player.drawPile.slice(0, -1);
          }
        }

        // 2. Ajouter les cartes à la cible
        if (targetZone.type === 'foundation') {
          console.log (`Targetzone.index ${targetZone.index}`)
          newState.sharedFoundationPiles[targetZone.index].push(...cardsToMove.reverse());
        } 
        else if (targetZone.type === 'shared') {
          newState.sharedPiles[targetZone.index].push(...cardsToMove.reverse());
        } 
        else if (targetZone.type === 'player') {
          const player = newState.players[targetZone.playerIndex];
          console.log (`Targetzone.playerIndex ${targetZone.playerIndex }`)
          if (targetZone.zone === 'discard') {
            player.discardPile.push(...cardsToMove.reverse());
          } 
          else if (targetZone.zone === 'drawPile') {
            player.drawPile.push(...cardsToMove.reverse());
          }
        }
      
        // 3. Effacer la sélection et retourner le nouvel état
        return {
          ...newState,
          selectedCard: null,
        };
      }
  
      // Annulation de la sélection
      case 'CANCEL_SELECTION': {
        return {
          ...gameState,
          selectedCard: null,
        };
      }

      // Changement de joueur
      case 'SWITCH_PLAYER':
        return {
          ...gameState,
          currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
          players: gameState.players.map(player => ({
            ...player,
            isActive: !player.isActive,
            isHandSelected:false
          }))
        };
  
      // Gestion de la main
    //  case 'SET_HAND_SELECTED':
    //    return {
    //      ...gameState,
    //      players: gameState.players.map((player, i) => 
    //        i === action.playerIndex
    //          ? { ...player, isHandSelected: true }
    //          : player
    //      )
    //    };
  
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



