import { M_PLUS_1 } from 'next/font/google';
import { RED, CARD_VALUES, SUITS, SUITS_LETTERS } from './constants';
import { Card as CardType } from "./types";

export function areCardsConsecutive(card1: CardType, card2: CardType) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  console.log(`ArecardConsecutive  ${index1}  avec ${index2}`);
  return Math.abs(index1 - index2) === 1;
}

export function areNextCardInferior(card1: CardType, card2: CardType) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  console.log(`areNextCardInferior  ${index1}  avec ${index2}`);
  return index1 - index2 === 1;
}

export function areNextCardSuperior(card1: CardType, card2: CardType) {
  let index1;
  if (card1.value === 'A' && card2.value === '2') { return true; } else {
    const index1 = CARD_VALUES.indexOf(card1.value);
    const index2 = CARD_VALUES.indexOf(card2.value);
  return index2 - index1 === 1;
  };
}

export function areCardsColorDifferent(card1: CardType, card2: CardType) {
  console.log(`areCardsColorDifferent  ${RED.includes(card1.suit)}  avec ${RED.includes(card2.suit)}`);
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
  console.log(`Comparaison de ${card.value} ${card.suit} avec ${topCard.value} ${topCard.suit}`);
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
  console.log(`Comparaison de ${card.value} ${card.suit} avec ${pile[pile.length - 1].value} ${pile[pile.length - 1].suit}`);
  if (pile.length === 0) return false;
  const topCard = pile[pile.length - 1];
  return areCardsColorDifferent(topCard, card) &&
    areCardsConsecutive(topCard, card);
}

//Renvoi la valeur de la carte
export function lettersFromSuits(suit: string) {
  return SUITS_LETTERS[SUITS.indexOf(suit)];
}