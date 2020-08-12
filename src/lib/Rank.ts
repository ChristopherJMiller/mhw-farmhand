
export enum Rank {
  Low = "low", High = "high", Master = "master"
}

export const isLowRank = (rarity: number) => rarity < 5
export const isHighRank = (rarity: number) => rarity >= 5 && rarity < 9
export const isMasterRank = (rarity: number) => rarity >= 9

export const getRank = (rarity: number): Rank => {
  if (isLowRank(rarity))
    return Rank.Low

  if (isHighRank(rarity))
    return Rank.High

  return Rank.Master
}