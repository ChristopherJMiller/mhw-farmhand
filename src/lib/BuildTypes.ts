import { Rank } from "./Rank";

export enum BuildType {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Charm = 'Charm'
}

export interface CraftingMaterial {
  itemID: number
  itemName: string
  quantity: number
}

export interface WeaponCrafting {
  craftable: boolean
  previous?: number
  branches: number[]
  craftingMaterials: CraftingMaterial[]
}

export interface BasicBuildType { 
  id: number
  name: string
  type: string
}

export interface RarityBuildType extends BasicBuildType { 
  rarity: number
}

export interface CraftWithRarity extends RarityBuildType {
  crafting: CraftingMaterial[]
}

export interface WeaponType extends RarityBuildType {
  crafting: WeaponCrafting
}

export interface ArmorType extends RarityBuildType  {
  crafting: CraftingMaterial[]
}

export interface CharmRank {
  level: number
  rarity: number
  crafting: CraftingMaterial[]
}

export interface CharmType extends BasicBuildType {
  ranks: CharmRank[]
}

export interface CharmItem extends RarityBuildType {}

export interface RewardCondition {
  type: string
  subtype?: string
  rank: Rank
  quantity: number
  change: number
}

export type GatheredCraftingMaterial = CraftingMaterial | HuntedCraftingMaterial

export interface HuntedCraftingMaterial extends CraftingMaterial {
  monsterId: number
  monsterName: string
  gatherMethods: RewardCondition[]
}

export interface TierMaterials {
  name: string
  rarity: number
  monstersNeeded: string[]
  materials: GatheredCraftingMaterial[]
}

export interface MonsterDrop {
  itemID: number
  itemName: string
  conditions: RewardCondition[]
}

export interface Monster {
  id: number
  name: string
  rewards: MonsterDrop[]
}