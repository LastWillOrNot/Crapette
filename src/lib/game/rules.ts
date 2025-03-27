import { RED, CARD_VALUES, SUITS, SUITS_LETTERS, LIBERTY_DEGREE } from './constants';
import { CardItem } from "./types";

export function areCardsConsecutive(card1: CardItem, card2: CardItem) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  console.log(`ArecardConsecutive  ${index1}  avec ${index2}`);
  return Math.abs(index1 - index2) === 1;
}

export function areNextCardInferior(card1: CardItem, card2: CardItem) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  console.log(`areNextCardInferior  ${index1}  avec ${index2}`);
  return index1 - index2 === 1;
}

export function areNextCardSuperior(card1: CardItem, card2: CardItem) {
  let index1;
  if (card1.value === 'A' && card2.value === '2') { return true; } else {
    const index1 = CARD_VALUES.indexOf(card1.value);
    const index2 = CARD_VALUES.indexOf(card2.value);
  return index2 - index1 === 1;
  };
}

export function areCardsColorDifferent(card1: CardItem, card2: CardItem) {
  console.log(`areCardsColorDifferent  ${RED.includes(card1.suit)}  avec ${RED.includes(card2.suit)}`);
  return RED.includes(card1.suit) !== RED.includes(card2.suit);
}

export function compareSuitsCards(card1: CardItem, card2: CardItem) {
  const index1 = CARD_VALUES.indexOf(card1.value);
  const index2 = CARD_VALUES.indexOf(card2.value);
  if (index1 !== index2) return index1 - index2;
  return SUITS.indexOf(card1.suit) - SUITS.indexOf(card2.suit);
}

export function canPlaceOnFoundation(CardItem: CardItem, pile: CardItem[]) {
  if (pile.length === 0) return CardItem.value === 'A';
  const topCard = pile[pile.length - 1];
  console.log(`Comparaison de ${CardItem.value} ${CardItem.suit} avec ${topCard.value} ${topCard.suit}`);
  return CardItem.suit === topCard.suit && areNextCardSuperior(topCard, CardItem);
}

export function canPlaceOnShared(CardItem: CardItem, pile: CardItem[]) {
  if (pile.length === 0) return true;
  const topCard = pile[pile.length - 1];
  return areCardsColorDifferent(topCard, CardItem) &&
    areNextCardInferior(topCard, CardItem);
}

export function canPlaceOnDrawPile(CardItem: CardItem, pile: CardItem[]) {
  if (pile.length === 0) return false;
  const topCard = pile[pile.length - 1];
  return !areCardsColorDifferent(topCard, CardItem) &&
    areCardsConsecutive(topCard, CardItem);
}

export function canPlaceOnDiscard(CardItem: CardItem, pile: CardItem[]) {
  if (pile.length === 0) return false;
  const topCard = pile[pile.length - 1];
  console.log(`Comparaison de ${CardItem.value} ${CardItem.suit} avec ${pile[pile.length - 1].value} ${pile[pile.length - 1].suit}`);
  return areCardsColorDifferent(topCard, CardItem) &&
    areCardsConsecutive(topCard, CardItem);
}

//Renvoi la valeur de la carte
export function lettersFromSuits(suit: string) {
  return SUITS_LETTERS[SUITS.indexOf(suit)];
}

// Nombre d'espaces vides dans les piles (partagées)
export function countSpacePlace(pile: CardItem[][]) {
  let SpacePlaceCount = 0;
  for (let i = 0; i < 8; i++) {
    if (pile[i].length === 0) {
      SpacePlaceCount++;
    }
  }
  console.log(`SpacePlaceCount ${SpacePlaceCount}`);
  return SpacePlaceCount;
}

// Nombre de cartes déplaçables dans les piles (partagées)
export function countMoveableCard(pile: CardItem[][]) {
  let MoveableCardCount = LIBERTY_DEGREE[countSpacePlace(pile)];
  console.log(`MoveableCardCount ${MoveableCardCount}`);
  return MoveableCardCount;
}
