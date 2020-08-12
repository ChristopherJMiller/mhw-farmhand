import { WeaponType, WeaponCrafting, CraftingMaterial, ArmorType, CharmType, CharmRank } from "./BuildTypes";

export const parseWeaponResponse = (obj: any) : WeaponType => {
  const materialList = obj.crafting?.craftable ? obj.crafting?.craftingMaterials : obj.crafting?.upgradeMaterials

  const crafting: WeaponCrafting = {
    previous: obj.crafting?.previous,
    branches: obj.crafting?.branches,
    craftable: obj.crafting?.craftable,
    craftingMaterials: materialList.map((cost: any): CraftingMaterial => ({
      quantity: cost.quantity,
      itemID: cost.item?.id,
      itemName: cost.item?.name
    }))
  }

  return {
    id: obj.id,
    name: obj.name,
    type: obj.type,
    rarity: obj.rarity,
    crafting
  }
}

export const parseArmorResponse = (obj: any): ArmorType => ({
    id: obj.id,
    name: obj.name,
    rarity: obj.rarity,
    type: obj.type,
    crafting: obj.crafting?.materials.map((cost: any): CraftingMaterial => ({
      quantity: cost.quantity,
      itemID: cost.item?.id,
      itemName: cost.item?.name
    }))
  })


export const parseCharmResponse = (obj: any): CharmType => {
  const ranks = obj.ranks.map((rank: any): CharmRank => {
    return {
      level: rank.level,
      rarity: rank.rarity,
      crafting: rank.crafting?.materials?.map((cost: any): CraftingMaterial => ({
        quantity: cost.quantity,
        itemID: cost.item?.id,
        itemName: cost.item?.name
      }))
    }
  })

  return {
    id: obj.id,
    name: obj.name,
    type: 'charm',
    ranks: ranks
  }
}