import { areCardsConsecutive } from "../game/rules";
import { CARD_VALUES, SUITS } from "../game/constants";
import { Card } from "../game/types";

describe("areCardsConsecutive", () => {
  test("retourne true pour deux cartes consécutives", () => {
    const card1 =  { value: CARD_VALUES[3], suit: SUITS[2] }; // Exemple : 4
    const card2 =  { value: CARD_VALUES[4], suit: SUITS[0] }; // Exemple : 5

    expect(areCardsConsecutive(card1, card2)).toBe(true);
  });

  test("retourne false pour deux cartes non consécutives", () => {
    const card1: Card = { value: CARD_VALUES[2], suit: "diamonds" }; // Exemple : 3
    const card2: Card = { value: CARD_VALUES[5], suit: "clubs" }; // Exemple : 6

    expect(areCardsConsecutive(card1, card2)).toBe(false);
  });

  test("retourne false pour deux cartes identiques", () => {
    const card1: Card = { value: CARD_VALUES[7], suit: "♥️" }; // Exemple : 8
    const card2: Card = { value: CARD_VALUES[7], suit: "spades" }; // Même valeur 8

    expect(areCardsConsecutive(card1, card2)).toBe(false);
  });

  test("retourne true indépendamment de la couleur", () => {
    const card1: Card = { value: CARD_VALUES[9], suit: "diamonds" }; // Exemple : 10
    const card2: Card = { value: CARD_VALUES[10], suit: "hearts" }; // Exemple : J

    expect(areCardsConsecutive(card1, card2)).toBe(true);
  });
});