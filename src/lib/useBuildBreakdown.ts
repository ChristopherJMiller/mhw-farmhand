import { BuildType, CraftingMaterial, WeaponType, ArmorType, CharmType, RarityBuildType, CraftWithRarity } from "./BuildTypes";
import {getBuildTypeURL} from './useQuery'
import { parseWeaponResponse, parseArmorResponse, parseCharmResponse } from "./ParseResponse";
import { useState, useEffect } from "react";
import { compact } from "lodash";

const getDBItem = async <T>(type: BuildType, parsingFunction: (obj: any) => T, id: number): Promise<T> => {
  const urlStart = getBuildTypeURL(type)
  const url = urlStart.concat(`/${id}`)
  const response = await fetch(url)
  const json: any = await response.json()
  return parsingFunction(json)
}

const getWeapon = async (id: number) => await getDBItem<WeaponType>(BuildType.Weapon, parseWeaponResponse, id)
const getArmor = async (id: number) => await getDBItem<ArmorType>(BuildType.Armor, parseArmorResponse, id)
const getCharm = async (id: number) => await getDBItem<CharmType>(BuildType.Charm, parseCharmResponse, id)

const getWeaponTree = async (id: number, runningList: WeaponType[] = []): Promise<WeaponType[]> => {
  const weapon = await getWeapon(id)
  const previous = weapon.crafting.previous
  const newList = [...runningList, weapon]
  if (previous === null || weapon.crafting.craftable) {
    return newList
  }

  return [...newList, ...await getWeaponTree(previous!, runningList)]
}

export interface BuildStep {
  gather: CraftingMaterial[]
  build: number[]
}

export type BuildPlan = BuildStep[]

export interface DetailedStep {
  gather: CraftingMaterial[]
  build: RarityBuildType[]
}

export type DetailedBuildPlan = DetailedStep[]

const createSteps = (plan: BuildPlan, craftingList: [number, CraftingMaterial[]][]): BuildPlan => {
  if (craftingList.length === 0) {
    return plan
  }
  
  const [[step, list], ...rest] = craftingList
  const completionList = [step]  
  const nameLut: MaterialInfoLookup = {}
  const quantityTable: MaterialQuantityTable = {}

  list.forEach((item: CraftingMaterial) => {
    const id = item.itemID
    nameLut[id] = item.itemName
    quantityTable[id] = item.quantity
  })

  const newRest = rest.map(([currStep, list]): [number, CraftingMaterial[]] | null => {
    const newList = list.map((material) => {
      if (quantityTable[material.itemID]) {
        quantityTable[material.itemID] += material.quantity
        return undefined
      }

      return material
    })

    const compactedList = compact(newList)

    if (compactedList.length === 0) {
      completionList.push(currStep)
      return null
    }

    return [currStep, compactedList]
  })

  const compactedRest = compact(newRest)

  const finalBuildStepItems =  Object.keys(nameLut).map(id => Number(id)).map((id: number): CraftingMaterial => ({
    itemID: id,
    itemName: nameLut[id],
    quantity: quantityTable[id]
  }))

  const buildStep: BuildStep = {
    build: completionList,
    gather: finalBuildStepItems
  }

  return createSteps([...plan, buildStep], compactedRest)
}

const createGatherOrder = (materialTiers: CraftingMaterial[][]): BuildPlan => {
  const tiers = [...materialTiers]
  const firstCraftFirst = tiers.reverse()
  const steppedMaterials = firstCraftFirst.map((item, index): [number, CraftingMaterial[]] => [index, item])
  return createSteps([], steppedMaterials)
}

const getMaterialPlan = async (builds: BuildEntry[]): Promise<DetailedBuildPlan> => {
  // Weapons
  const weaponBuilds = builds.filter((build) => build[0] === BuildType.Weapon)
  const weaponIDs = weaponBuilds.map(build => build[1])
  const weaponPromises = Promise.all(weaponIDs.map(async id => await getWeaponTree(id)))
  const weaponTrees = await weaponPromises
  const expandedWeaponTree = weaponTrees.reduce((prev, curr) => [...prev, ...curr])
  const weapons = expandedWeaponTree.map((weapon): CraftWithRarity => ({
    id: weapon.id,
    type: weapon.type,
    name: weapon.name,
    rarity: weapon.rarity,
    crafting: weapon.crafting.craftingMaterials
  }))
  
  // Armor
  const armorBuilds = builds.filter((build) => build[0] === BuildType.Armor)
  const armorIDs = armorBuilds.map(builds => builds[1])
  const armorPromises = Promise.all(armorIDs.map(async id => await getArmor(id)))
  const armorPieces = await armorPromises
  const armors = armorPieces.map((armor): CraftWithRarity => ({
    id: armor.id,
    name: armor.name,
    type: armor.type,
    rarity: armor.rarity,
    crafting: armor.crafting
  }))

  console.log(armors)
  
  // Charms
  const charmBuilds = builds.filter((build) => build[0] === BuildType.Charm)
  const charmIDs = charmBuilds.map(builds => builds[1])
  const charmPromises = Promise.all(charmIDs.map(async id => await getCharm(id)))
  const charmTrees = await charmPromises
  const expandedTrees = charmTrees.map((tree) => tree.ranks.map((rank): CraftWithRarity => ({
    id: tree.id,
    name: tree.name,
    rarity: rank.rarity,
    type: BuildType.Charm,
    crafting: rank.crafting
  })))
  const charms = expandedTrees.length > 0 ? expandedTrees.reduce((prev, curr) => [...prev, ...curr]) : []
  
  const expandedTree = [
    ...weapons,
    ...armors,
    ...charms
  ]

  const raritySort = expandedTree.sort((a, b) => b.rarity - a.rarity)
  const lengthSort = raritySort.sort((a, b) => b.crafting.length - a.crafting.length)
  const materialSteps = lengthSort.map((tier) => tier.crafting)
  const gatherOrder = createGatherOrder(materialSteps)
  
  const detailedPlan = gatherOrder.map((step, index): DetailedStep => ({
    gather: step.gather,
    build: step.build.map((id: number) => lengthSort[lengthSort.length - 1 - id])
  }))

  return detailedPlan
}

interface MaterialQuantityTable {
  [itemID: number]: number
}

interface MaterialInfoLookup {
  [itemID: number]: string
}

type BuildBreakdownHook = [boolean, DetailedBuildPlan | undefined]
type BuildEntry = [BuildType, number]

export default (builds: BuildEntry[]): BuildBreakdownHook => {
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<DetailedBuildPlan>()

  useEffect(() => {
    const getMaterials = async () => {
      console.log(builds)
      const buildPlan = await getMaterialPlan(builds)
      setResult(buildPlan)
      setLoading(false)
    }

    if (!loading) {
      setLoading(true)
      getMaterials()
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  return [loading, result]
}