import {useState} from 'react'
import { BuildType, WeaponType, ArmorType, CharmType } from './BuildTypes'
import { parseWeaponResponse, parseArmorResponse, parseCharmResponse } from './ParseResponse'

interface RouteLUT {
  [key: string]: string
}

export const ROUTE_LUT: RouteLUT = {
  'Weapon': 'https://mhw-db.com/weapons',
  'Armor': 'https://mhw-db.com/armor',
  'Charm': 'https://mhw-db.com/charms'
}

export const getBuildTypeURL = (buildType: BuildType): string => ROUTE_LUT[buildType]

const QUERY_SEARCH_BY_NAME = (query: string) => `?q={"name": {"$like":"${query}%"}}`

type UseQueryHook<T> = [boolean, string, (query: string) => Promise<T[]>, T[]?]

const useQuery = <T>(type: BuildType, parsingFunction: (json: any) => T): UseQueryHook<T> => {
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [result, setResult] = useState<T[]>()

  const lookup = async (lookupQuery: string): Promise<T[]> => {
    if (lookupQuery === '') {
      setQuery('')
      setResult(undefined)
      setLoading(false)
      return []
    }

    setLoading(true)
    setQuery(lookupQuery)

    const urlStart = getBuildTypeURL(type)
    const url = urlStart.concat(QUERY_SEARCH_BY_NAME(lookupQuery))
    const response = await fetch(url)
    const json: any[] = await response.json()

    console.log(json)
    const finalResult = json.map((singleResult: any): T => parsingFunction(singleResult))
    setResult(finalResult)
    setLoading(false)

    return finalResult 
  }

  return [loading, query, lookup, result]
}

export const useWeaponQuery = () => useQuery<WeaponType>(BuildType.Weapon, parseWeaponResponse)
export const useArmorQuery = () => useQuery<ArmorType>(BuildType.Armor, parseArmorResponse)
export const useCharmQuery = () => useQuery<CharmType>(BuildType.Charm, parseCharmResponse)

interface AggregateType {
  weapon?: WeaponType[],
  armor?: ArmorType[],
  charm?: CharmType[]
}
type UseAggQueryHook = [boolean, string, (query: string) => void, AggregateType?]

export default (): UseAggQueryHook => {
  const [aggResult, setAggResult] = useState<AggregateType>()
  const [query, setQuery] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const weapon = useWeaponQuery()
  const armor = useArmorQuery()
  const charm = useCharmQuery()

  const lookup = (lookupQuery: string) => {
    setLoading(true)
    setQuery(lookupQuery)
    callLookups(lookupQuery)
  }

  const callLookups = async (lookupQuery: string) => {
    const queue = Promise.all([
      weapon[2](lookupQuery),
      armor[2](lookupQuery),
      charm[2](lookupQuery),
    ])
    const results = await queue

    setAggResult({
      weapon: results[0],
      armor: results[1],
      charm: results[2]
    })
    setLoading(false)
  }

  return [loading, query, lookup, aggResult]
}