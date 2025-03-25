import { RED, CARD_VALUES, SUITS } from './constants';
import { Card as CardType } from "./types";

export function areCardsConsecutive(card1: CardType, card2: CardType) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  return Math.abs(index1 - index2) === 1;
}

export function areNextCardInferior(card1: CardType, card2: CardType) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  return index1 - index2 === 1;
}

export function areNextCardSuperior(card1: CardType, card2: CardType) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  return index2 - index1 === 1;
}

export function areCardsColorDifferent(card1: CardType, card2: CardType) {
  return RED.includes(card1.suit) !== RED.includes(card2.suit);
}

export function compareSuitsCards(card1: CardType, card2: CardType) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  if (index1 !== index2) return index1 - index2;
  return SUITS.indexOf(card1.suit) - SUITS.indexOf(card2.suit);
}

export function canPlaceOnFoundation(card: CardType, pile: CardType[]) {
  if (pile.length === 0) return card.value === 'A';
  const topCard = pile[pile.length - 1];
  return card.suit === topCard.suit && areNextCardSuperior(topCard, card);
}

export function canPlaceOnShared(card: CardType, pile: CardType[]) {
  if (pile.length === 0) return true;
  const topCard = pile[pile.length - 1];
  return areCardsColorDifferent(topCard, card) &&
    areNextCardInferior(topCard, card);
}

export function canPlaceOnDrawPile(card: CardType, pile: CardType[]) {
  if (pile.length === 0) return false;
  const topCard = pile[pile.length - 1];
  return !areCardsColorDifferent(topCard, card) &&
    areCardsConsecutive(topCard, card);
}

export function canPlaceOnDiscard(card: CardType, pile: CardType[]) {
  if (pile.length === 0) return false;
  const topCard = pile[pile.length - 1];
  return !areCardsColorDifferent(topCard, card) &&
    areCardsConsecutive(topCard, card);
}