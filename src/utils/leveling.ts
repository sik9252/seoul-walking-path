import { MyCard } from "../types/gameTypes";

const BASE_REQUIREMENTS = [20, 40, 70, 110, 170];
const GROWTH_FACTOR = 1.35;

export type LevelProgress = {
  level: number;
  totalExp: number;
  expInLevel: number;
  expForNextLevel: number;
};

export function getExpWeightFromCard(card: MyCard): number {
  if (card.rarity === "legendary") return 12;
  if (card.rarity === "epic") return 7;
  if (card.rarity === "rare") return 3;
  if (card.rarity === "common") return 1;

  const category = card.place?.category;
  if (category === "문화" || category === "레저") return 3;
  if (category === "자연") return 2;
  return 1;
}

function getRequirementForLevel(level: number): number {
  if (level <= 0) return BASE_REQUIREMENTS[0];
  if (level <= BASE_REQUIREMENTS.length) {
    return BASE_REQUIREMENTS[level - 1];
  }
  let requirement = BASE_REQUIREMENTS[BASE_REQUIREMENTS.length - 1];
  for (let lv = BASE_REQUIREMENTS.length + 1; lv <= level; lv += 1) {
    requirement = Math.round(requirement * GROWTH_FACTOR);
  }
  return requirement;
}

export function getLevelProgressByExp(exp: number): LevelProgress {
  let level = 1;
  let remainingExp = Math.max(0, Math.floor(exp));
  let requirement = getRequirementForLevel(level);

  while (remainingExp >= requirement) {
    remainingExp -= requirement;
    level += 1;
    requirement = getRequirementForLevel(level);
  }

  return {
    level,
    totalExp: exp,
    expInLevel: remainingExp,
    expForNextLevel: requirement,
  };
}

export function calculateExpFromCards(cards: MyCard[]) {
  return cards.reduce((sum, card) => sum + getExpWeightFromCard(card), 0);
}
